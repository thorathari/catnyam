const GAME_SECONDS = 60;

const authPanel = document.querySelector("#authPanel");
const gamePanel = document.querySelector("#gamePanel");
const profileBox = document.querySelector("#profileBox");
const profileButton = document.querySelector("#profileButton");
const currentUserName = document.querySelector("#currentUserName");
const adminBadge = document.querySelector("#adminBadge");
const coinText = document.querySelector("#coinText");
const shopButton = document.querySelector("#shopButton");
const authTitle = document.querySelector("#authTitle");
const authDescription = document.querySelector("#authDescription");
const authForm = document.querySelector("#authForm");
const usernameInput = document.querySelector("#usernameInput");
const nicknameField = document.querySelector("#nicknameField");
const nicknameInput = document.querySelector("#nicknameInput");
const passwordInput = document.querySelector("#passwordInput");
const rememberLoginField = document.querySelector("#rememberLoginField");
const rememberLoginInput = document.querySelector("#rememberLoginInput");
const confirmPasswordField = document.querySelector("#confirmPasswordField");
const confirmPasswordInput = document.querySelector("#confirmPasswordInput");
const authMessage = document.querySelector("#authMessage");
const authSubmitButton = document.querySelector("#authSubmitButton");
const signupButton = document.querySelector("#signupButton");
const loginModeButton = document.querySelector("#loginModeButton");
const logoutButton = document.querySelector("#logoutButton");
const startButton = document.querySelector("#startButton");
const gameOverlay = document.querySelector("#gameOverlay");
const overlayResult = document.querySelector("#overlayResult");
const gameModeSelector = document.querySelector("#gameModeSelector");
const gameModeButtons = Array.from(document.querySelectorAll(".game-mode-button"));
const shareResultButton = document.querySelector("#shareResultButton");
const shareStatus = document.querySelector("#shareStatus");
const pauseButton = document.querySelector("#pauseButton");
const pauseActions = document.querySelector("#pauseActions");
const pauseRestartButton = document.querySelector("#pauseRestartButton");
const pauseHomeButton = document.querySelector("#pauseHomeButton");
const resumeButton = document.querySelector("#resumeButton");
const itemGuide = document.querySelector("#itemGuide");
const touchLeftButton = document.querySelector("#touchLeftButton");
const touchRightButton = document.querySelector("#touchRightButton");
const rankingList = document.querySelector("#rankingList");
const rankingTitle = document.querySelector("#rankingTitle");
const dailyRankingButton = document.querySelector("#dailyRankingButton");
const allTimeRankingButton = document.querySelector("#allTimeRankingButton");
const recentPlayList = document.querySelector("#recentPlayList");
const recentPlayTitle = document.querySelector("#recentPlayTitle");
const playerHistoryModal = document.querySelector("#playerHistoryModal");
const closePlayerHistoryButton = document.querySelector("#closePlayerHistoryButton");
const playerHistoryTitle = document.querySelector("#playerHistoryTitle");
const playerHistorySummary = document.querySelector("#playerHistorySummary");
const playerHistoryList = document.querySelector("#playerHistoryList");
const playerHistoryMessage = document.querySelector("#playerHistoryMessage");
const accountModal = document.querySelector("#accountModal");
const closeAccountModalButton = document.querySelector("#closeAccountModalButton");
const passwordTabButton = document.querySelector("#passwordTabButton");
const adminTabButton = document.querySelector("#adminTabButton");
const passwordTabPanel = document.querySelector("#passwordTabPanel");
const adminTabPanel = document.querySelector("#adminTabPanel");
const tabList = document.querySelector(".tab-list");
const changeUsernameForm = document.querySelector("#changeUsernameForm");
const newUsernameInput = document.querySelector("#newUsernameInput");
const changeNicknameForm = document.querySelector("#changeNicknameForm");
const newNicknameInput = document.querySelector("#newNicknameInput");
const changePasswordForm = document.querySelector("#changePasswordForm");
const currentPasswordInput = document.querySelector("#currentPasswordInput");
const newPasswordInput = document.querySelector("#newPasswordInput");
const newPasswordConfirmInput = document.querySelector("#newPasswordConfirmInput");
const usernameMessage = document.querySelector("#usernameMessage");
const nicknameMessage = document.querySelector("#nicknameMessage");
const passwordMessage = document.querySelector("#passwordMessage");
const adminList = document.querySelector("#adminList");
const adminMessage = document.querySelector("#adminMessage");
const resetRankingButton = document.querySelector("#resetRankingButton");
const resetBombRankingButton = document.querySelector("#resetBombRankingButton");
const resetMyScoreButton = document.querySelector("#resetMyScoreButton");
const resetMyBombScoreButton = document.querySelector("#resetMyBombScoreButton");
const deleteMyAccountButton = document.querySelector("#deleteMyAccountButton");
const accountActionMessage = document.querySelector("#accountActionMessage");
const shopModal = document.querySelector("#shopModal");
const closeShopModalButton = document.querySelector("#closeShopModalButton");
const shopCoinText = document.querySelector("#shopCoinText");
const shopGrid = document.querySelector("#shopGrid");
const shopHelp = document.querySelector("#shopHelp");
const shopMessage = document.querySelector("#shopMessage");
const shopTabButtons = Array.from(document.querySelectorAll("[data-shop-tab]"));
const scoreText = document.querySelector("#scoreText");
const timeLabel = document.querySelector("#timeLabel");
const timeText = document.querySelector("#timeText");
const bestText = document.querySelector("#bestText");
const runCoinText = document.querySelector("#runCoinText");
const speedModeBadge = document.querySelector("#speedModeBadge");
const hideModeBadge = document.querySelector("#hideModeBadge");
const purrModeBadge = document.querySelector("#purrModeBadge");
const catnipModeBadge = document.querySelector("#catnipModeBadge");
const tunaModeBadge = document.querySelector("#tunaModeBadge");
const clipperModeBadge = document.querySelector("#clipperModeBadge");
const skullModeBadge = document.querySelector("#skullModeBadge");
const bombRainModeBadge = document.querySelector("#bombRainModeBadge");
const heartModeBadge = document.querySelector("#heartModeBadge");
const canvasWrap = document.querySelector("#canvasWrap");
const canvas = document.querySelector("#gameCanvas");
const ctx = canvas.getContext("2d");

const SHOP_CATALOG = {
  character: {
    gray_scottish: { name: "회색 스코티시 폴드", price: 20, kind: "cat", fur: "#aeb4bd", accent: "#858d99", col: 0, row: 0 },
    white_munchkin: { name: "흰색 먼치킨", price: 20, kind: "cat", fur: "#fffdf7", accent: "#e8e2d8", col: 1, row: 0 },
    siamese: { name: "샴 고양이", price: 20, kind: "cat", fur: "#ead6b0", accent: "#705449", col: 2, row: 0 },
    norwegian_forest: { name: "노르웨이숲", price: 20, kind: "cat", fur: "#9a806c", accent: "#f1e2cf", col: 3, row: 0 },
    cheese: { name: "치즈냥이", price: 20, kind: "cat", fur: "#f6b85f", accent: "#d98535", col: 0, row: 1 },
    calico: { name: "얼룩냥이", price: 0, kind: "cat", fur: "#ffcf8a", accent: "#69544a", col: 1, row: 1 },
    tuxedo: { name: "턱시도냥이", price: 20, kind: "cat", fur: "#30343b", accent: "#fffaf2", col: 2, row: 1 },
    black: { name: "깜냥이", price: 20, kind: "cat", fur: "#29282d", accent: "#55525d", col: 3, row: 1 },
    abyssinian: { name: "아비시니안", price: 20, kind: "cat", fur: "#b86d2d", accent: "#6d3a22", atlas: "extra", col: 0, row: 0 },
    bengal: { name: "뱅갈", price: 20, kind: "cat", fur: "#d9933c", accent: "#57351f", atlas: "extra", col: 1, row: 0 },
    ragdoll: { name: "렉돌", price: 20, kind: "cat", fur: "#f7eee2", accent: "#665047", atlas: "extra", col: 2, row: 0 },
    maltese: { name: "말티즈", price: 20, kind: "dog", fur: "#fffdf5", accent: "#ddd8cc", col: 0, row: 2 },
    poodle: { name: "푸들", price: 20, kind: "dog", fur: "#a86e47", accent: "#7d4d32", col: 1, row: 2 },
    shih_tzu: { name: "시츄", price: 20, kind: "dog", fur: "#f0dfc6", accent: "#76584b", col: 2, row: 2 },
    pomeranian: { name: "포메라니안", price: 20, kind: "dog", fur: "#e7a858", accent: "#fff0d2", col: 3, row: 2 },
    bichon: { name: "비숑", price: 20, kind: "dog", fur: "#fffdf8", accent: "#e5e1d9", col: 0, row: 3 },
    beagle: { name: "비글", price: 20, kind: "dog", fur: "#e6a25e", accent: "#5b443a", col: 1, row: 3 },
    jindo: { name: "진돗개", price: 20, kind: "dog", fur: "#fff9e9", accent: "#e8d7bc", atlas: "extra", col: 0, row: 1 },
    pug: { name: "퍼그", price: 20, kind: "dog", fur: "#e5c69a", accent: "#473b35", atlas: "extra", col: 1, row: 1 },
    pompitz: { name: "폼피츠", price: 20, kind: "dog", fur: "#fffdf7", accent: "#e9e1d5", atlas: "extra", col: 2, row: 1 },
    chihuahua: { name: "치와와", price: 20, kind: "dog", fur: "#e8b26f", accent: "#fff5df", atlas: "extra", col: 0, row: 2 },
    welsh_corgi: { name: "웰시코기", price: 20, kind: "dog", fur: "#e99536", accent: "#fff8e8", atlas: "extra", col: 1, row: 2 },
    husky: { name: "허스키", price: 20, kind: "dog", fur: "#69717a", accent: "#f4f5f3", atlas: "extra", col: 2, row: 2 },
  },
  companion: {
    hamster: { name: "햄스터", price: 50, buff: "좋은 아이템 획득 범위 +30%", col: 0, row: 0 },
    chick: { name: "병아리", price: 50, buff: "시간 아이템 효과 +1초", col: 1, row: 0 },
    sparrow: { name: "참새", price: 50, buff: "이동속도 +8%", col: 2, row: 0 },
    rabbit: { name: "토끼", price: 50, buff: "득점 아이템 +1점", col: 0, row: 1 },
    mole: { name: "두더지", price: 50, buff: "폭탄피하기 시작 목숨 +1", col: 1, row: 1 },
  },
  background: {
    village: { name: "시골동네", price: 0, col: 0, row: 0 },
    small_room: { name: "작은 방구석", price: 10, atlas: "extra", col: 0, row: 0 },
    promenade: { name: "고급산책로", price: 50, col: 1, row: 0 },
    beach: { name: "해변가", price: 50, col: 0, row: 1 },
    mountain: { name: "산동네", price: 30, col: 1, row: 1 },
    alley: { name: "뒷골목", price: 30, col: 0, row: 2 },
    suite: { name: "스위트룸", price: 50, atlas: "extra", col: 1, row: 0 },
  },
};

const ART_ASSETS = {
  character: Object.assign(new Image(), { src: "./assets/character-atlas.png" }),
  characterHappy: Object.assign(new Image(), { src: "./assets/character-happy-atlas.png" }),
  characterHurt: Object.assign(new Image(), { src: "./assets/character-hurt-atlas.png" }),
  characterExtra: Object.assign(new Image(), { src: "./assets/character-extra-atlas.png" }),
  characterExtraHappy: Object.assign(new Image(), { src: "./assets/character-extra-happy-atlas.png" }),
  characterExtraHurt: Object.assign(new Image(), { src: "./assets/character-extra-hurt-atlas.png" }),
  companion: Object.assign(new Image(), { src: "./assets/companion-atlas.png" }),
  background: Object.assign(new Image(), { src: "./assets/background-atlas.png" }),
  backgroundExtra: Object.assign(new Image(), { src: "./assets/background-extra-atlas.png" }),
  boxPaw: Object.assign(new Image(), { src: "./assets/box-paw-atlas.png" }),
  boxPawExtra: Object.assign(new Image(), { src: "./assets/box-paw-extra-atlas.png" }),
  boxClosed: Object.assign(new Image(), { src: "./assets/box-closed-atlas.png" }),
};

const CHARACTER_ATLASES = {
  main: {
    neutral: ART_ASSETS.character,
    happy: ART_ASSETS.characterHappy,
    hurt: ART_ASSETS.characterHurt,
    boxPaw: ART_ASSETS.boxPaw,
    columns: 4,
    rows: 4,
  },
  extra: {
    neutral: ART_ASSETS.characterExtra,
    happy: ART_ASSETS.characterExtraHappy,
    hurt: ART_ASSETS.characterExtraHurt,
    boxPaw: ART_ASSETS.boxPawExtra,
    columns: 3,
    rows: 3,
  },
};

const BACKGROUND_ATLASES = {
  main: { image: ART_ASSETS.background, columns: 2, rows: 3, url: "./assets/background-atlas.png" },
  extra: { image: ART_ASSETS.backgroundExtra, columns: 2, rows: 1, url: "./assets/background-extra-atlas.png" },
};

function getCharacterAtlas(item) {
  return item?.atlas === "extra" ? CHARACTER_ATLASES.extra : CHARACTER_ATLASES.main;
}

function getBackgroundAtlas(item) {
  return item?.atlas === "extra" ? BACKGROUND_ATLASES.extra : BACKGROUND_ATLASES.main;
}

const EXPRESSION_ARTWORK = {
  good: {},
  bad: {},
};
const SHOP_PREVIEW_ARTWORK_CACHE = new Map();

Object.values(ART_ASSETS).forEach((image) => {
  image.addEventListener("load", () => {
    prepareExpressionArtwork();
    if (currentUser && !game.running) {
      drawIntro();
    }
  });
});

const REMEMBER_LOGIN_KEY = "catnyam_auto_login";
const SHARE_PAGE_URL = "https://catnyam.vercel.app/";
const RANKING_REFRESH_MS = 15000;
const keys = new Set();
let authMode = "login";
let currentUser = null;
let animationId = null;
let idleAnimationId = null;
let idleVisualTime = 0;
let lastFrame = 0;
let touchDirection = 0;
let currentGameMode = CatnyamEngine.GAME_MODES.CHURU;
let rankingMode = "daily";
let rankingData = {
  daily: [],
  allTime: [],
};
let recentPlayData = [];
let rankingChanges = {
  daily: new Map(),
  allTime: new Map(),
};
let rankingRefreshId = null;
let rankingRequestInFlight = false;
let rankingRefreshQueued = false;
let activePlayerHistoryAccount = null;
let lastFinishedScore = null;
let lastFinishedShareUrls = null;
let lastFinishedSessionId = null;
let shopTab = "character";
const expandedAdminAccountIds = new Set();
let game = createGameState();

async function requestApi(path, options = {}) {
  const init = {
    method: options.method || "GET",
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
    },
  };

  if (options.body !== undefined) {
    init.headers["Content-Type"] = "application/json";
    init.body = JSON.stringify(options.body);
  }

  let response;
  try {
    response = await fetch(path, init);
  } catch {
    throw new Error("서버에 연결할 수 없습니다. Vercel 배포와 환경변수를 확인해주세요.");
  }

  let data = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(data.message || "요청 처리에 실패했습니다.");
  }

  return data;
}

function getCurrentLoadout() {
  return currentUser?.loadout || {
    character: "calico",
    companionLeft: null,
    companionRight: null,
    background: "village",
  };
}

function createGameState(seed = "catnyam-local", mode = currentGameMode, loadout = getCurrentLoadout()) {
  return {
    ...CatnyamEngine.createGameState({ seed, mode, loadout }),
    running: false,
    paused: false,
    gameSession: null,
    stepAccumulator: 0,
    inputLog: [],
    lastInputDirection: 0,
    visualFacing: 1,
    scorePopups: [],
    reaction: {
      type: "neutral",
      startedAt: 0,
      until: 0,
    },
    bubble: {
      text: "",
      until: 0,
    },
    emphasisBubble: {
      text: "",
      until: 0,
    },
    bombRainUntil: 0,
  };
}

function normalizeName(value) {
  return value.trim().replace(/\s+/g, " ");
}

function getRememberedLogin() {
  try {
    const value = JSON.parse(localStorage.getItem(REMEMBER_LOGIN_KEY));

    if (value?.username && value?.password) {
      return value;
    }
  } catch {
    // Login can continue normally if browser storage is unavailable.
  }

  return null;
}

function saveRememberedLogin(username, password) {
  try {
    localStorage.setItem(REMEMBER_LOGIN_KEY, JSON.stringify({ username, password }));
  } catch {
    // The active session still works even if credentials cannot be saved.
  }
}

function clearRememberedLogin() {
  try {
    localStorage.removeItem(REMEMBER_LOGIN_KEY);
  } catch {
    // Nothing else is required if browser storage is unavailable.
  }
}

function fillRememberedLogin() {
  const remembered = getRememberedLogin();

  if (!remembered) {
    return;
  }

  usernameInput.value = remembered.username;
  passwordInput.value = remembered.password;
  rememberLoginInput.checked = true;
}

function isAdmin(user) {
  return user?.role === "admin";
}

function getUserDisplayName(user) {
  return user?.nickname || user?.username || "";
}

function getGameModeLabel(mode = currentGameMode) {
  return mode === CatnyamEngine.GAME_MODES.BOMB ? "폭탄피하기" : "츄르먹기";
}

function getSurvivalSeconds(play) {
  const seconds = Number(play?.playSeconds);

  if (!Number.isFinite(seconds) || seconds < 0) {
    return null;
  }

  return Math.floor(seconds);
}

function shouldShowSurvivalTime(play, mode = currentGameMode) {
  return CatnyamEngine.normalizeGameMode(play?.gameMode || mode) === CatnyamEngine.GAME_MODES.BOMB && getSurvivalSeconds(play) !== null;
}

function formatSurvivalTime(play) {
  const totalSeconds = getSurvivalSeconds(play) || 0;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return minutes > 0 ? `${minutes}분 ${seconds}초` : `${seconds}초`;
}

function appendSurvivalTime(parent, play, mode = currentGameMode) {
  if (!shouldShowSurvivalTime(play, mode)) {
    return;
  }

  const survival = document.createElement("small");
  survival.className = "survival-time";
  survival.textContent = `생존 ${formatSurvivalTime(play)}`;
  parent.append(survival);
}

function getModeScoreStats(account, mode) {
  return account?.scoreStats?.[mode] || {
    bestScore: 0,
    gamesPlayed: 0,
  };
}

