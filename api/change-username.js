const {
  getUserByUsername,
  normalizeNickname,
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

function isMissingNicknameColumn(error) {
  return /nickname/i.test(error.message || "") && /column|schema cache/i.test(error.message || "");
}

module.exports = async function handler(req, res) {
  try {
    if (!requireMethod(req, res, "POST")) return;

    const user = await requireUser(req, res);
    if (!user) return;

    const body = await readJson(req);
    const hasUsername = Object.prototype.hasOwnProperty.call(body, "username");
    const hasNickname = Object.prototype.hasOwnProperty.call(body, "nickname");
    const username = hasUsername ? normalizeUsername(body.username) : user.username;
    const nickname = hasNickname ? normalizeNickname(body.nickname) : null;

    if (!hasUsername && !hasNickname) {
      sendJson(res, 400, { message: "변경할 정보를 입력해주세요." });
      return;
    }

    if (hasUsername && username.length < 2) {
      sendJson(res, 400, { message: "아이디는 2글자 이상 입력해주세요." });
      return;
    }

    if (hasNickname && nickname.length < 2) {
      sendJson(res, 400, { message: "닉네임은 2글자 이상 입력해주세요." });
      return;
    }

    if (hasUsername) {
      const existingUser = await getUserByUsername(username);

      if (existingUser && existingUser.id !== user.id) {
        sendJson(res, 409, { message: "이미 사용 중인 아이디입니다." });
        return;
      }
    }

    const updates = {
      updated_at: new Date().toISOString(),
    };

    if (hasUsername) {
      updates.username = username;
      updates.username_key = usernameKey(username);
    }

    if (hasNickname) {
      updates.nickname = nickname;
    }

    const updated = await supabaseRequest(`users?id=eq.${encodeURIComponent(user.id)}`, {
      method: "PATCH",
      body: updates,
    });

    setSessionCookie(res, updated[0]);
    sendJson(res, 200, { user: sanitizeUser(updated[0]) });
  } catch (error) {
    if (isMissingNicknameColumn(error)) {
      sendJson(res, 500, { message: "Supabase에서 nickname 컬럼을 추가한 뒤 다시 시도해주세요." });
      return;
    }

    sendJson(res, 500, { message: error.message });
  }
};
