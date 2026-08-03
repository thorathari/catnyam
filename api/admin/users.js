const {
  getUserById,
  normalizeScoreGameMode,
  readJson,
  requireAdmin,
  resetScoresForUser,
  sanitizeUser,
  sendJson,
  supabaseRequest,
} = require("../../server/db");

const MAX_SCORE_ROWS = 100000;

function createEmptyScoreStats() {
  return {
    churu: {
      bestScore: 0,
      gamesPlayed: 0,
    },
    bomb: {
      bestScore: 0,
      gamesPlayed: 0,
    },
  };
}

function cloneScoreStats(stats = createEmptyScoreStats()) {
  return {
    churu: { ...stats.churu },
    bomb: { ...stats.bomb },
  };
}

module.exports = async function handler(req, res) {
  try {
    if (req.method !== "GET" && req.method !== "POST") {
      res.setHeader("Allow", "GET, POST");
      sendJson(res, 405, { message: "허용되지 않은 요청입니다." });
      return;
    }

    const admin = await requireAdmin(req, res);
    if (!admin) return;

    if (req.method === "POST") {
      const { action, userId, gameMode } = await readJson(req);

      if (action !== "reset-score") {
        sendJson(res, 400, { message: "알 수 없는 관리자 작업입니다." });
        return;
      }

      if (!gameMode) {
        sendJson(res, 400, { message: "초기화할 게임 모드를 선택해주세요." });
        return;
      }

      const user = await getUserById(userId);

      if (!user) {
        sendJson(res, 404, { message: "계정을 찾을 수 없습니다." });
        return;
      }

      const updated = await resetScoresForUser(user.id, gameMode);
      sendJson(res, 200, { user: sanitizeUser(updated) });
      return;
    }

    const rows = await supabaseRequest("users?select=*&order=username.asc", {
      prefer: "",
    });
    const scores = await supabaseRequest(`scores?select=user_id,score,game_mode&limit=${MAX_SCORE_ROWS}`, {
      prefer: "",
    });
    const statsByUser = new Map();

    scores.forEach((scoreRow) => {
      const stats = statsByUser.get(scoreRow.user_id) || createEmptyScoreStats();
      const mode = normalizeScoreGameMode(scoreRow.game_mode);
      const score = scoreRow.score || 0;

      stats[mode].gamesPlayed += 1;
      stats[mode].bestScore = Math.max(stats[mode].bestScore, score);
      statsByUser.set(scoreRow.user_id, stats);
    });

    const users = rows.map((user) => ({
      id: user.id,
      username: user.username,
      nickname: String(user.nickname || "").trim() || user.username,
      role: user.role,
      bestScore: Math.max(
        statsByUser.get(user.id)?.churu.bestScore || 0,
        statsByUser.get(user.id)?.bomb.bestScore || 0,
      ),
      gamesPlayed: (statsByUser.get(user.id)?.churu.gamesPlayed || 0) + (statsByUser.get(user.id)?.bomb.gamesPlayed || 0),
      scoreStats: cloneScoreStats(statsByUser.get(user.id)),
      createdAt: user.created_at,
    }));

    sendJson(res, 200, { users });
  } catch (error) {
    sendJson(res, 500, { message: error.message });
  }
};
