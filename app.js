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
const passwordInput = document.querySelector("#passwordInput");
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
const touchLeftButton = document.querySelector("#touchLeftButton");
const touchRightButton = document.querySelector("#touchRightButton");
const rankingList = document.querySelector("#rankingList");
const accountModal = document.querySelector("#accountModal");
const closeAccountModalButton = document.querySelector("#closeAccountModalButton");
const passwordTabButton = document.querySelector("#passwordTabButton");
const adminTabButton = document.querySelector("#adminTabButton");
const passwordTabPanel = document.querySelector("#passwordTabPanel");
const adminTabPanel = document.querySelector("#adminTabPanel");
const tabList = document.querySelector(".tab-list");
const changePasswordForm = document.querySelector("#changePasswordForm");
const currentPasswordInput = document.querySelector("#currentPasswordInput");
const newPasswordInput = document.querySelector("#newPasswordInput");
const newPasswordConfirmInput = document.querySelector("#newPasswordConfirmInput");
const passwordMessage = document.querySelector("#passwordMessage");
const adminList = document.querySelector("#adminList");
const adminMessage = document.querySelector("#adminMessage");
const resetRankingButton = document.querySelector("#resetRankingButton");
const scoreText = document.querySelector("#scoreText");
const timeText = document.querySelector("#timeText");
const bestText = document.querySelector("#bestText");
const speedModeBadge = document.querySelector("#speedModeBadge");
const hideModeBadge = document.querySelector("#hideModeBadge");
const purrModeBadge = document.querySelector("#purrModeBadge");
const canvas = document.querySelector("#gameCanvas");
const ctx = canvas.getContext("2d");

const keys = new Set();
let authMode = "login";
let currentUser = null;
let animationId = null;
let lastFrame = 0;
let nextDropAt = 0;
let touchDirection = 0;
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

function createGameState() {
  return {
    running: false,
    score: 0,
    timeLeft: GAME_SECONDS,
    elapsed: 0,
    drops: [],
    reaction: {
      type: "neutral",
      until: 0,
    },
    modes: {
      speedUntil: 0,
      hideUntil: 0,
      purrUntil: 0,
    },
    cat: {
      x: canvas.width / 2,
      y: canvas.height - 84,
      width: 104,
      height: 74,
      speed: 520,
    },
  };
}

function normalizeName(value) {
  return value.trim().replace(/\s+/g, " ");
}

function isAdmin(user) {
  return user?.role === "admin";
}

function setFieldMessage(element, message, isGood = false) {
  element.textContent = message;
  element.style.color = isGood ? "#288466" : "";
}

function setMessage(message, isGood = false) {
  setFieldMessage(authMessage, message, isGood);
}

function setPasswordMessage(message, isGood = false) {
  setFieldMessage(passwordMessage, message, isGood);
}

function setAdminMessage(message, isGood = false) {
  setFieldMessage(adminMessage, message, isGood);
}

function setAuthMode(mode) {
  authMode = mode;
  const isSignup = mode === "signup";

  authTitle.textContent = isSignup ? "새 계정을 만들어 시작하세요" : "로그인하고 츄르 랭킹에 도전하세요";
  authDescription.textContent = isSignup
    ? "아이디, 비밀번호, 비밀번호 확인을 입력하면 바로 게임을 시작할 수 있습니다."
    : "아이디와 비밀번호를 입력해 시작합니다. 기록은 서버에 저장됩니다.";
  confirmPasswordField.hidden = !isSignup;
  confirmPasswordInput.required = isSignup;
  passwordInput.autocomplete = isSignup ? "new-password" : "current-password";
  authSubmitButton.textContent = isSignup ? "가입 완료" : "로그인";
  signupButton.hidden = isSignup;
  loginModeButton.hidden = !isSignup;
  authForm.reset();
  setMessage("");
  usernameInput.focus();
}

