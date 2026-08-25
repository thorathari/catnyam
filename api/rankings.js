const {
  requireAdmin,
  readJson,
  sendJson,
  supabaseRequest,
} = require("../server/db");
const CatnyamEngine = require("../game-engine");

const MAX_HISTORY = 30;
const MAX_DAILY_SCORES = 10000;
const MAX_RANKING_ROWS = 10000;
const MAX_RECENT_PLAYS = 5;
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

function normalizeGameMode(mode) {
  return CatnyamEngine.normalizeGameMode(mode);
}

function getGameModeFilter(gameMode) {
  return `game_mode=eq.${encodeURIComponent(normalizeGameMode(gameMode))}`;
}

function isMissingPlaySecondsColumn(error) {
  return /play_seconds/i.test(error.message || "");
}

function getPlaySeconds(scoreRow) {
  const seconds = Number(scoreRow?.play_seconds);

  if (!Number.isFinite(seconds) || seconds < 0) {
    return null;
  }

  return Math.floor(seconds);
}

async function getScoresWithPlaySeconds(pathWithPlaySeconds, pathWithoutPlaySeconds) {
  try {
    return await supabaseRequest(pathWithPlaySeconds, {
      prefer: "",
    });
  } catch (error) {
    if (!isMissingPlaySecondsColumn(error)) {
      throw error;
    }

    return supabaseRequest(pathWithoutPlaySeconds, {
      prefer: "",
    });
  }
}

function getDisplayName(user) {
  return String(user.nickname || "").trim() || user.username;
}

function getRequestUrl(req) {
  return new URL(req.url || "/api/rankings", `http://${req.headers.host || "localhost"}`);
}

function getKstDayRange(now = new Date()) {
  const kstNow = new Date(now.getTime() + KST_OFFSET_MS);
  const startAsUtc = Date.UTC(kstNow.getUTCFullYear(), kstNow.getUTCMonth(), kstNow.getUTCDate()) - KST_OFFSET_MS;

  return {
    start: new Date(startAsUtc).toISOString(),
    end: new Date(startAsUtc + 24 * 60 * 60 * 1000).toISOString(),
  };
}

function mapAllTimeRanking(user) {
  return {
    id: user.id,
    username: user.username,
    nickname: getDisplayName(user),
    role: user.role,
    bestScore: user.best_score || 0,
  };
}

async function sendPlayerHistory(req, res, userId, gameMode) {
  const admin = await requireAdmin(req, res);

  if (!admin) {
    return;
  }

  if (!userId) {
    sendJson(res, 400, { message: "플레이어 정보가 올바르지 않습니다." });
    return;
  }

  const users = await supabaseRequest(`users?id=eq.${encodeURIComponent(userId)}&select=*&limit=1`, {
    prefer: "",
  });
  const user = users?.[0];

  if (!user) {
    sendJson(res, 404, { message: "플레이어를 찾을 수 없습니다." });
    return;
  }

  const payload = await buildPlayerHistoryPayload(user, gameMode);
  sendJson(res, 200, payload);
}

async function buildPlayerHistoryPayload(user, gameMode) {
  const normalizedMode = normalizeGameMode(gameMode);
  const modeFilter = getGameModeFilter(normalizedMode);
  const scoreBaseFilter = `user_id=eq.${encodeURIComponent(user.id)}&${modeFilter}`;
  const scores = await getScoresWithPlaySeconds(
    `scores?${scoreBaseFilter}&select=id,score,created_at,game_mode,play_seconds&order=created_at.desc&limit=${MAX_HISTORY}`,
    `scores?${scoreBaseFilter}&select=id,score,created_at,game_mode&order=created_at.desc&limit=${MAX_HISTORY}`,
  );
  const allScores = await getScoresWithPlaySeconds(
    `scores?${scoreBaseFilter}&select=id,score,play_seconds&order=score.desc,created_at.asc&limit=${MAX_RANKING_ROWS}`,
    `scores?${scoreBaseFilter}&select=id,score&order=score.desc,created_at.asc&limit=${MAX_RANKING_ROWS}`,
  );
  const { start, end } = getKstDayRange();
  const todayScores = await supabaseRequest(`scores?${scoreBaseFilter}&select=id&created_at=gte.${encodeURIComponent(start)}&created_at=lt.${encodeURIComponent(end)}&limit=${MAX_DAILY_SCORES}`, {
    prefer: "",
  });
  const history = scores.map((scoreRow) => ({
    id: scoreRow.id,
    score: scoreRow.score || 0,
    gameMode: normalizeGameMode(scoreRow.game_mode),
    playSeconds: getPlaySeconds(scoreRow),
    createdAt: scoreRow.created_at,
  }));

  return {
    user: {
      ...mapAllTimeRanking(user),
      bestScore: allScores[0]?.score || 0,
      playSeconds: getPlaySeconds(allScores[0]),
      gamesPlayed: user.games_played || 0,
      coins: Math.max(0, Number(user.coins) || 0),
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      lastLoginAt: user.last_login_at,
    },
    stats: {
      gameMode: normalizedMode,
      totalGamesPlayed: allScores.length,
      todayGamesPlayed: todayScores.length,
    },
    history,
  };
}

async function recalculateUserScoreStats(userId) {
  const remainingScores = await supabaseRequest(`scores?user_id=eq.${encodeURIComponent(userId)}&select=score&order=score.desc,created_at.asc&limit=${MAX_RANKING_ROWS}`, {
    prefer: "",
  });
  const bestScore = remainingScores[0]?.score || 0;
  const updated = await supabaseRequest(`users?id=eq.${encodeURIComponent(userId)}`, {
    method: "PATCH",
    body: {
      best_score: bestScore,
      games_played: remainingScores.length,
      updated_at: new Date().toISOString(),
    },
  });

  return updated[0] || null;
}

