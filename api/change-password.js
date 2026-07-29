const {
  hashPassword,
  readJson,
  requireMethod,
  requireUser,
  sendJson,
  supabaseRequest,
  verifyPassword,
} = require("../server/db");

module.exports = async function handler(req, res) {
  try {
    if (!requireMethod(req, res, "POST")) return;

    const user = await requireUser(req, res);
    if (!user) return;

    const { currentPassword, newPassword } = await readJson(req);

    if (!verifyPassword(currentPassword, user.password_salt, user.password_hash)) {
      sendJson(res, 400, { message: "현재 비밀번호를 확인해주세요." });
      return;
    }

    if (String(newPassword || "").length < 4) {
      sendJson(res, 400, { message: "새 비밀번호는 4글자 이상 입력해주세요." });
      return;
    }

    const { salt, hash } = hashPassword(newPassword);
    await supabaseRequest(`users?id=eq.${encodeURIComponent(user.id)}`, {
      method: "PATCH",
      body: {
        password_hash: hash,
        password_salt: salt,
        updated_at: new Date().toISOString(),
      },
    });

    sendJson(res, 200, { ok: true });
  } catch (error) {
    sendJson(res, 500, { message: error.message });
  }
};