function createAdminModeStat(mode, stats) {
  const row = document.createElement("span");
  const label = document.createElement("strong");
  const value = document.createElement("span");

  row.className = "admin-mode-stat";
  label.textContent = getGameModeLabel(mode);
  value.textContent = `최고 ${stats.bestScore || 0}점 · ${stats.gamesPlayed || 0}회`;
  row.append(label, value);

  return row;
}

function isBombMode(mode = currentGameMode) {
  return mode === CatnyamEngine.GAME_MODES.BOMB;
}

function canUseGameMode(mode) {
  return Boolean(mode);
}

function ensureAllowedGameMode() {
  if (!canUseGameMode(currentGameMode)) {
    currentGameMode = CatnyamEngine.GAME_MODES.CHURU;

    if (game && !game.running && !game.paused && game.gameMode !== currentGameMode) {
      game = createGameState(`${currentGameMode}-preview`, currentGameMode);
    }
  }
}

function updateGameModeUI() {
  ensureAllowedGameMode();
  const bombMode = isBombMode();

  gameModeButtons.forEach((button) => {
    const isLocked = false;
    const isActive = button.dataset.gameMode === currentGameMode;
    button.hidden = isLocked;
    button.disabled = isLocked;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  itemGuide.querySelectorAll(".churu-guide").forEach((group) => {
    group.hidden = bombMode;
  });
  itemGuide.querySelectorAll(".bomb-guide").forEach((group) => {
    group.hidden = !bombMode;
  });

  timeLabel.textContent = bombMode ? "생존 시간" : "남은 시간";
  rankingTitle.textContent = bombMode ? "폭탄피하기 랭킹" : "츄르 랭킹";
  recentPlayTitle.textContent = "최근 플레이";
}

function updateTimeDisplay() {
  if (game.gameMode === CatnyamEngine.GAME_MODES.BOMB) {
    timeText.textContent = Math.floor(game.elapsed);
    return;
  }

  timeText.textContent = Math.ceil(game.timeLeft);
}

function setGameMode(mode) {
  if (game.running || game.paused) {
    return;
  }

  const nextMode = CatnyamEngine.normalizeGameMode(mode);

  if (!canUseGameMode(nextMode)) {
    return;
  }

  if (nextMode === currentGameMode) {
    updateGameModeUI();
    return;
  }

  currentGameMode = nextMode;
  lastFinishedScore = null;
  lastFinishedShareUrls = null;
  lastFinishedSessionId = null;
  resetShareStatus();
  rankingData = {
    daily: [],
    allTime: [],
  };
  rankingChanges = {
    daily: new Map(),
    allTime: new Map(),
  };
  recentPlayData = [];
  rankingList.innerHTML = "";
  recentPlayList.innerHTML = "";
  game = createGameState(`${currentGameMode}-preview`, currentGameMode);
  scoreText.textContent = "0";
  bestText.textContent = "0";
  clearModes();
  updateGameModeUI();
  updateTimeDisplay();
  renderRanking();
  showGameOverlay("게임 시작");
  drawIntro();
}

function setFieldMessage(element, message, isGood = false) {
  element.textContent = message;
  element.style.color = isGood ? "#288466" : "";
}

function setMessage(message, isGood = false) {
  setFieldMessage(authMessage, message, isGood);
}

function setUsernameMessage(message, isGood = false) {
  setFieldMessage(usernameMessage, message, isGood);
}

function setNicknameMessage(message, isGood = false) {
  setFieldMessage(nicknameMessage, message, isGood);
}

function setPasswordMessage(message, isGood = false) {
  setFieldMessage(passwordMessage, message, isGood);
}

function setAccountActionMessage(message, isGood = false) {
  setFieldMessage(accountActionMessage, message, isGood);
}

function setPlayerHistoryMessage(message, isGood = false) {
  setFieldMessage(playerHistoryMessage, message, isGood);
}

function setAdminMessage(message, isGood = false) {
  setFieldMessage(adminMessage, message, isGood);
}

function setShopMessage(message, isGood = false) {
  setFieldMessage(shopMessage, message, isGood);
}

function updateProfileName() {
  const displayName = getUserDisplayName(currentUser);
  currentUserName.textContent = displayName;
  adminBadge.hidden = !isAdmin(currentUser);
  coinText.textContent = currentUser?.coins || 0;
  shopCoinText.textContent = currentUser?.coins || 0;
}

function syncCurrentUser(user) {
  if (!user || currentUser?.id !== user.id) {
    return;
  }

  currentUser = user;
  updateProfileName();
  bestText.textContent = currentUser.bestScore || 0;
  renderShop();
}

function getOwnedShopItems(type) {
  const key = type === "character" ? "characters" : type === "companion" ? "companions" : "backgrounds";
  return currentUser?.inventory?.[key] || [];
}

function isShopItemEquipped(type, itemId, slot = "") {
  if (type === "character") {
    return currentUser?.loadout?.character === itemId;
  }

  if (type === "background") {
    return currentUser?.loadout?.background === itemId;
  }

  return slot === "left"
    ? currentUser?.loadout?.companionLeft === itemId
    : currentUser?.loadout?.companionRight === itemId;
}

function createShopActionButton(label, className, action, type, itemId, slot = "") {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `${className} shop-${action}-button`;
  button.textContent = label;
  button.dataset.shopAction = action;
  button.dataset.shopType = type;
  button.dataset.shopItem = itemId;
  if (slot) button.dataset.shopSlot = slot;
  return button;
}

function getShopPreviewStyle(type, item) {
  if (type === "background") {
    const atlas = getBackgroundAtlas(item);
    const x = atlas.columns > 1 ? (item.col / (atlas.columns - 1)) * 100 : 0;
    const y = atlas.rows > 1 ? (item.row / (atlas.rows - 1)) * 100 : 0;
    return `--shop-background-image:url("${atlas.url}");--shop-background-size:${atlas.columns * 100}% ${atlas.rows * 100}%;--sprite-x:${x}%;--sprite-y:${y}%`;
  }

  return "";
}

function getOpaqueArtworkBounds(imageData) {
  const { data, width, height } = imageData;
  const labels = new Uint16Array(width * height);
  let largest = null;
  let label = 0;

  for (let start = 0; start < labels.length; start += 1) {
    if (labels[start] || data[start * 4 + 3] < 8) {
      continue;
    }

    label += 1;
    const stack = [start];
    labels[start] = label;
    let count = 0;
    let minX = width;
    let minY = height;
    let maxX = 0;
    let maxY = 0;

    while (stack.length > 0) {
      const pixel = stack.pop();
      const x = pixel % width;
      const y = Math.floor(pixel / width);
      count += 1;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);

      const neighbors = [pixel - 1, pixel + 1, pixel - width, pixel + width];
      neighbors.forEach((neighbor, index) => {
        const crossesRow = (index === 0 && x === 0) || (index === 1 && x === width - 1);
        if (crossesRow || neighbor < 0 || neighbor >= labels.length || labels[neighbor]) {
          return;
        }

        if (data[neighbor * 4 + 3] >= 8) {
          labels[neighbor] = label;
          stack.push(neighbor);
        }
      });
    }

    if (!largest || count > largest.count) {
      largest = { label, count, minX, minY, maxX, maxY };
    }
  }

  if (largest) {
    for (let pixel = 0; pixel < labels.length; pixel += 1) {
      if (labels[pixel] !== largest.label) {
        data[pixel * 4 + 3] = 0;
      }
    }
  }

  return largest;
}

function drawShopSpritePreview(canvas, type, item) {
  const characterAtlas = type === "character" ? getCharacterAtlas(item) : null;
  const image = characterAtlas?.neutral || ART_ASSETS.companion;
  const columns = characterAtlas?.columns || 3;
  const rows = characterAtlas?.rows || 2;
  const draw = () => {
    if (!isArtworkReady(image)) {
      return;
    }

    const cacheKey = `${type}:${item.atlas || "main"}:${item.col}:${item.row}`;
    let artwork = SHOP_PREVIEW_ARTWORK_CACHE.get(cacheKey);
    if (!artwork) {
      const sourceX = Math.floor((item.col * image.naturalWidth) / columns);
      const sourceY = Math.floor((item.row * image.naturalHeight) / rows);
      const sourceRight = Math.floor(((item.col + 1) * image.naturalWidth) / columns);
      const sourceBottom = Math.floor(((item.row + 1) * image.naturalHeight) / rows);
      const sourceWidth = sourceRight - sourceX;
      const sourceHeight = sourceBottom - sourceY;
      const sourceCanvas = document.createElement("canvas");
      const sourceContext = sourceCanvas.getContext("2d", { willReadFrequently: true });
      sourceCanvas.width = sourceWidth;
      sourceCanvas.height = sourceHeight;
      sourceContext.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, sourceWidth, sourceHeight);
      const imageData = sourceContext.getImageData(0, 0, sourceWidth, sourceHeight);
      const bounds = getOpaqueArtworkBounds(imageData);
      if (bounds) {
        sourceContext.putImageData(imageData, 0, 0);
        artwork = { sourceCanvas, sourceWidth, sourceHeight, bounds };
        SHOP_PREVIEW_ARTWORK_CACHE.set(cacheKey, artwork);
      }
    }

    const { sourceCanvas, sourceWidth, sourceHeight, bounds } = artwork || {};
    if (!bounds) {
      return;
    }

    const padding = 8;
    const cropX = Math.max(0, bounds.minX - padding);
    const cropY = Math.max(0, bounds.minY - padding);
    const cropWidth = Math.min(sourceWidth, bounds.maxX + padding + 1) - cropX;
    const cropHeight = Math.min(sourceHeight, bounds.maxY + padding + 1) - cropY;
    const context = canvas.getContext("2d");
    const maxWidth = canvas.width * 0.7;
    const maxHeight = canvas.height * 0.8;
    const scale = Math.min(maxWidth / cropWidth, maxHeight / cropHeight);
    const drawWidth = cropWidth * scale;
    const drawHeight = cropHeight * scale;
    const drawX = (canvas.width - drawWidth) / 2;
    const drawY = canvas.height - drawHeight - canvas.height * 0.05;
    const flip = type === "companion" && (item.col === 1 || item.col === 2) && item.row === 0;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.save();
    if (flip) {
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
    }
    context.drawImage(
      sourceCanvas,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      flip ? canvas.width - drawX - drawWidth : drawX,
      drawY,
      drawWidth,
      drawHeight,
    );
    context.restore();
  };

  if (isArtworkReady(image)) {
    draw();
  } else {
    image.addEventListener("load", draw, { once: true });
  }
}

function renderShop() {
  if (!shopGrid || !currentUser) {
    return;
  }

  const catalog = SHOP_CATALOG[shopTab];
  const ownedItems = getOwnedShopItems(shopTab);
  const fragment = document.createDocumentFragment();
  shopGrid.innerHTML = "";
  shopCoinText.textContent = currentUser.coins || 0;
  shopHelp.textContent = shopTab === "character"
    ? "게임에서 사용할 주인공을 골라보세요."
    : shopTab === "companion"
      ? "좋은 아이템만 먹는 동료를 왼쪽과 오른쪽에 최대 두 마리 배치할 수 있어요."
      : "게임 화면의 풍경을 바꿔보세요.";

  const catalogEntries = Object.entries(catalog);
  if (shopTab === "background") {
    catalogEntries.sort(([, first], [, second]) => first.price - second.price);
  }

  catalogEntries.forEach(([itemId, item]) => {
    const owned = ownedItems.includes(itemId);
    const card = document.createElement("article");
    const preview = document.createElement("div");
    const copy = document.createElement("div");
    const title = document.createElement("strong");
    const meta = document.createElement("span");
    const description = document.createElement("small");
    const badge = document.createElement("span");
    const actions = document.createElement("div");
    const equipped = shopTab === "companion"
      ? isShopItemEquipped(shopTab, itemId, "left") || isShopItemEquipped(shopTab, itemId, "right")
      : isShopItemEquipped(shopTab, itemId);

    card.className = `shop-card shop-card-${shopTab}${equipped ? " is-equipped" : ""}`;
    preview.className = `shop-preview ${shopTab}`;
    preview.dataset.shopItem = itemId;
    preview.style.cssText = getShopPreviewStyle(shopTab, item);
    preview.setAttribute("aria-label", `${item.name} 미리보기`);
    if (shopTab === "character" || shopTab === "companion") {
      const artworkCanvas = document.createElement("canvas");
      artworkCanvas.className = "shop-preview-artwork";
      artworkCanvas.width = 360;
      artworkCanvas.height = 300;
      preview.append(artworkCanvas);
      drawShopSpritePreview(artworkCanvas, shopTab, item);
    }
    badge.className = `shop-preview-badge${equipped ? " equipped" : owned ? " owned" : ""}`;
    badge.textContent = equipped
      ? "사용 중"
      : owned
        ? "보유"
        : shopTab === "companion" ? "동료" : shopTab === "background" ? "배경" : "스킨";
    preview.append(badge);

    copy.className = "shop-card-copy";
    title.textContent = item.name;
    meta.textContent = item.price > 0 ? `● ${item.price}` : "기본";
    description.textContent = shopTab === "companion" ? item.buff : "";
    copy.append(title, meta);
    if (shopTab === "companion") {
      copy.append(description);
    }
    actions.className = "shop-card-actions";

    if (!owned) {
      actions.append(createShopActionButton(
        `${item.price}코인 구매`,
        "secondary-button wide",
        "purchase",
        shopTab,
        itemId,
      ));
    } else if (shopTab === "companion") {
      const leftEquipped = isShopItemEquipped(shopTab, itemId, "left");
      const rightEquipped = isShopItemEquipped(shopTab, itemId, "right");
      const leftButton = createShopActionButton(leftEquipped ? "왼쪽 해제" : "왼쪽 적용", leftEquipped ? "secondary-button" : "ghost-button", leftEquipped ? "unequip" : "equip", shopTab, itemId, "left");
      const rightButton = createShopActionButton(rightEquipped ? "오른쪽 해제" : "오른쪽 적용", rightEquipped ? "secondary-button" : "ghost-button", rightEquipped ? "unequip" : "equip", shopTab, itemId, "right");
      actions.append(leftButton, rightButton);
    } else {
      const equipButton = createShopActionButton(
        equipped ? "적용 중" : "적용하기",
        equipped ? "ghost-button wide" : "secondary-button wide",
        "equip",
        shopTab,
        itemId,
      );
      equipButton.disabled = equipped;
      actions.append(equipButton);
    }

    card.append(preview, copy, actions);
    fragment.append(card);
  });

  shopGrid.append(fragment);
}

function setShopTab(type) {
  if (!SHOP_CATALOG[type]) {
    return;
  }

  shopTab = type;
  shopTabButtons.forEach((button) => {
    const active = button.dataset.shopTab === type;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
  });
  setShopMessage("");
  renderShop();
}

async function openShopModal() {
  if (!currentUser || game.running || game.paused) {
    return;
  }

  closeAccountModal();
  shopModal.hidden = false;
  setShopMessage("");
  renderShop();
}

function closeShopModal() {
  shopModal.hidden = true;
  setShopMessage("");
}

async function handleShopAction(event) {
  const button = event.target.closest("[data-shop-action]");
  if (!button || !currentUser) {
    return;
  }

  button.disabled = true;
  setShopMessage("");

  try {
    const data = await requestApi("/api/scores", {
      method: "POST",
      body: {
        action: "shop",
        shopAction: button.dataset.shopAction,
        type: button.dataset.shopType,
        itemId: button.dataset.shopItem,
        slot: button.dataset.shopSlot || undefined,
      },
    });
    syncCurrentUser(data.user);
    game.loadout = CatnyamEngine.normalizeLoadout(currentUser.loadout);
    if (!game.running && !game.paused) {
      drawIntro();
    }
    setShopMessage(data.message || "상점 설정을 저장했습니다.", true);
  } catch (error) {
    setShopMessage(error.message);
    renderShop();
  }
}

function startRankingRefresh() {
  stopRankingRefresh();
  rankingRefreshId = window.setInterval(() => {
    if (currentUser && !gamePanel.hidden) {
      renderRanking();
    }
  }, RANKING_REFRESH_MS);
}

function stopRankingRefresh() {
  if (!rankingRefreshId) {
    return;
  }

  window.clearInterval(rankingRefreshId);
  rankingRefreshId = null;
}

function setAuthMode(mode) {
  authMode = mode;
  const isSignup = mode === "signup";

  authTitle.textContent = isSignup ? "새 계정을 만들어 시작하세요" : "로그인하고 츄르 랭킹에 도전하세요";
  authDescription.textContent = isSignup
    ? "아이디, 닉네임, 비밀번호와 비밀번호 확인을 입력하면 바로 게임을 시작할 수 있습니다."
    : "아이디와 비밀번호를 입력해 시작합니다. 기록은 서버에 저장됩니다.";
  nicknameField.hidden = !isSignup;
  nicknameInput.required = isSignup;
  confirmPasswordField.hidden = !isSignup;
  confirmPasswordInput.required = isSignup;
  rememberLoginField.hidden = isSignup;
  rememberLoginInput.disabled = isSignup;
  passwordInput.autocomplete = isSignup ? "new-password" : "current-password";
  authSubmitButton.textContent = isSignup ? "가입 완료" : "로그인";
  signupButton.hidden = isSignup;
  loginModeButton.hidden = !isSignup;
  authForm.reset();
  if (!isSignup) {
    fillRememberedLogin();
  }
  setMessage("");
  usernameInput.focus();
}

function showGameFor(user) {
  currentUser = user;
  game = createGameState(`${currentGameMode}-preview`, currentGameMode, currentUser.loadout);
  authPanel.hidden = true;
  gamePanel.hidden = false;
  profileBox.hidden = false;
  updateProfileName();
  scoreText.textContent = "0";
  runCoinText.textContent = "0";
  bestText.textContent = currentUser.bestScore || 0;
  changeUsernameForm.reset();
  changeNicknameForm.reset();
  changePasswordForm.reset();
  newUsernameInput.value = currentUser.username;
  newNicknameInput.value = getUserDisplayName(currentUser);
  setUsernameMessage("");
  setNicknameMessage("");
  setPasswordMessage("");
  setAccountActionMessage("");
  setAdminMessage("");
  updateGameModeUI();
  updateTimeDisplay();
  renderRanking();
  startRankingRefresh();
  updateModeBadges();
  showGameOverlay("게임 시작");
  drawIntro();
  startIdleAnimation();
}

function showAuth() {
  currentUser = null;
  cancelIdleAnimation();
  stopRankingRefresh();
  stopGame();
  authPanel.hidden = false;
  gamePanel.hidden = true;
  profileBox.hidden = true;
  closeAccountModal();
  closeShopModal();
  closePlayerHistoryModal();
  changeUsernameForm.reset();
  changeNicknameForm.reset();
  changePasswordForm.reset();
  setUsernameMessage("");
  setNicknameMessage("");
  setPasswordMessage("");
  setAccountActionMessage("");
  setAdminMessage("");
  setAuthMode("login");
}