async function deletePlayerHistory(req, res) {
  const admin = await requireAdmin(req, res);

  if (!admin) {
    return;
  }

  const { userId, scoreId, gameMode } = await readJson(req);
  const scoreKey = String(scoreId || "").trim();

  if (!userId || !/^\d+$/.test(scoreKey)) {
    sendJson(res, 400, { message: "삭제할 플레이 기록 정보가 올바르지 않습니다." });
    return;
  }

  const users = await supabaseRequest(`users?id=eq.${encodeURIComponent(userId)}&select=*&limit=1`, {
    prefer: "",
  });
  const user = users?.[0];

  if (!user) {
    sendJson(res, 404, { message: "플레이어를 찾을 수 없습니다." });
    return;
  }

  const deleted = await supabaseRequest(`scores?id=eq.${encodeURIComponent(scoreKey)}&user_id=eq.${encodeURIComponent(user.id)}`, {
    method: "DELETE",
  });

  if (!deleted || deleted.length === 0) {
    sendJson(res, 404, { message: "삭제할 플레이 기록을 찾을 수 없습니다." });
    return;
  }

  const updatedUser = await recalculateUserScoreStats(user.id);
  const payload = await buildPlayerHistoryPayload(updatedUser || user, gameMode);
  sendJson(res, 200, {
    ...payload,
    deletedScoreId: scoreKey,
  });
}

function buildDailyRankings(scores, users) {
  const usersById = new Map(users.map((user) => [user.id, user]));
  const bestByUser = new Map();

  scores.forEach((scoreRow) => {
    const user = usersById.get(scoreRow.user_id);

    if (!user) {
      return;
    }

    const score = scoreRow.score || 0;
    const previous = bestByUser.get(scoreRow.user_id);

    if (!previous || score > previous.score || (score === previous.score && scoreRow.created_at < previous.createdAt)) {
      bestByUser.set(scoreRow.user_id, {
        id: user.id,
        username: user.username,
        nickname: getDisplayName(user),
        role: user.role,
        score,
        bestScore: score,
        playSeconds: getPlaySeconds(scoreRow),
        createdAt: scoreRow.created_at,
      });
    }
  });

  return Array.from(bestByUser.values())
    .sort((left, right) => right.score - left.score || left.nickname.localeCompare(right.nickname, "ko"))
    .map(({ createdAt, ...ranking }) => ranking);
}

function buildRecentPlays(scores, users) {
  const usersById = new Map(users.map((user) => [user.id, user]));

  return scores
    .map((scoreRow) => {
      const user = usersById.get(scoreRow.user_id);

      if (!user) {
        return null;
      }

      return {
        nickname: getDisplayName(user),
        score: scoreRow.score || 0,
        gameMode: normalizeGameMode(scoreRow.game_mode),
        playSeconds: getPlaySeconds(scoreRow),
        createdAt: scoreRow.created_at,
      };
    })
    .filter(Boolean);
}

module.exports = async function handler(req, res) {
  try {
    if (req.method !== "GET" && req.method !== "DELETE") {
      res.setHeader("Allow", "GET, DELETE");
      sendJson(res, 405, { message: "허용되지 않은 요청입니다." });
      return;
    }

    if (req.method === "DELETE") {
      await deletePlayerHistory(req, res);
      return;
    }

    const url = getRequestUrl(req);
    const userId = url.searchParams.get("userId");
    const gameMode = normalizeGameMode(url.searchParams.get("gameMode"));

    if (userId) {
      await sendPlayerHistory(req, res, userId, gameMode);
      return;
    }

    const { start, end } = getKstDayRange();
    const modeFilter = getGameModeFilter(gameMode);
    const users = await supabaseRequest(`users?select=*&order=best_score.desc,username.asc&limit=${MAX_RANKING_ROWS}`, {
      prefer: "",
    });
    const scores = await getScoresWithPlaySeconds(
      `scores?select=user_id,score,created_at,play_seconds&${modeFilter}&created_at=gte.${encodeURIComponent(start)}&created_at=lt.${encodeURIComponent(end)}&order=score.desc,created_at.asc&limit=${MAX_DAILY_SCORES}`,
      `scores?select=user_id,score,created_at&${modeFilter}&created_at=gte.${encodeURIComponent(start)}&created_at=lt.${encodeURIComponent(end)}&order=score.desc,created_at.asc&limit=${MAX_DAILY_SCORES}`,
    );
    const allScores = await getScoresWithPlaySeconds(
      `scores?select=user_id,score,created_at,play_seconds&${modeFilter}&order=score.desc,created_at.asc&limit=${MAX_RANKING_ROWS}`,
      `scores?select=user_id,score,created_at&${modeFilter}&order=score.desc,created_at.asc&limit=${MAX_RANKING_ROWS}`,
    );
    const recentScores = await getScoresWithPlaySeconds(
      `scores?select=user_id,score,created_at,game_mode,play_seconds&${modeFilter}&order=created_at.desc&limit=${MAX_RECENT_PLAYS}`,
      `scores?select=user_id,score,created_at,game_mode&${modeFilter}&order=created_at.desc&limit=${MAX_RECENT_PLAYS}`,
    );
    const dailyRankings = buildDailyRankings(scores, users);
    const allTimeRankings = buildDailyRankings(allScores, users);
    const recentPlays = buildRecentPlays(recentScores, users);

    sendJson(res, 200, { dailyRankings, allTimeRankings, recentPlays, gameMode });
  } catch (error) {
    sendJson(res, 500, { message: error.message });
  }
};
