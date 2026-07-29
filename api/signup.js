const {
  getUserByUsername,
  hashPassword,
  normalizeUsername,
  readJson,
  requireMethod,
  sanitizeUser,
  sendJson,
  setSessionCookie,
  supabaseRequest,
  usernameKey,
} = require("../server/db");

module.exports = async function handler(req, res) {
  try {
    if (!requireMethod(req, res, "POST")) return;

    const { username: rawUsername, password } = await readJson(req);
    const username = normalizeUsername(rawUsername);

    if (username.length < 2) {
      sendJson(res, 400, { message: "아이디는 2글자 이상 입력해주세요." });
      return;
    }

    if (String(password || "").length < 4) {
      sendJson(res, 400, { message: "비밀번호는 4글자 이상 입력해주세요." });
      return;
    }

    if (await getUserByUsername(username)) {
      sendJson(res, 409, { message: "이미 사용 중인 아이디입니다." });
      return;
    }

    const users = await supabaseRequest("users?select=id", { prefer: "" });
    const role = users.length === 0 ? "admin" : "user";
    const { salt, hash } = hashPassword(password);
    const created = await supabaseRequest("users", {
      method: "POST",
      body: {
        username,
        username_key: usernameKey(username),
        password_hash: hash,
        password_salt: salt,
        role,
      },
    });
    const user = created[0];

    setSessionCookie(res, user);
    sendJson(res, 201, { user: sanitizeUser(user) });
  } catch (error) {
    sendJson(res, 500, { message: error.message });
  }
};
