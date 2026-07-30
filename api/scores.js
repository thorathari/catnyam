const {
  readJson,
  requireUser,
  resetScoresForUser,
  sanitizeUser,
  sendJson,
  supabaseRequest,
} = require("../server/db");

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

    const { score } = await readJson(req);
    const numericScore = Number(score);

    if (!Number.isInteger(numericScore) || numericScore < 0 || numericScore > 1000000) {
      sendJson(res, 400, { message: "점수 값이 올바르지 않습니다." });
      return;
    }

    await supabaseRequest("scores", {
      method: "POST",
      body: {
        user_id: user.id,
        score: numericScore,
      },
    });

    const bestScore = Math.max(user.best_score || 0, numericScore);
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
