const cover = document.querySelector('[data-screen="cover"]');
const objective = document.querySelector('[data-screen="objective"]');
const game = document.querySelector('[data-screen="game"]');
const score = document.querySelector('[data-screen="score"]');
const screens = [cover, objective, game, score];
const rainField = document.querySelector('[data-rain-field]');
const well = document.querySelector('[data-well]');
const timerDisplay = document.querySelector('[data-timer]');
const scoreDisplay = document.querySelector('[data-score]');
const drops = [...document.querySelectorAll('[data-drop]')];
let remainingTime = 60;
let collectedDrops = 0;
let animationFrame;
let previousTime;

function showScreen(screen) {
  screens.forEach((item) => { item.hidden = item !== screen; });
  if (screen === game) startGame();
  else stopGame();
}

function startGame() {
  cancelAnimationFrame(animationFrame);
  remainingTime = 60;
  collectedDrops = 0;
  previousTime = performance.now();
  timerDisplay.textContent = remainingTime;
  scoreDisplay.textContent = '00';
  well.style.left = '50%';
  drops.forEach((drop, index) => resetDrop(drop, index));
  animationFrame = requestAnimationFrame(updateGame);
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
  collectedDrops += 1;
  scoreDisplay.textContent = String(collectedDrops).padStart(2, '0');
  resetDrop(drop, Math.floor(Math.random() * drops.length));
}

function updateGame(now) {
  const elapsed = Math.min((now - previousTime) / 1000, 0.1);
  previousTime = now;
  remainingTime = Math.max(0, remainingTime - elapsed);
  timerDisplay.textContent = String(Math.ceil(remainingTime)).padStart(2, '0');
  const fallSpeed = 16 + ((60 - remainingTime) * 0.14);
  const fieldHeight = rainField.clientHeight;
  const wellBounds = well.getBoundingClientRect();
  const fieldBounds = rainField.getBoundingClientRect();

  drops.forEach((drop) => {
    const y = Number(drop.dataset.y) + (fallSpeed * elapsed);
    drop.dataset.y = String(y);
    drop.style.top = `${y}px`;
    const dropBounds = drop.getBoundingClientRect();
    const insideWell = dropBounds.bottom >= wellBounds.top && dropBounds.left < wellBounds.right && dropBounds.right > wellBounds.left;
    if (insideWell || y > fieldHeight - 20) collectDrop(drop);
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

drops.forEach((drop) => drop.addEventListener('click', () => collectDrop(drop)));