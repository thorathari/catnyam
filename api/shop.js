const {
  readJson,
  requireUser,
  sanitizeUser,
  sendJson,
  supabaseRequest,
} = require("../server/db");
const {
  CATALOG,
  getCatalogItem,
  getUserInventory,
  getUserLoadout,
} = require("../server/shop-catalog");

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
    throw new Error("코인 잔액이 변경되었습니다. 상점을 다시 열고 시도해주세요.");
  }

  return rows[0];
}

module.exports = async function handler(req, res) {
  try {
    if (req.method !== "GET" && req.method !== "POST") {
      res.setHeader("Allow", "GET, POST");
      sendJson(res, 405, { message: "허용되지 않은 요청입니다." });
      return;
    }

    const user = await requireUser(req, res);
    if (!user) return;

    if (req.method === "GET") {
      sendJson(res, 200, { user: sanitizeUser(user), catalog: CATALOG });
      return;
    }

    const { action, type, itemId, slot } = await readJson(req);
    const item = getCatalogItem(type, itemId);

    if (!item || !INVENTORY_KEYS[type]) {
      sendJson(res, 400, { message: "상점 상품이 올바르지 않습니다." });
      return;
    }

    const inventory = getUserInventory(user);
    const ownedKey = SANITIZED_INVENTORY_KEYS[type];
    const ownedItems = inventory[ownedKey];

    if (action === "purchase") {
      if (ownedItems.includes(itemId)) {
        sendJson(res, 200, { user: sanitizeUser(user), message: "이미 보유한 상품입니다." });
        return;
      }

      const coins = Math.max(0, Number(user.coins) || 0);
      if (coins < item.price) {
        sendJson(res, 400, { message: "코인이 부족합니다." });
        return;
      }

      const updated = await updateUser(user.id, {
        coins: coins - item.price,
        [INVENTORY_KEYS[type]]: [...ownedItems, itemId],
      }, coins);
      sendJson(res, 200, { user: sanitizeUser(updated), message: `${item.name} 구매 완료!` });
      return;
    }

    if (action !== "equip") {
      sendJson(res, 400, { message: "상점 요청이 올바르지 않습니다." });
      return;
    }

    if (!ownedItems.includes(itemId)) {
      sendJson(res, 400, { message: "먼저 상품을 구매해주세요." });
      return;
    }

    const loadout = getUserLoadout(user);
    let patch;

    if (type === "character") {
      patch = { equipped_character: itemId };
    } else if (type === "background") {
      patch = { equipped_background: itemId };
    } else {
      if (slot !== "left" && slot !== "right") {
        sendJson(res, 400, { message: "동료를 배치할 위치를 선택해주세요." });
        return;
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
    sendJson(res, 200, { user: sanitizeUser(updated), message: `${item.name} 적용 완료!` });
  } catch (error) {
    const isMissingColumn = /coins|owned_|equipped_/i.test(error.message || "");
    sendJson(res, 500, {
      message: isMissingColumn
        ? "Supabase SQL Editor에서 최신 supabase/schema.sql을 실행해주세요."
        : error.message,
    });
  }
};
