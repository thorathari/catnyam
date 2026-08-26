const ATTENDANCE_REWARDS = Object.freeze([
  { day: 1, coins: 3, tickets: 0 },
  { day: 2, coins: 3, tickets: 0 },
  { day: 3, coins: 5, tickets: 0 },
  { day: 4, coins: 5, tickets: 0 },
  { day: 5, coins: 7, tickets: 0 },
  { day: 6, coins: 7, tickets: 0 },
  { day: 7, coins: 10, tickets: 1 },
]);

function getKoreaDateString(now = new Date()) {
  return new Date(now.getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

function dateDifference(fromDate, toDate) {
  const from = Date.parse(`${fromDate}T00:00:00Z`);
  const to = Date.parse(`${toDate}T00:00:00Z`);

  if (!Number.isFinite(from) || !Number.isFinite(to)) {
    return null;
  }

  return Math.round((to - from) / 86400000);
}

function normalizeAttendanceDay(value) {
  const day = Number(value);
  return Number.isInteger(day) && day >= 1 && day <= 7 ? day : 0;
}

function getAttendanceStatus(user = {}, now = new Date()) {
  const today = getKoreaDateString(now);
  const lastDate = /^\d{4}-\d{2}-\d{2}$/.test(String(user.attendance_last_date || ""))
    ? String(user.attendance_last_date)
    : null;
  const storedDay = normalizeAttendanceDay(user.attendance_streak);

  if (!lastDate) {
    return { today, lastDate: null, completedDay: 0, nextDay: 1, canClaim: true };
  }

  const gap = dateDifference(lastDate, today);
  if (gap === 0) {
    return {
      today,
      lastDate,
      completedDay: storedDay,
      nextDay: storedDay >= 7 ? 1 : storedDay + 1,
      canClaim: false,
    };
  }

  if (gap === 1) {
    return {
      today,
      lastDate,
      completedDay: storedDay >= 7 ? 0 : storedDay,
      nextDay: storedDay >= 7 ? 1 : storedDay + 1,
      canClaim: true,
    };
  }

  if (gap > 1 || gap === null) {
    return { today, lastDate, completedDay: 0, nextDay: 1, canClaim: true };
  }

  return {
    today,
    lastDate,
    completedDay: storedDay,
    nextDay: storedDay >= 7 ? 1 : storedDay + 1,
    canClaim: false,
  };
}

function getAttendanceReward(day) {
  return ATTENDANCE_REWARDS.find((reward) => reward.day === Number(day)) || null;
}

module.exports = {
  ATTENDANCE_REWARDS,
  dateDifference,
  getAttendanceReward,
  getAttendanceStatus,
  getKoreaDateString,
};
