const {
  getUserById,
  readJson,
  requireAdmin,
  resetScoresForUser,
  sanitizeUser,
  sendJson,
  supabaseRequest,
} = require("../../server/db");

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
      const { action, userId } = await readJson(req);

      if (action !== "reset-score") {
        sendJson(res, 400, { message: "알 수 없는 관리자 작업입니다." });
        return;
      }

      const user = await getUserById(userId);

      if (!user) {
        sendJson(res, 404, { message: "계정을 찾을 수 없습니다." });
        return;
      }

      const updated = await resetScoresForUser(user.id);
      sendJson(res, 200, { user: sanitizeUser(updated) });
      return;
    }

    const rows = await supabaseRequest("users?select=*&order=username.asc", {
      prefer: "",
    });
    const users = rows.map((user) => ({
      id: user.id,
      username: user.username,
      nickname: String(user.nickname || "").trim() || user.username,
      role: user.role,
      bestScore: user.best_score || 0,
      gamesPlayed: user.games_played || 0,
      createdAt: user.created_at,
    }));

    sendJson(res, 200, { users });
  } catch (error) {
    sendJson(res, 500, { message: error.message });
  }
};