async function handleAuthSubmit(event) {
  event.preventDefault();

  if (authMode === "signup") {
    await signup();
    return;
  }

  await login();
}

async function signup() {
  const username = normalizeName(usernameInput.value);
  const nickname = normalizeName(nicknameInput.value);
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  if (username.length < 2) {
    setMessage("아이디는 2글자 이상 입력해주세요.");
    return;
  }

  if (nickname.length < 2) {
    setMessage("닉네임은 2글자 이상 입력해주세요.");
    return;
  }

  if (password.length < 4) {
    setMessage("비밀번호는 4글자 이상 입력해주세요.");
    return;
  }

  if (password !== confirmPassword) {
    setMessage("비밀번호 확인이 일치하지 않습니다.");
    return;
  }

  try {
    const data = await requestApi("/api/signup", {
      method: "POST",
      body: { username, nickname, password },
    });
    setMessage(data.user.role === "admin" ? "첫 관리자 계정으로 가입되었습니다." : "가입 완료! 바로 시작해볼까요?", true);
    showGameFor(data.user);
  } catch (error) {
    setMessage(error.message);
  }
}

async function login() {
  const username = normalizeName(usernameInput.value);
  const password = passwordInput.value;

  try {
    const data = await requestApi("/api/login", {
      method: "POST",
      body: { username, password },
    });
    if (rememberLoginInput.checked) {
      saveRememberedLogin(username, password);
    } else {
      clearRememberedLogin();
    }
    showGameFor(data.user);
  } catch (error) {
    setMessage(error.message);
  }
}

async function logout() {
  try {
    await requestApi("/api/logout", { method: "POST" });
  } catch {
    // The local screen can still return to auth even if the server session is already gone.
  }

  clearRememberedLogin();
  showAuth();
}

async function restoreSession() {
  try {
    const data = await requestApi("/api/login");
    showGameFor(data.user);
    return true;
  } catch {
    return false;
  }
}

async function loginWithRememberedCredentials() {
  const remembered = getRememberedLogin();

  if (!remembered) {
    return false;
  }

  usernameInput.value = remembered.username;
  passwordInput.value = remembered.password;
  rememberLoginInput.checked = true;

  try {
    const data = await requestApi("/api/login", {
      method: "POST",
      body: remembered,
    });
    showGameFor(data.user);
    return true;
  } catch {
    clearRememberedLogin();
    authForm.reset();
    setMessage("자동로그인에 실패했습니다. 다시 로그인해주세요.");
    return false;
  }
}

async function initializeApp() {
  authPanel.hidden = true;
  gamePanel.hidden = true;
  profileBox.hidden = true;

  if (await restoreSession()) {
    return;
  }

  if (await loginWithRememberedCredentials()) {
    return;
  }

  showAuth();
}

async function changeUsername(event) {
  event.preventDefault();

  if (!currentUser) {
    return;
  }

  const username = normalizeName(newUsernameInput.value);

  if (username.length < 2) {
    setUsernameMessage("아이디는 2글자 이상 입력해주세요.");
    return;
  }

  if (username === currentUser.username) {
    setUsernameMessage("현재 아이디와 같습니다.", true);
    return;
  }

  try {
    const data = await requestApi("/api/change-username", {
      method: "POST",
      body: { username },
    });
    currentUser = data.user;
    newUsernameInput.value = currentUser.username;
    newNicknameInput.value = getUserDisplayName(currentUser);
    const remembered = getRememberedLogin();

    if (remembered) {
      saveRememberedLogin(currentUser.username, remembered.password);
    }

    updateProfileName();
    setUsernameMessage("아이디가 변경되었습니다.", true);
    renderRanking();

    if (!adminTabPanel.hidden) {
      renderAdminList();
    }
  } catch (error) {
    setUsernameMessage(error.message);
  }
}

async function changeNickname(event) {
  event.preventDefault();

  if (!currentUser) {
    return;
  }

  const nickname = normalizeName(newNicknameInput.value);

  if (nickname.length < 2) {
    setNicknameMessage("닉네임은 2글자 이상 입력해주세요.");
    return;
  }

  if (nickname === getUserDisplayName(currentUser)) {
    setNicknameMessage("현재 닉네임과 같습니다.", true);
    return;
  }

  try {
    const data = await requestApi("/api/change-username", {
      method: "POST",
      body: { nickname },
    });
    currentUser = data.user;
    newNicknameInput.value = getUserDisplayName(currentUser);
    updateProfileName();
    setNicknameMessage("닉네임이 변경되었습니다.", true);
    renderRanking();

    if (!adminTabPanel.hidden) {
      renderAdminList();
    }
  } catch (error) {
    setNicknameMessage(error.message);
  }
}

async function changePassword(event) {
  event.preventDefault();

  if (!currentUser) {
    return;
  }

  const currentPassword = currentPasswordInput.value;
  const newPassword = newPasswordInput.value;
  const confirmPassword = newPasswordConfirmInput.value;

  if (newPassword.length < 4) {
    setPasswordMessage("새 비밀번호는 4글자 이상 입력해주세요.");
    return;
  }

  if (newPassword !== confirmPassword) {
    setPasswordMessage("새 비밀번호 확인이 일치하지 않습니다.");
    return;
  }

  try {
    await requestApi("/api/change-password", {
      method: "POST",
      body: { currentPassword, newPassword },
    });
    changePasswordForm.reset();
    const remembered = getRememberedLogin();

    if (remembered) {
      saveRememberedLogin(currentUser.username, newPassword);
    }

    setPasswordMessage("비밀번호가 변경되었습니다.", true);
  } catch (error) {
    setPasswordMessage(error.message);
  }
}

function openAccountModal() {
  if (!currentUser) {
    return;
  }

  const canManageAccounts = isAdmin(currentUser);
  adminTabButton.hidden = !canManageAccounts;
  tabList.classList.toggle("single-tab", !canManageAccounts);
  setAccountTab("password");
  changeUsernameForm.reset();
  changeNicknameForm.reset();
  changePasswordForm.reset();
  newUsernameInput.value = currentUser.username;
  newNicknameInput.value = getUserDisplayName(currentUser);
  setUsernameMessage("");
  setNicknameMessage("");
  setPasswordMessage("");
  setAccountActionMessage("");
  setAdminMessage("");
  closeShopModal();
  accountModal.hidden = false;
  newUsernameInput.focus();
}

function closeAccountModal() {
  accountModal.hidden = true;
}

function setAccountTab(tabName) {
  const isAdminTab = tabName === "admin";

  if (isAdminTab && !isAdmin(currentUser)) {
    return;
  }

  passwordTabButton.classList.toggle("active", !isAdminTab);
  adminTabButton.classList.toggle("active", isAdminTab);
  passwordTabButton.setAttribute("aria-selected", String(!isAdminTab));
  adminTabButton.setAttribute("aria-selected", String(isAdminTab));
  passwordTabPanel.hidden = isAdminTab;
  adminTabPanel.hidden = !isAdminTab;

  if (isAdminTab) {
    renderAdminList();
  }
}

async function renderRanking() {
  if (rankingRequestInFlight) {
    rankingRefreshQueued = true;
    return;
  }

  rankingRequestInFlight = true;
  const hadRankingContent = rankingList.children.length > 0;
  const hadRecentPlayContent = recentPlayList.children.length > 0;

  if (!hadRankingContent) {
    appendRankingItem("-", "랭킹을 불러오는 중입니다", 0);
  }

  if (!hadRecentPlayContent) {
    renderRecentPlays("최근 플레이를 불러오는 중입니다");
  }

  try {
    const requestedGameMode = currentGameMode;
    const data = await requestApi(`/api/rankings?gameMode=${encodeURIComponent(requestedGameMode)}`);

    if (requestedGameMode !== currentGameMode) {
      return;
    }

    const nextRankingData = {
      daily: data.dailyRankings || [],
      allTime: data.allTimeRankings || data.rankings || [],
    };
    recentPlayData = data.recentPlays || [];
    rankingChanges = {
      daily: buildRankingChangeMap(rankingData.daily, nextRankingData.daily),
      allTime: buildRankingChangeMap(rankingData.allTime, nextRankingData.allTime),
    };
    rankingData = nextRankingData;
    updateDisplayedBestScore();
    renderRankingList();
    renderRecentPlays();
  } catch {
    if (!hadRankingContent) {
      rankingList.innerHTML = "";
      appendRankingItem("-", "랭킹 서버 연결 필요", 0);
    }

    if (!hadRecentPlayContent) {
      recentPlayData = [];
      renderRecentPlays("최근 플레이 서버 연결 필요");
    }
  } finally {
    rankingRequestInFlight = false;

    if (rankingRefreshQueued) {
      rankingRefreshQueued = false;
      renderRanking();
    }
  }
}

function setRankingMode(mode) {
  rankingMode = mode;
  const isDaily = mode === "daily";
  dailyRankingButton.classList.toggle("active", isDaily);
  allTimeRankingButton.classList.toggle("active", !isDaily);
  dailyRankingButton.setAttribute("aria-selected", String(isDaily));
  allTimeRankingButton.setAttribute("aria-selected", String(!isDaily));
  renderRankingList();
}

function renderRankingList() {
  rankingList.innerHTML = "";
  const ranking = rankingMode === "daily" ? rankingData.daily : rankingData.allTime;
  const changes = rankingMode === "daily" ? rankingChanges.daily : rankingChanges.allTime;
  const emptyMessage = rankingMode === "daily" ? "오늘 기록이 없습니다" : "아직 기록이 없습니다";

  if (ranking.length === 0) {
    appendRankingItem("-", emptyMessage, 0);
    return;
  }

  ranking.forEach((account, index) => {
    appendRankingItem(index + 1, account, account.score ?? account.bestScore ?? 0, changes.get(getRankingKey(account)) || 0);
  });
}

function getRankingKey(account) {
  return account?.id || account?.username || account?.nickname || "";
}

function buildRankingChangeMap(previousRanking, nextRanking) {
  const previousRanks = new Map();
  const changes = new Map();

  previousRanking.forEach((account, index) => {
    const key = getRankingKey(account);

    if (key) {
      previousRanks.set(key, index + 1);
    }
  });

  nextRanking.forEach((account, index) => {
    const key = getRankingKey(account);
    const previousRank = previousRanks.get(key);
    const nextRank = index + 1;

    if (previousRank && previousRank !== nextRank) {
      changes.set(key, previousRank - nextRank);
    }
  });

  return changes;
}

function updateDisplayedBestScore() {
  if (!currentUser) {
    bestText.textContent = "0";
    return;
  }

  const currentUserRanking = rankingData.allTime.find((account) => account.id === currentUser.id);
  bestText.textContent = currentUserRanking?.bestScore ?? currentUserRanking?.score ?? 0;
}

function renderRankChange(element, delta) {
  element.textContent = "";
  element.classList.remove("up", "down");
  element.removeAttribute("title");
  element.removeAttribute("aria-label");

  if (!delta) {
    element.setAttribute("aria-hidden", "true");
    return;
  }

  const movedUp = delta > 0;
  const amount = Math.abs(delta);
  element.classList.add(movedUp ? "up" : "down");
  element.textContent = movedUp ? "▲" : "▼";
  element.title = movedUp ? `${amount}등 상승` : `${amount}등 하락`;
  element.setAttribute("aria-label", element.title);
  element.removeAttribute("aria-hidden");
}

function appendRankingItem(rankValue, accountInfo, scoreValue, rankDelta = 0) {
  const item = document.createElement("li");
  const rank = document.createElement("span");
  const name = document.createElement("span");
  const rankChange = document.createElement("span");
  const score = document.createElement("span");
  const account = typeof accountInfo === "object" && accountInfo !== null ? accountInfo : null;
  const displayName = account ? getUserDisplayName(account) : accountInfo;
  name.className = "name";
  rankChange.className = "rank-change";
  score.className = "score";
  rank.textContent = rankValue;

  if (account?.id && isAdmin(currentUser)) {
    const nameButton = document.createElement("button");
    nameButton.className = "ranking-name-button";
    nameButton.type = "button";
    nameButton.textContent = displayName;
    nameButton.title = `${displayName} 플레이 기록`;
    nameButton.setAttribute("aria-label", `${displayName} 플레이 기록 보기`);
    nameButton.addEventListener("click", () => openPlayerHistory(account));
    name.append(nameButton);
  } else {
    name.textContent = displayName;
  }

  renderRankChange(rankChange, account ? rankDelta : 0);
  score.textContent = "";
  const scoreNumber = document.createElement("span");
  scoreNumber.textContent = scoreValue;
  score.append(scoreNumber);

  if (account) {
    appendSurvivalTime(score, account, currentGameMode);
  }

  item.append(rank, name, rankChange, score);
  rankingList.append(item);
}

function formatPlayDate(value) {
  if (!value) {
    return "날짜 없음";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "날짜 없음";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatRecentPlayTime(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "날짜 없음";
  }

  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));

  if (elapsedSeconds < 60) {
    return "방금 전";
  }

  if (elapsedSeconds < 3600) {
    return `${Math.floor(elapsedSeconds / 60)}분 전`;
  }

  if (elapsedSeconds < 86400) {
    return `${Math.floor(elapsedSeconds / 3600)}시간 전`;
  }

  if (elapsedSeconds < 604800) {
    return `${Math.floor(elapsedSeconds / 86400)}일 전`;
  }

  return `${Math.floor(elapsedSeconds / 604800)}주 전`;
}

function formatRecentPlayDateTime(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const parts = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date).reduce((result, part) => {
    result[part.type] = part.value;
    return result;
  }, {});

  return `${parts.month}.${parts.day} ${parts.hour}:${parts.minute}`;
}

function appendRecentPlayItem(play) {
  const item = document.createElement("li");
  const main = document.createElement("span");
  const name = document.createElement("span");
  const time = document.createElement("time");
  const relativeTime = document.createElement("span");
  const exactTime = document.createElement("span");
  const score = document.createElement("span");
  main.className = "recent-play-main";
  name.className = "recent-play-name";
  time.className = "recent-play-time";
  relativeTime.className = "recent-play-relative";
  exactTime.className = "recent-play-date";
  score.className = "recent-play-score";
  name.textContent = play.nickname || "플레이어";
  relativeTime.textContent = formatRecentPlayTime(play.createdAt);
  const exactTimeText = formatRecentPlayDateTime(play.createdAt);
  exactTime.textContent = exactTimeText ? `(${exactTimeText})` : "";
  time.dateTime = play.createdAt || "";
  time.append(relativeTime, exactTime);
  score.textContent = `${play.score || 0}점`;
  appendSurvivalTime(score, play);
  main.append(name, time);
  item.append(main, score);
  recentPlayList.append(item);
}

function renderRecentPlays(message = "") {
  recentPlayList.innerHTML = "";

  if (message) {
    const item = document.createElement("li");
    item.className = "recent-play-empty";
    item.textContent = message;
    recentPlayList.append(item);
    return;
  }

  if (recentPlayData.length === 0) {
    const item = document.createElement("li");
    item.className = "recent-play-empty";
    item.textContent = "최근 플레이가 없습니다";
    recentPlayList.append(item);
    return;
  }

  recentPlayData.slice(0, 5).forEach(appendRecentPlayItem);
}

function closePlayerHistoryModal() {
  playerHistoryModal.hidden = true;
  activePlayerHistoryAccount = null;
}

function appendPlayerHistoryDetail(list, label, value) {
  const item = document.createElement("div");
  const term = document.createElement("dt");
  const description = document.createElement("dd");
  term.textContent = label;
  description.textContent = value || "-";
  item.append(term, description);
  list.append(item);
}

function getRoleLabel(role) {
  return role === "admin" ? "관리자" : "일반 사용자";
}

function renderPlayerHistorySummary(user, stats) {
  const details = document.createElement("dl");
  const totalGames = stats.totalGamesPlayed ?? user.gamesPlayed ?? 0;
  const todayGames = stats.todayGamesPlayed ?? 0;
  details.className = "player-history-info";

  appendPlayerHistoryDetail(details, "아이디", user.username);
  appendPlayerHistoryDetail(details, "닉네임", getUserDisplayName(user));
  appendPlayerHistoryDetail(details, "권한", getRoleLabel(user.role));
  appendPlayerHistoryDetail(details, "게임 모드", getGameModeLabel(stats.gameMode));
  appendPlayerHistoryDetail(details, "가입일", formatPlayDate(user.createdAt));
  appendPlayerHistoryDetail(details, "최종 접속일", formatPlayDate(user.lastLoginAt));
  appendPlayerHistoryDetail(details, "보유 코인", `${Math.max(0, Number(user.coins) || 0)}코인`);
  appendPlayerHistoryDetail(details, "최고 기록", `${user.bestScore || 0}점`);
  appendPlayerHistoryDetail(details, "전체 횟수", `${totalGames}회`);
  appendPlayerHistoryDetail(details, "오늘 횟수", `${todayGames}회`);
  playerHistorySummary.replaceChildren(details);
}

async function openPlayerHistory(account) {
  if (!account?.id) {
    return;
  }

  activePlayerHistoryAccount = account;
  playerHistoryTitle.textContent = `${getUserDisplayName(account)} 정보`;
  playerHistorySummary.textContent = "기록을 불러오는 중입니다.";
  playerHistoryList.innerHTML = "";
  setPlayerHistoryMessage("");
  playerHistoryModal.hidden = false;

  try {
    const data = await requestApi(`/api/rankings?userId=${encodeURIComponent(account.id)}&gameMode=${encodeURIComponent(currentGameMode)}`);
    renderPlayerHistory(data);
  } catch (error) {
    playerHistorySummary.textContent = "";
    setPlayerHistoryMessage(error.message);
  }
}

