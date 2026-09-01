const assert = require("node:assert/strict");
const test = require("node:test");

const { buildTodayAttendance } = require("../server/admin-attendance");

const TEST_NOW = new Date("2026-09-01T08:00:00.000Z");

test("admin attendance includes only today's Korea check-ins", () => {
  const result = buildTodayAttendance([
    {
      id: "late",
      username: "late-user",
      nickname: "늦게온냥",
      attendance_streak: 4,
      attendance_last_date: "2026-09-01",
      attendance_claimed_at: "2026-09-01T07:10:00.000Z",
    },
    {
      id: "early",
      username: "early-user",
      nickname: "",
      attendance_streak: 2,
      attendance_last_date: "2026-09-01",
      attendance_claimed_at: "2026-09-01T00:15:00.000Z",
    },
    {
      id: "yesterday",
      username: "old-user",
      attendance_streak: 1,
      attendance_last_date: "2026-08-31",
      attendance_claimed_at: "2026-08-31T10:00:00.000Z",
    },
  ], TEST_NOW);

  assert.equal(result.date, "2026-09-01");
  assert.deepEqual(result.entries, [
    {
      id: "late",
      username: "late-user",
      nickname: "늦게온냥",
      day: 4,
      claimedAt: "2026-09-01T07:10:00.000Z",
    },
    {
      id: "early",
      username: "early-user",
      nickname: "early-user",
      day: 2,
      claimedAt: "2026-09-01T00:15:00.000Z",
    },
  ]);
});

test("admin attendance keeps today's legacy check-in without inventing a time", () => {
  const result = buildTodayAttendance([{
    id: "legacy",
    username: "legacy-user",
    attendance_streak: 7,
    attendance_last_date: "2026-09-01",
  }], TEST_NOW);

  assert.equal(result.entries[0].day, 7);
  assert.equal(result.entries[0].claimedAt, null);
});
