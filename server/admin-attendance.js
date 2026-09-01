const { getKoreaDateString } = require("./reward-rules");

function normalizeAttendanceDay(value) {
  const day = Number(value);
  return Number.isInteger(day) && day >= 1 && day <= 7 ? day : 1;
}

function getClaimedAtTimestamp(value) {
  const timestamp = Date.parse(String(value || ""));
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function buildTodayAttendance(users = [], now = new Date()) {
  const date = getKoreaDateString(now);
  const entries = users
    .filter((user) => String(user.attendance_last_date || "") === date)
    .map((user) => ({
      id: user.id,
      username: user.username,
      nickname: String(user.nickname || "").trim() || user.username,
      day: normalizeAttendanceDay(user.attendance_streak),
      claimedAt: user.attendance_claimed_at || null,
    }))
    .sort((left, right) => getClaimedAtTimestamp(right.claimedAt) - getClaimedAtTimestamp(left.claimedAt));

  return { date, entries };
}

module.exports = {
  buildTodayAttendance,
};