function renderPlayerHistory(data) {
  const user = data.user || {};
  const stats = data.stats || {};
  const history = data.history || [];
  activePlayerHistoryAccount = user;
  playerHistoryTitle.textContent = `${getUserDisplayName(user) || "플레이어"} 정보`;
  renderPlayerHistorySummary(user, stats);
  playerHistoryList.innerHTML = "";
  setPlayerHistoryMessage("");

  if (history.length === 0) {
    setPlayerHistoryMessage("아직 플레이 기록이 없습니다.", true);
    return;
  }

  history.forEach((play) => {
    const item = document.createElement("li");
    const date = document.createElement("span");
    const scoreRow = document.createElement("span");
    const score = document.createElement("span");
    const deleteButton = document.createElement("button");
    date.className = "player-history-date";
    scoreRow.className = "player-history-score-row";
    score.className = "player-history-score";
    deleteButton.className = "player-history-delete-button";
    deleteButton.type = "button";
    deleteButton.textContent = "×";
    deleteButton.title = `${play.score || 0}점 기록 삭제`;
    deleteButton.setAttribute("aria-label", `${formatPlayDate(play.createdAt)} ${play.score || 0}점 기록 삭제`);
    deleteButton.addEventListener("click", () => deletePlayerHistoryRecord(play, deleteButton));
    date.textContent = formatPlayDate(play.createdAt);
    score.textContent = `${play.score || 0}점`;
    appendSurvivalTime(score, play, stats.gameMode);
    scoreRow.append(score, deleteButton);
    item.append(date, scoreRow);
    playerHistoryList.append(item);
  });
}

async function deletePlayerHistoryRecord(play, button) {
  if (!activePlayerHistoryAccount?.id || !play?.id) {
    return;
  }

  const playLabel = `${formatPlayDate(play.createdAt)} ${play.score || 0}점`;

  if (!window.confirm(`${playLabel} 기록을 삭제할까요?`)) {
    return;
  }

  button.disabled = true;
  setPlayerHistoryMessage("");

  try {
    const data = await requestApi("/api/rankings", {
      method: "DELETE",
      body: {
        userId: activePlayerHistoryAccount.id,
        scoreId: play.id,
        gameMode: currentGameMode,
      },
    });
    syncCurrentUser(data.user);
    renderPlayerHistory(data);
    renderRanking();

    if (!adminTabPanel.hidden) {
      await renderAdminList();
    }

    setPlayerHistoryMessage("플레이 기록을 삭제했습니다.", true);
  } catch (error) {
    setPlayerHistoryMessage(error.message);
    button.disabled = false;
  }
}

async function renderAdminList() {
  if (!isAdmin(currentUser)) {
    adminList.innerHTML = "";
    return;
  }

  adminList.innerHTML = "";
  setAdminMessage("");

  try {
    const data = await requestApi("/api/admin/users");
    const accounts = data.users || [];

    if (accounts.length === 0) {
      const empty = document.createElement("p");
      empty.className = "admin-note";
      empty.textContent = "관리할 계정이 없습니다.";
      adminList.append(empty);
      return;
    }

    accounts.forEach(renderAdminAccount);
  } catch (error) {
    setAdminMessage(error.message);
  }
}

function renderAdminAccount(account) {
  const item = document.createElement("div");
  const main = document.createElement("div");
  const name = document.createElement("button");
  const toggleIcon = document.createElement("span");
  const meta = document.createElement("span");
  const renameForm = document.createElement("form");
  const renameInput = document.createElement("input");
  const renameButton = document.createElement("button");
  const actions = document.createElement("div");
  const details = document.createElement("div");
  const churuScoreResetButton = document.createElement("button");
  const bombScoreResetButton = document.createElement("button");
  const resetButton = document.createElement("button");
  const deleteButton = document.createElement("button");

  item.className = "admin-account";
  main.className = "admin-account-main";
  name.className = "admin-account-name";
  toggleIcon.className = "admin-account-toggle-icon";
  meta.className = "admin-account-meta";
  renameForm.className = "admin-rename-row";
  actions.className = "admin-actions";
  details.className = "admin-account-details";
  renameButton.className = "secondary-button";
  churuScoreResetButton.className = "secondary-button";
  bombScoreResetButton.className = "secondary-button";
  resetButton.className = "secondary-button";
  deleteButton.className = "danger-button";

  const displayName = getUserDisplayName(account);
  const detailId = `admin-account-details-${account.id}`;
  const setExpanded = (isExpanded) => {
    item.classList.toggle("is-open", isExpanded);
    details.hidden = !isExpanded;
    main.setAttribute("aria-expanded", String(isExpanded));

    if (isExpanded) {
      expandedAdminAccountIds.add(account.id);
    } else {
      expandedAdminAccountIds.delete(account.id);
    }
  };

  main.tabIndex = 0;
  main.setAttribute("role", "button");
  main.setAttribute("aria-controls", detailId);
  main.addEventListener("click", () => {
    setExpanded(!expandedAdminAccountIds.has(account.id));
  });
  main.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    setExpanded(!expandedAdminAccountIds.has(account.id));
  });
  toggleIcon.setAttribute("aria-hidden", "true");
  details.id = detailId;
  name.type = "button";
  name.textContent = `${displayName}(${account.username})`;
  name.setAttribute("aria-label", `${displayName} 계정 정보 보기`);
  name.addEventListener("click", (event) => {
    event.stopPropagation();
    openPlayerHistory(account);
  });
  name.addEventListener("keydown", (event) => {
    event.stopPropagation();
  });
  meta.replaceChildren(
    createAdminModeStat(CatnyamEngine.GAME_MODES.CHURU, getModeScoreStats(account, CatnyamEngine.GAME_MODES.CHURU)),
    createAdminModeStat(CatnyamEngine.GAME_MODES.BOMB, getModeScoreStats(account, CatnyamEngine.GAME_MODES.BOMB)),
  );
  renameInput.type = "text";
  renameInput.maxLength = 16;
  renameInput.value = account.username;
  renameInput.setAttribute("aria-label", `${account.username} 새 아이디`);
  renameButton.type = "submit";
  renameButton.textContent = "아이디 변경";
  churuScoreResetButton.type = "button";
  bombScoreResetButton.type = "button";
  resetButton.type = "button";
  deleteButton.type = "button";
  churuScoreResetButton.textContent = "츄르 점수 초기화";
  bombScoreResetButton.textContent = "폭탄 점수 초기화";
  resetButton.textContent = "비밀번호 초기화";
  deleteButton.textContent = "계정 삭제";
  churuScoreResetButton.addEventListener("click", () => resetAccountScore(account.id, displayName, CatnyamEngine.GAME_MODES.CHURU));
  bombScoreResetButton.addEventListener("click", () => resetAccountScore(account.id, displayName, CatnyamEngine.GAME_MODES.BOMB));

  if (isAdmin(account)) {
    const badge = document.createElement("span");
    badge.className = "admin-badge";
    badge.textContent = "관리자";
    main.append(name, badge, toggleIcon);
    resetButton.disabled = true;
    deleteButton.disabled = true;
  } else {
    main.append(name, toggleIcon);
    resetButton.addEventListener("click", () => resetAccountPassword(account.id, account.username));
    deleteButton.addEventListener("click", () => deleteAccount(account.id, account.username));
  }

  renameForm.addEventListener("submit", (event) => {
    event.preventDefault();
    renameAccount(account.id, account.username, renameInput.value);
  });

  renameForm.append(renameInput, renameButton);
  actions.append(churuScoreResetButton, bombScoreResetButton, resetButton, deleteButton);
  details.append(meta, renameForm, actions);
  item.append(main, details);
  setExpanded(expandedAdminAccountIds.has(account.id));
  adminList.append(item);
}

async function renameAccount(userId, currentUsername, nextUsername) {
  const username = normalizeName(nextUsername);

  if (username.length < 2) {
    setAdminMessage("아이디는 2글자 이상 입력해주세요.");
    return;
  }

  try {
    const data = await requestApi("/api/admin/rename-user", {
      method: "POST",
      body: { userId, username },
    });

    if (currentUser?.id === data.user.id) {
      currentUser = data.user;
      newUsernameInput.value = currentUser.username;
      const remembered = getRememberedLogin();

      if (remembered) {
        saveRememberedLogin(currentUser.username, remembered.password);
      }

      updateProfileName();
    }

    renderRanking();
    await renderAdminList();
    setAdminMessage(`${currentUsername} 아이디를 ${data.user.username}(으)로 변경했습니다.`, true);
  } catch (error) {
    setAdminMessage(error.message);
  }
}

async function resetAccountPassword(userId, username) {
  try {
    const data = await requestApi("/api/admin/reset-password", {
      method: "POST",
      body: { userId },
    });
    setAdminMessage(`${username} 비밀번호를 ${data.resetPassword}로 초기화했습니다.`, true);
    renderAdminList();
  } catch (error) {
    setAdminMessage(error.message);
  }
}

async function resetAccountScore(userId, username, gameMode) {
  const modeLabel = getGameModeLabel(gameMode);

  if (!window.confirm(`${username} ${modeLabel} 점수와 플레이 기록을 초기화할까요?`)) {
    return;
  }

  try {
    const data = await requestApi("/api/admin/users", {
      method: "POST",
      body: {
        action: "reset-score",
        userId,
        gameMode,
      },
    });
    syncCurrentUser(data.user);
    renderRanking();
    await renderAdminList();
    setAdminMessage(`${username} ${modeLabel} 점수를 초기화했습니다.`, true);
  } catch (error) {
    setAdminMessage(error.message);
  }
}

async function deleteAccount(userId, username) {
  if (!window.confirm(`${username} 계정을 삭제할까요?`)) {
    return;
  }

  try {
    await requestApi("/api/admin/delete-user", {
      method: "POST",
      body: { userId },
    });
    setAdminMessage(`${username} 계정을 삭제했습니다.`, true);
    renderRanking();
    renderAdminList();
  } catch (error) {
    setAdminMessage(error.message);
  }
}

async function resetMyScore(gameMode) {
  const modeLabel = getGameModeLabel(gameMode);
  const button = gameMode === CatnyamEngine.GAME_MODES.BOMB ? resetMyBombScoreButton : resetMyScoreButton;

  if (!currentUser || !window.confirm(`내 ${modeLabel} 점수와 플레이 기록을 초기화할까요?`)) {
    return;
  }

  button.disabled = true;

  try {
    const data = await requestApi("/api/scores", {
      method: "DELETE",
      body: { gameMode },
    });
    syncCurrentUser(data.user);
    renderRanking();

    if (!adminTabPanel.hidden) {
      await renderAdminList();
    }

    setAccountActionMessage(`내 ${modeLabel} 점수를 초기화했습니다.`, true);
  } catch (error) {
    setAccountActionMessage(error.message);
  } finally {
    button.disabled = false;
  }
}

async function deleteMyAccount() {
  if (!currentUser) {
    return;
  }

  if (isAdmin(currentUser)) {
    setAccountActionMessage("관리자 계정은 탈퇴할 수 없습니다.");
    return;
  }

  if (!window.confirm("계정과 점수 기록을 모두 삭제할까요?")) {
    return;
  }

  if (!window.confirm("삭제한 계정은 복구할 수 없습니다. 정말 탈퇴할까요?")) {
    return;
  }

  deleteMyAccountButton.disabled = true;
  resetMyScoreButton.disabled = true;
  resetMyBombScoreButton.disabled = true;

  try {
    const deletedName = getUserDisplayName(currentUser);
    await requestApi("/api/logout", {
      method: "DELETE",
    });
    clearRememberedLogin();
    showAuth();
    setMessage(`${deletedName} 계정 탈퇴가 완료되었습니다.`, true);
    renderRanking();
  } catch (error) {
    setAccountActionMessage(error.message);
    deleteMyAccountButton.disabled = false;
    resetMyScoreButton.disabled = false;
    resetMyBombScoreButton.disabled = false;
  }
}

async function resetRankings(gameMode) {
  const modeLabel = getGameModeLabel(gameMode);
  const button = gameMode === CatnyamEngine.GAME_MODES.BOMB ? resetBombRankingButton : resetRankingButton;

  if (!window.confirm(`전체 ${modeLabel} 랭킹과 플레이 기록을 초기화할까요?`)) {
    return;
  }

  button.disabled = true;

  try {
    const data = await requestApi("/api/admin/reset-rankings", {
      method: "POST",
      body: { gameMode },
    });
    syncCurrentUser(data.user);
    renderRanking();
    await renderAdminList();
    setAdminMessage(`${modeLabel} 랭킹을 초기화했습니다.`, true);
  } catch (error) {
    setAdminMessage(error.message);
  } finally {
    button.disabled = false;
  }
}

async function startGame() {
  if (!currentUser) {
    return;
  }

  startButton.disabled = true;
  pauseRestartButton.disabled = true;

  let gameSession;

  try {
    const data = await requestApi("/api/scores", {
      method: "POST",
      body: {
        action: "start-game",
        gameMode: currentGameMode,
      },
    });
    gameSession = data.gameSession;

    if (!gameSession?.id || !gameSession?.token || !gameSession?.seed) {
      throw new Error("게임 시작 토큰을 받을 수 없습니다.");
    }
  } catch (error) {
    const overlayMessage = error.message.includes("schema.sql") ? "schema.sql 실행 필요" : "서버 설정 확인 필요";
    showGameOverlay("게임 시작", overlayMessage);
    setMessage(error.message);
    startButton.disabled = false;
    pauseRestartButton.disabled = false;
    return;
  }

  cancelIdleAnimation();
  stopGame();
  lastFinishedScore = null;
  lastFinishedShareUrls = null;
  lastFinishedSessionId = null;
  resetShareStatus();
  currentGameMode = CatnyamEngine.normalizeGameMode(gameSession.gameMode || currentGameMode);
  updateGameModeUI();
  game = createGameState(gameSession.seed, currentGameMode, gameSession.loadout || currentUser.loadout);
  game.gameSession = gameSession;
  game.running = true;
  game.paused = false;
  hideGameOverlay();
  scoreText.textContent = "0";
  runCoinText.textContent = "0";
  updateTimeDisplay();
  clearMovementInput();
  updateModeBadges();
  lastFrame = performance.now();
  animationId = requestAnimationFrame(loop);
  shopButton.disabled = true;
  startButton.disabled = false;
  pauseRestartButton.disabled = false;
}

function cancelAnimation() {
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
}

function cancelIdleAnimation() {
  if (idleAnimationId) {
    cancelAnimationFrame(idleAnimationId);
    idleAnimationId = null;
  }
}

function idleAnimationLoop(now) {
  if (!currentUser || game.running || game.paused || gamePanel.hidden) {
    idleAnimationId = null;
    return;
  }

  idleVisualTime = now / 1000;
  if (lastFinishedScore === null) {
    drawIntro();
  } else {
    drawFinish();
  }
  idleAnimationId = requestAnimationFrame(idleAnimationLoop);
}

function startIdleAnimation() {
  if (idleAnimationId || !currentUser || game.running || game.paused || gamePanel.hidden) {
    return;
  }

  idleAnimationId = requestAnimationFrame(idleAnimationLoop);
}

function stopGame() {
  cancelAnimation();
  game.running = false;
  game.paused = false;
  pauseButton.hidden = true;
  shopButton.disabled = false;
  canvasWrap.classList.remove("mode-highlight", "danger-highlight", "catnip-highlight", "reverse-highlight");
  clearMovementInput();
}

function finishGame() {
  const finalScore = game.score;
  lastFinishedScore = finalScore;
  lastFinishedShareUrls = null;
  lastFinishedSessionId = game.gameSession?.id || null;
  stopGame();
  clearModes();
  drawFinish();
  showGameOverlay("다시하기", `${finalScore}점!`, "result");
  startIdleAnimation();
  submitScore(finalScore);
}

async function submitScore(score) {
  if (!currentUser) {
    return;
  }

  if (!game.gameSession?.id || !game.gameSession?.token) {
    updateProfileName();
    showGameOverlay("다시하기", `${score}점 · 저장 실패`, "result");
    return;
  }

  const finishedGame = game;
  const submittedGameMode = finishedGame.gameMode;
  const submittedSessionId = finishedGame.gameSession.id;
  shareResultButton.disabled = true;

  try {
    const data = await requestApi("/api/scores", {
      method: "POST",
      body: {
        action: "finish-game",
        score,
        gameMode: submittedGameMode,
        sessionId: finishedGame.gameSession.id,
        sessionToken: finishedGame.gameSession.token,
        steps: finishedGame.step,
        inputLog: finishedGame.inputLog,
        coinsEarned: finishedGame.coins,
      },
    });
    currentUser = data.user;
    updateProfileName();
    if (lastFinishedSessionId === submittedSessionId) {
      lastFinishedShareUrls = data.shareUrls || null;
    }
    bestText.textContent = currentUser.bestScore || 0;
    renderRanking();
  } catch (error) {
    console.warn("Score save failed:", error);
    updateProfileName();
    showGameOverlay("다시하기", `${score}점 · 저장 실패: ${error.message}`, "result");
  } finally {
    if (lastFinishedSessionId === submittedSessionId) {
      shareResultButton.disabled = false;
    }
  }
}

function pauseGame() {
  if (!game.running) {
    return;
  }

  cancelAnimation();
  game.running = false;
  game.paused = true;
  clearMovementInput();
  draw();
  showPauseOverlay();
}

function resumeGame() {
  if (!game.paused) {
    return;
  }

  game.running = true;
  game.paused = false;
  hideGameOverlay();
  lastFrame = performance.now();
  animationId = requestAnimationFrame(loop);
}

function returnToGameHome() {
  stopGame();
  lastFinishedScore = null;
  lastFinishedShareUrls = null;
  lastFinishedSessionId = null;
  resetShareStatus();
  game = createGameState();
  updateProfileName();
  scoreText.textContent = "0";
  runCoinText.textContent = "0";
  updateTimeDisplay();
  updateModeBadges();
  showGameOverlay("게임 시작");
  drawIntro();
  startIdleAnimation();
}

function showPauseOverlay() {
  showGameOverlay("", "일시정지", "pause");
}

function showGameOverlay(buttonText, resultText = "", mode = "default") {
  const isPaused = mode === "pause";
  const canShareResult = mode === "result" && lastFinishedScore !== null;
  startButton.textContent = buttonText;
  startButton.hidden = isPaused;
  gameModeSelector.hidden = isPaused;
  shareResultButton.hidden = !canShareResult;
  if (!canShareResult) {
    resetShareStatus();
  }
  pauseActions.hidden = !isPaused;
  itemGuide.hidden = isPaused;
  overlayResult.textContent = resultText;
  overlayResult.hidden = !resultText;
  pauseButton.hidden = true;
  gameOverlay.hidden = false;
}

function hideGameOverlay() {
  gameOverlay.hidden = true;
  pauseActions.hidden = true;
  startButton.hidden = false;
  gameModeSelector.hidden = true;
  shareResultButton.hidden = true;
  shareStatus.hidden = true;
  itemGuide.hidden = false;
  pauseButton.hidden = !game.running;
}

function getSharePageUrl() {
  if (!lastFinishedShareUrls) {
    return SHARE_PAGE_URL;
  }

  return lastFinishedShareUrls[rankingMode]
    || lastFinishedShareUrls.allTime
    || lastFinishedShareUrls.daily
    || SHARE_PAGE_URL;
}

function resetShareStatus() {
  shareStatus.textContent = "";
  shareStatus.hidden = true;
}

