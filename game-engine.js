(function attachGameEngine(root, factory) {
  const engine = factory();

  if (typeof module === "object" && module.exports) {
    module.exports = engine;
  }

  root.CatnyamEngine = engine;
})(typeof globalThis !== "undefined" ? globalThis : this, function createGameEngine() {
  const GAME_SECONDS = 60;
  const GAME_MODES = {
    CHURU: "churu",
    BOMB: "bomb",
  };
  const STEP_SECONDS = 1 / 60;
  const TOTAL_STEPS = Math.round(GAME_SECONDS / STEP_SECONDS);
  const MAX_BOMB_STEPS = Math.round((3 * 60 * 60) / STEP_SECONDS);
  const CANVAS_WIDTH = 900;
  const CANVAS_HEIGHT = 560;
  const CAT_BASE_WIDTH = 104;
  const CAT_BASE_HEIGHT = 74;
  const CAT_BASE_Y = CANVAS_HEIGHT - 84;
  const CAT_BASE_SPEED = 520;
  const CHURU_MAX_PLAY_SECONDS = 5 * 60;
  const MAX_CHURU_STEPS = Math.round(CHURU_MAX_PLAY_SECONDS / STEP_SECONDS);
  const MAX_CHURU_INPUT_EVENTS = MAX_CHURU_STEPS + 1;
  const MAX_BOMB_INPUT_EVENTS = 20000;
  const TIME_EPSILON = 1e-9;
  const CHURU_TIMER_SECONDS = 5;
  const CHURU_FIRST_TIMER_MIN_SECONDS = 8;
  const CHURU_FIRST_TIMER_MAX_SECONDS = 30;
  const CHURU_TIMER_MIN_INTERVAL = 25;
  const CHURU_TIMER_MAX_INTERVAL = 55;
  const BOMB_START_HEARTS = 3;
  const BOMB_RAIN_INTERVAL = 15;
  const BOMB_FIRST_HEART_MIN_SECONDS = 8;
  const BOMB_FIRST_HEART_MAX_SECONDS = 30;
  const BOMB_HEART_MIN_INTERVAL = 25;
  const BOMB_HEART_MAX_INTERVAL = 55;
  const BOMB_FIRST_CATNIP_MIN_SECONDS = 8;
  const BOMB_FIRST_CATNIP_MAX_SECONDS = 24;
  const BOMB_CATNIP_MIN_INTERVAL = 18;
  const BOMB_CATNIP_MAX_INTERVAL = 38;
  const BOMB_FIRST_BOX_MIN_SECONDS = 10;
  const BOMB_FIRST_BOX_MAX_SECONDS = 28;
  const BOMB_BOX_MIN_INTERVAL = 20;
  const BOMB_BOX_MAX_INTERVAL = 42;
  const BOMB_FIRST_SKULL_MIN_SECONDS = 12;
  const BOMB_FIRST_SKULL_MAX_SECONDS = 30;
  const BOMB_SKULL_MIN_INTERVAL = 24;
  const BOMB_SKULL_MAX_INTERVAL = 52;
  const BOMB_FIRST_COIN_MIN_SECONDS = 15;
  const BOMB_FIRST_COIN_MAX_SECONDS = 32;
  const BOMB_COIN_MIN_INTERVAL = 29;
  const BOMB_COIN_MAX_INTERVAL = 56;
  const BOMB_GOLD_WINDOW_SECONDS = 1;
  const SURVIVAL_SCORE_INTERVAL = 0.1;

  function normalizeGameMode(mode) {
    return mode === GAME_MODES.BOMB ? GAME_MODES.BOMB : GAME_MODES.CHURU;
  }

  function normalizeLoadout(loadout = {}) {
    const companionLeft = loadout.companionLeft || null;
    const companionRight = loadout.companionRight === companionLeft ? null : loadout.companionRight || null;

    return {
      character: String(loadout.character || "calico"),
      companionLeft: companionLeft ? String(companionLeft) : null,
      companionRight: companionRight ? String(companionRight) : null,
      background: String(loadout.background || "village"),
    };
  }

  function hasCompanion(state, companionId) {
    return state.loadout.companionLeft === companionId || state.loadout.companionRight === companionId;
  }

  function createWindowDropSchedule(rng, windowSeconds, chance) {
    return {
      windowStart: 0,
      windowSeconds,
      chance,
      dropAt: rng() < chance ? rng() * windowSeconds : null,
    };
  }

  function advanceWindowDropSchedule(state, schedule) {
    schedule.windowStart += schedule.windowSeconds;
    schedule.dropAt = state.rng() < schedule.chance
      ? schedule.windowStart + state.rng() * schedule.windowSeconds
      : null;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function hashSeed(seed) {
    let hash = 1779033703 ^ seed.length;

    for (let index = 0; index < seed.length; index += 1) {
      hash = Math.imul(hash ^ seed.charCodeAt(index), 3432918353);
      hash = (hash << 13) | (hash >>> 19);
    }

    return function nextHash() {
      hash = Math.imul(hash ^ (hash >>> 16), 2246822507);
      hash = Math.imul(hash ^ (hash >>> 13), 3266489909);
      hash ^= hash >>> 16;
      return hash >>> 0;
    };
  }

  function createRng(seed) {
    const nextHash = hashSeed(String(seed || "catnyam"));
    let a = nextHash();
    let b = nextHash();
    let c = nextHash();
    let d = nextHash();

    return function random() {
      a >>>= 0;
      b >>>= 0;
      c >>>= 0;
      d >>>= 0;

      const sum = (a + b) | 0;
      a = b ^ (b >>> 9);
      b = (c + (c << 3)) | 0;
      c = (c << 21) | (c >>> 11);
      d = (d + 1) | 0;
      const result = (sum + d) | 0;
      c = (c + result) | 0;

      return (result >>> 0) / 4294967296;
    };
  }

  function createGameState(options = {}) {
    const seed = String(options.seed || "catnyam-local");
    const gameMode = normalizeGameMode(options.mode);
    const loadout = normalizeLoadout(options.loadout);
    const rng = createRng(seed);
    const churuModeState = gameMode === GAME_MODES.CHURU
      ? {
        durationSeconds: GAME_SECONDS,
        nextTimerAt: CHURU_FIRST_TIMER_MIN_SECONDS
          + rng() * (CHURU_FIRST_TIMER_MAX_SECONDS - CHURU_FIRST_TIMER_MIN_SECONDS),
      }
      : {};
    const bombModeState = gameMode === GAME_MODES.BOMB
      ? {
        hearts: BOMB_START_HEARTS + (loadout.companionLeft === "mole" || loadout.companionRight === "mole" ? 1 : 0),
        nextDropAt: 0.4,
        nextBombRainAt: BOMB_RAIN_INTERVAL,
        nextSurvivalScoreAt: SURVIVAL_SCORE_INTERVAL,
        nextHeartAt: BOMB_FIRST_HEART_MIN_SECONDS
          + rng() * (BOMB_FIRST_HEART_MAX_SECONDS - BOMB_FIRST_HEART_MIN_SECONDS),
        nextCatnipAt: BOMB_FIRST_CATNIP_MIN_SECONDS
          + rng() * (BOMB_FIRST_CATNIP_MAX_SECONDS - BOMB_FIRST_CATNIP_MIN_SECONDS),
        nextBoxAt: BOMB_FIRST_BOX_MIN_SECONDS
          + rng() * (BOMB_FIRST_BOX_MAX_SECONDS - BOMB_FIRST_BOX_MIN_SECONDS),
        nextSkullAt: BOMB_FIRST_SKULL_MIN_SECONDS
          + rng() * (BOMB_FIRST_SKULL_MAX_SECONDS - BOMB_FIRST_SKULL_MIN_SECONDS),
        nextCoinAt: BOMB_FIRST_COIN_MIN_SECONDS
          + rng() * (BOMB_FIRST_COIN_MAX_SECONDS - BOMB_FIRST_COIN_MIN_SECONDS),
        bombSpecialSchedules: {
          gold: createWindowDropSchedule(rng, BOMB_GOLD_WINDOW_SECONDS, 1),
        },
        gameOver: false,
      }
      : {};

    return {
      seed,
      gameMode,
      loadout,
      rng,
      step: 0,
      score: 0,
      coins: 0,
      timeLeft: gameMode === GAME_MODES.BOMB ? Number.POSITIVE_INFINITY : GAME_SECONDS,
      durationSeconds: gameMode === GAME_MODES.BOMB ? Number.POSITIVE_INFINITY : GAME_SECONDS,
      elapsed: 0,
      nextDropAt: 0,
      nextDropId: 1,
      drops: [],
      modes: {
        speedUntil: 0,
        hideUntil: 0,
        purrUntil: 0,
        catnipUntil: 0,
        tunaUntil: 0,
        clipperUntil: 0,
        skullUntil: 0,
      },
      specialSpawns: {
        tuna: 0,
        clipper: 0,
      },
      specialSpawnLimits: {
        tuna: Math.floor(rng() * 4),
        clipper: Math.floor(rng() * 4),
      },
      cat: {
        x: CANVAS_WIDTH / 2,
        y: CAT_BASE_Y,
        width: CAT_BASE_WIDTH,
        height: CAT_BASE_HEIGHT,
        speed: CAT_BASE_SPEED,
      },
      ...churuModeState,
      ...bombModeState,
    };
  }

  function isSpeedModeActive(state) {
    return state.modes.speedUntil > state.elapsed;
  }

  function isHideModeActive(state) {
    return state.modes.hideUntil > state.elapsed;
  }

  function isPurrModeActive(state) {
    return state.modes.purrUntil > state.elapsed;
  }

  function isCatnipModeActive(state) {
    return state.modes.catnipUntil > state.elapsed;
  }

  function isTunaModeActive(state) {
    return state.modes.tunaUntil > state.elapsed;
  }

  function isClipperModeActive(state) {
    return state.modes.clipperUntil > state.elapsed;
  }

  function isSkullModeActive(state) {
    return state.modes.skullUntil > state.elapsed;
  }

  function getCatScale(state) {
    return isCatnipModeActive(state) ? 1.4 : 1;
  }

  function getCatWidth(state) {
    return state.cat.width * getCatScale(state);
  }

  function getCatHeight(state) {
    return state.cat.height * getCatScale(state);
  }

  function canSpawnLimitedDrop(state, kind) {
    return state.specialSpawns[kind] < state.specialSpawnLimits[kind];
  }

  function noteDropSpawned(state, kind) {
    if (kind === "tuna" || kind === "clipper") {
      state.specialSpawns[kind] += 1;
    }
  }

  function pickWeightedKind(state, entries) {
    const totalWeight = entries.reduce((total, [, weight]) => total + weight, 0);
    let roll = state.rng() * totalWeight;

    for (const [kind, weight] of entries) {
      roll -= weight;

      if (roll <= 0) {
        return kind;
      }
    }

    return "normal";
  }

  function getRandomDropKind(state) {
    return pickWeightedKind(state, [
      ["catnip", 0.035],
      ["box", 0.04],
      ["toy", 0.06],
      ["hand", 0.06],
      ["tuna", canSpawnLimitedDrop(state, "tuna") ? 0.045 : 0],
      ["clipper", canSpawnLimitedDrop(state, "clipper") ? 0.045 : 0],
      ["skull", 0.045],
      ["coin", 0.02],
      ["bomb", 0.135],
      ["gold", 0.16],
      ["normal", 0.44],
    ]);
  }

  function addDrop(state, kind, options = {}) {
    const isGold = kind === "gold";
    const isBomb = kind === "bomb";
    const isToy = kind === "toy";
    const isBox = kind === "box";
    const isHand = kind === "hand";
    const isCatnip = kind === "catnip";
    const isTuna = kind === "tuna";
    const isClipper = kind === "clipper";
    const isHeart = kind === "heart";
    const isTimer = kind === "timer";
    const isSkull = kind === "skull";
    const isCoin = kind === "coin";

    noteDropSpawned(state, kind);
    state.drops.push({
      id: state.nextDropId,
      x: options.x ?? 34 + state.rng() * (CANVAS_WIDTH - 68),
      y: options.y ?? -40,
      width: options.width ?? (isBomb ? 42 : isBox ? 46 : isToy ? 42 : isHand ? 48 : isCatnip ? 46 : isTuna ? 44 : isClipper ? 48 : isHeart ? 42 : isTimer ? 42 : isSkull ? 44 : isCoin ? 40 : isGold ? 34 : 28),
      height: options.height ?? (isBomb ? 42 : isBox ? 38 : isToy ? 42 : isHand ? 48 : isCatnip ? 46 : isTuna ? 42 : isClipper ? 34 : isHeart ? 38 : isTimer ? 42 : isSkull ? 44 : isCoin ? 40 : isGold ? 70 : 60),
      speed: options.speed ?? 170 + state.rng() * 145 + state.elapsed * 2.3,
      rotation: options.rotation ?? state.rng() * Math.PI,
      spin: (state.rng() - 0.5) * 3,
      kind,
    });
    state.nextDropId += 1;
  }

  function spawnExtraChuruDrops(state) {
    if (isTunaModeActive(state)) {
      addDrop(state, "gold");

      if (state.rng() < 0.7) {
        addDrop(state, "gold");
      }

      return;
    }

    const roll = state.rng();

    if (roll < 0.36) {
      addDrop(state, "normal");
    } else if (roll < 0.48) {
      addDrop(state, "gold");
    }
  }

  function spawnExtraBombDrops(state) {
    if (isClipperModeActive(state)) {
      addDrop(state, "bomb");

      if (state.rng() < 0.7) {
        addDrop(state, "bomb");
      }

      return;
    }

    if (state.rng() < 0.16) {
      addDrop(state, "bomb");
    }
  }

  function spawnDrop(state) {
    const kind = getRandomDropKind(state);
    addDrop(state, kind);
    spawnExtraChuruDrops(state);
    spawnExtraBombDrops(state);
  }

  function spawnBombAvoidDrop(state) {
    const pressure = Math.min(1, state.elapsed / 180);
    addDrop(state, "bomb", {
      width: 38,
      height: 38,
      speed: 155 + state.rng() * 95 + state.elapsed * 1.65,
    });

    if (state.elapsed > 1.5 && state.rng() < 0.24 + pressure * 0.12) {
      addDrop(state, "bomb", {
        width: 38,
        height: 38,
        y: -70 - state.rng() * 90,
        speed: 165 + state.rng() * 105 + state.elapsed * 1.8,
      });
    }

    if (state.elapsed > 7 && state.rng() < 0.34 + pressure * 0.24) {
      addDrop(state, "bomb", {
        width: 38,
        height: 38,
        y: -80 - state.rng() * 80,
        speed: 170 + state.rng() * 110 + state.elapsed * 1.9,
      });
    }

    if (state.elapsed > 30 && state.rng() < pressure * 0.12) {
      addDrop(state, "bomb", {
        width: 38,
        height: 38,
        y: -140 - state.rng() * 120,
        speed: 185 + state.rng() * 120 + state.elapsed * 2,
      });
    }
  }

  function spawnChuruTimerDrop(state) {
    addDrop(state, "timer", {
      speed: 150 + state.rng() * 80,
      rotation: 0,
    });
    state.nextTimerAt = state.elapsed + CHURU_TIMER_MIN_INTERVAL
      + state.rng() * (CHURU_TIMER_MAX_INTERVAL - CHURU_TIMER_MIN_INTERVAL);
  }

  function spawnHeartDrop(state) {
    addDrop(state, "heart", {
      speed: 155 + state.rng() * 80,
      rotation: 0,
    });
    state.nextHeartAt = state.elapsed + BOMB_HEART_MIN_INTERVAL
      + state.rng() * (BOMB_HEART_MAX_INTERVAL - BOMB_HEART_MIN_INTERVAL);
  }

  function spawnBombModeCatnipDrop(state) {
    addDrop(state, "catnip", {
      speed: 145 + state.rng() * 75 + state.elapsed * 0.55,
      rotation: 0,
    });
    state.nextCatnipAt = state.elapsed + BOMB_CATNIP_MIN_INTERVAL
      + state.rng() * (BOMB_CATNIP_MAX_INTERVAL - BOMB_CATNIP_MIN_INTERVAL);
  }

  function spawnBombModeBoxDrop(state) {
    addDrop(state, "box", {
      speed: 150 + state.rng() * 75 + state.elapsed * 0.55,
      rotation: 0,
    });
    state.nextBoxAt = state.elapsed + BOMB_BOX_MIN_INTERVAL
      + state.rng() * (BOMB_BOX_MAX_INTERVAL - BOMB_BOX_MIN_INTERVAL);
  }

  function spawnBombModeSkullDrop(state) {
    addDrop(state, "skull", {
      speed: 155 + state.rng() * 85 + state.elapsed * 0.55,
      rotation: 0,
    });
    state.nextSkullAt = state.elapsed + BOMB_SKULL_MIN_INTERVAL
      + state.rng() * (BOMB_SKULL_MAX_INTERVAL - BOMB_SKULL_MIN_INTERVAL);
  }

  function spawnBombModeCoinDrop(state) {
    addDrop(state, "coin", {
      speed: 150 + state.rng() * 80 + state.elapsed * 0.5,
      rotation: 0,
    });
    state.nextCoinAt = state.elapsed + BOMB_COIN_MIN_INTERVAL
      + state.rng() * (BOMB_COIN_MAX_INTERVAL - BOMB_COIN_MIN_INTERVAL);
  }

  function spawnBombModeGoldDrop(state) {
    addDrop(state, "gold", {
      speed: 155 + state.rng() * 85 + state.elapsed * 0.75,
    });

    if (state.rng() < 0.55) {
      addDrop(state, "gold", {
        y: -95 - state.rng() * 80,
        speed: 165 + state.rng() * 95 + state.elapsed * 0.8,
      });
    }
  }

  function spawnBombRain(state, events) {
    const count = 4 + Math.min(1, Math.floor(state.elapsed / 90));

    for (let index = 0; index < count; index += 1) {
      const lane = (index + 0.16 + state.rng() * 0.68) / count;
      addDrop(state, "bomb", {
        width: 38,
        height: 38,
        x: 34 + lane * (CANVAS_WIDTH - 68),
        y: -50 - state.rng() * 260,
        speed: 285 + state.rng() * 145 + state.elapsed * 2.25,
      });
    }

    state.nextBombRainAt += BOMB_RAIN_INTERVAL;
    events.push({ type: "rain" });
  }

  function spawnBombAvoidDrops(state, events) {
    if (state.elapsed >= state.nextDropAt) {
      spawnBombAvoidDrop(state);
      state.nextDropAt = state.elapsed + Math.max(0.24, 0.5 - state.elapsed * 0.0015);
    }

    if (state.elapsed >= state.nextHeartAt) {
      spawnHeartDrop(state);
    }

    if (state.elapsed >= state.nextCatnipAt) {
      spawnBombModeCatnipDrop(state);
    }

    if (state.elapsed >= state.nextBoxAt) {
      spawnBombModeBoxDrop(state);
    }

    if (state.elapsed >= state.nextSkullAt) {
      spawnBombModeSkullDrop(state);
    }

    if (state.elapsed >= state.nextCoinAt) {
      spawnBombModeCoinDrop(state);
    }

    maybeSpawnBombModeWindowDrop(state, state.bombSpecialSchedules?.gold, spawnBombModeGoldDrop);

    while (state.elapsed >= state.nextBombRainAt) {
      spawnBombRain(state, events);
    }
  }

  function maybeSpawnBombModeWindowDrop(state, schedule, spawnDrop) {
    if (!schedule) {
      return;
    }

    while (state.elapsed >= schedule.windowStart + schedule.windowSeconds) {
      advanceWindowDropSchedule(state, schedule);
    }

    if (schedule.dropAt !== null && state.elapsed >= schedule.dropAt) {
      spawnDrop(state);
      advanceWindowDropSchedule(state, schedule);
    }
  }

  function getScoreMultiplier(state) {
    let multiplier = 1;

    if (isPurrModeActive(state)) {
      multiplier *= 2;
    }

    if (isCatnipModeActive(state)) {
      multiplier *= 2;
    }

    return multiplier;
  }

  function getDropScore(state, drop) {
    if (drop.kind === "bomb") {
      return -3;
    }

    const baseScore = (drop.kind === "gold" ? 5 : 2) + (hasCompanion(state, "rabbit") ? 1 : 0);
    return baseScore * getScoreMultiplier(state);
  }

  function applyScoreDelta(state, scoreDelta, events, source = "item") {
    state.score = Math.max(0, state.score + scoreDelta);
    events.push({
      type: "score",
      scoreDelta,
      score: state.score,
      source,
      x: state.cat.x,
      y: state.cat.y,
    });
  }

  function getBombModeItemScore(state, baseScore) {
    const companionBonus = hasCompanion(state, "rabbit") ? 1 : 0;
    return (baseScore + companionBonus) * (isCatnipModeActive(state) ? 2 : 1);
  }

  function applyCoin(state, events) {
    const coinDelta = 1;
    state.coins += coinDelta;
    events.push({
      type: "coin",
      coinDelta,
      coins: state.coins,
    });
  }

  function applyModeItem(state, drop, events) {
    if (drop.kind === "toy") {
      state.modes.speedUntil = state.elapsed + 5;
      events.push({ type: "mode", kind: "toy" });
      return true;
    }

    if (drop.kind === "box") {
      state.modes.hideUntil = state.elapsed + 3;
      events.push({ type: "mode", kind: "box" });
      return true;
    }

    if (drop.kind === "hand") {
      state.modes.purrUntil = state.elapsed + 5;
      events.push({ type: "mode", kind: "hand", multiplier: getScoreMultiplier(state) });
      return true;
    }

    if (drop.kind === "catnip") {
      state.modes.catnipUntil = state.elapsed + 5;
      events.push({ type: "mode", kind: "catnip", multiplier: getScoreMultiplier(state) });
      return true;
    }

    if (drop.kind === "tuna") {
      state.modes.tunaUntil = state.elapsed + 5;
      applyScoreDelta(state, 1 + (hasCompanion(state, "rabbit") ? 1 : 0), events);
      events.push({ type: "mode", kind: "tuna" });
      return true;
    }

    if (drop.kind === "clipper") {
      state.modes.clipperUntil = state.elapsed + 5;
      applyScoreDelta(state, -1, events);
      events.push({ type: "mode", kind: "clipper" });
      return true;
    }

    if (drop.kind === "timer" && state.gameMode === GAME_MODES.CHURU) {
      const seconds = CHURU_TIMER_SECONDS + (hasCompanion(state, "chick") ? 1 : 0);
      state.durationSeconds += seconds;
      state.timeLeft = Math.max(0, state.durationSeconds - state.elapsed);
      events.push({
        type: "time",
        seconds,
        timeLeft: state.timeLeft,
      });
      return true;
    }

    if (drop.kind === "coin") {
      applyCoin(state, events);
      return true;
    }

    if (drop.kind === "skull") {
      state.modes.skullUntil = state.elapsed + 5;
      events.push({ type: "mode", kind: "skull" });
      return true;
    }

    return false;
  }

  function isDebuffDrop(drop) {
    return drop.kind === "bomb" || drop.kind === "clipper" || drop.kind === "skull";
  }

  function isGoodDrop(drop) {
    return !isDebuffDrop(drop);
  }

  function applySurvivalScore(state, events) {
    while (state.elapsed >= state.nextSurvivalScoreAt && !state.gameOver) {
      applyScoreDelta(state, 1, events, "survival");
      state.nextSurvivalScoreAt += SURVIVAL_SCORE_INTERVAL;
    }
  }

  function handleBombAvoidCollision(state, drop, events) {
    if (drop.kind === "box") {
      applyModeItem(state, drop, events);
      return false;
    }

    if (isCatnipModeActive(state) && isDebuffDrop(drop)) {
      knockAwayDrop(state, drop, events);
      return true;
    }

    if (isHideModeActive(state) && isDebuffDrop(drop)) {
      knockAwayDrop(state, drop, events);
      return true;
    }

    if (drop.kind === "heart") {
      state.hearts += 1;
      events.push({
        type: "heart",
        hearts: state.hearts,
      });
      return false;
    }

    if (drop.kind === "coin") {
      applyCoin(state, events);
      return false;
    }

    if (drop.kind === "catnip") {
      applyModeItem(state, drop, events);
      return false;
    }

    if (drop.kind === "gold") {
      applyScoreDelta(state, getBombModeItemScore(state, 5), events);
      return false;
    }

    if (drop.kind === "skull") {
      applyModeItem(state, drop, events);
      return false;
    }

    if (drop.kind === "bomb") {
      state.hearts = Math.max(0, state.hearts - 1);
      applyScoreDelta(state, -3, events, "bomb");
      events.push({
        type: "life",
        hearts: state.hearts,
      });

      if (state.hearts <= 0) {
        state.gameOver = true;
        state.timeLeft = 0;
      }

      return false;
    }

    return true;
  }

  function knockAwayDrop(state, drop, events) {
    const direction = drop.x >= state.cat.x ? 1 : -1;
    drop.knocked = true;
    drop.vx = direction * (380 + state.rng() * 130);
    drop.vy = -360 - state.rng() * 120;
    drop.spin = direction * (7 + state.rng() * 4);
    events.push({ type: "bounce", kind: drop.kind });
  }

  function isDropVisible(drop) {
    return drop.y < CANVAS_HEIGHT + 90 && drop.x > -90 && drop.x < CANVAS_WIDTH + 90;
  }

  function collides(state, drop) {
    const hitboxScale = state.gameMode === GAME_MODES.BOMB ? 0.72 : 1;
    const catHitboxWidth = getCatWidth(state) * hitboxScale;
    const catHitboxHeight = getCatHeight(state) * (state.gameMode === GAME_MODES.BOMB ? 0.78 : 1);
    const catLeft = state.cat.x - catHitboxWidth / 2;
    const catRight = state.cat.x + catHitboxWidth / 2;
    const catTop = state.cat.y - catHitboxHeight / 2;
    const catBottom = state.cat.y + catHitboxHeight / 2;
    const dropLeft = drop.x - drop.width / 2;
    const dropRight = drop.x + drop.width / 2;
    const dropTop = drop.y - drop.height / 2;
    const dropBottom = drop.y + drop.height / 2;

    return dropRight > catLeft && dropLeft < catRight && dropBottom > catTop && dropTop < catBottom;
  }

  function getCompanionHitboxes(state) {
    const catWidth = getCatWidth(state);
    const y = state.cat.y + Math.min(16, getCatHeight(state) * 0.16);
    const offset = catWidth / 2 + 30;
    const hitboxes = [];

    if (state.loadout.companionLeft) {
      const isHamster = state.loadout.companionLeft === "hamster";
      hitboxes.push({
        id: state.loadout.companionLeft,
        side: "left",
        x: state.cat.x - offset,
        y,
        width: isHamster ? 64 : 48,
        height: isHamster ? 56 : 42,
      });
    }

    if (state.loadout.companionRight) {
      const isHamster = state.loadout.companionRight === "hamster";
      hitboxes.push({
        id: state.loadout.companionRight,
        side: "right",
        x: state.cat.x + offset,
        y,
        width: isHamster ? 64 : 48,
        height: isHamster ? 56 : 42,
      });
    }

    return hitboxes;
  }

  function collidesCompanion(state, drop) {
    if (!isGoodDrop(drop)) {
      return false;
    }

    const dropLeft = drop.x - drop.width / 2;
    const dropRight = drop.x + drop.width / 2;
    const dropTop = drop.y - drop.height / 2;
    const dropBottom = drop.y + drop.height / 2;

    return getCompanionHitboxes(state).some((companion) => {
      const left = companion.x - companion.width / 2;
      const right = companion.x + companion.width / 2;
      const top = companion.y - companion.height / 2;
      const bottom = companion.y + companion.height / 2;
      return dropRight > left && dropLeft < right && dropBottom > top && dropTop < bottom;
    });
  }

  function stepGame(state, direction = 0, delta = STEP_SECONDS) {
    const events = [];

    if ((state.gameMode === GAME_MODES.BOMB && state.gameOver) || state.timeLeft <= 0) {
      return events;
    }

    const safeDirection = clamp(Number(direction) || 0, -1, 1);
    const durationSeconds = state.gameMode === GAME_MODES.BOMB ? Number.POSITIVE_INFINITY : state.durationSeconds;
    const stepDelta = state.gameMode === GAME_MODES.BOMB ? delta : Math.min(delta, Math.max(0, durationSeconds - state.elapsed));
    state.elapsed += stepDelta;

    if (state.gameMode === GAME_MODES.BOMB) {
      state.timeLeft = Number.POSITIVE_INFINITY;
    } else {
      state.timeLeft = Math.max(0, state.durationSeconds - state.elapsed);

      if (state.timeLeft <= TIME_EPSILON) {
        state.elapsed = state.durationSeconds;
        state.timeLeft = 0;
      }
    }

    const speedMultiplier = (isSpeedModeActive(state) ? 1.75 : 1) * (hasCompanion(state, "sparrow") ? 1.08 : 1);
    const movementDirection = isSkullModeActive(state) ? -safeDirection : safeDirection;
    state.cat.x += movementDirection * state.cat.speed * speedMultiplier * stepDelta;
    state.cat.x = clamp(state.cat.x, getCatWidth(state) / 2 + 12, CANVAS_WIDTH - getCatWidth(state) / 2 - 12);

    if (state.gameMode === GAME_MODES.BOMB) {
      applySurvivalScore(state, events);
      spawnBombAvoidDrops(state, events);
    } else if (state.elapsed >= state.nextDropAt) {
      spawnDrop(state);
      state.nextDropAt = state.elapsed + Math.max(0.32, 0.82 - state.elapsed * 0.008);
    }

    if (state.gameMode === GAME_MODES.CHURU && state.elapsed >= state.nextTimerAt) {
      spawnChuruTimerDrop(state);
    }

    state.drops.forEach((drop) => {
      if (drop.knocked) {
        drop.x += drop.vx * stepDelta;
        drop.y += drop.vy * stepDelta;
        drop.vy += 620 * stepDelta;
        drop.rotation += drop.spin * stepDelta * 2.8;
        return;
      }

      drop.y += drop.speed * stepDelta;
      drop.rotation += drop.spin * stepDelta;
    });

    state.drops = state.drops.filter((drop) => {
      if (drop.knocked) {
        return isDropVisible(drop);
      }

      const mainCollision = collides(state, drop);
      const companionCollision = !mainCollision && collidesCompanion(state, drop);

      if (mainCollision || companionCollision) {
        if (state.gameMode === GAME_MODES.BOMB) {
          return handleBombAvoidCollision(state, drop, events);
        }

        if (mainCollision && isCatnipModeActive(state) && isDebuffDrop(drop)) {
          knockAwayDrop(state, drop, events);
          return true;
        }

        if (mainCollision && isHideModeActive(state) && isDebuffDrop(drop)) {
          knockAwayDrop(state, drop, events);
          return true;
        }

        if (applyModeItem(state, drop, events)) {
          return false;
        }

        applyScoreDelta(state, getDropScore(state, drop), events);
        return false;
      }

      return isDropVisible(drop);
    });

    state.step += 1;
    return events;
  }

  function normalizeInputLog(inputLog, options = {}) {
    const maxInputEvents = options.maxInputEvents || MAX_CHURU_INPUT_EVENTS;
    const maxStep = options.maxStep || TOTAL_STEPS;

    if (!Array.isArray(inputLog) || inputLog.length > maxInputEvents) {
      return { error: "입력 로그가 올바르지 않습니다." };
    }

    let previousStep = -1;
    const normalized = [];

    for (const entry of inputLog) {
      const step = Number(entry?.step);
      const direction = Number(entry?.direction);

      if (!Number.isInteger(step) || step < 0 || step > maxStep || step <= previousStep) {
        return { error: "입력 로그 순서가 올바르지 않습니다." };
      }

      if (!Number.isInteger(direction) || direction < -1 || direction > 1) {
        return { error: "입력 방향 값이 올바르지 않습니다." };
      }

      normalized.push({ step, direction });
      previousStep = step;
    }

    return { inputLog: normalized };
  }

  function simulateGame(seed, inputLog, options = {}) {
    const gameMode = normalizeGameMode(options.mode);
    const requestedSteps = Number(options.steps);
    const totalSteps = Number.isInteger(requestedSteps) ? requestedSteps : TOTAL_STEPS;
    const maxStep = gameMode === GAME_MODES.BOMB ? totalSteps : totalSteps - 1;
    const normalized = normalizeInputLog(inputLog, {
      maxInputEvents: gameMode === GAME_MODES.BOMB ? MAX_BOMB_INPUT_EVENTS : MAX_CHURU_INPUT_EVENTS,
      maxStep,
    });

    if (normalized.error) {
      return {
        error: normalized.error,
      };
    }

    const state = createGameState({ seed, mode: gameMode, loadout: options.loadout });
    let direction = 0;
    let logIndex = 0;

    if (gameMode === GAME_MODES.BOMB && (!Number.isInteger(totalSteps) || totalSteps <= 0 || totalSteps > MAX_BOMB_STEPS)) {
      return { error: "폭탄피하기 플레이 시간이 올바르지 않습니다." };
    }

    if (gameMode === GAME_MODES.CHURU && (!Number.isInteger(totalSteps) || totalSteps <= 0 || totalSteps > MAX_CHURU_STEPS)) {
      return { error: "츄르먹기 플레이 시간이 올바르지 않습니다." };
    }

    for (let step = 0; step < totalSteps; step += 1) {
      while (logIndex < normalized.inputLog.length && normalized.inputLog[logIndex].step === step) {
        direction = normalized.inputLog[logIndex].direction;
        logIndex += 1;
      }

      stepGame(state, direction);

      if (gameMode === GAME_MODES.BOMB && state.gameOver) {
        break;
      }

      if (gameMode === GAME_MODES.CHURU && state.timeLeft <= 0) {
        break;
      }
    }

    if (gameMode === GAME_MODES.BOMB && !state.gameOver) {
      return { error: "폭탄피하기가 아직 종료되지 않았습니다." };
    }

    if (gameMode === GAME_MODES.CHURU && state.timeLeft > 0) {
      return { error: "츄르먹기가 아직 종료되지 않았습니다." };
    }

    if (state.step !== totalSteps) {
      return { error: "플레이 시간이 올바르지 않습니다." };
    }

    return {
      score: state.score,
      steps: state.step,
      elapsed: state.elapsed,
      hearts: state.hearts,
      coins: state.coins,
      gameMode: state.gameMode,
    };
  }

  return {
    BOMB_START_HEARTS,
    CHURU_TIMER_SECONDS,
    GAME_SECONDS,
    GAME_MODES,
    MAX_BOMB_STEPS,
    STEP_SECONDS,
    TOTAL_STEPS,
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
    createGameState,
    createRng,
    getCompanionHitboxes,
    getCatHeight,
    getCatWidth,
    getCatScale,
    getScoreMultiplier,
    isCatnipModeActive,
    isClipperModeActive,
    isHideModeActive,
    isPurrModeActive,
    isSkullModeActive,
    isSpeedModeActive,
    isTunaModeActive,
    normalizeGameMode,
    normalizeLoadout,
    normalizeInputLog,
    simulateGame,
    stepGame,
  };
});
