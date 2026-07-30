const {
  getUserByUsername,
  normalizeUsername,
  readJson,
  requireMethod,
  requireUser,
  sanitizeUser,
  sendJson,
  setSessionCookie,
  supabaseRequest,
  usernameKey,
} = require("../server/db");

module.exports = async function handler(req, res) {
  try {
    if (!requireMethod(req, res, "POST")) return;

    const user = await requireUser(req, res);
    if (!user) return;

    const { username: rawUsername } = await readJson(req);
    const username = normalizeUsername(rawUsername);

    if (username.length < 2) {
      sendJson(res, 400, { message: "아이디는 2글자 이상 입력해주세요." });
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

    setSessionCookie(res, updated[0]);
    sendJson(res, 200, { user: sanitizeUser(updated[0]) });
  } catch (error) {
    sendJson(res, 500, { message: error.message });
  }
};
