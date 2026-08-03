const GAME_SECONDS = 45;

const authPanel = document.querySelector("#authPanel");
const gamePanel = document.querySelector("#gamePanel");
const profileBox = document.querySelector("#profileBox");
const profileButton = document.querySelector("#profileButton");
const currentUserName = document.querySelector("#currentUserName");
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
const resetMyScoreButton = document.querySelector("#resetMyScoreButton");
const deleteMyAccountButton = document.querySelector("#deleteMyAccountButton");
const accountActionMessage = document.querySelector("#accountActionMessage");
const scoreText = document.querySelector("#scoreText");
const timeLabel = document.querySelector("#timeLabel");
const timeText = document.querySelector("#timeText");
const bestText = document.querySelector("#bestText");
const speedModeBadge = document.querySelector("#speedModeBadge");
const hideModeBadge = document.querySelector("#hideModeBadge");
const purrModeBadge = document.querySelector("#purrModeBadge");
const catnipModeBadge = document.querySelector("#catnipModeBadge");
const tunaModeBadge = document.querySelector("#tunaModeBadge");
const clipperModeBadge = document.querySelector("#clipperModeBadge");
const heartModeBadge = document.querySelector("#heartModeBadge");
const canvasWrap = document.querySelector("#canvasWrap");
const canvas = document.querySelector("#gameCanvas");
const ctx = canvas.getContext("2d");

const REMEMBER_LOGIN_KEY = "catnyam_auto_login";
const RANKING_REFRESH_MS = 15000;
const keys = new Set();
let authMode = "login";
let currentUser = null;
let animationId = null;
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

