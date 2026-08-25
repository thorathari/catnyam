const DEFAULT_CHARACTER = "calico";
const DEFAULT_BACKGROUND = "village";

const CATALOG = {
  character: {
    gray_scottish: { name: "회색 스코티시 폴드", price: 20, col: 0, row: 0 },
    white_munchkin: { name: "흰색 먼치킨", price: 20, col: 1, row: 0 },
    siamese: { name: "샴 고양이", price: 20, col: 2, row: 0 },
    norwegian_forest: { name: "노르웨이숲", price: 20, col: 3, row: 0 },
    cheese: { name: "치즈냥이", price: 20, col: 0, row: 1 },
    calico: { name: "얼룩냥이", price: 0, col: 1, row: 1 },
    tuxedo: { name: "턱시도냥이", price: 20, col: 2, row: 1 },
    black: { name: "깜냥이", price: 20, col: 3, row: 1 },
    maltese: { name: "말티즈", price: 20, col: 0, row: 2 },
    poodle: { name: "푸들", price: 20, col: 1, row: 2 },
    shih_tzu: { name: "시츄", price: 20, col: 2, row: 2 },
    pomeranian: { name: "포메라니안", price: 20, col: 3, row: 2 },
    bichon: { name: "비숑", price: 20, col: 0, row: 3 },
    beagle: { name: "비글", price: 20, col: 1, row: 3 },
  },
  companion: {
    hamster: { name: "햄스터", price: 50, buff: "좋은 아이템 획득 범위 +30%", col: 0, row: 0 },
    chick: { name: "병아리", price: 50, buff: "시간 아이템 +1초", col: 1, row: 0 },
    sparrow: { name: "참새", price: 50, buff: "이동속도 +8%", col: 2, row: 0 },
    rabbit: { name: "토끼", price: 50, buff: "득점 아이템 +1점", col: 0, row: 1 },
    mole: { name: "두더지", price: 50, buff: "폭탄피하기 시작 목숨 +1", col: 1, row: 1 },
  },
  background: {
    village: { name: "시골동네", price: 0, col: 0, row: 0 },
    promenade: { name: "고급산책로", price: 30, col: 1, row: 0 },
    beach: { name: "해변가", price: 30, col: 0, row: 1 },
    mountain: { name: "산동네", price: 30, col: 1, row: 1 },
    alley: { name: "뒷골목", price: 30, col: 0, row: 2 },
  },
};

function normalizeOwnedList(value, defaults = []) {
  let list = value;

  if (typeof list === "string") {
    try {
      list = JSON.parse(list);
    } catch {
      list = [];
    }
  }

  return Array.from(new Set([
    ...defaults,
    ...(Array.isArray(list) ? list.map(String) : []),
  ]));
}

function getUserLoadout(user = {}) {
  const inventory = getUserInventory(user);
  const character = CATALOG.character[user.equipped_character] && inventory.characters.includes(user.equipped_character)
    ? user.equipped_character
    : DEFAULT_CHARACTER;
  const companionLeft = CATALOG.companion[user.equipped_companion_left] && inventory.companions.includes(user.equipped_companion_left)
    ? user.equipped_companion_left
    : null;
  const companionRight = CATALOG.companion[user.equipped_companion_right]
    && inventory.companions.includes(user.equipped_companion_right)
    && user.equipped_companion_right !== companionLeft
    ? user.equipped_companion_right
    : null;
  const background = CATALOG.background[user.equipped_background] && inventory.backgrounds.includes(user.equipped_background)
    ? user.equipped_background
    : DEFAULT_BACKGROUND;

  return {
    character,
    companionLeft,
    companionRight,
    background,
  };
}

function getUserInventory(user = {}) {
  return {
    characters: normalizeOwnedList(user.owned_characters, [DEFAULT_CHARACTER]),
    companions: normalizeOwnedList(user.owned_companions),
    backgrounds: normalizeOwnedList(user.owned_backgrounds, [DEFAULT_BACKGROUND]),
  };
}

function getCatalogItem(type, id) {
  return CATALOG[type]?.[id] || null;
}

module.exports = {
  CATALOG,
  DEFAULT_BACKGROUND,
  DEFAULT_CHARACTER,
  getCatalogItem,
  getUserInventory,
  getUserLoadout,
  normalizeOwnedList,
};
