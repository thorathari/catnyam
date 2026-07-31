const {
  requireAdmin,
  readJson,
  sendJson,
  supabaseRequest,
} = require("../server/db");

const MAX_HISTORY = 30;
const MAX_DAILY_SCORES = 10000;
const MAX_RANKING_ROWS = 10000;
const MAX_RECENT_PLAYS = 5;
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

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

async function sendPlayerHistory(req, res, userId) {
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

  const payload = await buildPlayerHistoryPayload(user);
  sendJson(res, 200, payload);
}

async function buildPlayerHistoryPayload(user) {
  const scores = await supabaseRequest(`scores?user_id=eq.${encodeURIComponent(user.id)}&select=id,score,created_at&order=created_at.desc&limit=${MAX_HISTORY}`, {
    prefer: "",
  });
  const { start, end } = getKstDayRange();
  const todayScores = await supabaseRequest(`scores?user_id=eq.${encodeURIComponent(user.id)}&select=id&created_at=gte.${encodeURIComponent(start)}&created_at=lt.${encodeURIComponent(end)}&limit=${MAX_DAILY_SCORES}`, {
    prefer: "",
  });
  const history = scores.map((scoreRow) => ({
    id: scoreRow.id,
    score: scoreRow.score || 0,
    createdAt: scoreRow.created_at,
  }));

  return {
    user: {
      ...mapAllTimeRanking(user),
      gamesPlayed: user.games_played || 0,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      lastLoginAt: user.last_login_at,
    },
    stats: {
      totalGamesPlayed: user.games_played || 0,
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

  const { userId, scoreId } = await readJson(req);
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
  const payload = await buildPlayerHistoryPayload(updatedUser || user);
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

    if (userId) {
      await sendPlayerHistory(req, res, userId);
      return;
    }

    const { start, end } = getKstDayRange();
    const users = await supabaseRequest(`users?select=*&order=best_score.desc,username.asc&limit=${MAX_RANKING_ROWS}`, {
      prefer: "",
    });
    const scores = await supabaseRequest(`scores?select=user_id,score,created_at&created_at=gte.${encodeURIComponent(start)}&created_at=lt.${encodeURIComponent(end)}&order=score.desc,created_at.asc&limit=${MAX_DAILY_SCORES}`, {
      prefer: "",
    });
    const recentScores = await supabaseRequest(`scores?select=user_id,score,created_at&order=created_at.desc&limit=${MAX_RECENT_PLAYS}`, {
      prefer: "",
    });
    const dailyRankings = buildDailyRankings(scores, users);
    const allTimeRankings = users.map(mapAllTimeRanking);
    const recentPlays = buildRecentPlays(recentScores, users);

    sendJson(res, 200, { dailyRankings, allTimeRankings, recentPlays });
  } catch (error) {
    sendJson(res, 500, { message: error.message });
  }
};
