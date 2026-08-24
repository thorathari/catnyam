const crypto = require("crypto");
const CatnyamEngine = require("../game-engine");

const {
  readJson,
  requireUser,
  resetScoresForUser,
  sanitizeUser,
  sendJson,
  supabaseRequest,
} = require("../server/db");
const { getUserLoadout } = require("../server/shop-catalog");

const CHURU_MIN_PLAY_MS = (CatnyamEngine.GAME_SECONDS - 5) * 1000;
const SESSION_TTL_MS = 3 * 60 * 60 * 1000;
const SUBMIT_CLOCK_SKEW_MS = 3000;
const MAX_ACCEPTED_SCORE = 500000;
const MAX_SHARE_RANKING_ROWS = 10000;
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

function normalizeGameMode(mode) {
  return CatnyamEngine.normalizeGameMode(mode);
}

function canUseGameMode(user, mode) {
  return Boolean(user && mode);
}

function getDisplayName(user) {
  return String(user.nickname || "").trim() || user.username;
}

function getKstDayRange(now = new Date()) {
  const kstNow = new Date(now.getTime() + KST_OFFSET_MS);
  const startAsUtc = Date.UTC(kstNow.getUTCFullYear(), kstNow.getUTCMonth(), kstNow.getUTCDate()) - KST_OFFSET_MS;

  return {
    start: new Date(startAsUtc).toISOString(),
    end: new Date(startAsUtc + 24 * 60 * 60 * 1000).toISOString(),
  };
}

function getShareScorePath(gameMode, scope = "allTime") {
  const normalizedMode = normalizeGameMode(gameMode);
  let path = `scores?select=user_id,score,created_at&game_mode=eq.${encodeURIComponent(normalizedMode)}`;

  if (scope === "daily") {
    const { start, end } = getKstDayRange();
    path += `&created_at=gte.${encodeURIComponent(start)}&created_at=lt.${encodeURIComponent(end)}`;
  }

  return `${path}&order=score.desc,created_at.asc&limit=${MAX_SHARE_RANKING_ROWS}`;
}

async function getShareRanking(userId, gameMode, scope = "allTime") {
  const normalizedMode = normalizeGameMode(gameMode);
  const [users, scores] = await Promise.all([
    supabaseRequest(`users?select=id,username,nickname&limit=${MAX_SHARE_RANKING_ROWS}`, {
      prefer: "",
    }),
    supabaseRequest(getShareScorePath(normalizedMode, scope), {
      prefer: "",
    }),
  ]);
  const usersById = new Map(users.map((account) => [account.id, account]));
  const bestByUser = new Map();

  scores.forEach((scoreRow) => {
    if (!usersById.has(scoreRow.user_id)) {
      return;
    }

    const score = Number(scoreRow.score) || 0;
    const previous = bestByUser.get(scoreRow.user_id);

    if (!previous || score > previous.score) {
      bestByUser.set(scoreRow.user_id, {
        id: scoreRow.user_id,
        nickname: getDisplayName(usersById.get(scoreRow.user_id)),
        score,
      });
    }
  });

  const rankings = Array.from(bestByUser.values())
    .sort((left, right) => right.score - left.score || left.nickname.localeCompare(right.nickname, "ko"));
  const rankingIndex = rankings.findIndex((account) => account.id === userId);

  if (rankingIndex < 0) {
    return null;
  }

  return {
    rank: rankingIndex + 1,
    rankingScore: rankings[rankingIndex].score,
    overtakenNickname: rankings[rankingIndex + 1]?.nickname || null,
    scope,
  };
}

async function getPersonalBestScore(userId, gameMode) {
  const scores = await supabaseRequest(
    `scores?user_id=eq.${encodeURIComponent(userId)}&game_mode=eq.${encodeURIComponent(normalizeGameMode(gameMode))}&select=score&order=score.desc,created_at.asc&limit=1`,
    {
      prefer: "",
    },
  );

  return Number(scores?.[0]?.score) || 0;
}

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;

  if (!secret) {
    throw new Error("SESSION_SECRET 환경변수가 필요합니다.");
  }

  return secret;
}

function hashGameToken(token) {
  return crypto.createHmac("sha256", getSessionSecret()).update(token).digest("hex");
}

