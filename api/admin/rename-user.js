const {
  getUserById,
  getUserByUsername,
  normalizeUsername,
  readJson,
  requireAdmin,
  requireMethod,
  sanitizeUser,
  sendJson,
  setSessionCookie,
  supabaseRequest,
  usernameKey,
} = require("../../server/db");

module.exports = async function handler(req, res) {
  try {
    if (!requireMethod(req, res, "POST")) return;

    const admin = await requireAdmin(req, res);
    if (!admin) return;

    const { userId, username: rawUsername } = await readJson(req);
    const username = normalizeUsername(rawUsername);

    if (!userId) {
      sendJson(res, 400, { message: "계정을 선택해주세요." });
      return;
    }

    if (username.length < 2) {
      sendJson(res, 400, { message: "아이디는 2글자 이상 입력해주세요." });
      return;
    }

    const user = await getUserById(userId);

    if (!user) {
      sendJson(res, 404, { message: "계정을 찾을 수 없습니다." });
      return;
    }

    const existingUser = await getUserByUsername(username);

    if (existingUser && existingUser.id !== user.id) {
      sendJson(res, 409, { message: "이미 사용 중인 아이디입니다." });
      return;
    }

    const updated = await supabaseRequest(`users?id=eq.${encodeURIComponent(user.id)}`, {
      method: "PATCH",
      body: {
        username,
        username_key: usernameKey(username),
        updated_at: new Date().toISOString(),
      },
    });

    if (updated[0]?.id === admin.id) {
      setSessionCookie(res, updated[0]);
    }

    sendJson(res, 200, { user: sanitizeUser(updated[0]) });
  } catch (error) {
    sendJson(res, 500, { message: error.message });
  }
};
