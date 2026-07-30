const {
  getUserByUsername,
  readJson,
  requireUser,
  sanitizeUser,
  sendJson,
  setSessionCookie,
  verifyPassword,
} = require("../server/db");

module.exports = async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const user = await requireUser(req, res);
      if (!user) return;

      sendJson(res, 200, { user: sanitizeUser(user) });
      return;
    }

    if (req.method !== "POST") {
      res.setHeader("Allow", "GET, POST");
      sendJson(res, 405, { message: "허용되지 않은 요청입니다." });
      return;
    }

    const { username, password } = await readJson(req);
    const user = await getUserByUsername(username);

    if (!user || !verifyPassword(password, user.password_salt, user.password_hash)) {
      sendJson(res, 401, { message: "아이디 또는 비밀번호를 확인해주세요." });
      return;
    }

    setSessionCookie(res, user);
    sendJson(res, 200, { user: sanitizeUser(user) });
  } catch (error) {
    sendJson(res, 500, { message: error.message });
  }
};
