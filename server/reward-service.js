const crypto = require("crypto");

const { sanitizeUser, supabaseRequest } = require("./db");
const { CATALOG, getUserInventory } = require("./shop-catalog");
const { getAttendanceReward, getAttendanceStatus } = require("./reward-rules");

const GACHA_TICKET_PRICE = 20;
const GACHA_REFUND_COINS = 5;
const GACHA_MISS_THRESHOLD = 1500;
const GACHA_DUPLICATE_THRESHOLD = 2000;

function rewardError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function getGachaCharacterIds() {
  return Object.entries(CATALOG.character)
    .filter(([, item]) => Number(item.price) > 0)
    .map(([itemId]) => itemId);
}

function selectGachaOutcome(ownedCharacters, roll, randomIndex = 0) {
  const prizeIds = getGachaCharacterIds();
  const owned = Array.from(new Set(ownedCharacters)).filter((itemId) => CATALOG.character[itemId]);
  const unowned = prizeIds.filter((itemId) => !owned.includes(itemId));

  if (unowned.length === 0) {
    return null;
  }

  if (roll < GACHA_MISS_THRESHOLD) {
    return { type: "miss", itemId: null, refundCoins: GACHA_REFUND_COINS };
  }

  if (roll < GACHA_DUPLICATE_THRESHOLD) {
    const duplicatePool = owned.length > 0 ? owned : ["calico"];
    const itemId = duplicatePool[Math.abs(randomIndex) % duplicatePool.length];
    return { type: "duplicate", itemId, refundCoins: GACHA_REFUND_COINS };
  }

  const itemId = unowned[Math.abs(randomIndex) % unowned.length];
  return { type: "win", itemId, refundCoins: 0 };
}

function buildExpectedFilters(expected = {}) {
  const filters = [];

  if (expected.coins !== undefined) {
    filters.push(`coins=eq.${encodeURIComponent(expected.coins)}`);
  }
  if (expected.tickets !== undefined) {
    filters.push(`gacha_tickets=eq.${encodeURIComponent(expected.tickets)}`);
  }
  if (expected.attendanceLastDate !== undefined) {
    filters.push(expected.attendanceLastDate === null
      ? "attendance_last_date=is.null"
      : `attendance_last_date=eq.${encodeURIComponent(expected.attendanceLastDate)}`);
  }

  return filters.length > 0 ? `&${filters.join("&")}` : "";
}

async function updateRewardUser(userId, patch, expected = {}) {
  const rows = await supabaseRequest(
    `users?id=eq.${encodeURIComponent(userId)}${buildExpectedFilters(expected)}`,
    {
      method: "PATCH",
      body: {
        ...patch,
        updated_at: new Date().toISOString(),
      },
    },
  );

  if (!rows[0]) {
    throw rewardError("보상 정보가 변경되었습니다. 다시 시도해주세요.", 409);
  }

  return rows[0];
}

function getGachaDrawPayment(coinsValue, ticketsValue) {
  const coins = Math.max(0, Number(coinsValue) || 0);
  const tickets = Math.max(0, Number(ticketsValue) || 0);

  if (tickets > 0) {
    return { coinCost: 0, ticketsAfter: tickets - 1, paymentType: "ticket" };
  }

  if (coins >= GACHA_TICKET_PRICE) {
    return { coinCost: GACHA_TICKET_PRICE, ticketsAfter: 0, paymentType: "coins" };
  }

  return null;
}

async function drawGacha(user) {
  const coins = Math.max(0, Number(user.coins) || 0);
  const tickets = Math.max(0, Number(user.gacha_tickets) || 0);
  const inventory = getUserInventory(user);
  const payment = getGachaDrawPayment(coins, tickets);

  if (!payment) {
    throw rewardError("뽑기에 필요한 20코인이 부족합니다.");
  }

  const roll = crypto.randomInt(10000);
  const outcome = selectGachaOutcome(inventory.characters, roll, crypto.randomInt(2147483647));

  if (!outcome) {
    throw rewardError("모든 캐릭터를 모았습니다!", 409);
  }

  const item = outcome.itemId ? CATALOG.character[outcome.itemId] : null;
  const patch = {
    coins: coins - payment.coinCost + outcome.refundCoins,
    gacha_tickets: payment.ticketsAfter,
  };

  if (outcome.type === "win") {
    patch.owned_characters = [...inventory.characters, outcome.itemId];
  }

  const updated = await updateRewardUser(user.id, patch, { coins, tickets });
  const message = outcome.type === "win"
    ? `${item.name} 등장! 새로운 친구를 만났다냥!`
    : outcome.type === "duplicate"
      ? `${item.name} 중복! 5코인을 돌려받았습니다.`
      : "꽝! 5코인을 돌려받았습니다.";

  return {
    user: sanitizeUser(updated),
    message,
    gachaResult: {
      type: outcome.type,
      itemId: outcome.itemId,
      name: item?.name || "꽝",
      refundCoins: outcome.refundCoins,
      paymentType: payment.paymentType,
    },
  };
}

async function processGachaAction(user, shopAction) {
  if (shopAction === "draw-gacha") {
    return drawGacha(user);
  }
  throw rewardError("가챠 요청이 올바르지 않습니다.");
}

async function processAttendanceClaim(user, now = new Date()) {
  const status = getAttendanceStatus(user, now);

  if (!status.canClaim) {
    throw rewardError("오늘 출석 보상은 이미 받았습니다.", 409);
  }

  const reward = getAttendanceReward(status.nextDay);
  const coins = Math.max(0, Number(user.coins) || 0);
  const tickets = Math.max(0, Number(user.gacha_tickets) || 0);
  const updated = await updateRewardUser(user.id, {
    coins: coins + reward.coins,
    gacha_tickets: tickets + reward.tickets,
    attendance_streak: reward.day,
    attendance_last_date: status.today,
  }, {
    coins,
    tickets,
    attendanceLastDate: status.lastDate,
  });

  return {
    user: sanitizeUser(updated),
    message: reward.tickets > 0
      ? `7일 출석 완료! ${reward.coins}코인과 가챠 뽑기권 1장을 받았습니다.`
      : `${reward.day}일차 출석 완료! ${reward.coins}코인을 받았습니다.`,
    attendanceReward: reward,
  };
}

module.exports = {
  GACHA_REFUND_COINS,
  GACHA_TICKET_PRICE,
  getGachaDrawPayment,
  processAttendanceClaim,
  processGachaAction,
  selectGachaOutcome,
};
