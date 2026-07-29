const STORAGE_KEY = "catnyam_accounts_v1";
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
const scoreText = document.querySelector("#scoreText");
const timeText = document.querySelector("#timeText");
const bestText = document.querySelector("#bestText");
const canvas = document.querySelector("#gameCanvas");
const ctx = canvas.getContext("2d");

const keys = new Set();
let authMode = "login";
let currentUser = null;
let animationId = null;
let lastFrame = 0;
let nextDropAt = 0;
let game = createGameState();

function readAccounts() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function writeAccounts(accounts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
}

function ensureAccountRoles() {
  const accounts = readAccounts();
  let changed = false;

  accounts.forEach((account) => {
    if (!account.role) {
      account.role = "user";
      changed = true;
    }
  });

  if (changed) {
    writeAccounts(accounts);
  }
}

function createGameState() {
  return {
    running: false,
    score: 0,
    timeLeft: GAME_SECONDS,
    elapsed: 0,
    drops: [],
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

function sameUsername(left, right) {
  return String(left || "").toLowerCase() === String(right || "").toLowerCase();
}

function findAccount(username) {
  return readAccounts().find((account) => sameUsername(account.username, username));
}

function hasAdminAccount(accounts = readAccounts()) {
  return accounts.some((account) => isAdmin(account));
}

function isAdmin(account) {
  return account?.role === "admin";
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
    : "아이디와 비밀번호를 입력해 시작합니다. 기록은 이 브라우저에 저장됩니다.";
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

function showGameFor(username) {
  currentUser = findAccount(username);
  if (!currentUser) {
    return;
  }

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
  renderAdminList();
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

function handleAuthSubmit(event) {
  event.preventDefault();

  if (authMode === "signup") {
    signup();
    return;
  }

  login();
}

function signup() {
  const username = normalizeName(usernameInput.value);
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;
  const accounts = readAccounts();

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

  if (findAccount(username)) {
    setMessage("이미 사용 중인 아이디입니다.");
    return;
  }

  const shouldCreateAdmin = !hasAdminAccount(accounts);
  accounts.push({
    username,
    password,
    role: shouldCreateAdmin ? "admin" : "user",
    bestScore: 0,
    gamesPlayed: 0,
    createdAt: new Date().toISOString(),
  });
  writeAccounts(accounts);
  setMessage(shouldCreateAdmin ? "첫 관리자 계정으로 가입되었습니다." : "가입 완료! 바로 시작해볼까요?", true);
  showGameFor(username);
}

function login() {
  const username = normalizeName(usernameInput.value);
  const password = passwordInput.value;
  const account = findAccount(username);

  if (!account || account.password !== password) {
    setMessage("아이디 또는 비밀번호를 확인해주세요.");
    return;
  }

  showGameFor(account.username);
}

function changePassword(event) {
  event.preventDefault();

  if (!currentUser) {
    return;
  }

  const currentPassword = currentPasswordInput.value;
  const newPassword = newPasswordInput.value;
  const confirmPassword = newPasswordConfirmInput.value;

  if (currentPassword !== currentUser.password) {
    setPasswordMessage("현재 비밀번호를 확인해주세요.");
    return;
  }

  if (newPassword.length < 4) {
    setPasswordMessage("새 비밀번호는 4글자 이상 입력해주세요.");
    return;
  }

  if (newPassword !== confirmPassword) {
    setPasswordMessage("새 비밀번호 확인이 일치하지 않습니다.");
    return;
  }

  const accounts = readAccounts();
  const account = accounts.find((item) => sameUsername(item.username, currentUser.username));

  if (!account) {
    setPasswordMessage("계정을 찾을 수 없습니다.");
    return;
  }

  account.password = newPassword;
  account.updatedAt = new Date().toISOString();
  writeAccounts(accounts);
  currentUser = account;
  changePasswordForm.reset();
  setPasswordMessage("비밀번호가 변경되었습니다.", true);
  renderAdminList();
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
  renderAdminList();
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

function renderRanking() {
  const ranking = readAccounts()
    .slice()
    .sort((a, b) => (b.bestScore || 0) - (a.bestScore || 0) || a.username.localeCompare(b.username))
    .slice(0, 10);

  rankingList.innerHTML = "";

  if (ranking.length === 0) {
    const item = document.createElement("li");
    const rank = document.createElement("span");
    const name = document.createElement("span");
    const score = document.createElement("span");
    name.className = "name";
    score.className = "score";
    rank.textContent = "-";
    name.textContent = "아직 기록이 없습니다";
    score.textContent = "0";
    item.append(rank, name, score);
    rankingList.append(item);
    return;
  }

  ranking.forEach((account, index) => {
    const item = document.createElement("li");
    const rank = document.createElement("span");
    const name = document.createElement("span");
    const score = document.createElement("span");
    name.className = "name";
    score.className = "score";
    rank.textContent = index + 1;
    name.textContent = account.username;
    score.textContent = account.bestScore || 0;
    item.append(rank, name, score);
    rankingList.append(item);
  });
}

function renderAdminList() {
  if (!isAdmin(currentUser)) {
    adminList.innerHTML = "";
    return;
  }

  const accounts = readAccounts()
    .slice()
    .sort((a, b) => {
      if (isAdmin(a) !== isAdmin(b)) {
        return isAdmin(a) ? -1 : 1;
      }

      return a.username.localeCompare(b.username);
    });

  adminList.innerHTML = "";

  accounts.forEach((account) => {
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
      resetButton.addEventListener("click", () => resetAccountPassword(account.username));
      deleteButton.addEventListener("click", () => deleteAccount(account.username));
    }

    actions.append(resetButton, deleteButton);
    item.append(main, meta, actions);
    adminList.append(item);
  });
}

function resetAccountPassword(username) {
  const accounts = readAccounts();
  const account = accounts.find((item) => sameUsername(item.username, username));

  if (!account || isAdmin(account)) {
    setAdminMessage("관리자 계정은 여기서 초기화할 수 없습니다.");
    return;
  }

  const temporaryPassword = generateTemporaryPassword();
  account.password = temporaryPassword;
  account.updatedAt = new Date().toISOString();
  writeAccounts(accounts);
  setAdminMessage(`${account.username} 임시 비밀번호: ${temporaryPassword}`, true);
  renderAdminList();
}

function generateTemporaryPassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const values = new Uint32Array(10);

  if (window.crypto?.getRandomValues) {
    window.crypto.getRandomValues(values);
  } else {
    values.forEach((_, index) => {
      values[index] = Math.floor(Math.random() * chars.length);
    });
  }

  return Array.from(values, (value) => chars[value % chars.length]).join("");
}

function deleteAccount(username) {
  const account = findAccount(username);

  if (!account || isAdmin(account)) {
    setAdminMessage("관리자 계정은 삭제할 수 없습니다.");
    return;
  }

  if (!window.confirm(`${account.username} 계정을 삭제할까요?`)) {
    return;
  }

  const accounts = readAccounts().filter((item) => !sameUsername(item.username, username));
  writeAccounts(accounts);
  setAdminMessage(`${account.username} 계정을 삭제했습니다.`, true);
  renderRanking();
  renderAdminList();
}

function startGame() {
  stopGame();
  game = createGameState();
  game.running = true;
  startButton.textContent = "다시 시작";
  scoreText.textContent = "0";
  timeText.textContent = GAME_SECONDS;
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
  stopGame();
  const accounts = readAccounts();
  const account = accounts.find((item) => sameUsername(item.username, currentUser.username));

  if (account) {
    account.gamesPlayed = (account.gamesPlayed || 0) + 1;
    account.bestScore = Math.max(account.bestScore || 0, game.score);
    account.lastScore = game.score;
    account.updatedAt = new Date().toISOString();
    writeAccounts(accounts);
    currentUser = account;
  }

  bestText.textContent = currentUser.bestScore || 0;
  renderRanking();
  renderAdminList();
  drawFinish();
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

  const direction = (keys.has("ArrowRight") || keys.has("d") ? 1 : 0) - (keys.has("ArrowLeft") || keys.has("a") ? 1 : 0);
  game.cat.x += direction * game.cat.speed * delta;
  game.cat.x = clamp(game.cat.x, game.cat.width / 2 + 12, canvas.width - game.cat.width / 2 - 12);

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
      game.score += drop.kind === "gold" ? 5 : 2;
      scoreText.textContent = game.score;
      return false;
    }

    return drop.y < canvas.height + 60;
  });

  if (game.timeLeft <= 0) {
    finishGame();
  }
}

