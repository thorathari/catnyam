const {
  getUserById,
  hashPassword,
  readJson,
  requireAdmin,
  requireMethod,
  sendJson,
  supabaseRequest,
} = require("../../server/db");

const RESET_PASSWORD = "1234";

module.exports = async function handler(req, res) {
  try {
    if (!requireMethod(req, res, "POST")) return;

    const admin = await requireAdmin(req, res);
    if (!admin) return;

    const { userId } = await readJson(req);
    const user = await getUserById(userId);

    if (!user || user.role === "admin") {
      sendJson(res, 400, { message: "관리자 계정은 초기화할 수 없습니다." });
      return;
    }

    const { salt, hash } = hashPassword(RESET_PASSWORD);

    await supabaseRequest(`users?id=eq.${encodeURIComponent(user.id)}`, {
      method: "PATCH",
      body: {
        password_hash: hash,
        password_salt: salt,
        updated_at: new Date().toISOString(),
      },
    });

    sendJson(res, 200, { resetPassword: RESET_PASSWORD });
  } catch (error) {
    sendJson(res, 500, { message: error.message });
  }
};
