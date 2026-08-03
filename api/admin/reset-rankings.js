const {
  getUserById,
  normalizeScoreGameMode,
  readJson,
  requireAdmin,
  requireMethod,
  sanitizeUser,
  sendJson,
  supabaseRequest,
} = require("../../server/db");

const MAX_SCORE_ROWS = 100000;
const MAX_USER_ROWS = 100000;

function createScoreStats() {
  return {
    bestScore: 0,
    gamesPlayed: 0,
  };
}

async function recalculateAllUserScoreStats() {
  const users = await supabaseRequest(`users?select=id&limit=${MAX_USER_ROWS}`, {
    prefer: "",
  });
  const scores = await supabaseRequest(`scores?select=user_id,score&limit=${MAX_SCORE_ROWS}`, {
    prefer: "",
  });
  const statsByUser = new Map(users.map((user) => [user.id, createScoreStats()]));

  scores.forEach((scoreRow) => {
    const stats = statsByUser.get(scoreRow.user_id);

    if (!stats) {
      return;
    }

    stats.gamesPlayed += 1;
    stats.bestScore = Math.max(stats.bestScore, scoreRow.score || 0);
  });

  const updatedAt = new Date().toISOString();

  for (const user of users) {
    const stats = statsByUser.get(user.id) || createScoreStats();

    await supabaseRequest(`users?id=eq.${encodeURIComponent(user.id)}`, {
      method: "PATCH",
      prefer: "return=minimal",
      body: {
        best_score: stats.bestScore,
        games_played: stats.gamesPlayed,
        updated_at: updatedAt,
      },
    });
  }
}

module.exports = async function handler(req, res) {
  try {
    if (!requireMethod(req, res, "POST")) return;

    const admin = await requireAdmin(req, res);
    if (!admin) return;

    const { gameMode } = await readJson(req);

    if (!gameMode) {
      sendJson(res, 400, { message: "초기화할 게임 모드를 선택해주세요." });
      return;
    }

    const normalizedMode = normalizeScoreGameMode(gameMode);

    await supabaseRequest(`scores?game_mode=eq.${encodeURIComponent(normalizedMode)}`, {
      method: "DELETE",
      prefer: "return=minimal",
    });

    await recalculateAllUserScoreStats();

    const updatedAdmin = await getUserById(admin.id);

    sendJson(res, 200, {
      ok: true,
      gameMode: normalizedMode,
      user: sanitizeUser(updatedAdmin),
    });
  } catch (error) {
    sendJson(res, 500, { message: error.message });
  }
};
