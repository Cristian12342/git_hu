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

// Referencias a los audios
const shootSound = document.getElementById('shootSound');
const hitSound = document.getElementById('hitSound');

let moveTimer = null;

// Reproducir sonido de disparo
function playShootSound() {
  if (shootSound) {
    shootSound.currentTime = 0;
    shootSound.play().catch(() => {});
  }
}

// Reproducir sonido de acierto/impacto
function playHitSound() {
  if (hitSound) {
    hitSound.currentTime = 0;
    hitSound.play().catch(() => {});
  }
}

// Mueve el objeto y ajusta la velocidad (mucho más rápido ahora)
function moveTarget() {
  const padding = 100;
  const maxX = window.innerWidth - viewerBox.clientWidth - padding;
  const maxY = window.innerHeight - viewerBox.clientHeight - padding;
  const minX = padding;
  const minY = 120;

  const randomX = Math.floor(Math.random() * (maxX - minX) + minX);
  const randomY = Math.floor(Math.random() * (maxY - minY) + minY);

  // NUEVA VELOCIDAD AUMENTADA:
  // Con salud al 100% tardará 0.8 segundos. Con la vida baja, ¡tardará solo 0.25 segundos (extremadamente rápido)!
  const currentSpeed = 0.25 + (health / maxHealth) * 0.55; 
  viewerBox.style.transition = `left ${currentSpeed}s ease-in-out, top ${currentSpeed}s ease-in-out`;

  viewerBox.style.left = `${randomX}px`;
  viewerBox.style.top = `${randomY}px`;

  // Reiniciar el temporizador según la nueva velocidad
  if (moveTimer) clearTimeout(moveTimer);
  moveTimer = setTimeout(moveTarget, currentSpeed * 1000);
}

// Disparo fallido en la página
document.body.addEventListener('click', (e) => {
  if (e.target.closest('.controls') || e.target.closest('.hud')) return;

  shots++;
  shotsEl.textContent = shots;
  playShootSound();
});

// Acierto al Objeto 3D
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

    // Mover inmediatamente al recibir el impacto
    moveTarget();

    if (health <= 0) {
      setTimeout(() => {
        alert('🎉 ¡Objetivo 3D neutralizado! +500 puntos');
        score += 500;
        scoreEl.textContent = score;
        health = maxHealth;
        updateHealthUI();
      }, 200);
    }
  }
});

// Cambio de modelo 3D
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

resetBtn.addEventListener('click', resetGame);

// Iniciar juego
window.onload = () => {
  moveTarget();
};