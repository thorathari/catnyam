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
const LEGACY_SHARE_TOKEN_VERSION = 1;
const SHORT_SHARE_TOKEN_VERSION = 2;
const SHARE_IMAGE_REVISION = 3;
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
  const companionLeft = CATALOG.companion[value?.x] ? value.x : null;
  const companionRight = CATALOG.companion[value?.y] && value.y !== companionLeft ? value.y : null;

  if (value?.v !== LEGACY_SHARE_TOKEN_VERSION || !Number.isInteger(score) || score < 0 || score > MAX_SCORE) {
    return null;
  }

  return {
    version: LEGACY_SHARE_TOKEN_VERSION,
    nickname: cleanText(value.n) || "플레이어",
    score,
    gameMode: mode,
    rank: Number.isInteger(rank) && rank > 0 ? rank : null,
    overtakenNickname: cleanText(value.o),
    scope: value.q === "daily" ? "daily" : "allTime",
    character,
    companionLeft,
    companionRight,
    background,
  };
}

function normalizeResolvedPayload(value) {
  return normalizeSharePayload({
    v: LEGACY_SHARE_TOKEN_VERSION,
    n: value?.nickname,
    s: value?.score,
    m: value?.gameMode,
    r: value?.rank,
    o: value?.overtakenNickname,
    q: value?.scope,
    c: value?.character,
    x: value?.companionLeft,
    y: value?.companionRight,
    b: value?.background,
  });
}

function uuidToBuffer(value) {
  const hex = String(value || "").replace(/-/g, "").toLowerCase();

  if (!/^[0-9a-f]{32}$/.test(hex)) {
    return null;
  }

  return Buffer.from(hex, "hex");
}

function bufferToUuid(value) {
  const hex = value.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function signReference(encodedReference) {
  return crypto
    .createHmac("sha256", getSecret())
    .update(`catnyam-share-reference:${encodedReference}`)
    .digest()
    .subarray(0, 12)
    .toString("base64url");
}

function createShareToken({ sessionId, scope = "allTime" }) {
  const sessionBytes = uuidToBuffer(sessionId);

  if (!sessionBytes) {
    throw new Error("공유할 게임 세션 ID가 올바르지 않습니다.");
  }

  const reference = Buffer.concat([
    Buffer.from([SHORT_SHARE_TOKEN_VERSION, scope === "daily" ? 1 : 0]),
    sessionBytes,
  ]).toString("base64url");
  return `${reference}.${signReference(reference)}`;
}

function createShareImageToken(payload) {
  const encodedPayload = Buffer.from(JSON.stringify({
    v: LEGACY_SHARE_TOKEN_VERSION,
    g: SHARE_IMAGE_REVISION,
    n: payload.nickname,
    s: payload.score,
    m: payload.gameMode,
    r: payload.rank,
    o: payload.overtakenNickname,
    q: payload.scope,
    c: payload.character,
    x: payload.companionLeft,
    y: payload.companionRight,
    b: payload.background,
  })).toString("base64url");

  return `${encodedPayload}.${signPayload(encodedPayload)}`;
}

function readShortShareToken(token) {
  const separatorIndex = token.lastIndexOf(".");

  if (separatorIndex <= 0) {
    return null;
  }

  const encodedReference = token.slice(0, separatorIndex);
  const signature = token.slice(separatorIndex + 1);

  if (!safeEqual(signature, signReference(encodedReference))) {
    return null;
  }

  try {
    const reference = Buffer.from(encodedReference, "base64url");

    if (reference.length !== 18 || reference[0] !== SHORT_SHARE_TOKEN_VERSION) {
      return null;
    }

    return {
      type: "reference",
      sessionId: bufferToUuid(reference.subarray(2)),
      scope: reference[1] === 1 ? "daily" : "allTime",
    };
  } catch {
    return null;
  }
}

function readLegacyShareToken(token) {
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
    const payload = normalizeSharePayload(JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")));
    return payload ? { type: "payload", payload } : null;
  } catch {
    return null;
  }
}

function readShareToken(token) {
  if (!token || token.length > MAX_SHARE_TOKEN_LENGTH) {
    return null;
  }

  return readShortShareToken(token) || readLegacyShareToken(token);
}

function createShareUrl(options) {
  return `${SHARE_ORIGIN}/s/${createShareToken(options)}`;
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

function keepLargestOpaqueComponent(data, width, height, channels) {
  const labels = new Uint32Array(width * height);
  const stack = [];
  let nextLabel = 0;
  let largestLabel = 0;
  let largestSize = 0;

  for (let start = 0; start < labels.length; start += 1) {
    if (labels[start] || data[start * channels + 3] === 0) {
      continue;
    }

    nextLabel += 1;
    labels[start] = nextLabel;
    stack.push(start);
    let size = 0;

    while (stack.length > 0) {
      const pixel = stack.pop();
      const x = pixel % width;
      size += 1;
      const neighbors = [pixel - 1, pixel + 1, pixel - width, pixel + width];

      neighbors.forEach((neighbor, index) => {
        const crossesRow = (index === 0 && x === 0) || (index === 1 && x === width - 1);
        if (crossesRow || neighbor < 0 || neighbor >= labels.length || labels[neighbor]) {
          return;
        }
        if (data[neighbor * channels + 3] > 0) {
          labels[neighbor] = nextLabel;
          stack.push(neighbor);
        }
      });
    }

    if (size > largestSize) {
      largestLabel = nextLabel;
      largestSize = size;
    }
  }

  for (let pixel = 0; pixel < labels.length; pixel += 1) {
    if (labels[pixel] !== largestLabel) {
      data[pixel * channels + 3] = 0;
    }
  }
}

function refineOpaqueEdge(data, width, height, channels) {
  const opaque = new Uint8Array(width * height);
  const eroded = new Uint8Array(width * height);

  for (let pixel = 0; pixel < opaque.length; pixel += 1) {
    opaque[pixel] = data[pixel * channels + 3] > 0 ? 1 : 0;
  }

  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const pixel = y * width + x;
      if (!opaque[pixel]) {
        continue;
      }

      let surrounded = true;
      for (let offsetY = -1; offsetY <= 1 && surrounded; offsetY += 1) {
        for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
          if (!opaque[(y + offsetY) * width + x + offsetX]) {
            surrounded = false;
            break;
          }
        }
      }
      eroded[pixel] = surrounded ? 1 : 0;
    }
  }

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const pixel = y * width + x;
      const alphaOffset = pixel * channels + 3;
      if (!eroded[pixel]) {
        data[alphaOffset] = 0;
        continue;
      }

      let boundary = false;
      for (let offsetY = -1; offsetY <= 1 && !boundary; offsetY += 1) {
        for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
          const neighborX = x + offsetX;
          const neighborY = y + offsetY;
          if (neighborX < 0 || neighborX >= width || neighborY < 0 || neighborY >= height
            || !eroded[neighborY * width + neighborX]) {
            boundary = true;
            break;
          }
        }
      }
      if (boundary) {
        data[alphaOffset] = Math.min(data[alphaOffset], 200);
      }
    }
  }
}

