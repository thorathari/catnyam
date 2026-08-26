const { sanitizeUser, supabaseRequest } = require("./db");
const { getCatalogItem, getUserInventory, getUserLoadout } = require("./shop-catalog");
const { processGachaAction } = require("./reward-service");

const INVENTORY_KEYS = {
  character: "owned_characters",
  companion: "owned_companions",
  background: "owned_backgrounds",
};

const SANITIZED_INVENTORY_KEYS = {
  character: "characters",
  companion: "companions",
  background: "backgrounds",
};

function shopError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function updateUser(userId, patch, expectedCoins = null) {
  const coinFilter = expectedCoins === null ? "" : `&coins=eq.${encodeURIComponent(expectedCoins)}`;
  const rows = await supabaseRequest(`users?id=eq.${encodeURIComponent(userId)}${coinFilter}`, {
    method: "PATCH",
    body: {
      ...patch,
      updated_at: new Date().toISOString(),
    },
  });

  if (!rows[0]) {
    throw shopError("코인 잔액이 변경되었습니다. 상점을 다시 열고 시도해주세요.", 409);
  }

  return rows[0];
}

async function processShopAction(user, body = {}) {
  const { shopAction, type, itemId, slot } = body;

  if (shopAction === "draw-gacha") {
    return processGachaAction(user, shopAction);
  }

  const item = getCatalogItem(type, itemId);

  if (!item || !INVENTORY_KEYS[type]) {
    throw shopError("상점 상품이 올바르지 않습니다.");
  }

  const inventory = getUserInventory(user);
  const ownedKey = SANITIZED_INVENTORY_KEYS[type];
  const ownedItems = inventory[ownedKey];

  if (shopAction === "purchase") {
    if (ownedItems.includes(itemId)) {
      return { user: sanitizeUser(user), message: "이미 보유한 상품입니다." };
    }

    const coins = Math.max(0, Number(user.coins) || 0);
    if (coins < item.price) {
      throw shopError("코인이 부족합니다.");
    }

    const updated = await updateUser(user.id, {
      coins: coins - item.price,
      [INVENTORY_KEYS[type]]: [...ownedItems, itemId],
    }, coins);
    return { user: sanitizeUser(updated), message: `${item.name} 구매 완료!` };
  }

  if (shopAction !== "equip" && shopAction !== "unequip") {
    throw shopError("상점 요청이 올바르지 않습니다.");
  }

  if (!ownedItems.includes(itemId)) {
    throw shopError("먼저 상품을 구매해주세요.");
  }

  const loadout = getUserLoadout(user);
  let patch;

  if (shopAction === "unequip") {
    if (type !== "companion" || (slot !== "left" && slot !== "right")) {
      throw shopError("해제할 동료 위치가 올바르지 않습니다.");
    }

    const equippedItem = slot === "left" ? loadout.companionLeft : loadout.companionRight;
    if (equippedItem !== itemId) {
      throw shopError("해당 위치에 적용된 동료가 아닙니다.");
    }

    patch = slot === "left"
      ? { equipped_companion_left: null }
      : { equipped_companion_right: null };
    const updated = await updateUser(user.id, patch);
    return { user: sanitizeUser(updated), message: `${item.name} 적용 해제!` };
  }

  if (type === "character") {
    patch = { equipped_character: itemId };
  } else if (type === "background") {
    patch = { equipped_background: itemId };
  } else {
    if (slot !== "left" && slot !== "right") {
      throw shopError("동료를 배치할 위치를 선택해주세요.");
    }

    patch = slot === "left"
      ? {
        equipped_companion_left: itemId,
        equipped_companion_right: loadout.companionRight === itemId ? null : loadout.companionRight,
      }
      : {
        equipped_companion_left: loadout.companionLeft === itemId ? null : loadout.companionLeft,
        equipped_companion_right: itemId,
      };
  }

  const updated = await updateUser(user.id, patch);
  return { user: sanitizeUser(updated), message: `${item.name} 적용 완료!` };
}

module.exports = {
  processShopAction,
};
