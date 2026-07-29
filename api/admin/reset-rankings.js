const {
  requireAdmin,
  requireMethod,
  sendJson,
  supabaseRequest,
} = require("../../server/db");

module.exports = async function handler(req, res) {
  try {
    if (!requireMethod(req, res, "POST")) return;

    const admin = await requireAdmin(req, res);
    if (!admin) return;

    await supabaseRequest("scores?id=not.is.null", {
      method: "DELETE",
      prefer: "return=minimal",
    });

    await supabaseRequest("users?id=not.is.null", {
      method: "PATCH",
      prefer: "return=minimal",
      body: {
        best_score: 0,
        games_played: 0,
        updated_at: new Date().toISOString(),
      },
    });

    sendJson(res, 200, { ok: true });
  } catch (error) {
    sendJson(res, 500, { message: error.message });
  }
};
