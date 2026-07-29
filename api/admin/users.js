const { requireAdmin, requireMethod, sendJson, supabaseRequest } = require("../../server/db");

module.exports = async function handler(req, res) {
  try {
    if (!requireMethod(req, res, "GET")) return;

    const admin = await requireAdmin(req, res);
    if (!admin) return;

    const rows = await supabaseRequest("users?select=id,username,role,best_score,games_played,created_at&order=username.asc", {
      prefer: "",
    });
    const users = rows.map((user) => ({
      id: user.id,
      username: user.username,
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
