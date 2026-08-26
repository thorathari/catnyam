const assert = require("node:assert/strict");
const test = require("node:test");

const { CATALOG } = require("../server/shop-catalog");
const { processShopAction } = require("../server/shop-service");

test("paid characters cost 100 coins for direct purchase", () => {
  const paidCharacters = Object.values(CATALOG.character).filter((item) => item.price > 0);

  assert.ok(paidCharacters.length > 0);
  paidCharacters.forEach((item) => assert.equal(item.price, 100));
});

test("character purchase uses the normal coin purchase path", async () => {
  await assert.rejects(
    processShopAction({
      id: "user-1",
      coins: 99,
      owned_characters: ["calico"],
    }, {
      shopAction: "purchase",
      type: "character",
      itemId: "gray_scottish",
    }),
    /코인이 부족합니다/,
  );
});
