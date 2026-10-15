const cover = document.querySelector('[data-screen="cover"]');
const objective = document.querySelector('[data-screen="objective"]');
const game = document.querySelector('[data-screen="game"]');
const score = document.querySelector('[data-screen="score"]');
const screens = [cover, objective, game, score];
const rainField = document.querySelector('[data-rain-field]');
const well = document.querySelector('[data-well]');
const timerDisplay = document.querySelector('[data-timer]');
const gameScoreDisplay = document.querySelector('[data-game-score]');
const scoreDisplay = document.querySelector('[data-score]');
const resultMessage = document.querySelector('[data-result-message]');
const confettiLayer = document.querySelector('[data-confetti]');
const drops = [...document.querySelectorAll('[data-drop]')];
const gameDuration = 30;
const confettiScoreThreshold = 20;
let remainingTime = gameDuration;
let scorePoints = 0;
let animationFrame;
let previousTime;

function showScreen(screen) {
  screens.forEach((item) => { item.hidden = item !== screen; });
  if (screen === game) startGame();
  else stopGame();
  if (screen === score) {
    updateResultMessage();
    updateConfetti();
  }
}

function startGame() {
  cancelAnimationFrame(animationFrame);
  confettiLayer.replaceChildren();
  resultMessage.textContent = '';
  remainingTime = gameDuration;
  scorePoints = 0;
  previousTime = performance.now();
  timerDisplay.textContent = remainingTime;
  updateScoreDisplay();
  well.style.left = '50%';
  drops.forEach((drop, index) => resetDrop(drop, index));
  animationFrame = requestAnimationFrame(updateGame);
}

function updateResultMessage() {
  resultMessage.textContent = scorePoints >= confettiScoreThreshold ? 'Congrats!' : 'Try again';
}

function updateScoreDisplay() {
  const displayedScore = String(scorePoints).padStart(2, '0');
  gameScoreDisplay.textContent = displayedScore;
  scoreDisplay.textContent = displayedScore;
}

function updateConfetti() {
  confettiLayer.replaceChildren();
  if (scorePoints <= confettiScoreThreshold) return;

  const colors = ['#2f7c91', '#edb45d', '#8fc7c4', '#d87850', '#172d36'];
  const pieces = Array.from({ length: 40 }, (_, index) => {
    const piece = document.createElement('span');
    piece.className = 'confetti-piece';
    piece.style.setProperty('--confetti-x', `${(index * 37) % 100}%`);
    piece.style.setProperty('--confetti-delay', `${(index % 8) * 0.08}s`);
    piece.style.setProperty('--confetti-duration', `${2.4 + (index % 6) * 0.2}s`);
    piece.style.setProperty('--confetti-drift', `${((index * 17) % 120) - 60}px`);
    piece.style.setProperty('--confetti-spin', `${360 + ((index * 53) % 540)}deg`);
    piece.style.setProperty('--confetti-color', colors[index % colors.length]);
    return piece;
  });
  confettiLayer.append(...pieces);
}

function stopGame() {
  cancelAnimationFrame(animationFrame);
  animationFrame = undefined;
}

function resetDrop(drop, index) {
  drop.classList.remove('collected');
  drop.dataset.x = String(12 + ((index * 19) % 72));
  drop.dataset.y = String(45 + ((index * 53) % 170));
  drop.style.left = `${drop.dataset.x}%`;
  drop.style.top = `${drop.dataset.y}px`;
}

function collectDrop(drop) {
  if (drop.classList.contains('collected')) return;
  drop.classList.add('collected');
  if (drop.classList.contains('dirty')) scorePoints = Math.max(0, scorePoints - 1);
  else scorePoints += 1;
  updateScoreDisplay();
  window.setTimeout(() => resetDrop(drop, Math.floor(Math.random() * drops.length)), 250);
}

function updateGame(now) {
  const elapsed = Math.min((now - previousTime) / 1000, 0.1);
  previousTime = now;
  remainingTime = Math.max(0, remainingTime - elapsed);
  timerDisplay.textContent = String(Math.ceil(remainingTime)).padStart(2, '0');
  const fallSpeed = 24 + ((gameDuration - remainingTime) * 0.2);
  const fieldHeight = rainField.clientHeight;
  const wellBounds = well.getBoundingClientRect();
  const fieldBounds = rainField.getBoundingClientRect();

  drops.forEach((drop) => {
    const y = Number(drop.dataset.y) + (fallSpeed * elapsed);
    drop.dataset.y = String(y);
    drop.style.top = `${y}px`;
    const dropBounds = drop.getBoundingClientRect();
    const insideWell = dropBounds.bottom >= wellBounds.top && dropBounds.left < wellBounds.right && dropBounds.right > wellBounds.left;
    if (insideWell) collectDrop(drop);
    else if (y > fieldHeight - 20) resetDrop(drop, Math.floor(Math.random() * drops.length));
  });

  if (remainingTime > 0) animationFrame = requestAnimationFrame(updateGame);
  else showScreen(score);
}

function moveWell(clientX) {
  const bounds = rainField.getBoundingClientRect();
  const halfWidth = well.offsetWidth / 2;
  const x = Math.max(halfWidth, Math.min(bounds.width - halfWidth, clientX - bounds.left));
  well.style.left = `${x}px`;
}

function showObjective() {
  showScreen(objective);
  objective.focus?.();
}

function showCover() {
  showScreen(cover);
}

document.querySelector('[data-start]').addEventListener('click', showObjective);
document.querySelector('[data-back]').addEventListener('click', showCover);
document.querySelector('[data-continue]').addEventListener('click', (event) => {
  event.preventDefault();
  showScreen(game);
});
document.querySelector('[data-game-back]').addEventListener('click', showObjective);
document.querySelector('[data-finish]').addEventListener('click', () => showScreen(score));
document.querySelector('[data-replay]').addEventListener('click', () => showScreen(game));
rainField.addEventListener('pointermove', (event) => moveWell(event.clientX));
rainField.addEventListener('pointerdown', (event) => moveWell(event.clientX));

drops.forEach((drop) => drop.addEventListener('pointerdown', (event) => {
  event.stopPropagation();
  collectDrop(drop);
}));