function timingSafeEqualText(left, right) {
  const leftBuffer = Buffer.from(String(left || ""), "hex");
  const rightBuffer = Buffer.from(String(right || ""), "hex");

  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function isMissingPlaySecondsColumn(error) {
  return /play_seconds/i.test(error.message || "");
}

function isMissingColumn(error, columnName) {
  return new RegExp(columnName, "i").test(error.message || "")
    && /column|schema cache/i.test(error.message || "");
}

async function insertScore(scoreRow) {
  try {
    await supabaseRequest("scores", {
      method: "POST",
      body: scoreRow,
    });
  } catch (error) {
    if (!Object.hasOwn(scoreRow, "play_seconds") || !isMissingPlaySecondsColumn(error)) {
      throw error;
    }

    const { play_seconds: playSeconds, ...fallbackScoreRow } = scoreRow;
    await supabaseRequest("scores", {
      method: "POST",
      body: fallbackScoreRow,
    });
  }
}

async function createGameSession(user, gameMode) {
  const sessionId = crypto.randomUUID();
  const token = crypto.randomBytes(32).toString("base64url");
  const seed = crypto.randomBytes(16).toString("hex");
  const normalizedMode = normalizeGameMode(gameMode);
  const loadout = getUserLoadout(user);
  const now = Date.now();

  const sessionBody = {
    id: sessionId,
    user_id: user.id,
    token_hash: hashGameToken(token),
    seed,
    game_mode: normalizedMode,
    loadout,
    started_at: new Date(now).toISOString(),
    expires_at: new Date(now + SESSION_TTL_MS).toISOString(),
  };

  try {
    await supabaseRequest("game_sessions", {
      method: "POST",
      body: sessionBody,
    });
  } catch (error) {
    if (!isMissingColumn(error, "loadout")) {
      throw new Error(`게임 세션 저장에 실패했습니다. Supabase SQL Editor에서 supabase/schema.sql을 다시 실행해주세요. (${error.message})`);
    }

    const { loadout: unusedLoadout, ...fallbackBody } = sessionBody;
    await supabaseRequest("game_sessions", {
      method: "POST",
      body: fallbackBody,
    });
  }

  return {
    id: sessionId,
    token,
    seed,
    gameMode: normalizedMode,
    loadout,
    minSubmitAfterMs: normalizedMode === CatnyamEngine.GAME_MODES.BOMB ? 0 : CHURU_MIN_PLAY_MS,
  };
}

async function validateGameSession(user, sessionId, sessionToken, score, inputLog, gameMode, steps) {
  if (!sessionId || !sessionToken) {
    return { error: "게임 시작 토큰이 필요합니다." };
  }

  if (score > MAX_ACCEPTED_SCORE) {
    return { error: "점수 값이 비정상적으로 높습니다." };
  }

  const sessions = await supabaseRequest(`game_sessions?id=eq.${encodeURIComponent(sessionId)}&user_id=eq.${encodeURIComponent(user.id)}&select=*&limit=1`, {
    prefer: "",
  });
  const session = sessions?.[0];

  if (!session) {
    return { error: "게임 세션을 찾을 수 없습니다." };
  }

  const expectedHash = hashGameToken(sessionToken);

  if (!timingSafeEqualText(expectedHash, session.token_hash)) {
    return { error: "게임 세션 토큰이 올바르지 않습니다." };
  }

  const now = Date.now();
  const startedAt = new Date(session.started_at).getTime();
  const expiresAt = new Date(session.expires_at).getTime();
  const sessionGameMode = normalizeGameMode(session.game_mode);
  const requestedGameMode = normalizeGameMode(gameMode);

  if (sessionGameMode !== CatnyamEngine.GAME_MODES.BOMB && (Number.isNaN(startedAt) || now - startedAt < CHURU_MIN_PLAY_MS)) {
    return { error: "게임 시간이 너무 짧습니다." };
  }

  if (Number.isNaN(expiresAt) || now > expiresAt) {
    return { error: "게임 세션이 만료되었습니다." };
  }

  if (!session.seed) {
    return { error: "게임 세션 seed가 없습니다. Supabase SQL Editor에서 supabase/schema.sql을 다시 실행해주세요." };
  }

  if (!canUseGameMode(user, sessionGameMode)) {
    return { error: "폭탄피하기 모드는 현재 관리자만 이용할 수 있습니다." };
  }

  if (gameMode && requestedGameMode !== sessionGameMode) {
    return { error: "게임 모드 검증에 실패했습니다." };
  }

  const submittedSteps = Number(steps);

  if (!Number.isInteger(submittedSteps) || submittedSteps <= 0) {
    return { error: `${sessionGameMode === CatnyamEngine.GAME_MODES.BOMB ? "폭탄피하기" : "츄르먹기"} 종료 시간이 올바르지 않습니다.` };
  }

  const submittedPlayMs = submittedSteps * CatnyamEngine.STEP_SECONDS * 1000;

  if (Number.isNaN(startedAt) || submittedPlayMs - (now - startedAt) > SUBMIT_CLOCK_SKEW_MS) {
    return { error: `${sessionGameMode === CatnyamEngine.GAME_MODES.BOMB ? "폭탄피하기" : "츄르먹기"} 플레이 시간이 올바르지 않습니다.` };
  }

  const simulationOptions = {
    mode: sessionGameMode,
    steps: submittedSteps,
    loadout: session.loadout || getUserLoadout(user),
  };

  const simulation = CatnyamEngine.simulateGame(session.seed, inputLog, simulationOptions);

  if (simulation.error) {
    return { error: simulation.error };
  }

  if (simulation.score !== score) {
    return { error: "점수 검증에 실패했습니다." };
  }

  const usedSession = await supabaseRequest(`game_sessions?id=eq.${encodeURIComponent(session.id)}&user_id=eq.${encodeURIComponent(user.id)}&submitted_at=is.null`, {
    method: "PATCH",
    body: {
      submitted_at: new Date(now).toISOString(),
      submitted_score: score,
    },
  });

  if (!usedSession || usedSession.length === 0) {
    return { error: "이미 제출된 게임 세션입니다." };
  }

  return {
    score: simulation.score,
    coins: Math.max(0, Number(simulation.coins) || 0),
    gameMode: sessionGameMode,
    playSeconds: sessionGameMode === CatnyamEngine.GAME_MODES.BOMB ? Math.max(0, Math.floor(simulation.elapsed || 0)) : null,
  };
}

module.exports = async function handler(req, res) {
  try {
    if (req.method !== "POST" && req.method !== "DELETE") {
      res.setHeader("Allow", "POST, DELETE");
      sendJson(res, 405, { message: "허용되지 않은 요청입니다." });
      return;
    }

    const user = await requireUser(req, res);
    if (!user) return;

    if (req.method === "DELETE") {
      const body = await readJson(req);

      if (!body.gameMode) {
        sendJson(res, 400, { message: "초기화할 게임 모드를 선택해주세요." });
        return;
      }

      const updated = await resetScoresForUser(user.id, body.gameMode);
      sendJson(res, 200, { user: sanitizeUser(updated) });
      return;
    }

    const body = await readJson(req);
    const { action, score, sessionId, sessionToken, inputLog, gameMode, steps } = body;

    if (action === "start-game") {
      const normalizedMode = normalizeGameMode(gameMode);

      if (!canUseGameMode(user, normalizedMode)) {
        sendJson(res, 403, { message: "폭탄피하기 모드는 현재 관리자만 이용할 수 있습니다." });
        return;
      }

      const gameSession = await createGameSession(user, normalizedMode);
      sendJson(res, 200, { gameSession });
      return;
    }

    if (action !== "finish-game") {
      sendJson(res, 400, { message: "게임 시작 토큰이 필요합니다." });
      return;
    }

    const numericScore = Number(score);

    if (!Number.isInteger(numericScore) || numericScore < 0 || numericScore > MAX_ACCEPTED_SCORE) {
      sendJson(res, 400, { message: "점수 값이 올바르지 않습니다." });
      return;
    }

    const validation = await validateGameSession(user, sessionId, sessionToken, numericScore, inputLog, gameMode, steps);

    if (validation.error) {
      sendJson(res, 400, { message: validation.error });
      return;
    }

    const verifiedScore = validation.score;
    const previousPersonalBest = await getPersonalBestScore(user.id, validation.gameMode);
    const isPersonalBest = verifiedScore > 0 && verifiedScore >= previousPersonalBest;

    await insertScore({
      user_id: user.id,
      score: verifiedScore,
      game_mode: validation.gameMode,
      play_seconds: validation.playSeconds,
    });

    const bestScore = Math.max(user.best_score || 0, verifiedScore);
    const userPatch = {
      best_score: bestScore,
      games_played: (user.games_played || 0) + 1,
      coins: Math.max(0, Number(user.coins) || 0) + validation.coins,
      updated_at: new Date().toISOString(),
    };
    let updated;

    try {
      updated = await supabaseRequest(`users?id=eq.${encodeURIComponent(user.id)}`, {
        method: "PATCH",
        body: userPatch,
      });
    } catch (error) {
      if (!isMissingColumn(error, "coins")) {
        throw error;
      }

      const { coins: unusedCoins, ...fallbackPatch } = userPatch;
      updated = await supabaseRequest(`users?id=eq.${encodeURIComponent(user.id)}`, {
        method: "PATCH",
        body: fallbackPatch,
      });
    }

    let shareRanking = null;
    let shareRankings = {
      daily: null,
      allTime: null,
    };

    try {
      const [dailyShareRanking, allTimeShareRanking] = await Promise.all([
        getShareRanking(user.id, validation.gameMode, "daily"),
        getShareRanking(user.id, validation.gameMode, "allTime"),
      ]);
      shareRankings = {
        daily: dailyShareRanking ? { ...dailyShareRanking, isPersonalBest } : null,
        allTime: allTimeShareRanking ? { ...allTimeShareRanking, isPersonalBest } : null,
      };
      shareRanking = shareRankings.allTime;
      if (shareRanking) {
        shareRanking.isPersonalBest = isPersonalBest;
      }
    } catch (error) {
      console.warn("Share ranking lookup failed:", error);
    }

    sendJson(res, 200, {
      user: sanitizeUser(updated[0]),
      shareRanking,
      shareRankings,
      coinsEarned: validation.coins,
    });
  } catch (error) {
    sendJson(res, 500, { message: error.message });
  }
};
