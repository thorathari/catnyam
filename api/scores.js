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

const GAME_SECONDS = 45;
const MIN_PLAY_MS = (GAME_SECONDS - 5) * 1000;
const SESSION_TTL_MS = 30 * 60 * 1000;
const MAX_ACCEPTED_SCORE = 5000;

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

async function createGameSession(user) {
  const sessionId = crypto.randomUUID();
  const token = crypto.randomBytes(32).toString("base64url");
  const seed = crypto.randomBytes(16).toString("hex");
  const now = Date.now();

  try {
    await supabaseRequest("game_sessions", {
      method: "POST",
      body: {
        id: sessionId,
        user_id: user.id,
        token_hash: hashGameToken(token),
        seed,
        started_at: new Date(now).toISOString(),
        expires_at: new Date(now + SESSION_TTL_MS).toISOString(),
      },
    });
  } catch (error) {
    throw new Error(`게임 세션 저장에 실패했습니다. Supabase SQL Editor에서 supabase/schema.sql을 다시 실행해주세요. (${error.message})`);
  }

  return {
    id: sessionId,
    token,
    seed,
    minSubmitAfterMs: MIN_PLAY_MS,
  };
}

async function validateGameSession(user, sessionId, sessionToken, score, inputLog) {
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

  if (Number.isNaN(startedAt) || now - startedAt < MIN_PLAY_MS) {
    return { error: "게임 시간이 너무 짧습니다." };
  }

  if (Number.isNaN(expiresAt) || now > expiresAt) {
    return { error: "게임 세션이 만료되었습니다." };
  }

  if (!session.seed) {
    return { error: "게임 세션 seed가 없습니다. Supabase SQL Editor에서 supabase/schema.sql을 다시 실행해주세요." };
  }

  const simulation = CatnyamEngine.simulateGame(session.seed, inputLog);

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

  return { score: simulation.score };
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
      const updated = await resetScoresForUser(user.id);
      sendJson(res, 200, { user: sanitizeUser(updated) });
      return;
    }

    const body = await readJson(req);
    const { action, score, sessionId, sessionToken, inputLog } = body;

    if (action === "start-game") {
      const gameSession = await createGameSession(user);
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

    const validation = await validateGameSession(user, sessionId, sessionToken, numericScore, inputLog);

    if (validation.error) {
      sendJson(res, 400, { message: validation.error });
      return;
    }

    const verifiedScore = validation.score;

    await supabaseRequest("scores", {
      method: "POST",
      body: {
        user_id: user.id,
        score: verifiedScore,
      },
    });

    const bestScore = Math.max(user.best_score || 0, verifiedScore);
    const updated = await supabaseRequest(`users?id=eq.${encodeURIComponent(user.id)}`, {
      method: "PATCH",
      body: {
        best_score: bestScore,
        games_played: (user.games_played || 0) + 1,
        updated_at: new Date().toISOString(),
      },
    });

    sendJson(res, 200, { user: sanitizeUser(updated[0]) });
  } catch (error) {
    sendJson(res, 500, { message: error.message });
  }
};