async function copyResultShareLink() {
  if (!navigator.clipboard?.writeText) {
    throw new Error("이 브라우저에서는 공유와 복사를 지원하지 않습니다.");
  }

  await navigator.clipboard.writeText(getSharePageUrl());
}

async function shareResult() {
  shareResultButton.disabled = true;
  shareStatus.hidden = false;
  shareStatus.textContent = "링크를 복사하는 중입니다.";

  try {
    await copyResultShareLink();
    shareStatus.textContent = "공유 링크가 복사되었습니다.";
  } catch (error) {
    shareStatus.textContent = error.message || "복사를 완료하지 못했어요.";
  } finally {
    shareResultButton.disabled = false;
  }
}

function loop(now) {
  const delta = Math.min((now - lastFrame) / 1000, 0.04);
  lastFrame = now;
  update(delta);
  draw();

  if (game.running) {
    animationId = requestAnimationFrame(loop);
  }
}

function update(delta) {
  game.stepAccumulator += delta;

  game.scorePopups.forEach((popup) => {
    popup.age += delta;
    popup.y -= 46 * delta;
  });
  game.scorePopups = game.scorePopups.filter((popup) => popup.age < popup.duration);

  while (game.stepAccumulator >= CatnyamEngine.STEP_SECONDS && isGameInProgress()) {
    const direction = getMovementDirection();
    recordInputDirection(direction);
    handleEngineEvents(CatnyamEngine.stepGame(game, direction));
    game.stepAccumulator -= CatnyamEngine.STEP_SECONDS;
  }

  updateTimeDisplay();
  updateModeBadges();

  if (isGameFinished()) {
    finishGame();
  }
}

function isGameInProgress() {
  return game.gameMode === CatnyamEngine.GAME_MODES.BOMB ? !game.gameOver : game.timeLeft > 0;
}

function isGameFinished() {
  return game.gameMode === CatnyamEngine.GAME_MODES.BOMB ? game.gameOver : game.timeLeft <= 0;
}

function getMovementDirection() {
  const keyboardDirection = (keys.has("ArrowRight") || keys.has("d") ? 1 : 0) - (keys.has("ArrowLeft") || keys.has("a") ? 1 : 0);
  return touchDirection || keyboardDirection;
}

function recordInputDirection(direction) {
  if (direction === game.lastInputDirection) {
    return;
  }

  game.inputLog.push({
    step: game.step,
    direction,
  });
  game.lastInputDirection = direction;
}

function handleEngineEvents(events) {
  events.forEach((event) => {
    if (event.type === "score") {
      scoreText.textContent = event.score;
      if (event.source !== "survival") {
        setCollectedItemReaction(event.scoreDelta < 0 ? "bad" : "good");
        addScorePopup(event.scoreDelta);
      }
      return;
    }

    if (event.type === "bounce") {
      if (!isHideModeActive()) {
        setCatReaction("good");
      }
      setCatBubble("통통!", 0.9);
      return;
    }

    if (event.type === "mode") {
      handleModeEvent(event.kind);
      return;
    }

    if (event.type === "heart") {
      setCollectedItemReaction("good");
      setCatBubble("하트 +1", 1.1);
      updateModeBadges();
      return;
    }

    if (event.type === "coin") {
      runCoinText.textContent = event.coins;
      const displayedCoins = Math.max(0, Number(currentUser?.coins) || 0) + event.coins;
      coinText.textContent = displayedCoins;
      shopCoinText.textContent = displayedCoins;
      setCollectedItemReaction("good");
      setCatBubble(`코인 +${event.coinDelta}`, 1.1);
      return;
    }

    if (event.type === "time") {
      setCollectedItemReaction("good");
      setCatBubble(`${event.seconds || CatnyamEngine.CHURU_TIMER_SECONDS}초 추가!!!`, 1.3);
      triggerCanvasHighlight("mode");
      updateTimeDisplay();
      return;
    }

    if (event.type === "life") {
      setCatReaction("bad");
      setCatBubble(event.hearts <= 0 ? "털썩..." : "아야!", 1.1);
      updateModeBadges();
      return;
    }

    if (event.type === "rain") {
      setCatBubble("폭탄비!", 5);
      game.bombRainUntil = game.elapsed + 5;
      triggerCanvasHighlight("danger", 5);
      updateModeBadges();
    }
  });
}

function handleModeEvent(kind) {
  if (kind === "toy") {
    setCollectedItemReaction("good");
    setCatBubble("우다다모드!", 1.5);
    triggerCanvasHighlight("mode");
  } else if (kind === "box") {
    setCatBubble("건들지마라냥!", 3);
    setCatReaction("box-open", 0.55);
    triggerCanvasHighlight("mode", 3);
  } else if (kind === "hand") {
    setCollectedItemReaction("good");
    setMultiplierBubble();
    triggerCanvasHighlight("mode");
  } else if (kind === "catnip") {
    setCollectedItemReaction("good");
    if (game.gameMode !== CatnyamEngine.GAME_MODES.BOMB) {
      setMultiplierBubble();
    }
    setCatBubble("캣닢파워!", 1.6);
    triggerCanvasHighlight("catnip");
  } else if (kind === "tuna") {
    setCollectedItemReaction("good");
    setCatBubble("애교모드!", 1.6);
    triggerCanvasHighlight("mode");
  } else if (kind === "clipper") {
    setCatReaction("bad");
    setCatBubble("위이이잉!!!", 1.6);
    triggerCanvasHighlight("danger");
  } else if (kind === "skull") {
    setCatReaction("bad", 5);
    setCatBubble("반대로 간다냥!", 5);
    triggerCanvasHighlight("reverse", 5);
  }

  updateModeBadges();
}

function getScoreMultiplier() {
  return CatnyamEngine.getScoreMultiplier(game);
}

function setCatReaction(type, duration = 0.45) {
  game.reaction = {
    type,
    startedAt: game.elapsed,
    until: game.elapsed + duration,
  };
}

function setCollectedItemReaction(type) {
  const openHideout = isHideModeActive() && !isCatnipModeActive();
  setCatReaction(openHideout ? "box-open" : type, openHideout ? 0.55 : 0.45);
}

function setCatBubble(text, duration) {
  game.bubble = {
    text,
    until: game.elapsed + duration,
  };
}

function setMultiplierBubble() {
  const multiplier = getScoreMultiplier();

  if (multiplier <= 1) {
    return;
  }

  game.emphasisBubble = {
    text: multiplier >= 4 ? "4배!!!" : "2배!",
    until: game.elapsed + 1.15,
  };
}

function triggerCanvasHighlight(type, duration = 0) {
  if (duration > 0) {
    game.canvasHighlight = {
      type,
      until: game.elapsed + duration,
    };
  }

  canvasWrap.classList.remove("mode-highlight", "danger-highlight", "catnip-highlight", "reverse-highlight");
  void canvasWrap.offsetWidth;
  const className = type === "catnip"
    ? "catnip-highlight"
    : type === "danger"
      ? "danger-highlight"
      : type === "reverse"
        ? "reverse-highlight"
        : "mode-highlight";
  canvasWrap.classList.add(className);
}

function addScorePopup(scoreDelta) {
  game.scorePopups.push({
    text: scoreDelta > 0 ? `+${scoreDelta}` : String(scoreDelta),
    x: game.cat.x,
    y: game.cat.y - getCatHeight() * 0.62,
    age: 0,
    duration: 0.82,
    color: scoreDelta > 0 ? "#ef6f8f" : "#288466",
  });
}

function getCatBubbleText() {
  if (game.bubble?.text && game.bubble.until >= game.elapsed) {
    return game.bubble.text;
  }

  return isPurrModeActive() ? "골골골골~" : "";
}

function getCatEmphasisBubbleText() {
  return game.emphasisBubble?.until >= game.elapsed ? game.emphasisBubble.text : "";
}

function getCatReaction() {
  if (isHideModeActive() && !isCatnipModeActive() && game.reaction?.type === "box-open" && game.reaction.until >= game.elapsed) {
    return "box-open";
  }

  if (isCatnipModeActive()) {
    const activeReaction = game.reaction?.until >= game.elapsed ? game.reaction.type : "neutral";
    return activeReaction === "box-open" ? "good" : activeReaction;
  }

  if (isSkullModeActive()) {
    return "bad";
  }

  if (isHideModeActive()) {
    return "box";
  }

  return game.reaction?.until >= game.elapsed ? game.reaction.type : "neutral";
}

function isSpeedModeActive() {
  return CatnyamEngine.isSpeedModeActive(game);
}

function isHideModeActive() {
  return CatnyamEngine.isHideModeActive(game);
}

function isPurrModeActive() {
  return CatnyamEngine.isPurrModeActive(game);
}

function isCatnipModeActive() {
  return CatnyamEngine.isCatnipModeActive(game);
}

function isTunaModeActive() {
  return CatnyamEngine.isTunaModeActive(game);
}

function isClipperModeActive() {
  return CatnyamEngine.isClipperModeActive(game);
}

function isSkullModeActive() {
  return CatnyamEngine.isSkullModeActive(game);
}

function getCatScale() {
  return CatnyamEngine.getCatScale(game);
}

function getCatWidth() {
  return CatnyamEngine.getCatWidth(game);
}

function getCatHeight() {
  return CatnyamEngine.getCatHeight(game);
}

function getCatRotation() {
  return isCatnipModeActive() ? game.elapsed * 7.5 : 0;
}

function getModeSecondsLeft(until) {
  return Math.max(0, Math.ceil(until - game.elapsed));
}

function isBombRainActive() {
  return game.bombRainUntil > game.elapsed;
}

function updateModeBadges() {
  const isBombMode = game.gameMode === CatnyamEngine.GAME_MODES.BOMB;

  if (isBombMode) {
    speedModeBadge.hidden = true;
    updateModeBadge(hideModeBadge, isHideModeActive(), `숨숨집 ${getModeSecondsLeft(game.modes.hideUntil)}초`);
    purrModeBadge.hidden = true;
    tunaModeBadge.hidden = true;
    clipperModeBadge.hidden = true;
    updateModeBadge(skullModeBadge, isSkullModeActive(), `반대 ${getModeSecondsLeft(game.modes.skullUntil)}초`);
    updateModeBadge(catnipModeBadge, isCatnipModeActive(), `무적 ${getModeSecondsLeft(game.modes.catnipUntil)}초`);
    updateModeBadge(bombRainModeBadge, isBombRainActive(), `폭탄비 ${getModeSecondsLeft(game.bombRainUntil)}초`);
    heartModeBadge.hidden = true;
    updateCanvasHighlight();
    return;
  }

  updateModeBadge(speedModeBadge, isSpeedModeActive(), `우다다 ${getModeSecondsLeft(game.modes.speedUntil)}초`);
  updateModeBadge(hideModeBadge, isHideModeActive(), `숨숨집 ${getModeSecondsLeft(game.modes.hideUntil)}초`);
  updateModeBadge(purrModeBadge, isPurrModeActive(), `골골송 ${getModeSecondsLeft(game.modes.purrUntil)}초`);
  updateModeBadge(catnipModeBadge, isCatnipModeActive(), `캣닢 ${getModeSecondsLeft(game.modes.catnipUntil)}초`);
  updateModeBadge(tunaModeBadge, isTunaModeActive(), `애교 ${getModeSecondsLeft(game.modes.tunaUntil)}초`);
  updateModeBadge(clipperModeBadge, isClipperModeActive(), `위이잉 ${getModeSecondsLeft(game.modes.clipperUntil)}초`);
  updateModeBadge(skullModeBadge, isSkullModeActive(), `반대 ${getModeSecondsLeft(game.modes.skullUntil)}초`);
  bombRainModeBadge.hidden = true;
  heartModeBadge.hidden = true;
  updateCanvasHighlight();
}

function updateModeBadge(badge, isActive, text) {
  badge.hidden = !isActive;

  if (isActive) {
    badge.textContent = text;
  }
}

function clearModes() {
  game.modes.speedUntil = 0;
  game.modes.hideUntil = 0;
  game.modes.purrUntil = 0;
  game.modes.catnipUntil = 0;
  game.modes.tunaUntil = 0;
  game.modes.clipperUntil = 0;
  game.modes.skullUntil = 0;
  game.bubble = {
    text: "",
    until: 0,
  };
  game.emphasisBubble = {
    text: "",
    until: 0,
  };
  game.bombRainUntil = 0;
  game.canvasHighlight = null;
  updateModeBadges();
}

function updateCanvasHighlight() {
  const timedHighlight = game.canvasHighlight?.until >= game.elapsed ? game.canvasHighlight.type : "";
  const hideIsBuff = isHideModeActive();
  const forceReverse = timedHighlight === "reverse" || isSkullModeActive();
  const forceDanger = timedHighlight === "danger" && !hideIsBuff;
  const forceMode = timedHighlight === "mode";
  const catnipActive = timedHighlight === "catnip" || isCatnipModeActive();
  const reverseActive = !catnipActive && forceReverse;
  const dangerActive = !catnipActive && !reverseActive && (forceDanger || ((!hideIsBuff && isHideModeActive()) || isClipperModeActive()));
  const modeActive = !catnipActive && !reverseActive && !dangerActive && (forceMode || hideIsBuff || isSpeedModeActive() || isPurrModeActive() || isTunaModeActive());
  canvasWrap.classList.toggle("catnip-highlight", catnipActive);
  canvasWrap.classList.toggle("reverse-highlight", reverseActive);
  canvasWrap.classList.toggle("danger-highlight", dangerActive);
  canvasWrap.classList.toggle("mode-highlight", modeActive);
}

function draw() {
  drawWorld();
  game.drops.forEach(drawChuru);
  drawCompanions();
  const catReaction = getCatReaction();
  const boxReaction = catReaction === "box" || catReaction === "box-open";
  const drawWidth = boxReaction ? game.cat.width : getCatWidth();
  const drawHeight = boxReaction ? game.cat.height : getCatHeight();
  drawCat(game.cat.x, game.cat.y, drawWidth, drawHeight, catReaction, getCatRotation());
  game.scorePopups.forEach(drawScorePopup);
  drawBombModeHearts();
}

function drawBombModeHearts() {
  if (game.gameMode !== CatnyamEngine.GAME_MODES.BOMB) {
    return;
  }

  const hearts = Math.max(0, Number(game.hearts) || 0);
  if (hearts <= 0) {
    return;
  }

  const heartSize = 28;
  const heartGap = 39;
  const horizontalPadding = 20;
  const visibleHearts = Math.min(hearts, 8);
  const hudLeft = 18;
  const hudTop = 16;
  const hudHeight = 54;
  const heartGroupWidth = heartSize + (visibleHearts - 1) * heartGap;
  const hudWidth = horizontalPadding * 2 + heartGroupWidth + (hearts > visibleHearts ? 44 : 0);
  const heartY = hudTop + hudHeight / 2;
  const firstHeartX = hudLeft + horizontalPadding + heartSize / 2;

  ctx.save();
  ctx.fillStyle = "rgba(255, 255, 255, 0.76)";
  ctx.strokeStyle = "rgba(239, 111, 143, 0.22)";
  ctx.lineWidth = 2;
  roundRect(hudLeft, hudTop, hudWidth, hudHeight, 14);
  ctx.fill();
  ctx.stroke();

  for (let index = 0; index < visibleHearts; index += 1) {
    drawLifeHeart(firstHeartX + index * heartGap, heartY, heartSize);
  }

  if (hearts > visibleHearts) {
    ctx.fillStyle = "#8f274b";
    ctx.font = "900 18px Jua, Nunito, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(`+${hearts - visibleHearts}`, firstHeartX + visibleHearts * heartGap, heartY);
  }

  ctx.restore();
}

