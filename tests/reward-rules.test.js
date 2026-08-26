const test = require("node:test");
const assert = require("node:assert/strict");

const { CATALOG } = require("../server/shop-catalog");
const { getAttendanceStatus } = require("../server/reward-rules");
const { getGachaDrawPayment, selectGachaOutcome } = require("../server/reward-service");

const TEST_NOW = new Date("2026-08-26T03:00:00Z");

test("attendance starts at day one for a new user", () => {
  assert.deepEqual(getAttendanceStatus({}, TEST_NOW), {
    today: "2026-08-26",
    lastDate: null,
    completedDay: 0,
    nextDay: 1,
    canClaim: true,
  });
});

test("attendance advances, blocks duplicate claims, and resets after a missed day", () => {
  const consecutive = getAttendanceStatus({
    attendance_streak: 3,
    attendance_last_date: "2026-08-25",
  }, TEST_NOW);
  assert.equal(consecutive.nextDay, 4);
  assert.equal(consecutive.canClaim, true);

  const alreadyClaimed = getAttendanceStatus({
    attendance_streak: 4,
    attendance_last_date: "2026-08-26",
  }, TEST_NOW);
  assert.equal(alreadyClaimed.completedDay, 4);
  assert.equal(alreadyClaimed.canClaim, false);

  const missed = getAttendanceStatus({
    attendance_streak: 4,
    attendance_last_date: "2026-08-24",
  }, TEST_NOW);
  assert.equal(missed.completedDay, 0);
  assert.equal(missed.nextDay, 1);
});

test("attendance loops to day one after completing day seven", () => {
  const status = getAttendanceStatus({
    attendance_streak: 7,
    attendance_last_date: "2026-08-25",
  }, TEST_NOW);

  assert.equal(status.completedDay, 0);
  assert.equal(status.nextDay, 1);
  assert.equal(status.canClaim, true);
});

test("gacha uses 15 percent miss, 5 percent duplicate, and then new character", () => {
  const owned = ["calico"];

  assert.equal(selectGachaOutcome(owned, 1499, 0).type, "miss");
  assert.equal(selectGachaOutcome(owned, 1500, 0).type, "duplicate");
  assert.equal(selectGachaOutcome(owned, 1999, 0).type, "duplicate");
  assert.equal(selectGachaOutcome(owned, 2000, 0).type, "win");
});

test("gacha stops after every paid character is owned", () => {
  const allCharacters = Object.keys(CATALOG.character);
  assert.equal(selectGachaOutcome(allCharacters, 9000, 0), null);
});

test("gacha uses an attendance ticket before charging coins", () => {
  assert.deepEqual(getGachaDrawPayment(100, 2), {
    coinCost: 0,
    ticketsAfter: 1,
    paymentType: "ticket",
  });
});

test("gacha charges 20 coins when no attendance ticket is available", () => {
  assert.deepEqual(getGachaDrawPayment(20, 0), {
    coinCost: 20,
    ticketsAfter: 0,
    paymentType: "coins",
  });
  assert.equal(getGachaDrawPayment(19, 0), null);
});
