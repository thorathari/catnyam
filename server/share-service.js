const crypto = require("crypto");
const path = require("path");
const sharp = require("sharp");

const CatnyamEngine = require("../game-engine");
const {
  CATALOG,
  DEFAULT_BACKGROUND,
  DEFAULT_CHARACTER,
} = require("./shop-catalog");

const SHARE_ORIGIN = "https://catnyam.vercel.app";
const SHARE_TOKEN_VERSION = 1;
const MAX_SHARE_TOKEN_LENGTH = 4096;
const MAX_SCORE = 500000;

function getSecret() {
  const secret = process.env.SESSION_SECRET;

  if (!secret) {
    throw new Error("SESSION_SECRET 환경변수가 필요합니다.");
  }

  return secret;
}

function cleanText(value, maxLength = 24) {
  return String(value || "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function signPayload(encodedPayload) {
  return crypto
    .createHmac("sha256", getSecret())
    .update(`catnyam-share:${encodedPayload}`)
    .digest("base64url");
}

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(String(left || ""));
  const rightBuffer = Buffer.from(String(right || ""));
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function normalizeSharePayload(value) {
  const score = Number(value?.s);
  const rank = Number(value?.r);
  const mode = CatnyamEngine.normalizeGameMode(value?.m);
  const character = CATALOG.character[value?.c] ? value.c : DEFAULT_CHARACTER;
  const background = CATALOG.background[value?.b] ? value.b : DEFAULT_BACKGROUND;

  if (value?.v !== SHARE_TOKEN_VERSION || !Number.isInteger(score) || score < 0 || score > MAX_SCORE) {
    return null;
  }

  return {
    version: SHARE_TOKEN_VERSION,
    nickname: cleanText(value.n) || "플레이어",
    score,
    gameMode: mode,
    rank: Number.isInteger(rank) && rank > 0 ? rank : null,
    overtakenNickname: cleanText(value.o),
    scope: value.q === "daily" ? "daily" : "allTime",
    character,
    background,
  };
}

function createShareToken({ user, score, gameMode, ranking, loadout }) {
  const numericScore = Number(score);
  const rank = Number(ranking?.rank);
  const isRankingScore = Number(ranking?.rankingScore) === numericScore;
  const useRanking = Number.isInteger(rank)
    && rank > 0
    && (ranking?.isPersonalBest === true || isRankingScore);
  const payload = {
    v: SHARE_TOKEN_VERSION,
    n: cleanText(user?.nickname || user?.username) || "플레이어",
    s: numericScore,
    m: CatnyamEngine.normalizeGameMode(gameMode),
    r: useRanking ? rank : null,
    o: useRanking ? cleanText(ranking?.overtakenNickname) : "",
    q: ranking?.scope === "daily" ? "daily" : "allTime",
    c: CATALOG.character[loadout?.character] ? loadout.character : DEFAULT_CHARACTER,
    b: CATALOG.background[loadout?.background] ? loadout.background : DEFAULT_BACKGROUND,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  return `${encodedPayload}.${signPayload(encodedPayload)}`;
}

function readShareToken(token) {
  if (!token || token.length > MAX_SHARE_TOKEN_LENGTH) {
    return null;
  }

  const separatorIndex = token.lastIndexOf(".");

  if (separatorIndex <= 0) {
    return null;
  }

  const encodedPayload = token.slice(0, separatorIndex);
  const signature = token.slice(separatorIndex + 1);

  if (!safeEqual(signature, signPayload(encodedPayload))) {
    return null;
  }

  try {
    return normalizeSharePayload(JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")));
  } catch {
    return null;
  }
}

function createShareUrl(options) {
  const token = createShareToken(options);
  return `${SHARE_ORIGIN}/api/scores?share=${encodeURIComponent(token)}`;
}

function getModeLabel(gameMode) {
  return gameMode === CatnyamEngine.GAME_MODES.BOMB ? "폭탄피하기" : "츄르먹기";
}

function getShareCopy(payload) {
  const modeLabel = getModeLabel(payload.gameMode);
  const headline = `Cat Nyam ${modeLabel} 모드로 ${payload.nickname}님이 ${payload.score}점을 달성${payload.rank ? "하여" : "했다냥!"}`;
  const scopeLabel = payload.scope === "daily" ? "일일 랭킹" : "전체 랭킹";
  const rankMessage = payload.rank
    ? payload.overtakenNickname
      ? `${payload.overtakenNickname}님을 제끼고 ${payload.rank}위의 자리를 차지했다냥!`
      : `${scopeLabel} ${payload.rank}위의 자리를 차지했다냥!`
    : "";
  const callToAction = "지금 당장 츄르 잡으러 가봐라냥!";
  const message = [headline, rankMessage, callToAction].filter(Boolean).join("\n");

  return {
    headline,
    description: [rankMessage, callToAction].filter(Boolean).join(" "),
    message,
  };
}

function getQueryParam(req, name) {
  const queryValue = req.query?.[name];

  if (Array.isArray(queryValue)) {
    return String(queryValue[0] || "");
  }

  if (queryValue !== undefined) {
    return String(queryValue || "");
  }

  try {
    return new URL(req.url, SHARE_ORIGIN).searchParams.get(name) || "";
  } catch {
    return "";
  }
}

function getAtlasRect(metadata, item, columns, rows) {
  const left = Math.round((item.col * metadata.width) / columns);
  const top = Math.round((item.row * metadata.height) / rows);
  const right = Math.round(((item.col + 1) * metadata.width) / columns);
  const bottom = Math.round(((item.row + 1) * metadata.height) / rows);

  return {
    left,
    top,
    width: right - left,
    height: bottom - top,
  };
}

async function getAtlasCell(filePath, item, columns, rows) {
  const image = sharp(filePath);
  const metadata = await image.metadata();
  return image.extract(getAtlasRect(metadata, item, columns, rows));
}

function createUnderlaySvg() {
  return Buffer.from(`
    <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="shade" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#fffaf0" stop-opacity="0.35"/>
          <stop offset="0.55" stop-color="#fffaf0" stop-opacity="0.04"/>
          <stop offset="1" stop-color="#26352f" stop-opacity="0.16"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="630" fill="url(#shade)"/>
      <ellipse cx="600" cy="576" rx="205" ry="35" fill="#2b2a27" fill-opacity="0.2"/>
    </svg>
  `);
}

function createUiSvg(payload) {
  const modeText = payload.gameMode === CatnyamEngine.GAME_MODES.BOMB ? "BOMB DODGE" : "CHURU CATCH";
  const rankMarkup = payload.rank
    ? `<rect x="920" y="42" width="232" height="82" rx="18" fill="#fffaf0" stroke="#3b372f" stroke-width="4"/>
       <text x="1036" y="94" text-anchor="middle" font-family="Arial, sans-serif" font-size="32" font-weight="900" fill="#2c2925">RANK #${payload.rank}</text>`
    : "";
  const formattedScore = payload.score.toLocaleString("en-US");

  return Buffer.from(`
    <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <rect x="46" y="42" width="326" height="118" rx="22" fill="#fffaf0" stroke="#3b372f" stroke-width="4"/>
      <text x="72" y="96" font-family="Arial, sans-serif" font-size="42" font-weight="900" fill="#2c2925">CAT NYAM</text>
      <text x="73" y="135" font-family="Arial, sans-serif" font-size="21" font-weight="800" fill="#e95e83">${modeText}</text>
      ${rankMarkup}
      <rect x="805" y="438" width="347" height="146" rx="25" fill="#fffaf0" stroke="#3b372f" stroke-width="5"/>
      <text x="838" y="482" font-family="Arial, sans-serif" font-size="22" font-weight="800" fill="#70685e">SCORE</text>
      <text x="978" y="548" text-anchor="middle" font-family="Arial, sans-serif" font-size="61" font-weight="900" fill="#ef5f85">${formattedScore}</text>
      <text x="1122" y="558" text-anchor="end" font-family="Arial, sans-serif" font-size="18" font-weight="800" fill="#70685e">POINTS</text>
    </svg>
  `);
}

async function createShareImage(payload) {
  const backgroundItem = CATALOG.background[payload.background] || CATALOG.background[DEFAULT_BACKGROUND];
  const characterItem = CATALOG.character[payload.character] || CATALOG.character[DEFAULT_CHARACTER];
  const backgroundPath = path.join(__dirname, "..", "assets", "background-atlas.png");
  const characterMaskPath = path.join(__dirname, "..", "assets", "character-atlas.png");
  const characterHappyPath = path.join(__dirname, "..", "assets", "character-happy-atlas.png");
  const backgroundCell = await getAtlasCell(backgroundPath, backgroundItem, 2, 3);
  const characterHappyCell = await getAtlasCell(characterHappyPath, characterItem, 4, 4);
  const characterMaskCell = await getAtlasCell(characterMaskPath, characterItem, 4, 4);
  const backgroundBuffer = await backgroundCell
    .resize(1200, 630, { fit: "cover" })
    .modulate({ brightness: 0.88, saturation: 0.82 })
    .png()
    .toBuffer();
  const characterHappyBuffer = await characterHappyCell.png().toBuffer();
  const characterHappyMetadata = await sharp(characterHappyBuffer).metadata();
  const characterMaskBuffer = await characterMaskCell
    .resize(characterHappyMetadata.width, characterHappyMetadata.height, { fit: "fill" })
    .png()
    .toBuffer();
  const maskedCharacterBuffer = await sharp(characterHappyBuffer)
    .composite([{ input: characterMaskBuffer, blend: "dest-in" }])
    .png()
    .toBuffer();
  const characterBuffer = await sharp(maskedCharacterBuffer)
    .trim()
    .resize(410, 350, { fit: "inside", withoutEnlargement: false })
    .png()
    .toBuffer();
  const characterMetadata = await sharp(characterBuffer).metadata();
  const characterLeft = Math.round(600 - characterMetadata.width / 2);
  const characterTop = Math.round(600 - characterMetadata.height);

  return sharp(backgroundBuffer)
    .composite([
      { input: createUnderlaySvg(), left: 0, top: 0 },
      { input: characterBuffer, left: characterLeft, top: characterTop },
      { input: createUiSvg(payload), left: 0, top: 0 },
    ])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

function sendInvalidShare(res) {
  res.statusCode = 404;
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end("유효하지 않은 공유 링크입니다.");
}

function sendSharePage(res, token, payload) {
  const copy = getShareCopy(payload);
  const shareUrl = `${SHARE_ORIGIN}/api/scores?share=${encodeURIComponent(token)}`;
  const imageUrl = `${SHARE_ORIGIN}/api/scores?shareImage=${encodeURIComponent(token)}`;
  const title = escapeHtml(copy.headline);
  const description = escapeHtml(copy.description);
  const message = escapeHtml(copy.message).replace(/\n/g, "<br>");
  const html = `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Cat Nyam">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:url" content="${escapeHtml(shareUrl)}">
  <meta property="og:image" content="${escapeHtml(imageUrl)}">
  <meta property="og:image:secure_url" content="${escapeHtml(imageUrl)}">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Cat Nyam 게임 결과">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${escapeHtml(imageUrl)}">
  <link rel="canonical" href="${escapeHtml(shareUrl)}">
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 24px; color: #2c2925; background: #fff7e8; font-family: Arial, sans-serif; }
    main { width: min(560px, 100%); text-align: center; }
    img { display: block; width: 100%; border: 3px solid #3b372f; border-radius: 8px; }
    h1 { margin: 22px 0 10px; font-size: 24px; }
    p { margin: 0 0 22px; line-height: 1.7; }
    a { display: inline-block; padding: 13px 22px; border: 2px solid #3b372f; border-radius: 7px; color: white; background: #ef5f85; font-weight: 800; text-decoration: none; }
  </style>
</head>
<body>
  <main>
    <img src="${escapeHtml(imageUrl)}" alt="Cat Nyam 게임 결과">
    <h1>Cat Nyam 게임 결과</h1>
    <p>${message}</p>
    <a href="${SHARE_ORIGIN}/">게임하러 가기</a>
  </main>
  <script>window.setTimeout(function () { window.location.replace("${SHARE_ORIGIN}/"); }, 600);</script>
</body>
</html>`;

  res.statusCode = 200;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=300, s-maxage=86400, stale-while-revalidate=604800");
  res.end(html);
}

async function handleShareRequest(req, res) {
  if (req.method !== "GET") {
    return false;
  }

  const imageToken = getQueryParam(req, "shareImage");
  const pageToken = getQueryParam(req, "share");
  const token = imageToken || pageToken;

  if (!token) {
    return false;
  }

  const payload = readShareToken(token);

  if (!payload) {
    sendInvalidShare(res);
    return true;
  }

  if (imageToken) {
    const image = await createShareImage(payload);
    res.statusCode = 200;
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Content-Length", image.length);
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.end(image);
    return true;
  }

  sendSharePage(res, token, payload);
  return true;
}

module.exports = {
  createShareImage,
  createShareToken,
  createShareUrl,
  getShareCopy,
  handleShareRequest,
  readShareToken,
};
