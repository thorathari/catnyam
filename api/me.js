const {
  requireMethod,
  requireUser,
  sanitizeUser,
  sendJson,
} = require("../server/db");

module.exports = async function handler(req, res) {
  try {
    if (!requireMethod(req, res, "GET")) return;

    const user = await requireUser(req, res);
    if (!user) return;

    sendJson(res, 200, { user: sanitizeUser(user) });
  } catch (error) {
    sendJson(res, 500, { message: error.message });
  }
};
