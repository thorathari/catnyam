const { requireMethod, sendJson, supabaseRequest } = require("../server/db");

module.exports = async function handler(req, res) {
  try {
    if (!requireMethod(req, res, "GET")) return;

    const users = await supabaseRequest("users?select=id,username,role,best_score,games_played&order=best_score.desc,username.asc&limit=10", {
      prefer: "",
    });
    const rankings = users.map((user) => ({
      id: user.id,
      username: user.username,
      role: user.role,
      bestScore: user.best_score || 0,
      gamesPlayed: user.games_played || 0,
    }));

    sendJson(res, 200, { rankings });
  } catch (error) {
    sendJson(res, 500, { message: error.message });
  }
};
