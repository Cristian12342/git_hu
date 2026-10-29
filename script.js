let score = 0;
let shots = 0;
let hits = 0;
let health = 100;
const maxHealth = 100;

const scoreEl = document.getElementById('score');
const shotsEl = document.getElementById('shots');
const hitsEl = document.getElementById('hits');
const healthBar = document.getElementById('health-bar');
const healthText = document.getElementById('health-text');
const viewerBox = document.getElementById('viewerBox');
const modelViewer = document.getElementById('3dModel');
const targetOverlay = document.getElementById('targetOverlay');
const modelSelect = document.getElementById('modelSelect');
const resetBtn = document.getElementById('resetBtn');
const victoryModal = document.getElementById('victoryModal');

// Referencias de audio
const shootSound = document.getElementById('shootSound');
const hitSound = document.getElementById('hitSound');

let moveTimer = null;

function playShootSound() {
  if (shootSound) {
    shootSound.currentTime = 0;
    shootSound.play().catch(() => {});
  }
}

function playHitSound() {
  if (hitSound) {
    hitSound.currentTime = 0;
    hitSound.play().catch(() => {});
  }
}

// Movimiento dinámico con velocidad aumentada y aceleración por salud baja
function moveTarget() {
  const padding = 100;
  const maxX = window.innerWidth - viewerBox.clientWidth - padding;
  const maxY = window.innerHeight - viewerBox.clientHeight - padding;
  const minX = padding;
  const minY = 120;

  const randomX = Math.floor(Math.random() * (maxX - minX) + minX);
  const randomY = Math.floor(Math.random() * (maxY - minY) + minY);

  const currentSpeed = 0.25 + (health / maxHealth) * 0.55; 
  viewerBox.style.transition = `left ${currentSpeed}s ease-in-out, top ${currentSpeed}s ease-in-out`;

  viewerBox.style.left = `${randomX}px`;
  viewerBox.style.top = `${randomY}px`;

  if (moveTimer) clearTimeout(moveTimer);
  moveTimer = setTimeout(moveTarget, currentSpeed * 1000);
}

// Disparos fallidos en cualquier parte de la página
document.body.addEventListener('click', (e) => {
  if (e.target.closest('.controls') || e.target.closest('.hud') || victoryModal.classList.contains('active')) return;

  shots++;
  shotsEl.textContent = shots;
  playShootSound();
});

// Aciertos al objeto 3D
targetOverlay.addEventListener('click', (e) => {
  e.stopPropagation();
  playHitSound();

  const rect = viewerBox.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  const dist = Math.hypot(x - centerX, y - centerY);

  const hitRadius = rect.width * 0.45;

  if (dist < hitRadius) {
    hits++;
    hitsEl.textContent = hits;

    const isCrit = dist < (hitRadius * 0.25);
    const damage = isCrit ? 25 : 10;
    const points = isCrit ? 200 : 100;

    score += points;
    scoreEl.textContent = score;

    health = Math.max(0, health - damage);
    updateHealthUI();

    showImpact(x, y);
    showDamageText(x, y, isCrit ? `-${damage} ¡CRÍTICO!` : `-${damage}`);

    moveTarget();

    if (health <= 0) {
      setTimeout(() => {
        victoryModal.classList.add('active');
        score += 500;
        scoreEl.textContent = score;
      }, 200);
    }
  }
});

// Cambio de modelo 3D desde el selector
modelSelect.addEventListener('change', (e) => {
  modelViewer.src = e.target.value;
});

function updateHealthUI() {
  const pct = (health / maxHealth) * 100;
  healthBar.style.width = pct + '%';
  healthText.textContent = `${health} / ${maxHealth}`;
}

function showImpact(x, y) {
  const spark = document.createElement('div');
  spark.className = 'impact-mark';
  spark.style.left = x + 'px';
  spark.style.top = y + 'px';
  viewerBox.appendChild(spark);
  setTimeout(() => spark.remove(), 500);
}

function showDamageText(x, y, text) {
  const dmg = document.createElement('div');
  dmg.className = 'damage-text';
  dmg.textContent = text;
  dmg.style.left = x + 'px';
  dmg.style.top = y + 'px';
  viewerBox.appendChild(dmg);
  setTimeout(() => dmg.remove(), 600);
}

function resetGame() {
  score = 0;
  shots = 0;
  hits = 0;
  health = maxHealth;
  scoreEl.textContent = '0';
  shotsEl.textContent = '0';
  hitsEl.textContent = '0';
  updateHealthUI();
  moveTarget();
}

function closeVictoryModal() {
  victoryModal.classList.remove('active');
  health = maxHealth;
  updateHealthUI();
  moveTarget();
}

resetBtn.addEventListener('click', resetGame);

window.onload = () => {
  moveTarget();
};