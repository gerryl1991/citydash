/* ===== Elements & state ===== */
const game = document.getElementById('game');
const player = document.getElementById('player');
const overlay = document.getElementById('overlay');
const scoreEl = document.getElementById('score');
const bestEl = document.getElementById('best');
const titleEl = document.getElementById('title');
const msgEl = document.getElementById('msg');
const startBtn = document.getElementById('startBtn');
const muteBtn = document.getElementById('mute');

const GROUND = 40;          // ground height (px)
const GRAVITY = 0.7;        // pulls player down each frame
const JUMP_POWER = 13.5;    // initial upward velocity

let y = 0, vy = 0;          // player height above ground, vertical speed
let obstacles = [];         // {el, x, w, h, passed}
let speed = 6, score = 0, best = 0;
let running = false, lastTime = 0, distToNext = 0, soundOn = true;

try { best = +localStorage.getItem('jumpyBest') || 0; } catch (e) {}
bestEl.textContent = best;

/* ===== Sound effects (Web Audio, no files needed) ===== */
let audio;
function beep(freq, dur, type = 'square', vol = 0.06) {
  if (!soundOn) return;
  try {
    audio = audio || new (window.AudioContext || window.webkitAudioContext)();
    const o = audio.createOscillator(), g = audio.createGain();
    o.type = type; o.frequency.value = freq; g.gain.value = vol;
    o.connect(g); g.connect(audio.destination);
    o.start(); o.stop(audio.currentTime + dur);
  } catch (e) {}
}

/* ===== Character movement ===== */
function jump() {
  if (!running) {  // ignore input until the game-over screen is showing
    if (!overlay.classList.contains('hidden')) startGame();
    return;
  }
  if (y === 0) {            // only jump from the ground
    vy = JUMP_POWER;
    player.classList.add('jumping');
    beep(520, 0.12);
  }
}

function updatePlayer(step) {
  vy -= GRAVITY * step;     // gravity
  y += vy * step;
  if (y <= 0) { y = 0; vy = 0; player.classList.remove('jumping'); }
  player.style.bottom = (GROUND + y) + 'px';
}

/* ===== Obstacle generation ===== */
function spawnObstacle() {
  const el = document.createElement('div');
  let w, h, b = 0, mul = 1;                 // b = height above the road
  if (score >= 1 && Math.random() < 0.35) {  // bird: flies at head height, moves faster
    el.className = 'bird';
    w = 34; h = 18; b = 48 + Math.random() * 16; mul = 1.25;
    el.style.bottom = (GROUND + b) + 'px';
  } else {                                  // random car: sedan, van or bus
    el.className = 'car';
    const types = [[78, 32], [90, 42], [112, 48]];
    const colors = ['#e4572e', '#f2c94c', '#3b82f6', '#9b5de5', '#ef476f', '#06d6a0', '#f8f9fa'];
    [w, h] = types[Math.floor(Math.random() * types.length)];
    el.style.background = colors[Math.floor(Math.random() * colors.length)];
  }
  el.style.width = w + 'px';
  el.style.height = h + 'px';
  const x = game.clientWidth + 20;
  el.style.left = x + 'px';
  game.appendChild(el);
  obstacles.push({ el, x, w, h, b, mul, passed: false });
  // Random gap that grows slightly with speed, so it's always jumpable
  distToNext = 260 + Math.random() * 260 + speed * 12;
}

function updateObstacles(step) {
  distToNext -= speed * step;
  if (distToNext <= 0) spawnObstacle();

  for (const o of obstacles) {
    o.x -= speed * o.mul * step;                      // consistent movement toward the player
    o.el.style.left = o.x + 'px';
    if (!o.passed && o.x + o.w < 60) {        // jumped over successfully
      o.passed = true;
      score++;
      scoreEl.textContent = score;
      speed = Math.min(speed + 0.15, 12.5);                          // gets harder
      if (score % 5 === 0) beep(880, 0.15, 'triangle');
    }
  }
  obstacles = obstacles.filter(o => {
    if (o.x + o.w < -40) { o.el.remove(); return false; }
    return true;
  });
}

