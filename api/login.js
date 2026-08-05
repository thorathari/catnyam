const {
  clearSessionCookie,
  getUserByUsername,
  readJson,
  requireUser,
  sanitizeUser,
  sendJson,
  setSessionCookie,
  supabaseRequest,
  verifyPassword,
} = require("../server/db");

function isMissingLastLoginColumn(error) {
  return /last_login_at/i.test(error.message || "") && /column|schema cache/i.test(error.message || "");
}

async function updateLastLogin(user) {
  const lastLoginAt = new Date().toISOString();

  try {
    const updated = await supabaseRequest(`users?id=eq.${encodeURIComponent(user.id)}`, {
      method: "PATCH",
      body: {
        last_login_at: lastLoginAt,
      },
    });

    return updated[0] || {
      ...user,
      last_login_at: lastLoginAt,
    };
  } catch (error) {
    if (!isMissingLastLoginColumn(error)) {
      throw error;
    }

    return user;
  }
}

module.exports = async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const user = await requireUser(req, res);
      if (!user) return;

      const hasLastLoginColumn = Object.prototype.hasOwnProperty.call(user, "last_login_at");

      if (hasLastLoginColumn && !user.last_login_at) {
        clearSessionCookie(res);
        sendJson(res, 401, {
          code: "FRESH_LOGIN_REQUIRED",
          message: "최종접속일 등록을 위해 다시 로그인해주세요.",
        });
        return;
      }

      setSessionCookie(res, user);
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

    const loggedInUser = await updateLastLogin(user);
    setSessionCookie(res, loggedInUser);
    sendJson(res, 200, { user: sanitizeUser(loggedInUser) });
  } catch (error) {
    sendJson(res, 500, { message: error.message });
  }
};