function addCharacterOutline(data, width, height, channels, radius = 2) {
  const alpha = new Uint8Array(width * height);

  for (let pixel = 0; pixel < alpha.length; pixel += 1) {
    alpha[pixel] = data[pixel * channels + 3];
  }

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const pixel = y * width + x;
      if (alpha[pixel] > 0) {
        continue;
      }

      let nearestDistance = Infinity;
      for (let offsetY = -radius; offsetY <= radius; offsetY += 1) {
        for (let offsetX = -radius; offsetX <= radius; offsetX += 1) {
          const distance = offsetX * offsetX + offsetY * offsetY;
          if (distance === 0 || distance > radius * radius) {
            continue;
          }

          const neighborX = x + offsetX;
          const neighborY = y + offsetY;
          if (neighborX < 0 || neighborX >= width || neighborY < 0 || neighborY >= height) {
            continue;
          }
          if (alpha[neighborY * width + neighborX] >= 96) {
            nearestDistance = Math.min(nearestDistance, distance);
          }
        }
      }

      if (nearestDistance === Infinity) {
        continue;
      }

      const offset = pixel * channels;
      data[offset] = 52;
      data[offset + 1] = 42;
      data[offset + 2] = 35;
      data[offset + 3] = nearestDistance <= 1 ? 255 : 205;
    }
  }
}