/* ===== Collision detection (forgiving hitboxes) ===== */
function hitTest() {
  const pad = 5;
  const px1 = 60 + 11, px2 = 60 + 44 - 11;
  const pBottom = y + pad;
  for (const o of obstacles) {
    const overlapX = px2 > o.x + pad && px1 < o.x + o.w - pad;
    const overlapY = y + pad < o.b + o.h - pad && y + 44 - pad > o.b + pad;
    if (overlapX && overlapY) return true;
  }
  return false;
}

/* ===== Game loop & state ===== */
function loop(t) {
  if (!running) return;
  const step = Math.min((t - lastTime) / 16.67, 3);   // normalise to ~60fps
  lastTime = t;
  updatePlayer(step);
  updateObstacles(step);
  if (hitTest()) { endGame(); return; }
  requestAnimationFrame(loop);
}

function startGame() {
  obstacles.forEach(o => o.el.remove());
  obstacles = [];
  y = 0; vy = 0; speed = 6; score = 0; distToNext = 300;
  scoreEl.textContent = 0;
  player.className = '';
  player.style.bottom = GROUND + 'px';
  overlay.classList.add('hidden');
  game.classList.remove('over');
  running = true;
  lastTime = performance.now();
  requestAnimationFrame(loop);
}

function endGame() {
  running = false;
  game.classList.add('over');
  player.classList.add('dead');
  beep(160, 0.4, 'sawtooth', 0.08);
  if (score > best) {
    best = score; bestEl.textContent = best;
    try { localStorage.setItem('jumpyBest', best); } catch (e) {}
  }
  titleEl.textContent = 'Game Over';
  msgEl.textContent = 'Final score: ' + score + ' (best ' + best + ') — press Space to retry';
  startBtn.textContent = 'Play again';
  setTimeout(() => overlay.classList.remove('hidden'), 350);
}

/* ===== Input ===== */
document.addEventListener('keydown', e => {
  if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); jump(); }
});
game.addEventListener('pointerdown', e => { if (e.target !== startBtn) jump(); });
startBtn.addEventListener('click', e => { e.stopPropagation(); startGame(); });
muteBtn.addEventListener('click', () => {
  soundOn = !soundOn;
  muteBtn.textContent = 'Sound: ' + (soundOn ? 'on' : 'off');
});

/* ===== Stars ===== */
(function makeStars() {
  const s = document.getElementById('stars');
  for (let i = 0; i < 28; i++) {
    const d = document.createElement('i');
    d.className = 'star';
    d.style.cssText = 'left:' + (Math.random() * 100) + '%;top:' + (Math.random() * 80) + 'px;animation-delay:-' +
      (Math.random() * 2.5) + 's;' + (Math.random() < 0.3 ? 'width:3px;height:3px;' : '');
    s.appendChild(d);
  }
})();

/* ===== Background scenery: random buildings and trees, tiled so it loops ===== */
(function buildScenery() {
  const TILE = 800;
  const bEl = document.getElementById('buildings');
  const tEl = document.getElementById('trees');
  const bldgs = [], trees = [];
  let x = 0;
  while (x < TILE - 60) {
    const w = Math.min(50 + Math.random() * 40, TILE - x - 4);
    bldgs.push({ x, w, h: 70 + Math.random() * 55, shade: 0.85 + Math.random() * 0.4, ant: Math.random() < 0.3 });
    x += w + 4 + Math.random() * 12;
  }
  x = 15;
  while (x < TILE - 30) { trees.push({ x, h: 14 + Math.random() * 10 }); x += 70 + Math.random() * 70; }
  for (let copy = 0; copy < 2; copy++) {
    for (const b of bldgs) {
      const d = document.createElement('div');
      d.className = 'bldg' + (b.ant ? ' antenna' : '');
      d.style.cssText = 'left:' + (b.x + copy * TILE) + 'px;width:' + b.w + 'px;height:' + b.h + 'px;filter:brightness(' + b.shade + ')';
      bEl.appendChild(d);
    }
    for (const t of trees) {
      const d = document.createElement('div');
      d.className = 'tree';
      d.style.cssText = 'left:' + (t.x + copy * TILE) + 'px;height:' + t.h + 'px';
      tEl.appendChild(d);
    }
  }
})();