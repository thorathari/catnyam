const {
  getUserById,
  readJson,
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

    const { userId } = await readJson(req);
    const user = await getUserById(userId);

    if (!user || user.role === "admin") {
      sendJson(res, 400, { message: "관리자 계정은 삭제할 수 없습니다." });
      return;
    }

    await supabaseRequest(`users?id=eq.${encodeURIComponent(user.id)}`, {
      method: "DELETE",
      prefer: "return=minimal",
    });

    sendJson(res, 200, { ok: true });
  } catch (error) {
    sendJson(res, 500, { message: error.message });
  }
};