function spawnDrop() {
  const isGold = Math.random() < 0.16;
  game.drops.push({
    x: 34 + Math.random() * (canvas.width - 68),
    y: -40,
    width: isGold ? 34 : 28,
    height: isGold ? 70 : 60,
    speed: 170 + Math.random() * 145 + game.elapsed * 2.3,
    rotation: Math.random() * Math.PI,
    spin: (Math.random() - 0.5) * 3,
    kind: isGold ? "gold" : "normal",
  });
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
  drawCat(game.cat.x, game.cat.y, game.cat.width, game.cat.height);
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

function drawCat(x, y, width, height) {
  ctx.save();
  ctx.translate(x, y);

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

  ctx.fillStyle = "#332923";
  ctx.beginPath();
  ctx.arc(-width * 0.16, -height * 0.03, 5, 0, Math.PI * 2);
  ctx.arc(width * 0.16, -height * 0.03, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#332923";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(0, height * 0.05);
  ctx.quadraticCurveTo(-8, height * 0.16, -18, height * 0.08);
  ctx.moveTo(0, height * 0.05);
  ctx.quadraticCurveTo(8, height * 0.16, 18, height * 0.08);
  ctx.stroke();

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
}

function drawIntro() {
  drawWorld();
  drawCat(canvas.width / 2, canvas.height - 84, 104, 74);
  drawCenterText("← → 또는 A D로 이동", "게임 시작을 눌러 츄르를 잡아보세요");
}

function drawFinish() {
  drawWorld();
  drawCat(game.cat.x, game.cat.y, game.cat.width, game.cat.height);
  drawCenterText(`${game.score}점!`, "다시 시작해서 최고 기록을 노려보세요");
}

function drawCenterText(title, subtitle) {
  ctx.save();
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  roundRect(canvas.width / 2 - 210, 180, 420, 110, 8);
  ctx.fill();
  ctx.fillStyle = "#25211d";
  ctx.textAlign = "center";
  ctx.font = "800 34px Nunito, sans-serif";
  ctx.fillText(title, canvas.width / 2, 226);
  ctx.font = "700 18px Nunito, sans-serif";
  ctx.fillStyle = "#746b62";
  ctx.fillText(subtitle, canvas.width / 2, 260);
  ctx.restore();
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
logoutButton.addEventListener("click", showAuth);
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

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !accountModal.hidden) {
    closeAccountModal();
  }
});

ensureAccountRoles();
showAuth();