function createGameState(seed = "catnyam-local", mode = currentGameMode) {
  return {
    ...CatnyamEngine.createGameState({ seed, mode }),
    running: false,
    paused: false,
    gameSession: null,
    stepAccumulator: 0,
    inputLog: [],
    lastInputDirection: 0,
    scorePopups: [],
    reaction: {
      type: "neutral",
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

function isBombMode(mode = currentGameMode) {
  return mode === CatnyamEngine.GAME_MODES.BOMB;
}

function canUseGameMode(mode) {
  return !isBombMode(mode) || isAdmin(currentUser);
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
    const isLocked = isBombMode(button.dataset.gameMode) && !isAdmin(currentUser);
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

function updateProfileName() {
  const displayName = getUserDisplayName(currentUser);
  currentUserName.textContent = isAdmin(currentUser) ? `${displayName} 관리자` : displayName;
}

function syncCurrentUser(user) {
  if (!user || currentUser?.id !== user.id) {
    return;
  }

  currentUser = user;
  updateProfileName();
  bestText.textContent = currentUser.bestScore || 0;
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
  authPanel.hidden = true;
  gamePanel.hidden = false;
  profileBox.hidden = false;
  updateProfileName();
  scoreText.textContent = "0";
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
}

function showAuth() {
  currentUser = null;
  stopRankingRefresh();
  stopGame();
  authPanel.hidden = false;
  gamePanel.hidden = true;
  profileBox.hidden = true;
  closeAccountModal();
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
  score.textContent = scoreValue;
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
  const meta = document.createElement("span");
  const renameForm = document.createElement("form");
  const renameInput = document.createElement("input");
  const renameButton = document.createElement("button");
  const actions = document.createElement("div");
  const scoreResetButton = document.createElement("button");
  const resetButton = document.createElement("button");
  const deleteButton = document.createElement("button");

  item.className = "admin-account";
  main.className = "admin-account-main";
  name.className = "admin-account-name";
  meta.className = "admin-account-meta";
  renameForm.className = "admin-rename-row";
  actions.className = "admin-actions";
  renameButton.className = "secondary-button";
  scoreResetButton.className = "secondary-button";
  resetButton.className = "secondary-button";
  deleteButton.className = "danger-button";

  const displayName = getUserDisplayName(account);
  name.type = "button";
  name.textContent = `${displayName}(${account.username})`;
  name.setAttribute("aria-label", `${displayName} 계정 정보 보기`);
  name.addEventListener("click", () => openPlayerHistory(account));
  meta.textContent = `최고 ${account.bestScore || 0}점 · ${account.gamesPlayed || 0}회`;
  renameInput.type = "text";
  renameInput.maxLength = 16;
  renameInput.value = account.username;
  renameInput.setAttribute("aria-label", `${account.username} 새 아이디`);
  renameButton.type = "submit";
  renameButton.textContent = "아이디 변경";
  scoreResetButton.type = "button";
  resetButton.type = "button";
  deleteButton.type = "button";
  scoreResetButton.textContent = "점수 초기화";
  resetButton.textContent = "비밀번호 초기화";
  deleteButton.textContent = "계정 삭제";
  scoreResetButton.addEventListener("click", () => resetAccountScore(account.id, displayName));

  if (isAdmin(account)) {
    const badge = document.createElement("span");
    badge.className = "admin-badge";
    badge.textContent = "관리자";
    main.append(name, badge);
    resetButton.disabled = true;
    deleteButton.disabled = true;
  } else {
    main.append(name);
    resetButton.addEventListener("click", () => resetAccountPassword(account.id, account.username));
    deleteButton.addEventListener("click", () => deleteAccount(account.id, account.username));
  }

  renameForm.addEventListener("submit", (event) => {
    event.preventDefault();
    renameAccount(account.id, account.username, renameInput.value);
  });

  renameForm.append(renameInput, renameButton);
  actions.append(scoreResetButton, resetButton, deleteButton);
  item.append(main, meta, renameForm, actions);
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
    setAdminMessage(`${username} 임시 비밀번호: ${data.temporaryPassword}`, true);
    renderAdminList();
  } catch (error) {
    setAdminMessage(error.message);
  }
}

async function resetAccountScore(userId, username) {
  if (!window.confirm(`${username} 점수와 플레이 기록을 초기화할까요?`)) {
    return;
  }

  try {
    const data = await requestApi("/api/admin/users", {
      method: "POST",
      body: {
        action: "reset-score",
        userId,
      },
    });
    syncCurrentUser(data.user);
    renderRanking();
    await renderAdminList();
    setAdminMessage(`${getUserDisplayName(data.user)} 점수를 초기화했습니다.`, true);
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

async function resetMyScore() {
  if (!currentUser || !window.confirm("내 점수와 플레이 기록을 초기화할까요?")) {
    return;
  }

  resetMyScoreButton.disabled = true;

  try {
    const data = await requestApi("/api/scores", {
      method: "DELETE",
    });
    syncCurrentUser(data.user);
    renderRanking();

    if (!adminTabPanel.hidden) {
      await renderAdminList();
    }

    setAccountActionMessage("내 점수를 초기화했습니다.", true);
  } catch (error) {
    setAccountActionMessage(error.message);
  } finally {
    resetMyScoreButton.disabled = false;
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
  }
}

async function resetRankings() {
  if (!window.confirm("전체 츄르 랭킹과 플레이 기록을 초기화할까요?")) {
    return;
  }

  resetRankingButton.disabled = true;

  try {
    await requestApi("/api/admin/reset-rankings", {
      method: "POST",
    });
    currentUser.bestScore = 0;
    currentUser.gamesPlayed = 0;
    bestText.textContent = "0";
    renderRanking();
    await renderAdminList();
    setAdminMessage("츄르 랭킹을 초기화했습니다.", true);
  } catch (error) {
    setAdminMessage(error.message);
  } finally {
    resetRankingButton.disabled = false;
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

  stopGame();
  lastFinishedScore = null;
  resetShareStatus();
  currentGameMode = CatnyamEngine.normalizeGameMode(gameSession.gameMode || currentGameMode);
  updateGameModeUI();
  game = createGameState(gameSession.seed, currentGameMode);
  game.gameSession = gameSession;
  game.running = true;
  game.paused = false;
  hideGameOverlay();
  scoreText.textContent = "0";
  updateTimeDisplay();
  clearMovementInput();
  updateModeBadges();
  lastFrame = performance.now();
  animationId = requestAnimationFrame(loop);
  startButton.disabled = false;
  pauseRestartButton.disabled = false;
}

function cancelAnimation() {
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
}

function stopGame() {
  cancelAnimation();
  game.running = false;
  game.paused = false;
  pauseButton.hidden = true;
  canvasWrap.classList.remove("mode-highlight", "danger-highlight", "catnip-highlight");
  clearMovementInput();
}

function finishGame() {
  const finalScore = game.score;
  lastFinishedScore = finalScore;
  stopGame();
  clearModes();
  drawFinish();
  showGameOverlay("다시하기", `${finalScore}점!`, "result");
  submitScore(finalScore);
}

async function submitScore(score) {
  if (!currentUser) {
    return;
  }

  if (!game.gameSession?.id || !game.gameSession?.token) {
    showGameOverlay("다시하기", `${score}점 · 저장 실패`, "result");
    return;
  }

  try {
    const data = await requestApi("/api/scores", {
      method: "POST",
      body: {
        action: "finish-game",
        score,
        gameMode: currentGameMode,
        sessionId: game.gameSession.id,
        sessionToken: game.gameSession.token,
        steps: game.step,
        inputLog: game.inputLog,
      },
    });
    currentUser = data.user;
    bestText.textContent = currentUser.bestScore || 0;
    renderRanking();
  } catch {
    showGameOverlay("다시하기", `${score}점 · 저장 실패`, "result");
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
  resetShareStatus();
  game = createGameState();
  scoreText.textContent = "0";
  updateTimeDisplay();
  updateModeBadges();
  showGameOverlay("게임 시작");
  drawIntro();
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
  return `${window.location.origin}${window.location.pathname}`;
}

function getResultShareText(score) {
  const nickname = getUserDisplayName(currentUser) || "플레이어";

  return `Cat Nyam에서 ${nickname}님이 ${score}점 달성!\n츄르 잡으러 도전해봐냥`;
}

function getFullResultShareText(score) {
  return `${getResultShareText(score)}\n${getSharePageUrl()}`;
}

function resetShareStatus() {
  shareStatus.textContent = "";
  shareStatus.hidden = true;
}

async function copyResultShareText(score) {
  if (!navigator.clipboard?.writeText) {
    throw new Error("이 브라우저에서는 공유와 복사를 지원하지 않습니다.");
  }

  await navigator.clipboard.writeText(getFullResultShareText(score));
}

async function shareResult() {
  const score = lastFinishedScore ?? game.score ?? 0;
  shareResultButton.disabled = true;
  shareStatus.hidden = false;
  shareStatus.textContent = "복사하는 중입니다.";

  try {
    await copyResultShareText(score);
    shareStatus.textContent = "공유 문구가 복사되었습니다.";
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
        setCatReaction(event.scoreDelta < 0 ? "bad" : "good");
        addScorePopup(event.scoreDelta);
      }
      return;
    }

    if (event.type === "bounce") {
      setCatReaction("good");
      setCatBubble("통통!", 0.9);
      return;
    }

    if (event.type === "mode") {
      handleModeEvent(event.kind);
      return;
    }

    if (event.type === "heart") {
      setCatReaction("good");
      setCatBubble("하트 +1", 1.1);
      updateModeBadges();
      return;
    }

    if (event.type === "life") {
      setCatReaction("bad");
      setCatBubble(event.hearts <= 0 ? "털썩..." : "아야!", 1.1);
      updateModeBadges();
      return;
    }

    if (event.type === "rain") {
      setCatBubble("폭탄비!", 1.2);
      triggerCanvasHighlight("danger");
    }
  });
}

function handleModeEvent(kind) {
  if (kind === "toy") {
    setCatReaction("good");
    setCatBubble("우다다모드!", 1.5);
    triggerCanvasHighlight("mode");
  } else if (kind === "box") {
    setCatBubble("건들지마라냥!", 3);
    triggerCanvasHighlight("danger");
  } else if (kind === "hand") {
    setCatReaction("good");
    setMultiplierBubble();
    triggerCanvasHighlight("mode");
  } else if (kind === "catnip") {
    setCatReaction("good");
    if (game.gameMode !== CatnyamEngine.GAME_MODES.BOMB) {
      setMultiplierBubble();
    }
    setCatBubble("캣닢파워!", 1.6);
    triggerCanvasHighlight("catnip");
  } else if (kind === "tuna") {
    setCatReaction("good");
    setCatBubble("애교모드!", 1.6);
    triggerCanvasHighlight("mode");
  } else if (kind === "clipper") {
    setCatReaction("bad");
    setCatBubble("위이이잉!!!", 1.6);
    triggerCanvasHighlight("danger");
  }

  updateModeBadges();
}

function getScoreMultiplier() {
  return CatnyamEngine.getScoreMultiplier(game);
}

function setCatReaction(type) {
  game.reaction = {
    type,
    until: game.elapsed + 0.45,
  };
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

function triggerCanvasHighlight(type) {
  canvasWrap.classList.remove("mode-highlight", "danger-highlight", "catnip-highlight");
  void canvasWrap.offsetWidth;
  const className = type === "catnip"
    ? "catnip-highlight"
    : type === "danger"
      ? "danger-highlight"
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
  if (isHideModeActive() && !isCatnipModeActive()) {
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

function updateModeBadges() {
  const isBombMode = game.gameMode === CatnyamEngine.GAME_MODES.BOMB;

  if (isBombMode) {
    speedModeBadge.hidden = true;
    hideModeBadge.hidden = true;
    purrModeBadge.hidden = true;
    catnipModeBadge.hidden = true;
    tunaModeBadge.hidden = true;
    clipperModeBadge.hidden = true;
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
  game.bubble = {
    text: "",
    until: 0,
  };
  game.emphasisBubble = {
    text: "",
    until: 0,
  };
  updateModeBadges();
}

function updateCanvasHighlight() {
  const catnipActive = isCatnipModeActive();
  const dangerActive = !catnipActive && (isHideModeActive() || isClipperModeActive());
  const modeActive = !catnipActive && !dangerActive && (isSpeedModeActive() || isPurrModeActive() || isTunaModeActive());
  canvasWrap.classList.toggle("catnip-highlight", catnipActive);
  canvasWrap.classList.toggle("danger-highlight", dangerActive);
  canvasWrap.classList.toggle("mode-highlight", modeActive);
}

function draw() {
  drawWorld();
  game.drops.forEach(drawChuru);
  drawCat(game.cat.x, game.cat.y, getCatWidth(), getCatHeight(), getCatReaction(), getCatRotation());
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
  const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
  sky.addColorStop(0, "#dff5ff");
  sky.addColorStop(1, "#fff6dc");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
  drawCloud(130, 92, 1);
  drawCloud(740, 128, 0.8);
  drawCloud(450, 70, 0.62);

  ctx.fillStyle = "#8addbd";
  ctx.fillRect(0, canvas.height - 44, canvas.width, 44);
  ctx.fillStyle = "rgba(37, 33, 29, 0.08)";
  for (let x = 20; x < canvas.width; x += 48) {
    ctx.fillRect(x, canvas.height - 37, 18, 6);
  }
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

  ctx.fillStyle = drop.kind === "gold" ? "#ffd84f" : "#ff9f6e";
  roundRect(-drop.width / 2, -drop.height / 2, drop.width, drop.height, 9);
  ctx.fill();

  ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
  roundRect(-drop.width / 2 + 6, -drop.height / 2 + 8, 7, drop.height - 18, 4);
  ctx.fill();

  ctx.fillStyle = "#fffaf2";
  ctx.fillRect(-drop.width / 2, -drop.height / 2 - 5, drop.width, 10);

  ctx.restore();
}

function drawHeartItem(drop) {
  const size = drop.width;

  ctx.save();
  ctx.scale(size / 42, size / 42);
  ctx.fillStyle = "rgba(239, 111, 143, 0.18)";
  ctx.beginPath();
  ctx.ellipse(0, 6, 26, 22, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.rotate(-Math.PI / 4);
  ctx.fillStyle = "#ef6f8f";
  ctx.beginPath();
  roundRect(-9, -9, 18, 18, 5);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, -9, 9, 0, Math.PI * 2);
  ctx.arc(9, 0, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = "rgba(255, 255, 255, 0.54)";
  ctx.beginPath();
  ctx.ellipse(-7, -8, 5, 3, -0.7, 0, Math.PI * 2);
  ctx.fill();
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
  ctx.arc(0, 3, radius + 6, 0, Math.PI * 2);
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

  ctx.fillStyle = "#c58b51";
  roundRect(-width / 2, -height / 2, width, height, 6);
  ctx.fill();

  ctx.fillStyle = "#e0aa68";
  ctx.beginPath();
  ctx.moveTo(-width / 2, -height / 2);
  ctx.lineTo(0, -height / 2 - 10);
  ctx.lineTo(width / 2, -height / 2);
  ctx.lineTo(0, -height / 2 + 8);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "rgba(92, 56, 30, 0.45)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, -height / 2 + 4);
  ctx.lineTo(0, height / 2 - 4);
  ctx.stroke();
}

function drawHandItem(drop) {
  const width = drop.width;
  const height = drop.height;

  ctx.fillStyle = "#ffc8a2";
  ctx.beginPath();
  ctx.ellipse(0, 8, width * 0.32, height * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();

  [-0.3, -0.1, 0.1, 0.3].forEach((offset, index) => {
    ctx.beginPath();
    ctx.ellipse(width * offset, -height * 0.2, 6, 16 - index, 0, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.beginPath();
  ctx.ellipse(width * 0.38, 0, 7, 15, 0.7, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(142, 92, 66, 0.36)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-8, 5);
  ctx.quadraticCurveTo(0, 14, 10, 5);
  ctx.stroke();
}

function drawCat(x, y, width, height, reaction = "neutral", rotation = 0) {
  ctx.save();
  ctx.translate(x, y);

  if (reaction === "box") {
    drawBoxCat(width, height);
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

  ctx.fillStyle = "#ffcf8a";
  ctx.beginPath();
  ctx.ellipse(0, 6, width * 0.45, height * 0.42, 0, 0, Math.PI * 2);
  ctx.fill();

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

  ctx.strokeStyle = "#332923";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";

  if (reaction === "good") {
    drawHappyEyes(width, height);
    drawOpenMouth(height, "#ef6f8f");
  } else if (reaction === "bad") {
    drawXEyes(width, height);
    drawOpenMouth(height, "#8ed7f5");
  } else {
    ctx.fillStyle = "#332923";
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

  ctx.strokeStyle = "rgba(51, 41, 35, 0.72)";
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

function drawBoxCat(width, height) {
  ctx.fillStyle = "rgba(37, 33, 29, 0.14)";
  ctx.beginPath();
  ctx.ellipse(0, height / 2 + 9, width * 0.5, 13, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#c58b51";
  roundRect(-width * 0.42, -height * 0.22, width * 0.84, height * 0.68, 8);
  ctx.fill();

  ctx.fillStyle = "#e0aa68";
  ctx.beginPath();
  ctx.moveTo(-width * 0.42, -height * 0.22);
  ctx.lineTo(0, -height * 0.46);
  ctx.lineTo(width * 0.42, -height * 0.22);
  ctx.lineTo(0, -height * 0.08);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "rgba(92, 56, 30, 0.45)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, -height * 0.05);
  ctx.lineTo(0, height * 0.38);
  ctx.stroke();
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

function drawHappyEyes(width, height) {
  ctx.strokeStyle = "#332923";
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-width * 0.24, -height * 0.03);
  ctx.quadraticCurveTo(-width * 0.16, -height * 0.2, -width * 0.08, -height * 0.03);
  ctx.moveTo(width * 0.08, -height * 0.03);
  ctx.quadraticCurveTo(width * 0.16, -height * 0.2, width * 0.24, -height * 0.03);
  ctx.stroke();
}

function drawXEyes(width, height) {
  ctx.strokeStyle = "#332923";
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

function drawOpenMouth(height, tongueColor) {
  ctx.fillStyle = "#332923";
  ctx.beginPath();
  ctx.ellipse(0, height * 0.12, 12, 14, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = tongueColor;
  ctx.beginPath();
  ctx.ellipse(0, height * 0.18, 7, 5, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawIntro() {
  drawWorld();
  drawCat(canvas.width / 2, canvas.height - 84, 104, 74);
  drawBombModeHearts();
}

function drawFinish() {
  drawWorld();
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
closeAccountModalButton.addEventListener("click", closeAccountModal);
closePlayerHistoryButton.addEventListener("click", closePlayerHistoryModal);
accountModal.addEventListener("click", (event) => {
  if (event.target === accountModal) {
    closeAccountModal();
  }
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
resetMyScoreButton.addEventListener("click", resetMyScore);
deleteMyAccountButton.addEventListener("click", deleteMyAccount);
bindGuideTooltips();
bindTouchControl(touchLeftButton, -1);
bindTouchControl(touchRightButton, 1);
resetRankingButton.addEventListener("click", resetRankings);
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
  }
});

initializeApp();
