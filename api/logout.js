const {
  clearSessionCookie,
  requireUser,
  sendJson,
  supabaseRequest,
} = require("../server/db");

module.exports = async function handler(req, res) {
  if (req.method !== "POST" && req.method !== "DELETE") {
    res.setHeader("Allow", "POST, DELETE");
    sendJson(res, 405, { message: "허용되지 않은 요청입니다." });
    return;
  }

  if (req.method === "POST") {
    clearSessionCookie(res);
    sendJson(res, 200, { ok: true });
    return;
  }

  try {
    const user = await requireUser(req, res);
    if (!user) return;

    if (user.role === "admin") {
      sendJson(res, 400, { message: "관리자 계정은 탈퇴할 수 없습니다." });
      return;
    }

    await supabaseRequest(`scores?user_id=eq.${encodeURIComponent(user.id)}`, {
      method: "DELETE",
      prefer: "return=minimal",
    });

    await supabaseRequest(`users?id=eq.${encodeURIComponent(user.id)}`, {
      method: "DELETE",
      prefer: "return=minimal",
    });

    clearSessionCookie(res);
    sendJson(res, 200, { ok: true });
  } catch (error) {
    sendJson(res, 500, { message: error.message });
  }
};