function drawLifeHeart(x, y, size) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 42, size / 42);
  ctx.rotate(-Math.PI / 4);
  ctx.fillStyle = "#ef6f8f";
  roundRect(-9, -9, 18, 18, 5);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, -9, 9, 0, Math.PI * 2);
  ctx.arc(9, 0, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "rgba(255, 255, 255, 0.58)";
  ctx.beginPath();
  ctx.ellipse(-5, -5, 3.5, 2.2, -0.7, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawWorld() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const backgroundId = game.loadout?.background || currentUser?.loadout?.background || "village";
  const background = SHOP_CATALOG.background[backgroundId] || SHOP_CATALOG.background.village;

  if (drawBackgroundArtwork(background)) {
    return;
  }

  const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
  sky.addColorStop(0, "#dff5ff");
  sky.addColorStop(1, backgroundId === "alley" ? "#eee8e0" : "#fff6dc");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
  drawCloud(130, 92, 1);
  drawCloud(740, 128, 0.8);
  drawCloud(450, 70, 0.62);

  if (backgroundId === "mountain") {
    ctx.fillStyle = "rgba(79, 122, 91, 0.38)";
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - 44);
    ctx.lineTo(180, 240);
    ctx.lineTo(350, canvas.height - 44);
    ctx.lineTo(570, 205);
    ctx.lineTo(820, canvas.height - 44);
    ctx.closePath();
    ctx.fill();
  } else if (backgroundId === "beach") {
    ctx.fillStyle = "rgba(70, 184, 220, 0.5)";
    ctx.fillRect(0, canvas.height - 128, canvas.width, 84);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.82)";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - 72);
    ctx.quadraticCurveTo(220, canvas.height - 91, 430, canvas.height - 69);
    ctx.quadraticCurveTo(650, canvas.height - 48, canvas.width, canvas.height - 76);
    ctx.stroke();
  } else if (backgroundId === "promenade") {
    ctx.strokeStyle = "rgba(82, 95, 103, 0.34)";
    ctx.lineWidth = 8;
    for (let x = 60; x < canvas.width; x += 160) {
      ctx.beginPath();
      ctx.moveTo(x, canvas.height - 44);
      ctx.lineTo(x, canvas.height - 150);
      ctx.stroke();
      ctx.fillStyle = "rgba(255, 216, 79, 0.8)";
      ctx.beginPath();
      ctx.arc(x, canvas.height - 158, 12, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (backgroundId === "alley") {
    ctx.fillStyle = "rgba(97, 91, 105, 0.18)";
    ctx.fillRect(0, 190, 170, canvas.height - 234);
    ctx.fillRect(canvas.width - 190, 140, 190, canvas.height - 184);
    ctx.fillStyle = "rgba(239, 111, 143, 0.38)";
    ctx.fillRect(28, 245, 74, 34);
  }

  ctx.fillStyle = "#8addbd";
  ctx.fillRect(0, canvas.height - 44, canvas.width, 44);
  ctx.fillStyle = "rgba(37, 33, 29, 0.08)";
  for (let x = 20; x < canvas.width; x += 48) {
    ctx.fillRect(x, canvas.height - 37, 18, 6);
  }
}

function isArtworkReady(image) {
  if (image && "complete" in image && !image.complete) {
    return false;
  }

  const width = image?.naturalWidth || image?.width || 0;
  const height = image?.naturalHeight || image?.height || 0;
  return width > 0 && height > 0;
}

function createMaskedArtwork(source, mask) {
  const canvasElement = document.createElement("canvas");
  canvasElement.width = source.naturalWidth;
  canvasElement.height = source.naturalHeight;
  const canvasContext = canvasElement.getContext("2d");
  canvasContext.drawImage(source, 0, 0);
  canvasContext.globalCompositeOperation = "destination-in";
  canvasContext.drawImage(mask, 0, 0, canvasElement.width, canvasElement.height);
  canvasContext.globalCompositeOperation = "source-over";
  return canvasElement;
}

function prepareExpressionArtwork() {
  Object.entries(CHARACTER_ATLASES).forEach(([atlasId, atlas]) => {
    if (!isArtworkReady(atlas.neutral)) {
      return;
    }

    if (!EXPRESSION_ARTWORK.good[atlasId] && isArtworkReady(atlas.happy)) {
      EXPRESSION_ARTWORK.good[atlasId] = atlasId === "extra"
        ? atlas.happy
        : createMaskedArtwork(atlas.happy, atlas.neutral);
    }

    if (!EXPRESSION_ARTWORK.bad[atlasId] && isArtworkReady(atlas.hurt)) {
      EXPRESSION_ARTWORK.bad[atlasId] = atlasId === "extra"
        ? atlas.hurt
        : createMaskedArtwork(atlas.hurt, atlas.neutral);
    }
  });
}

function drawAtlasCell(image, item, columns, rows, x, y, width, height) {
  if (!isArtworkReady(image) || !item) {
    return false;
  }

  const artworkWidth = image.naturalWidth || image.width;
  const artworkHeight = image.naturalHeight || image.height;
  const sourceWidth = artworkWidth / columns;
  const sourceHeight = artworkHeight / rows;
  ctx.drawImage(
    image,
    item.col * sourceWidth,
    item.row * sourceHeight,
    sourceWidth,
    sourceHeight,
    x,
    y,
    width,
    height,
  );
  return true;
}

function drawBackgroundArtwork(background) {
  const atlas = getBackgroundAtlas(background);

  if (!isArtworkReady(atlas.image)) {
    return false;
  }

  ctx.save();
  ctx.filter = "saturate(0.7) brightness(1.08)";
  drawAtlasCell(atlas.image, background, atlas.columns, atlas.rows, 0, 0, canvas.width, canvas.height);
  ctx.restore();
  const wash = ctx.createLinearGradient(0, 0, 0, canvas.height);
  wash.addColorStop(0, "rgba(255, 255, 255, 0.2)");
  wash.addColorStop(0.72, "rgba(255, 250, 242, 0.3)");
  wash.addColorStop(1, "rgba(255, 250, 242, 0.4)");
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "rgba(37, 33, 29, 0.18)";
  ctx.lineWidth = 5;
  ctx.setLineDash([20, 24]);
  ctx.beginPath();
  ctx.moveTo(0, canvas.height - 32);
  ctx.lineTo(canvas.width, canvas.height - 32);
  ctx.stroke();
  ctx.setLineDash([]);
  return true;
}

function drawCloud(x, y, scale) {
  ctx.beginPath();
  ctx.ellipse(x, y, 46 * scale, 25 * scale, 0, 0, Math.PI * 2);
  ctx.ellipse(x + 40 * scale, y + 4 * scale, 32 * scale, 21 * scale, 0, 0, Math.PI * 2);
  ctx.ellipse(x - 38 * scale, y + 6 * scale, 28 * scale, 18 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawScorePopup(popup) {
  const progress = popup.age / popup.duration;

  ctx.save();
  ctx.globalAlpha = Math.max(0, 1 - progress);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "900 34px Jua, Nunito, sans-serif";
  ctx.lineWidth = 7;
  ctx.strokeStyle = "rgba(255, 250, 242, 0.94)";
  ctx.fillStyle = popup.color;
  ctx.strokeText(popup.text, popup.x, popup.y);
  ctx.fillText(popup.text, popup.x, popup.y);
  ctx.restore();
}

function drawChuru(drop) {
  ctx.save();
  ctx.translate(drop.x, drop.y);
  ctx.rotate(drop.rotation);

  if (drop.kind === "bomb") {
    drawBomb(drop);
    ctx.restore();
    return;
  }

  if (drop.kind === "toy") {
    drawToy(drop);
    ctx.restore();
    return;
  }

  if (drop.kind === "box") {
    drawBoxItem(drop);
    ctx.restore();
    return;
  }

  if (drop.kind === "hand") {
    drawHandItem(drop);
    ctx.restore();
    return;
  }

  if (drop.kind === "catnip") {
    drawCatnipItem(drop);
    ctx.restore();
    return;
  }

  if (drop.kind === "tuna") {
    drawTunaCanItem(drop);
    ctx.restore();
    return;
  }

  if (drop.kind === "clipper") {
    drawClipperItem(drop);
    ctx.restore();
    return;
  }

  if (drop.kind === "heart") {
    drawHeartItem(drop);
    ctx.restore();
    return;
  }

  if (drop.kind === "timer") {
    drawTimerItem(drop);
    ctx.restore();
    return;
  }

  if (drop.kind === "skull") {
    drawSkullItem(drop);
    ctx.restore();
    return;
  }

  if (drop.kind === "coin") {
    drawCoinItem(drop);
    ctx.restore();
    return;
  }

  drawChuruPouch(drop);

  ctx.restore();
}

function drawCoinItem(drop) {
  const radius = Math.min(drop.width, drop.height) / 2;
  const gradient = ctx.createRadialGradient(-radius * 0.3, -radius * 0.38, 2, 0, 0, radius);
  gradient.addColorStop(0, "#fff2a3");
  gradient.addColorStop(0.55, "#ffd84f");
  gradient.addColorStop(1, "#d69b18");

  ctx.fillStyle = "rgba(255, 216, 79, 0.2)";
  ctx.beginPath();
  ctx.arc(0, 0, radius + 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = gradient;
  ctx.strokeStyle = "#a86f08";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = "rgba(168, 111, 8, 0.72)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.67, 0, Math.PI * 2);
  ctx.stroke();

  drawPawMark(0, 1, radius * 1.08, "#a86f08");
}

function drawPawMark(x, y, scale, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(0, scale * 0.12, scale * 0.3, scale * 0.23, 0, 0, Math.PI * 2);
  ctx.fill();

  [-0.28, 0, 0.28].forEach((offset, index) => {
    ctx.beginPath();
    ctx.arc(offset * scale, -scale * (0.18 + Math.abs(index - 1) * 0.03), scale * 0.105, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

function drawChuruPouch(drop) {
  const width = drop.width;
  const height = drop.height;
  const isGold = drop.kind === "gold";
  const darkColor = isGold ? "#d49f16" : "#d96f55";
  const bodyColor = isGold ? "#ffd84f" : "#ff9f6e";
  const lightColor = isGold ? "#fff1a3" : "#ffc5a2";
  const outlineColor = isGold ? "rgba(116, 82, 16, 0.58)" : "rgba(123, 66, 49, 0.55)";

  const pouchGradient = ctx.createLinearGradient(-width * 0.5, 0, width * 0.5, 0);
  pouchGradient.addColorStop(0, darkColor);
  pouchGradient.addColorStop(0.28, bodyColor);
  pouchGradient.addColorStop(0.72, lightColor);
  pouchGradient.addColorStop(1, darkColor);
  ctx.fillStyle = pouchGradient;
  ctx.strokeStyle = outlineColor;
  ctx.lineWidth = 2;
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(-width * 0.45, -height * 0.4);
  ctx.quadraticCurveTo(-width * 0.51, -height * 0.06, -width * 0.4, height * 0.4);
  ctx.quadraticCurveTo(0, height * 0.49, width * 0.4, height * 0.4);
  ctx.quadraticCurveTo(width * 0.51, -height * 0.06, width * 0.45, -height * 0.4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = darkColor;
  roundRect(-width * 0.5, -height * 0.5, width, height * 0.13, 3);
  ctx.fill();
  roundRect(-width * 0.42, height * 0.37, width * 0.84, height * 0.1, 3);
  ctx.fill();

  ctx.strokeStyle = "rgba(255, 255, 255, 0.55)";
  ctx.lineWidth = 1;
  [-0.24, 0, 0.24].forEach((offset) => {
    ctx.beginPath();
    ctx.moveTo(width * offset, -height * 0.48);
    ctx.lineTo(width * offset, -height * 0.39);
    ctx.stroke();
  });

  ctx.fillStyle = "rgba(255, 250, 242, 0.9)";
  ctx.beginPath();
  ctx.ellipse(0, height * 0.03, width * 0.3, height * 0.15, -0.05, 0, Math.PI * 2);
  ctx.fill();
  drawPawMark(0, height * 0.01, Math.min(width, height) * 0.44, isGold ? "#d49f16" : "#ef6f8f");

  ctx.strokeStyle = "rgba(255, 255, 255, 0.72)";
  ctx.lineWidth = Math.max(2, width * 0.1);
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-width * 0.28, -height * 0.28);
  ctx.lineTo(-width * 0.24, height * 0.22);
  ctx.stroke();

  if (isGold) {
    ctx.strokeStyle = "rgba(255, 255, 255, 0.92)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(width * 0.25, -height * 0.25);
    ctx.lineTo(width * 0.25, -height * 0.12);
    ctx.moveTo(width * 0.18, -height * 0.185);
    ctx.lineTo(width * 0.32, -height * 0.185);
    ctx.stroke();
  }
}

function drawHeartItem(drop) {
  const size = Math.min(drop.width, drop.height);

  ctx.save();
  ctx.scale(size / 42, size / 42);
  ctx.fillStyle = "rgba(239, 111, 143, 0.18)";
  ctx.beginPath();
  ctx.arc(0, 0, 26, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ef6f8f";
  ctx.beginPath();
  ctx.moveTo(0, 17);
  ctx.bezierCurveTo(-4, 12, -18, 3, -18, -7);
  ctx.bezierCurveTo(-18, -16, -7, -20, 0, -11);
  ctx.bezierCurveTo(7, -20, 18, -16, 18, -7);
  ctx.bezierCurveTo(18, 3, 4, 12, 0, 17);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "rgba(255, 255, 255, 0.54)";
  ctx.beginPath();
  ctx.ellipse(-7, -9, 5, 2.8, -0.55, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawTimerItem(drop) {
  const size = Math.min(drop.width, drop.height);
  const radius = size / 2;

  ctx.save();
  ctx.fillStyle = "rgba(119, 216, 186, 0.2)";
  ctx.beginPath();
  ctx.arc(0, 0, radius + 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#fffaf2";
  ctx.strokeStyle = "#288466";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.78, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#77d8ba";
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.12, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#288466";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -radius * 0.42);
  ctx.moveTo(0, 0);
  ctx.lineTo(radius * 0.34, radius * 0.2);
  ctx.stroke();

  ctx.strokeStyle = "rgba(40, 132, 102, 0.5)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.56, -Math.PI * 0.36, Math.PI * 0.18);
  ctx.stroke();

  ctx.fillStyle = "#ffd84f";
  ctx.beginPath();
  ctx.arc(-radius * 0.42, -radius * 0.7, radius * 0.18, 0, Math.PI * 2);
  ctx.arc(radius * 0.42, -radius * 0.7, radius * 0.18, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawSkullItem(drop) {
  const size = Math.min(drop.width, drop.height);
  const radius = size / 2;

  ctx.save();
  ctx.fillStyle = "rgba(126, 87, 194, 0.18)";
  ctx.beginPath();
  ctx.arc(0, 1, radius + 6, 0, Math.PI * 2);
  ctx.fill();

  const skullGradient = ctx.createRadialGradient(-radius * 0.3, -radius * 0.38, 3, 0, 0, radius);
  skullGradient.addColorStop(0, "#c9b7ff");
  skullGradient.addColorStop(0.72, "#8f66dc");
  skullGradient.addColorStop(1, "#6b46ba");

  ctx.fillStyle = skullGradient;
  ctx.strokeStyle = "rgba(62, 39, 112, 0.62)";
  ctx.lineWidth = 2;
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.arc(0, -radius * 0.14, radius * 0.72, Math.PI * 0.02, Math.PI * 1.98);
  ctx.lineTo(radius * 0.46, radius * 0.52);
  ctx.lineTo(radius * 0.2, radius * 0.66);
  ctx.lineTo(0, radius * 0.54);
  ctx.lineTo(-radius * 0.2, radius * 0.66);
  ctx.lineTo(-radius * 0.46, radius * 0.52);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#2f244b";
  ctx.beginPath();
  ctx.ellipse(-radius * 0.28, -radius * 0.16, radius * 0.16, radius * 0.2, -0.2, 0, Math.PI * 2);
  ctx.ellipse(radius * 0.28, -radius * 0.16, radius * 0.16, radius * 0.2, 0.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(0, radius * 0.02);
  ctx.lineTo(radius * 0.11, radius * 0.24);
  ctx.lineTo(-radius * 0.11, radius * 0.24);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "rgba(47, 36, 75, 0.85)";
  ctx.lineWidth = 1.5;
  ctx.lineCap = "round";
  [-0.18, 0, 0.18].forEach((offset) => {
    ctx.beginPath();
    ctx.moveTo(radius * offset, radius * 0.43);
    ctx.lineTo(radius * offset, radius * 0.58);
    ctx.stroke();
  });

  ctx.fillStyle = "rgba(255, 250, 242, 0.5)";
  ctx.beginPath();
  ctx.ellipse(-radius * 0.28, -radius * 0.47, radius * 0.2, radius * 0.08, -0.42, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawBomb(drop) {
  const radius = drop.width / 2;

  ctx.fillStyle = "#38302d";
  ctx.beginPath();
  ctx.arc(0, 5, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(255, 255, 255, 0.28)";
  ctx.beginPath();
  ctx.arc(-radius * 0.35, -radius * 0.2, radius * 0.24, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#38302d";
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(0, -radius + 4);
  ctx.quadraticCurveTo(9, -radius - 15, 23, -radius - 11);
  ctx.stroke();

  ctx.fillStyle = "#ffd84f";
  ctx.beginPath();
  ctx.moveTo(24, -radius - 16);
  ctx.lineTo(31, -radius - 8);
  ctx.lineTo(21, -radius - 5);
  ctx.closePath();
  ctx.fill();
}

function drawCatnipItem(drop) {
  const radius = drop.width / 2;
  const gradient = ctx.createRadialGradient(-radius * 0.28, -radius * 0.35, 3, 0, 0, radius);
  gradient.addColorStop(0, "#98bd63");
  gradient.addColorStop(0.7, "#4d7b35");
  gradient.addColorStop(1, "#2f4f2a");

  ctx.fillStyle = "rgba(77, 123, 53, 0.2)";
  ctx.beginPath();
  ctx.arc(0, 0, radius + 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(245, 255, 207, 0.72)";
  [
    [-7, -9, 2.2],
    [5, -8, 1.7],
    [9, 1, 1.8],
    [-4, 7, 1.9],
    [-10, 3, 1.4],
    [1, 10, 1.5],
  ].forEach(([x, y, size]) => {
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.strokeStyle = "rgba(255, 250, 242, 0.38)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(-3, -3, radius * 0.64, Math.PI * 0.78, Math.PI * 1.56);
  ctx.stroke();
}

function drawTunaCanItem(drop) {
  const width = drop.width;
  const height = drop.height;
  const bodyGradient = ctx.createLinearGradient(-width / 2, 0, width / 2, 0);
  bodyGradient.addColorStop(0, "#80d5d3");
  bodyGradient.addColorStop(0.5, "#f5fbff");
  bodyGradient.addColorStop(1, "#57b9bd");

  ctx.fillStyle = "rgba(87, 185, 189, 0.2)";
  ctx.beginPath();
  ctx.ellipse(0, height * 0.12, width * 0.6, height * 0.44, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = bodyGradient;
  roundRect(-width / 2, -height * 0.26, width, height * 0.58, 8);
  ctx.fill();

  ctx.fillStyle = "#d7edf1";
  ctx.beginPath();
  ctx.ellipse(0, -height * 0.26, width * 0.5, height * 0.16, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#4a9ba1";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(0, -height * 0.26, width * 0.5, height * 0.16, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "#ef6f8f";
  ctx.beginPath();
  ctx.moveTo(-9, 1);
  ctx.quadraticCurveTo(-1, -7, 10, -2);
  ctx.quadraticCurveTo(2, 7, -9, 1);
  ctx.fill();

  ctx.fillStyle = "#fffaf2";
  ctx.beginPath();
  ctx.arc(8, -2, 2, 0, Math.PI * 2);
  ctx.fill();
}

function drawClipperItem(drop) {
  const width = drop.width;
  const height = drop.height;

  ctx.fillStyle = "rgba(70, 84, 100, 0.18)";
  ctx.beginPath();
  ctx.ellipse(0, 3, width * 0.58, height * 0.48, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#9aa7b6";
  roundRect(-width * 0.42, -height * 0.28, width * 0.72, height * 0.56, 8);
  ctx.fill();

  ctx.fillStyle = "#5d6876";
  roundRect(-width * 0.3, -height * 0.18, width * 0.42, height * 0.36, 5);
  ctx.fill();

  ctx.fillStyle = "#dce5ee";
  roundRect(width * 0.16, -height * 0.22, width * 0.3, height * 0.44, 4);
  ctx.fill();

  ctx.strokeStyle = "#5d6876";
  ctx.lineWidth = 2;
  [-0.12, 0, 0.12].forEach((offset) => {
    ctx.beginPath();
    ctx.moveTo(width * 0.24, height * offset);
    ctx.lineTo(width * 0.43, height * offset);
    ctx.stroke();
  });

  ctx.fillStyle = "#ffd84f";
  ctx.beginPath();
  ctx.arc(-width * 0.28, 0, 3, 0, Math.PI * 2);
  ctx.fill();
}

function drawToy(drop) {
  const bodyWidth = drop.width * 0.82;
  const bodyHeight = drop.height * 0.52;

  ctx.fillStyle = "rgba(142, 215, 245, 0.26)";
  ctx.beginPath();
  ctx.arc(0, 1, drop.width * 0.62, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#746b62";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(bodyWidth * 0.42, 4);
  ctx.quadraticCurveTo(bodyWidth * 0.72, 8, bodyWidth * 0.86, -8);
  ctx.stroke();

  ctx.fillStyle = "#8ed7f5";
  ctx.beginPath();
  ctx.ellipse(-2, 4, bodyWidth * 0.42, bodyHeight * 0.42, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(-12, -10, 6, 0, Math.PI * 2);
  ctx.arc(-3, -12, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffbed0";
  ctx.beginPath();
  ctx.arc(-12, -10, 3, 0, Math.PI * 2);
  ctx.arc(-3, -12, 2.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#332923";
  ctx.beginPath();
  ctx.arc(-11, 0, 2.2, 0, Math.PI * 2);
  ctx.arc(-bodyWidth * 0.42, 3, 2.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#fffaf2";
  ctx.beginPath();
  ctx.ellipse(3, 12, 8, 3, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawBoxItem(drop) {
  const width = drop.width;
  const height = drop.height;
  const bodyTop = -height * 0.24;
  const bodyHeight = height * 0.7;

  ctx.fillStyle = "#c58b51";
  ctx.strokeStyle = "rgba(92, 56, 30, 0.48)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.rect(-width * 0.46, bodyTop, width * 0.92, bodyHeight);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#e0aa68";
  ctx.beginPath();
  ctx.moveTo(-width * 0.46, bodyTop);
  ctx.lineTo(0, -height * 0.48);
  ctx.lineTo(width * 0.46, bodyTop);
  ctx.lineTo(0, -height * 0.06);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#f4cc91";
  ctx.beginPath();
  ctx.moveTo(-width * 0.07, -height * 0.43);
  ctx.lineTo(width * 0.08, -height * 0.4);
  ctx.lineTo(width * 0.08, bodyTop + bodyHeight - 2);
  ctx.lineTo(-width * 0.07, bodyTop + bodyHeight - 1);
  ctx.closePath();
  ctx.fill();

  drawPawMark(-width * 0.2, height * 0.16, Math.min(width, height) * 0.32, "rgba(92, 56, 30, 0.58)");
}

function drawHandItem(drop) {
  const size = Math.min(drop.width, drop.height);
  const scale = size / 26;
  const handPath = new Path2D(
    "M8 22c-2.5-1.3-4-3.7-4-6.6V12c0-1 .7-1.7 1.6-1.7S7.2 11 7.2 12v1V5.4c0-.9.7-1.6 1.6-1.6s1.6.7 1.6 1.6V10 3.2c0-.9.7-1.6 1.6-1.6s1.6.7 1.6 1.6V10 4.3c0-.9.7-1.6 1.6-1.6s1.6.7 1.6 1.6v6.2-4.4c0-.9.7-1.6 1.6-1.6s1.6.7 1.6 1.6v8.2c0 4.4-3.6 7.9-8 7.9H10c-.7 0-1.4-.1-2-.2Z",
  );

  ctx.save();
  ctx.scale(scale, scale);
  ctx.translate(-12, -12);
  ctx.fillStyle = "#ffc8a2";
  ctx.strokeStyle = "#c2694b";
  ctx.lineWidth = 1.25;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.fill(handPath);
  ctx.stroke(handPath);

  ctx.strokeStyle = "rgba(255, 241, 225, 0.78)";
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.moveTo(7.5, 15.2);
  ctx.quadraticCurveTo(10.8, 13.2, 14.8, 14.6);
  ctx.stroke();
  ctx.restore();
}

function getActiveMovementDirection() {
  const inputDirection = game.running && !game.paused ? getMovementDirection() : 0;
  return isSkullModeActive() ? -inputDirection : inputDirection;
}

function syncVisualFacing(direction = getActiveMovementDirection()) {
  if (direction) {
    game.visualFacing = Math.sign(direction);
  }
  return game.visualFacing || 1;
}

function drawCompanions() {
  const visualScale = 0.75;
  const facing = syncVisualFacing();

  CatnyamEngine.getCompanionHitboxes(game).forEach((companion) => {
    const companionFacing = companion.id === "chick" || companion.id === "sparrow" ? -facing : facing;
    ctx.save();
    ctx.translate(companion.x, companion.y);
    ctx.scale(companionFacing, 1);
    drawCompanion(companion.id, 0, 0, companion.width * visualScale, companion.height * visualScale);
    ctx.restore();
  });
}

function drawCompanion(id, x, y, width, height) {
  const artwork = SHOP_CATALOG.companion[id];

  if (artwork && isArtworkReady(ART_ASSETS.companion)) {
    const phase = ({ hamster: 0, chick: 0.8, sparrow: 1.6, rabbit: 2.4, mole: 3.2 })[id] || 0;
    const bob = game.running && !game.paused
      ? Math.abs(Math.sin(game.elapsed * 6.4 + phase)) * 3.5
      : 0;
    const drawWidth = width * 1.65;
    const drawHeight = height * 1.75;
    ctx.save();
    ctx.fillStyle = "rgba(37, 33, 29, 0.16)";
    ctx.beginPath();
    ctx.ellipse(x, y + height * 0.43, width * 0.48, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    drawAtlasCell(
      ART_ASSETS.companion,
      artwork,
      3,
      2,
      x - drawWidth / 2,
      y + height * 0.55 - drawHeight - bob,
      drawWidth,
      drawHeight,
    );
    ctx.restore();
    return;
  }

  const palettes = {
    hamster: { fur: "#d9a36b", accent: "#fff0d8", ear: "#ef9eaa" },
    chick: { fur: "#ffd84f", accent: "#fff1a3", ear: "#e98a3d" },
    sparrow: { fur: "#9a765e", accent: "#ead7c5", ear: "#6b4f40" },
    rabbit: { fur: "#f3eee7", accent: "#ffffff", ear: "#ef9eaa" },
    mole: { fur: "#655c59", accent: "#948681", ear: "#ef9eaa" },
  };
  const palette = palettes[id] || palettes.hamster;

  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "rgba(37, 33, 29, 0.12)";
  ctx.beginPath();
  ctx.ellipse(0, height * 0.42, width * 0.42, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  if (id === "rabbit") {
    ctx.fillStyle = palette.fur;
    [-1, 1].forEach((side) => {
      ctx.beginPath();
      ctx.ellipse(side * width * 0.15, -height * 0.43, width * 0.11, height * 0.35, side * 0.08, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.fillStyle = palette.ear;
    [-1, 1].forEach((side) => {
      ctx.beginPath();
      ctx.ellipse(side * width * 0.15, -height * 0.43, width * 0.045, height * 0.23, side * 0.08, 0, Math.PI * 2);
      ctx.fill();
    });
  } else if (id === "hamster") {
    ctx.fillStyle = palette.ear;
    ctx.beginPath();
    ctx.arc(-width * 0.27, -height * 0.2, width * 0.13, 0, Math.PI * 2);
    ctx.arc(width * 0.27, -height * 0.2, width * 0.13, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = palette.fur;
  ctx.beginPath();
  ctx.ellipse(0, 2, width * 0.4, height * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();

  if (id === "chick" || id === "sparrow") {
    ctx.fillStyle = palette.accent;
    ctx.beginPath();
    ctx.ellipse(0, height * 0.12, width * 0.22, height * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = id === "chick" ? "#e98a3d" : "#6b4f40";
    ctx.beginPath();
    ctx.moveTo(0, 2);
    ctx.lineTo(width * 0.17, height * 0.09);
    ctx.lineTo(0, height * 0.15);
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.fillStyle = palette.accent;
    ctx.beginPath();
    ctx.ellipse(0, height * 0.12, width * 0.23, height * 0.19, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = id === "mole" ? "#fffaf2" : "#332923";
  ctx.beginPath();
  ctx.arc(-width * 0.13, -height * 0.05, 2.6, 0, Math.PI * 2);
  ctx.arc(width * 0.13, -height * 0.05, 2.6, 0, Math.PI * 2);
  ctx.fill();

  if (id !== "chick" && id !== "sparrow") {
    ctx.fillStyle = id === "mole" ? "#ef9eaa" : "#6c4b3d";
    ctx.beginPath();
    ctx.arc(0, height * 0.09, 3.3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function getCharacterMotion(reaction) {
  const isPreviewAnimating = Boolean(currentUser && !game.running && !game.paused && !gamePanel.hidden);
  const time = isPreviewAnimating ? idleVisualTime : Number(game.elapsed) || 0;
  const isAnimating = (game.running && !game.paused) || isPreviewAnimating;
  const direction = getActiveMovementDirection();
  const moving = Math.abs(direction) > 0;
  const speedCadence = isSpeedModeActive() ? 16 : 10.5;
  const stepWave = Math.sin(time * speedCadence);
  const breathWave = Math.sin(time * 3.2);
  const motion = {
    x: 0,
    y: 0,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
    facing: syncVisualFacing(direction),
  };

  if (isAnimating && moving && !isCatnipModeActive()) {
    const stepLift = Math.abs(stepWave);
    motion.y -= stepLift * (isSpeedModeActive() ? 6 : 4);
    motion.rotation += stepWave * direction * (isSpeedModeActive() ? 0.055 : 0.035);
    motion.scaleX *= 1 + stepLift * 0.035;
    motion.scaleY *= 1 - stepLift * 0.025;
  } else if (isAnimating && !isCatnipModeActive()) {
    motion.y += breathWave * 1.2;
    motion.scaleX *= 1 - breathWave * 0.009;
    motion.scaleY *= 1 + breathWave * 0.014;
  }

  if (isPurrModeActive()) {
    motion.x += Math.sin(time * 28) * 0.9;
    motion.scaleX *= 1 + Math.sin(time * 6) * 0.012;
  }

  if (isTunaModeActive() && !isCatnipModeActive()) {
    motion.rotation += Math.sin(time * 5.5) * 0.045;
  }

  if (isCatnipModeActive()) {
    const catnipPulse = (Math.sin(time * 9) + 1) / 2;
    motion.y -= 3 + catnipPulse * 4;
    motion.scaleX *= 1 + catnipPulse * 0.055;
    motion.scaleY *= 1 + catnipPulse * 0.055;
  }

  const reactionStartedAt = Number(game.reaction?.startedAt);
  const reactionClock = isPreviewAnimating ? Number(game.elapsed) || 0 : time;
  const reactionAge = Number.isFinite(reactionStartedAt) ? Math.max(0, reactionClock - reactionStartedAt) : 1;

  if (reaction === "good" || reaction === "box-open") {
    const progress = Math.min(1, reactionAge / 0.45);
    const pop = Math.sin(progress * Math.PI);
    motion.y -= pop * 8;
    motion.scaleX *= 1 + pop * 0.08;
    motion.scaleY *= 1 + pop * 0.12;
  }

  return motion;
}

function applyCharacterMotion(motion, mirrorFacing = false) {
  ctx.translate(motion.x, motion.y);
  ctx.rotate(motion.rotation);
  ctx.scale(motion.scaleX * (mirrorFacing ? motion.facing : 1), motion.scaleY);
}

function drawCharacterArtwork(width, height, rotation, reaction) {
  const characterId = game.loadout?.character || currentUser?.loadout?.character || "calico";
  const character = SHOP_CATALOG.character[characterId] || SHOP_CATALOG.character.calico;
  const atlasId = character.atlas === "extra" ? "extra" : "main";
  const atlas = CHARACTER_ATLASES[atlasId];
  const reactionArtwork = reaction === "good"
    ? EXPRESSION_ARTWORK.good[atlasId]
    : reaction === "bad"
      ? EXPRESSION_ARTWORK.bad[atlasId]
      : null;

  if (!isArtworkReady(atlas.neutral)) {
    return false;
  }

  const defaultDrawWidth = width * 1.28;
  const defaultDrawHeight = height * 1.46;
  const sourceWidth = (atlas.neutral.naturalWidth || atlas.neutral.width) / atlas.columns;
  const sourceHeight = (atlas.neutral.naturalHeight || atlas.neutral.height) / atlas.rows;
  const sourceAspect = sourceWidth / sourceHeight;
  const defaultArea = defaultDrawWidth * defaultDrawHeight;
  const drawWidth = atlasId === "extra" ? Math.sqrt(defaultArea * sourceAspect) : defaultDrawWidth;
  const drawHeight = atlasId === "extra" ? drawWidth / sourceAspect : defaultDrawHeight;
  const drawLeft = -drawWidth / 2;
  const drawTop = height * 0.58 - drawHeight;

  ctx.fillStyle = "rgba(37, 33, 29, 0.18)";
  ctx.beginPath();
  ctx.ellipse(0, height / 2 + 9, width * 0.54, Math.max(8, height * 0.14), 0, 0, Math.PI * 2);
  ctx.fill();

  const motion = getCharacterMotion(reaction);
  ctx.save();
  applyCharacterMotion(motion, true);
  ctx.rotate(rotation);
  if (!reactionArtwork || atlasId === "main") {
    drawAtlasCell(
      atlas.neutral,
      character,
      atlas.columns,
      atlas.rows,
      drawLeft,
      drawTop,
      drawWidth,
      drawHeight,
    );
  }
  if (isArtworkReady(reactionArtwork)) {
    drawAtlasCell(
      reactionArtwork,
      character,
      atlas.columns,
      atlas.rows,
      drawLeft,
      drawTop,
      drawWidth,
      drawHeight,
    );
  }
  ctx.restore();
  return true;
}

function drawCat(x, y, width, height, reaction = "neutral", rotation = 0) {
  ctx.save();
  ctx.translate(x, y);

  if (reaction === "box" || reaction === "box-open") {
    const motion = getCharacterMotion(reaction);
    ctx.save();
    applyCharacterMotion(motion);
    const renderedBox = reaction === "box-open"
      ? drawBoxPawArtwork(width, height)
      : drawClosedBoxArtwork(width, height);
    if (!renderedBox) {
      drawBoxCat(width, height, reaction === "box-open");
    }
    ctx.restore();
    const emphasisText = getCatEmphasisBubbleText();
    const bubbleText = getCatBubbleText();

    if (bubbleText) {
      drawSpeechBubble(width, height, bubbleText);
    }

    if (emphasisText) {
      drawEmphasisBubble(width, height, emphasisText);
    }

    ctx.restore();
    return;
  }

  if (drawCharacterArtwork(width, height, rotation, reaction)) {
    const emphasisText = getCatEmphasisBubbleText();
    const bubbleText = getCatBubbleText();

    if (bubbleText) {
      drawSpeechBubble(width, height, bubbleText);
    }

    if (emphasisText) {
      drawEmphasisBubble(width, height, emphasisText);
    }

    ctx.restore();
    return;
  }

  ctx.fillStyle = "rgba(37, 33, 29, 0.14)";
  ctx.beginPath();
  ctx.ellipse(0, height / 2 + 9, width * 0.55, 13, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.rotate(rotation);

  const characterId = game.loadout?.character || currentUser?.loadout?.character || "calico";
  const character = SHOP_CATALOG.character[characterId] || SHOP_CATALOG.character.calico;
  const faceColor = characterId === "black" || characterId === "tuxedo" ? "#fff5cb" : "#332923";

  ctx.fillStyle = character.fur;
  ctx.beginPath();
  ctx.ellipse(0, 6, width * 0.45, height * 0.42, 0, 0, Math.PI * 2);
  ctx.fill();

  if (character.kind === "dog") {
    ctx.fillStyle = character.accent;
    ctx.beginPath();
    ctx.ellipse(-width * 0.36, -height * 0.13, width * 0.14, height * 0.3, -0.22, 0, Math.PI * 2);
    ctx.ellipse(width * 0.36, -height * 0.13, width * 0.14, height * 0.3, 0.22, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = character.fur;
    ctx.beginPath();
    ctx.moveTo(-width * 0.33, -height * 0.22);
    ctx.lineTo(-width * 0.22, -height * 0.62);
    ctx.lineTo(-width * 0.07, -height * 0.28);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(width * 0.33, -height * 0.22);
    ctx.lineTo(width * 0.22, -height * 0.62);
    ctx.lineTo(width * 0.07, -height * 0.28);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#ff9fbe";
    ctx.beginPath();
    ctx.moveTo(-width * 0.27, -height * 0.25);
    ctx.lineTo(-width * 0.22, -height * 0.46);
    ctx.lineTo(-width * 0.13, -height * 0.26);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(width * 0.27, -height * 0.25);
    ctx.lineTo(width * 0.22, -height * 0.46);
    ctx.lineTo(width * 0.13, -height * 0.26);
    ctx.closePath();
    ctx.fill();
  }

  ctx.fillStyle = character.accent;
  ctx.beginPath();
  ctx.ellipse(-width * 0.18, -height * 0.13, width * 0.12, height * 0.12, -0.35, 0, Math.PI * 2);
  if (characterId === "calico" || characterId === "beagle" || characterId === "shih_tzu") {
    ctx.ellipse(width * 0.2, height * 0.13, width * 0.11, height * 0.15, 0.4, 0, Math.PI * 2);
  }
  ctx.fill();

  if (character.kind === "dog") {
    ctx.fillStyle = "rgba(255, 250, 242, 0.72)";
    ctx.beginPath();
    ctx.ellipse(0, height * 0.08, width * 0.2, height * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.strokeStyle = faceColor;
  ctx.lineWidth = 3;
  ctx.lineCap = "round";

  if (reaction === "good") {
    drawHappyEyes(width, height, faceColor);
    drawOpenMouth(height, "#ef6f8f", faceColor);
  } else if (reaction === "bad") {
    drawXEyes(width, height, faceColor);
    drawOpenMouth(height, "#8ed7f5", faceColor);
  } else {
    ctx.fillStyle = faceColor;
    ctx.beginPath();
    ctx.arc(-width * 0.16, -height * 0.03, 5, 0, Math.PI * 2);
    ctx.arc(width * 0.16, -height * 0.03, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(0, height * 0.05);
    ctx.quadraticCurveTo(-8, height * 0.16, -18, height * 0.08);
    ctx.moveTo(0, height * 0.05);
    ctx.quadraticCurveTo(8, height * 0.16, 18, height * 0.08);
    ctx.stroke();
  }

  ctx.strokeStyle = character.kind === "dog" ? "rgba(51, 41, 35, 0.4)" : faceColor;
  ctx.lineWidth = 2;
  [-1, 1].forEach((side) => {
    ctx.beginPath();
    ctx.moveTo(side * 21, 4);
    ctx.lineTo(side * 42, -3);
    ctx.moveTo(side * 20, 13);
    ctx.lineTo(side * 43, 14);
    ctx.stroke();
  });

  ctx.restore();

  const emphasisText = getCatEmphasisBubbleText();
  const bubbleText = getCatBubbleText();

  if (bubbleText) {
    drawSpeechBubble(width, height, bubbleText);
  }

  if (emphasisText) {
    drawEmphasisBubble(width, height, emphasisText);
  }

  ctx.restore();
}

function drawClosedBoxArtwork(width, height) {
  const characterId = game.loadout?.character || currentUser?.loadout?.character || "calico";
  const character = SHOP_CATALOG.character[characterId] || SHOP_CATALOG.character.calico;

  if (!isArtworkReady(ART_ASSETS.boxClosed)) {
    return false;
  }

  const drawSize = Math.max(width * 1.28, height * 1.7);
  const drawBottom = height * 0.54;
  ctx.fillStyle = "rgba(37, 33, 29, 0.14)";
  ctx.beginPath();
  ctx.ellipse(0, height / 2 + 7, width * 0.5, Math.max(7, height * 0.12), 0, 0, Math.PI * 2);
  ctx.fill();
  return drawAtlasCell(
    ART_ASSETS.boxClosed,
    { col: character.kind === "dog" ? 1 : 0, row: 0 },
    2,
    1,
    -drawSize / 2,
    drawBottom - drawSize,
    drawSize,
    drawSize,
  );
}

function drawBoxPawArtwork(width, height) {
  const characterId = game.loadout?.character || currentUser?.loadout?.character || "calico";
  const character = SHOP_CATALOG.character[characterId] || SHOP_CATALOG.character.calico;
  const atlas = getCharacterAtlas(character);

  if (!isArtworkReady(atlas.boxPaw)) {
    return false;
  }

  const drawSize = Math.max(width * 1.34, height * 1.78);
  const drawBottom = height * 0.52;
  ctx.fillStyle = "rgba(37, 33, 29, 0.16)";
  ctx.beginPath();
  ctx.ellipse(0, height / 2 + 7, width * 0.5, Math.max(7, height * 0.12), 0, 0, Math.PI * 2);
  ctx.fill();
  return drawAtlasCell(
    atlas.boxPaw,
    character,
    atlas.columns,
    atlas.rows,
    -drawSize / 2,
    drawBottom - drawSize,
    drawSize,
    drawSize,
  );
}

function drawBoxCat(width, height, isOpen = false) {
  const bodyX = -width * 0.42;
  const bodyY = -height * 0.22;
  const bodyWidth = width * 0.84;
  const bodyHeight = height * 0.68;

  ctx.fillStyle = "#c58b51";
  ctx.strokeStyle = "rgba(92, 56, 30, 0.5)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.rect(bodyX, bodyY, bodyWidth, bodyHeight);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#f4cc91";
  ctx.fillRect(-width * 0.055, bodyY + 1, width * 0.11, bodyHeight - 2);

  drawPawMark(-width * 0.2, height * 0.15, Math.min(width, height) * 0.2, "rgba(91, 55, 29, 0.58)");

  if (isOpen) {
    ctx.fillStyle = "rgba(75, 43, 24, 0.82)";
    ctx.beginPath();
    ctx.ellipse(0, bodyY + 2, width * 0.34, height * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#e0aa68";
    ctx.strokeStyle = "rgba(92, 56, 30, 0.5)";
    ctx.lineWidth = 1.8;
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(-width * 0.42, bodyY);
    ctx.lineTo(-width * 0.6, -height * 0.42);
    ctx.lineTo(-width * 0.08, -height * 0.31);
    ctx.lineTo(0, -height * 0.18);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(width * 0.42, bodyY);
    ctx.lineTo(width * 0.6, -height * 0.42);
    ctx.lineTo(width * 0.08, -height * 0.31);
    ctx.lineTo(0, -height * 0.18);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    const pawX = -width * 0.36;
    const pawY = -height * 0.49;
    const characterId = game.loadout?.character || "calico";
    const character = SHOP_CATALOG.character[characterId] || SHOP_CATALOG.character.calico;
    const pawOutline = "rgba(119, 72, 42, 0.5)";
    const pawFur = character.fur;
    ctx.strokeStyle = pawOutline;
    ctx.lineWidth = width * 0.2;
    ctx.lineCap = "butt";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(width * 0.04, bodyY + height * 0.13);
    ctx.quadraticCurveTo(-width * 0.17, -height * 0.35, pawX, pawY);
    ctx.stroke();

    ctx.strokeStyle = pawFur;
    ctx.lineWidth = width * 0.145;
    ctx.beginPath();
    ctx.moveTo(width * 0.04, bodyY + height * 0.13);
    ctx.quadraticCurveTo(-width * 0.17, -height * 0.35, pawX, pawY);
    ctx.stroke();

    const drawPawShape = (color, scale) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.ellipse(pawX, pawY + height * 0.015, width * 0.135 * scale, height * 0.13 * scale, -0.28, 0, Math.PI * 2);
      ctx.fill();
      [
        [-0.085, -0.045],
        [-0.047, -0.1],
        [0.005, -0.105],
      ].forEach(([xOffset, yOffset]) => {
        ctx.beginPath();
        ctx.arc(pawX + width * xOffset * scale, pawY + height * yOffset * scale, width * 0.048 * scale, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    drawPawShape(pawOutline, 1.12);
    drawPawShape(pawFur, 0.9);

    ctx.fillStyle = "#ef91ad";
    ctx.beginPath();
    ctx.ellipse(pawX + width * 0.012, pawY + height * 0.025, width * 0.043, height * 0.038, -0.28, 0, Math.PI * 2);
    ctx.fill();
    [
      [-0.07, -0.047],
      [-0.036, -0.087],
      [0.008, -0.09],
    ].forEach(([xOffset, yOffset]) => {
      ctx.beginPath();
      ctx.arc(pawX + width * xOffset, pawY + height * yOffset, width * 0.018, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.fillStyle = "#c58b51";
    ctx.fillRect(bodyX + 1, bodyY, bodyWidth - 2, height * 0.16);
    ctx.fillStyle = "#f4cc91";
    ctx.fillRect(-width * 0.055, bodyY, width * 0.11, height * 0.16);
    ctx.strokeStyle = "rgba(92, 56, 30, 0.5)";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(bodyX, bodyY);
    ctx.lineTo(bodyX + bodyWidth, bodyY);
    ctx.stroke();
  } else {
    ctx.fillStyle = "#e0aa68";
    ctx.strokeStyle = "rgba(92, 56, 30, 0.5)";
    ctx.lineWidth = 1.8;
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(-width * 0.42, bodyY);
    ctx.lineTo(0, -height * 0.46);
    ctx.lineTo(width * 0.42, bodyY);
    ctx.lineTo(0, -height * 0.08);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#f4cc91";
    ctx.beginPath();
    ctx.moveTo(-width * 0.045, -height * 0.43);
    ctx.lineTo(width * 0.045, -height * 0.43);
    ctx.lineTo(width * 0.045, -height * 0.1);
    ctx.lineTo(-width * 0.045, -height * 0.1);
    ctx.closePath();
    ctx.fill();
  }
}

function drawSpeechBubble(width, height, text) {
  ctx.save();
  const bubbleWidthBasis = Math.min(width, game.cat.width);
  const bubbleHeightBasis = Math.min(height, game.cat.height);
  ctx.translate(bubbleWidthBasis * 0.32, -bubbleHeightBasis * 0.54);
  ctx.font = "800 16px Jua, Nunito, sans-serif";
  const bubbleWidth = Math.max(112, ctx.measureText(text).width + 30);
  const bubbleLeft = -bubbleWidth * 0.22;
  const textX = bubbleLeft + bubbleWidth / 2;

  ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
  roundRect(bubbleLeft, -26, bubbleWidth, 36, 8);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(5, 8);
  ctx.lineTo(-7, 22);
  ctx.lineTo(23, 8);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#ef6f8f";
  ctx.textAlign = "center";
  ctx.fillText(text, textX, -3);
  ctx.restore();
}

function drawEmphasisBubble(width, height, text) {
  ctx.save();
  const bubbleWidthBasis = Math.min(width, game.cat.width);
  const bubbleHeightBasis = Math.min(height, game.cat.height);
  ctx.translate(bubbleWidthBasis * 0.32, -bubbleHeightBasis * 0.54 - 56);
  ctx.font = "900 21px Jua, Nunito, sans-serif";
  const textWidth = ctx.measureText(text).width;
  const radiusX = Math.max(48, textWidth / 2 + 21);
  const radiusY = 28;
  const points = 18;

  ctx.beginPath();
  for (let index = 0; index < points; index += 1) {
    const angle = -Math.PI / 2 + (Math.PI * 2 * index) / points;
    const spike = index % 2 === 0 ? 1.1 : 0.86;
    const x = Math.cos(angle) * radiusX * spike;
    const y = Math.sin(angle) * radiusY * spike;

    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.closePath();

  ctx.fillStyle = "rgba(255, 244, 163, 0.78)";
  ctx.strokeStyle = "rgba(239, 111, 143, 0.78)";
  ctx.lineWidth = 2;
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "rgba(255, 255, 255, 0.36)";
  ctx.beginPath();
  ctx.ellipse(-radiusX * 0.18, -radiusY * 0.36, radiusX * 0.46, 5, -0.08, 0, Math.PI * 2);
  ctx.fill();

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.lineWidth = 4;
  ctx.strokeStyle = "rgba(255, 250, 242, 0.72)";
  ctx.fillStyle = "rgba(217, 75, 87, 0.88)";
  ctx.strokeText(text, 0, 1);
  ctx.fillText(text, 0, 1);
  ctx.restore();
}

function drawHappyEyes(width, height, color = "#332923") {
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-width * 0.24, -height * 0.03);
  ctx.quadraticCurveTo(-width * 0.16, -height * 0.2, -width * 0.08, -height * 0.03);
  ctx.moveTo(width * 0.08, -height * 0.03);
  ctx.quadraticCurveTo(width * 0.16, -height * 0.2, width * 0.24, -height * 0.03);
  ctx.stroke();
}

function drawXEyes(width, height, color = "#332923") {
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  [-1, 1].forEach((side) => {
    const centerX = side * width * 0.16;
    const centerY = -height * 0.04;
    ctx.beginPath();
    ctx.moveTo(centerX - 8, centerY - 8);
    ctx.lineTo(centerX + 8, centerY + 8);
    ctx.moveTo(centerX + 8, centerY - 8);
    ctx.lineTo(centerX - 8, centerY + 8);
    ctx.stroke();
  });
}

function drawOpenMouth(height, tongueColor, outlineColor = "#332923") {
  ctx.fillStyle = "#332923";
  ctx.strokeStyle = outlineColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(0, height * 0.12, 12, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = tongueColor;
  ctx.beginPath();
  ctx.ellipse(0, height * 0.18, 7, 5, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawIntro() {
  drawWorld();
  drawCompanions();
  drawCat(canvas.width / 2, canvas.height - 84, 104, 74);
  drawBombModeHearts();
}

function drawFinish() {
  drawWorld();
  drawCompanions();
  drawCat(game.cat.x, game.cat.y, game.cat.width, game.cat.height, getCatReaction());
  drawBombModeHearts();
}

function roundRect(x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function getControlKey(key) {
  if (typeof key !== "string") {
    return "";
  }

  if (key === "ArrowLeft" || key === "ArrowRight") {
    return key;
  }

  const lowerKey = key.toLowerCase();
  return lowerKey === "a" || lowerKey === "d" ? lowerKey : "";
}

function isTypingTarget(target) {
  return target instanceof HTMLInputElement
    || target instanceof HTMLTextAreaElement
    || target instanceof HTMLSelectElement
    || target?.isContentEditable;
}

function isButtonTarget(target) {
  return target instanceof HTMLButtonElement || Boolean(target?.closest?.("button"));
}

function canUseGameHotkey(target) {
  return currentUser
    && !gamePanel.hidden
    && accountModal.hidden
    && shopModal.hidden
    && playerHistoryModal.hidden
    && !isTypingTarget(target)
    && !isButtonTarget(target);
}

function handleSpaceGameAction(event) {
  if ((event.code !== "Space" && event.key !== " ") || event.repeat || !canUseGameHotkey(event.target)) {
    return;
  }

  event.preventDefault();

  if (game.running) {
    pauseGame();
    return;
  }

  if (game.paused) {
    resumeGame();
    return;
  }

  if (!gameOverlay.hidden && !startButton.hidden && !startButton.disabled) {
    startGame();
  }
}

function clearMovementInput() {
  keys.clear();
  touchDirection = 0;
  touchLeftButton.classList.remove("pressed");
  touchRightButton.classList.remove("pressed");
}

function closeGuideTooltips(exceptItem = null) {
  itemGuide.querySelectorAll(".guide-item.tooltip-open").forEach((item) => {
    if (item !== exceptItem) {
      item.classList.remove("tooltip-open");
      item.setAttribute("aria-expanded", "false");
    }
  });
}

function bindGuideTooltips() {
  itemGuide.querySelectorAll(".guide-item").forEach((item) => {
    item.setAttribute("aria-expanded", "false");
    item.addEventListener("click", (event) => {
      event.preventDefault();
      const willOpen = !item.classList.contains("tooltip-open");
      closeGuideTooltips(item);
      item.classList.toggle("tooltip-open", willOpen);
      item.setAttribute("aria-expanded", String(willOpen));
    });
  });
}

function bindTouchControl(button, direction) {
  const start = (event) => {
    touchDirection = direction;
    button.classList.add("pressed");

    if (button.setPointerCapture && event.pointerId !== undefined) {
      button.setPointerCapture(event.pointerId);
    }

    event.preventDefault();
  };
  const stop = () => {
    if (touchDirection === direction) {
      touchDirection = 0;
    }
    button.classList.remove("pressed");
  };

  button.addEventListener("pointerdown", start);
  button.addEventListener("pointerup", stop);
  button.addEventListener("pointercancel", stop);
  button.addEventListener("pointerleave", stop);
  button.addEventListener("lostpointercapture", stop);
  button.addEventListener("selectstart", (event) => event.preventDefault());
  button.addEventListener("contextmenu", (event) => event.preventDefault());
  button.addEventListener("dragstart", (event) => event.preventDefault());
}

function getSelectionElement(node) {
  if (!node) {
    return null;
  }

  return node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
}

function clearGameSelection(onlyGamePanel = false) {
  const selection = window.getSelection?.();

  if (selection && !selection.isCollapsed) {
    if (onlyGamePanel) {
      const anchorElement = getSelectionElement(selection.anchorNode);
      const focusElement = getSelectionElement(selection.focusNode);
      const selectionInGame = (anchorElement && gamePanel.contains(anchorElement))
        || (focusElement && gamePanel.contains(focusElement));

      if (!selectionInGame) {
        return;
      }
    }

    selection.removeAllRanges();
  }
}

function preventGameSelection(event) {
  if (!isTypingTarget(event.target)) {
    event.preventDefault();
    clearGameSelection();
  }
}

function preventGameTouchMove(event) {
  if (game.running && !isTypingTarget(event.target)) {
    event.preventDefault();
    clearGameSelection();
  }
}

window.addEventListener("keydown", (event) => {
  handleSpaceGameAction(event);

  const controlKey = getControlKey(event.key);

  if (controlKey && game.running && canUseGameHotkey(event.target)) {
    keys.add(controlKey);
    event.preventDefault();
  }
});

window.addEventListener("keyup", (event) => {
  const controlKey = getControlKey(event.key);
  keys.delete(controlKey);
});

authForm.addEventListener("submit", handleAuthSubmit);
signupButton.addEventListener("click", () => setAuthMode("signup"));
loginModeButton.addEventListener("click", () => setAuthMode("login"));
logoutButton.addEventListener("click", logout);
profileButton.addEventListener("click", openAccountModal);
shopButton.addEventListener("click", openShopModal);
closeAccountModalButton.addEventListener("click", closeAccountModal);
closeShopModalButton.addEventListener("click", closeShopModal);
closePlayerHistoryButton.addEventListener("click", closePlayerHistoryModal);
accountModal.addEventListener("click", (event) => {
  if (event.target === accountModal) {
    closeAccountModal();
  }
});
shopModal.addEventListener("click", (event) => {
  if (event.target === shopModal) {
    closeShopModal();
  }
});
shopGrid.addEventListener("click", handleShopAction);
shopTabButtons.forEach((button) => {
  button.addEventListener("click", () => setShopTab(button.dataset.shopTab));
});
playerHistoryModal.addEventListener("click", (event) => {
  if (event.target === playerHistoryModal) {
    closePlayerHistoryModal();
  }
});
passwordTabButton.addEventListener("click", () => setAccountTab("password"));
adminTabButton.addEventListener("click", () => setAccountTab("admin"));
dailyRankingButton.addEventListener("click", () => setRankingMode("daily"));
allTimeRankingButton.addEventListener("click", () => setRankingMode("allTime"));
gameModeButtons.forEach((button) => {
  button.addEventListener("click", () => setGameMode(button.dataset.gameMode));
});
startButton.addEventListener("click", startGame);
shareResultButton.addEventListener("click", shareResult);
pauseButton.addEventListener("click", pauseGame);
pauseRestartButton.addEventListener("click", startGame);
pauseHomeButton.addEventListener("click", returnToGameHome);
resumeButton.addEventListener("click", resumeGame);
changeUsernameForm.addEventListener("submit", changeUsername);
changeNicknameForm.addEventListener("submit", changeNickname);
changePasswordForm.addEventListener("submit", changePassword);
resetMyScoreButton.addEventListener("click", () => resetMyScore(CatnyamEngine.GAME_MODES.CHURU));
resetMyBombScoreButton.addEventListener("click", () => resetMyScore(CatnyamEngine.GAME_MODES.BOMB));
deleteMyAccountButton.addEventListener("click", deleteMyAccount);
bindGuideTooltips();
bindTouchControl(touchLeftButton, -1);
bindTouchControl(touchRightButton, 1);
resetRankingButton.addEventListener("click", () => resetRankings(CatnyamEngine.GAME_MODES.CHURU));
resetBombRankingButton.addEventListener("click", () => resetRankings(CatnyamEngine.GAME_MODES.BOMB));
gamePanel.addEventListener("selectstart", preventGameSelection);
gamePanel.addEventListener("dragstart", preventGameSelection);
gamePanel.addEventListener("contextmenu", preventGameSelection);
gamePanel.addEventListener("touchmove", preventGameTouchMove, { passive: false });
document.addEventListener("selectionchange", () => {
  if (game.running && !gamePanel.hidden) {
    clearGameSelection(true);
  }
});
document.addEventListener("click", (event) => {
  if (!itemGuide.contains(event.target)) {
    closeGuideTooltips();
  }
});

window.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") {
    return;
  }

  closeGuideTooltips();

  if (!playerHistoryModal.hidden) {
    closePlayerHistoryModal();
    return;
  }

  if (!accountModal.hidden) {
    closeAccountModal();
    return;
  }

  if (!shopModal.hidden) {
    closeShopModal();
  }
});

initializeApp();