function showGameFor(user) {
  currentUser = user;
  authPanel.hidden = true;
  gamePanel.hidden = false;
  profileBox.hidden = false;
  currentUserName.textContent = isAdmin(currentUser) ? `${currentUser.username} 관리자` : currentUser.username;
  scoreText.textContent = "0";
  timeText.textContent = GAME_SECONDS;
  bestText.textContent = currentUser.bestScore || 0;
  changePasswordForm.reset();
  setPasswordMessage("");
  setAdminMessage("");
  renderRanking();
  updateModeBadges();
  showGameOverlay("게임 시작");
  drawIntro();
}

function showAuth() {
  currentUser = null;
  stopGame();
  authPanel.hidden = false;
  gamePanel.hidden = true;
  profileBox.hidden = true;
  closeAccountModal();
  changePasswordForm.reset();
  setPasswordMessage("");
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
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  if (username.length < 2) {
    setMessage("아이디는 2글자 이상 입력해주세요.");
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
      body: { username, password },
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

  showAuth();
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
  changePasswordForm.reset();
  setPasswordMessage("");
  setAdminMessage("");
  accountModal.hidden = false;
  currentPasswordInput.focus();
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
  rankingList.innerHTML = "";

  try {
    const data = await requestApi("/api/rankings");
    const ranking = data.rankings || [];

    if (ranking.length === 0) {
      appendRankingItem("-", "아직 기록이 없습니다", 0);
      return;
    }

    ranking.forEach((account, index) => {
      appendRankingItem(index + 1, account.username, account.bestScore || 0);
    });
  } catch {
    appendRankingItem("-", "랭킹 서버 연결 필요", 0);
  }
}

function appendRankingItem(rankValue, username, scoreValue) {
  const item = document.createElement("li");
  const rank = document.createElement("span");
  const name = document.createElement("span");
  const score = document.createElement("span");
  name.className = "name";
  score.className = "score";
  rank.textContent = rankValue;
  name.textContent = username;
  score.textContent = scoreValue;
  item.append(rank, name, score);
  rankingList.append(item);
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
  const name = document.createElement("span");
  const meta = document.createElement("span");
  const actions = document.createElement("div");
  const resetButton = document.createElement("button");
  const deleteButton = document.createElement("button");

  item.className = "admin-account";
  main.className = "admin-account-main";
  name.className = "admin-account-name";
  meta.className = "admin-account-meta";
  actions.className = "admin-actions";
  resetButton.className = "secondary-button";
  deleteButton.className = "danger-button";

  name.textContent = account.username;
  meta.textContent = `최고 ${account.bestScore || 0}점 · ${account.gamesPlayed || 0}회`;
  resetButton.type = "button";
  deleteButton.type = "button";
  resetButton.textContent = "비밀번호 초기화";
  deleteButton.textContent = "계정 삭제";

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

  actions.append(resetButton, deleteButton);
  item.append(main, meta, actions);
  adminList.append(item);
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

function startGame() {
  stopGame();
  game = createGameState();
  game.running = true;
  hideGameOverlay();
  scoreText.textContent = "0";
  timeText.textContent = GAME_SECONDS;
  touchDirection = 0;
  updateModeBadges();
  lastFrame = performance.now();
  nextDropAt = 0;
  animationId = requestAnimationFrame(loop);
}

function stopGame() {
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
  game.running = false;
}

function finishGame() {
  const finalScore = game.score;
  stopGame();
  clearModes();
  drawFinish();
  showGameOverlay("다시하기", `${finalScore}점!`);
  submitScore(finalScore);
}

async function submitScore(score) {
  if (!currentUser) {
    return;
  }

  try {
    const data = await requestApi("/api/scores", {
      method: "POST",
      body: { score },
    });
    currentUser = data.user;
    bestText.textContent = currentUser.bestScore || 0;
    renderRanking();
  } catch {
    showGameOverlay("다시하기", `${score}점 · 저장 실패`);
  }
}

function showGameOverlay(buttonText, resultText = "") {
  startButton.textContent = buttonText;
  overlayResult.textContent = resultText;
  overlayResult.hidden = !resultText;
  gameOverlay.hidden = false;
}

function hideGameOverlay() {
  gameOverlay.hidden = true;
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
  game.elapsed += delta;
  game.timeLeft = Math.max(0, GAME_SECONDS - game.elapsed);
  timeText.textContent = Math.ceil(game.timeLeft);

  const keyboardDirection = (keys.has("ArrowRight") || keys.has("d") ? 1 : 0) - (keys.has("ArrowLeft") || keys.has("a") ? 1 : 0);
  const direction = touchDirection || keyboardDirection;
  const speedMultiplier = isSpeedModeActive() ? 1.75 : 1;
  game.cat.x += direction * game.cat.speed * speedMultiplier * delta;
  game.cat.x = clamp(game.cat.x, game.cat.width / 2 + 12, canvas.width - game.cat.width / 2 - 12);
  updateModeBadges();

  if (game.elapsed >= nextDropAt) {
    spawnDrop();
    nextDropAt = game.elapsed + Math.max(0.32, 0.82 - game.elapsed * 0.008);
  }

  game.drops.forEach((drop) => {
    drop.y += drop.speed * delta;
    drop.rotation += drop.spin * delta;
  });

  game.drops = game.drops.filter((drop) => {
    if (collides(drop)) {
      if (isHideModeActive()) {
        return true;
      }

      if (applyModeItem(drop)) {
        return false;
      }

      const scoreDelta = getDropScore(drop);
      game.score = Math.max(0, game.score + scoreDelta);
      scoreText.textContent = game.score;
      setCatReaction(scoreDelta < 0 ? "bad" : "good");
      return false;
    }

    return drop.y < canvas.height + 60;
  });

  if (game.timeLeft <= 0) {
    finishGame();
  }
}

function spawnDrop() {
  const roll = Math.random();
  const kind = getRandomDropKind(roll);
  const isGold = kind === "gold";
  const isBomb = kind === "bomb";
  const isToy = kind === "toy";
  const isBox = kind === "box";
  const isHand = kind === "hand";
  game.drops.push({
    x: 34 + Math.random() * (canvas.width - 68),
    y: -40,
    width: isBomb ? 42 : isBox ? 46 : isToy ? 42 : isHand ? 44 : isGold ? 34 : 28,
    height: isBomb ? 42 : isBox ? 38 : isToy ? 42 : isHand ? 48 : isGold ? 70 : 60,
    speed: 170 + Math.random() * 145 + game.elapsed * 2.3,
    rotation: Math.random() * Math.PI,
    spin: (Math.random() - 0.5) * 3,
    kind,
  });
}

function getRandomDropKind(roll) {
  if (roll < 0.04) return "box";
  if (roll < 0.10) return "toy";
  if (roll < 0.16) return "hand";
  if (roll < 0.30) return "bomb";
  if (roll < 0.46) return "gold";
  return "normal";
}

function getDropScore(drop) {
  if (drop.kind === "bomb") {
    return -3;
  }

  const baseScore = drop.kind === "gold" ? 5 : 2;
  return isPurrModeActive() ? baseScore * 2 : baseScore;
}

function applyModeItem(drop) {
  if (drop.kind === "toy") {
    game.modes.speedUntil = game.elapsed + 5;
    setCatReaction("good");
    updateModeBadges();
    return true;
  }

  if (drop.kind === "box") {
    game.modes.hideUntil = game.elapsed + 3;
    updateModeBadges();
    return true;
  }

  if (drop.kind === "hand") {
    game.modes.purrUntil = game.elapsed + 5;
    setCatReaction("good");
    updateModeBadges();
    return true;
  }

  return false;
}

function setCatReaction(type) {
  game.reaction = {
    type,
    until: game.elapsed + 0.45,
  };
}

function getCatReaction() {
  if (isHideModeActive()) {
    return "box";
  }

  return game.reaction?.until >= game.elapsed ? game.reaction.type : "neutral";
}

function isSpeedModeActive() {
  return game.modes.speedUntil > game.elapsed;
}

function isHideModeActive() {
  return game.modes.hideUntil > game.elapsed;
}

function isPurrModeActive() {
  return game.modes.purrUntil > game.elapsed;
}

function getModeSecondsLeft(until) {
  return Math.max(0, Math.ceil(until - game.elapsed));
}

function updateModeBadges() {
  updateModeBadge(speedModeBadge, isSpeedModeActive(), `우다다 ${getModeSecondsLeft(game.modes.speedUntil)}초`);
  updateModeBadge(hideModeBadge, isHideModeActive(), `숨숨집 ${getModeSecondsLeft(game.modes.hideUntil)}초`);
  updateModeBadge(purrModeBadge, isPurrModeActive(), `골골송 ${getModeSecondsLeft(game.modes.purrUntil)}초`);
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
  updateModeBadges();
}

function collides(drop) {
  const catLeft = game.cat.x - game.cat.width / 2;
  const catRight = game.cat.x + game.cat.width / 2;
  const catTop = game.cat.y - game.cat.height / 2;
  const catBottom = game.cat.y + game.cat.height / 2;
  const dropLeft = drop.x - drop.width / 2;
  const dropRight = drop.x + drop.width / 2;
  const dropTop = drop.y - drop.height / 2;
  const dropBottom = drop.y + drop.height / 2;

  return dropRight > catLeft && dropLeft < catRight && dropBottom > catTop && dropTop < catBottom;
}

function draw() {
  drawWorld();
  game.drops.forEach(drawChuru);
  drawCat(game.cat.x, game.cat.y, game.cat.width, game.cat.height, getCatReaction());
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

function drawToy(drop) {
  const outer = drop.width / 2;
  const inner = outer * 0.45;

  ctx.fillStyle = "rgba(142, 215, 245, 0.26)";
  ctx.beginPath();
  ctx.arc(0, 0, outer + 7, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#8ed7f5";
  ctx.beginPath();
  for (let index = 0; index < 10; index += 1) {
    const radius = index % 2 === 0 ? outer : inner;
    const angle = -Math.PI / 2 + index * Math.PI / 5;
    const px = Math.cos(angle) * radius;
    const py = Math.sin(angle) * radius;

    if (index === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#fffaf2";
  ctx.beginPath();
  ctx.arc(0, 0, 5, 0, Math.PI * 2);
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

function drawCat(x, y, width, height, reaction = "neutral") {
  ctx.save();
  ctx.translate(x, y);

  if (reaction === "box") {
    drawBoxCat(width, height);
    ctx.restore();
    return;
  }

  ctx.fillStyle = "rgba(37, 33, 29, 0.14)";
  ctx.beginPath();
  ctx.ellipse(0, height / 2 + 9, width * 0.55, 13, 0, 0, Math.PI * 2);
  ctx.fill();

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

  if (isPurrModeActive()) {
    drawPurrBubble(width, height);
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

function drawPurrBubble(width, height) {
  ctx.save();
  ctx.translate(width * 0.32, -height * 0.54);
  ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
  roundRect(-12, -26, 112, 36, 8);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(5, 8);
  ctx.lineTo(-7, 22);
  ctx.lineTo(23, 8);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#ef6f8f";
  ctx.textAlign = "center";
  ctx.font = "800 16px Nunito, sans-serif";
  ctx.fillText("골골골골~", 44, -3);
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
}

function drawFinish() {
  drawWorld();
  drawCat(game.cat.x, game.cat.y, game.cat.width, game.cat.height, getCatReaction());
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

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
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

function bindTouchControl(button, direction) {
  const start = (event) => {
    touchDirection = direction;
    button.classList.add("pressed");
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
}

window.addEventListener("keydown", (event) => {
  const controlKey = getControlKey(event.key);

  if (controlKey && game.running && accountModal.hidden && !isTypingTarget(event.target)) {
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
accountModal.addEventListener("click", (event) => {
  if (event.target === accountModal) {
    closeAccountModal();
  }
});
passwordTabButton.addEventListener("click", () => setAccountTab("password"));
adminTabButton.addEventListener("click", () => setAccountTab("admin"));
startButton.addEventListener("click", startGame);
changePasswordForm.addEventListener("submit", changePassword);
bindTouchControl(touchLeftButton, -1);
bindTouchControl(touchRightButton, 1);
resetRankingButton.addEventListener("click", resetRankings);

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !accountModal.hidden) {
    closeAccountModal();
  }
});

showAuth();
renderRanking();