async function removeConnectedDarkBackground(imageBuffer, refineEdge = false, darkThreshold = 24) {
  const { data, info } = await sharp(imageBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const visited = new Uint8Array(info.width * info.height);
  const stack = [];

  const isBackground = (pixel) => {
    const offset = pixel * info.channels;
    const red = data[offset];
    const green = data[offset + 1];
    const blue = data[offset + 2];
    return Math.max(red, green, blue) <= darkThreshold
      && Math.max(red, green, blue) - Math.min(red, green, blue) <= 12;
  };
  const enqueue = (pixel) => {
    if (pixel < 0 || pixel >= visited.length || visited[pixel] || !isBackground(pixel)) {
      return;
    }
    visited[pixel] = 1;
    stack.push(pixel);
  };

  for (let x = 0; x < info.width; x += 1) {
    enqueue(x);
    enqueue((info.height - 1) * info.width + x);
  }
  for (let y = 0; y < info.height; y += 1) {
    enqueue(y * info.width);
    enqueue(y * info.width + info.width - 1);
  }

  while (stack.length > 0) {
    const pixel = stack.pop();
    const x = pixel % info.width;
    const offset = pixel * info.channels;
    data[offset + 3] = 0;
    if (x > 0) enqueue(pixel - 1);
    if (x < info.width - 1) enqueue(pixel + 1);
    enqueue(pixel - info.width);
    enqueue(pixel + info.width);
  }

  keepLargestOpaqueComponent(data, info.width, info.height, info.channels);

  if (refineEdge) {
    refineOpaqueEdge(data, info.width, info.height, info.channels);
    keepLargestOpaqueComponent(data, info.width, info.height, info.channels);
    addCharacterOutline(data, info.width, info.height, info.channels);
  }

  return sharp(data, { raw: info }).png().toBuffer();
}

function getShareCharacterAtlas(item) {
  return item?.atlas === "extra"
    ? {
      happyFile: "character-extra-happy-atlas.png",
      columns: 3,
      rows: 3,
    }
    : {
      happyFile: "character-happy-atlas.png",
      columns: 4,
      rows: 4,
    };
}

function getShareBackgroundAtlas(item) {
  return item?.atlas === "extra"
    ? { file: "background-extra-atlas.png", columns: 2, rows: 1 }
    : { file: "background-atlas.png", columns: 2, rows: 3 };
}

function getShareCompanionLayout(payload) {
  const companionIds = [payload.companionLeft, payload.companionRight]
    .filter((companionId, index, values) => CATALOG.companion[companionId] && values.indexOf(companionId) === index);
  const centers = companionIds.length > 1 ? [210, 355] : [355];

  return companionIds.map((companionId, index) => ({
    id: companionId,
    centerX: centers[index],
    baselineY: 588,
  }));
}

function createUnderlaySvg(payload) {
  const companionShadows = getShareCompanionLayout(payload)
    .map(({ centerX, baselineY }) => `<ellipse cx="${centerX}" cy="${baselineY}" rx="70" ry="18" fill="#2b2a27" fill-opacity="0.17"/>`)
    .join("");

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
      ${companionShadows}
      <ellipse cx="600" cy="576" rx="205" ry="35" fill="#2b2a27" fill-opacity="0.2"/>
    </svg>
  `);
}

const PIXEL_GLYPHS = {
  " ": ["000", "000", "000", "000", "000", "000", "000"],
  "#": ["01010", "11111", "01010", "01010", "11111", "01010", "01010"],
  ",": ["000", "000", "000", "000", "000", "010", "100"],
  "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
  "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  "2": ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
  "3": ["11110", "00001", "00001", "01110", "00001", "00001", "11110"],
  "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
  "5": ["11111", "10000", "10000", "11110", "00001", "00001", "11110"],
  "6": ["01110", "10000", "10000", "11110", "10001", "10001", "01110"],
  "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
  "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
  "9": ["01110", "10001", "10001", "01111", "00001", "00001", "01110"],
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  C: ["01111", "10000", "10000", "10000", "10000", "10000", "01111"],
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  G: ["01111", "10000", "10000", "10111", "10001", "10001", "01110"],
  H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  I: ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
  K: ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  N: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  Y: ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
};

function getPixelTextWidth(text, scale) {
  const glyphWidths = Array.from(text, (character) => (PIXEL_GLYPHS[character] || PIXEL_GLYPHS[" "])[0].length * scale);
  return glyphWidths.reduce((total, width) => total + width, 0) + Math.max(0, glyphWidths.length - 1) * scale;
}

function renderPixelText(text, x, y, scale, color, align = "left") {
  const normalizedText = String(text || "").toUpperCase();
  const totalWidth = getPixelTextWidth(normalizedText, scale);
  let cursorX = align === "center" ? x - totalWidth / 2 : align === "right" ? x - totalWidth : x;
  const pixelRadius = Math.max(0.4, scale * 0.1);
  const markup = [];

  Array.from(normalizedText).forEach((character) => {
    const pattern = PIXEL_GLYPHS[character] || PIXEL_GLYPHS[" "];

    pattern.forEach((row, rowIndex) => {
      Array.from(row).forEach((pixel, columnIndex) => {
        if (pixel === "1") {
          markup.push(`<rect x="${cursorX + columnIndex * scale}" y="${y + rowIndex * scale}" width="${scale}" height="${scale}" rx="${pixelRadius}" fill="${color}"/>`);
        }
      });
    });
    cursorX += (pattern[0].length + 1) * scale;
  });

  return markup.join("");
}

function createUiSvg(payload) {
  const modeText = payload.gameMode === CatnyamEngine.GAME_MODES.BOMB ? "BOMB DODGE" : "CHURU CATCH";
  const rankMarkup = payload.rank
    ? `<rect x="876" y="42" width="276" height="82" rx="18" fill="#fffaf0" stroke="#3b372f" stroke-width="4"/>
       ${renderPixelText(`RANK #${payload.rank}`, 1014, 69, 4, "#2c2925", "center")}`
    : "";
  const formattedScore = payload.score.toLocaleString("en-US");

  return Buffer.from(`
    <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <rect x="46" y="42" width="390" height="118" rx="22" fill="#fffaf0" stroke="#3b372f" stroke-width="4"/>
      ${renderPixelText("CAT NYAM", 241, 66, 6, "#2c2925", "center")}
      ${renderPixelText(modeText, 241, 126, 3, "#e95e83", "center")}
      ${rankMarkup}
      <rect x="805" y="438" width="347" height="146" rx="25" fill="#fffaf0" stroke="#3b372f" stroke-width="5"/>
      ${renderPixelText("SCORE", 838, 467, 3, "#70685e")}
      ${renderPixelText("POINTS", 1122, 467, 2, "#70685e", "right")}
      ${renderPixelText(formattedScore, 978, 506, 8, "#ef5f85", "center")}
    </svg>
  `);
}

async function createShareImage(payload) {
  const backgroundItem = CATALOG.background[payload.background] || CATALOG.background[DEFAULT_BACKGROUND];
  const characterItem = CATALOG.character[payload.character] || CATALOG.character[DEFAULT_CHARACTER];
  const backgroundAtlas = getShareBackgroundAtlas(backgroundItem);
  const characterAtlas = getShareCharacterAtlas(characterItem);
  const backgroundPath = path.join(__dirname, "..", "assets", backgroundAtlas.file);
  const characterHappyPath = path.join(__dirname, "..", "assets", characterAtlas.happyFile);
  const companionPath = path.join(__dirname, "..", "assets", "companion-atlas.png");
  const backgroundCell = await getAtlasCell(
    backgroundPath,
    backgroundItem,
    backgroundAtlas.columns,
    backgroundAtlas.rows,
  );
  const characterHappyCell = await getAtlasCell(
    characterHappyPath,
    characterItem,
    characterAtlas.columns,
    characterAtlas.rows,
  );
  const backgroundBuffer = await backgroundCell
    .resize(1200, 630, { fit: "cover" })
    .modulate({ brightness: 0.88, saturation: 0.82 })
    .png()
    .toBuffer();
  const characterHappyBuffer = await characterHappyCell.png().toBuffer();
  const darkEdgeThreshold = ["black", "tuxedo", "calico"].includes(payload.character) ? 24 : 72;
  const maskedCharacterBuffer = await removeConnectedDarkBackground(
    characterHappyBuffer,
    characterItem.atlas !== "extra",
    darkEdgeThreshold,
  );
  const characterBuffer = await sharp(maskedCharacterBuffer)
    .trim()
    .resize(410, 350, { fit: "inside", withoutEnlargement: false })
    .png()
    .toBuffer();
  const characterMetadata = await sharp(characterBuffer).metadata();
  const characterLeft = Math.round(600 - characterMetadata.width / 2);
  const characterTop = Math.round(600 - characterMetadata.height);
  const companionComposites = [];

  for (const companion of getShareCompanionLayout(payload)) {
    try {
      const companionItem = CATALOG.companion[companion.id];
      const companionCell = await getAtlasCell(companionPath, companionItem, 3, 2);
      const companionCellBuffer = await companionCell.png().toBuffer();
      let companionArtwork = sharp(companionCellBuffer)
        .trim()
        .resize(150, 145, { fit: "inside", withoutEnlargement: false });

      if (companion.id === "chick" || companion.id === "sparrow") {
        companionArtwork = companionArtwork.flop();
      }

      const companionBuffer = await companionArtwork.png().toBuffer();
      const companionMetadata = await sharp(companionBuffer).metadata();
      companionComposites.push({
        input: companionBuffer,
        left: Math.round(companion.centerX - companionMetadata.width / 2),
        top: Math.round(companion.baselineY - companionMetadata.height),
      });
    } catch (error) {
      console.warn(`Shared companion artwork skipped (${companion.id}):`, error.message);
    }
  }

  return sharp(backgroundBuffer)
    .composite([
      { input: createUnderlaySvg(payload), left: 0, top: 0 },
      { input: characterBuffer, left: characterLeft, top: characterTop },
      ...companionComposites,
      { input: createUiSvg(payload), left: 0, top: 0 },
    ])
    .jpeg({ quality: 86, chromaSubsampling: "4:2:0", progressive: false })
    .toBuffer();
}

function createFallbackShareImage(payload) {
  const scene = Buffer.from(`
    <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="630" fill="#dff5ff"/>
      <rect y="390" width="1200" height="240" fill="#cfe5a4"/>
      <ellipse cx="170" cy="145" rx="92" ry="32" fill="#ffffff" opacity="0.82"/>
      <ellipse cx="980" cy="210" rx="116" ry="38" fill="#ffffff" opacity="0.76"/>
      <circle cx="600" cy="415" r="110" fill="#fff8e9" stroke="#3b372f" stroke-width="7"/>
      <path d="M535 385 L565 330 L595 386 M605 386 L640 330 L670 390" fill="#efb16c" stroke="#3b372f" stroke-width="7" stroke-linejoin="round"/>
      <circle cx="565" cy="416" r="10" fill="#3b372f"/>
      <circle cx="635" cy="416" r="10" fill="#3b372f"/>
      <path d="M580 454 Q600 470 620 454" fill="none" stroke="#3b372f" stroke-width="7" stroke-linecap="round"/>
    </svg>
  `);

  return sharp(scene)
    .composite([{ input: createUiSvg(payload), left: 0, top: 0 }])
    .jpeg({ quality: 86, chromaSubsampling: "4:2:0", progressive: false })
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
  const shareUrl = `${SHARE_ORIGIN}/s/${token}`;
  const imageToken = createShareImageToken(payload);
  const imageUrl = `${SHARE_ORIGIN}/api/scores?shareImage=${encodeURIComponent(imageToken)}`;
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
  <meta property="og:image:url" content="${escapeHtml(imageUrl)}">
  <meta property="og:image:secure_url" content="${escapeHtml(imageUrl)}">
  <meta property="og:image:type" content="image/jpeg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Cat Nyam 게임 결과">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${escapeHtml(imageUrl)}">
  <link rel="canonical" href="${escapeHtml(shareUrl)}">
  <script>window.location.replace("${SHARE_ORIGIN}/");</script>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 24px; color: #2c2925; background: #fff7e8; font-family: Arial, sans-serif; }
    main { width: min(560px, 100%); text-align: center; }
    img { display: block; width: 100%; border: 3px solid #3b372f; border-radius: 8px; }
    h1 { margin: 22px 0 10px; font-size: 24px; }
    p { margin: 0 0 22px; line-height: 1.7; }
  </style>
</head>
<body>
  <main>
    <img src="${escapeHtml(imageUrl)}" alt="Cat Nyam 게임 결과">
    <h1>Cat Nyam 게임 결과</h1>
    <p>${message}</p>
  </main>
</body>
</html>`;

  res.statusCode = 200;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=300, s-maxage=86400, stale-while-revalidate=604800");
  res.end(html);
}

async function handleShareRequest(req, res, resolveShareReference) {
  if (req.method !== "GET") {
    return false;
  }

  const imageToken = getQueryParam(req, "shareImage");
  const pageToken = getQueryParam(req, "share");
  const token = imageToken || pageToken;

  if (!token) {
    return false;
  }

  const shareData = readShareToken(token);

  if (!shareData) {
    sendInvalidShare(res);
    return true;
  }

  const payload = shareData.type === "payload"
    ? shareData.payload
    : normalizeResolvedPayload(await resolveShareReference?.(shareData));

  if (!payload) {
    sendInvalidShare(res);
    return true;
  }

  if (imageToken) {
    let image;

    try {
      image = await createShareImage(payload);
    } catch (error) {
      console.warn("Shared result artwork failed; using fallback:", error.message);
      image = await createFallbackShareImage(payload);
    }

    res.statusCode = 200;
    res.setHeader("Content-Type", "image/jpeg");
    res.setHeader("Content-Length", image.length);
    res.setHeader("Content-Disposition", "inline; filename=catnyam-result.jpg");
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
