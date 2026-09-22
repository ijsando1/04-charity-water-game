const cover = document.querySelector('[data-screen="cover"]');
const objective = document.querySelector('[data-screen="objective"]');
const game = document.querySelector('[data-screen="game"]');
const score = document.querySelector('[data-screen="score"]');
const screens = [cover, objective, game, score];

function showScreen(screen) {
  screens.forEach((item) => { item.hidden = item !== screen; });
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
document.querySelector('[data-continue]').addEventListener('click', () => {
  showScreen(game);
});
document.querySelector('[data-game-back]').addEventListener('click', showObjective);
document.querySelector('[data-finish]').addEventListener('click', () => showScreen(score));
document.querySelector('[data-replay]').addEventListener('click', () => showScreen(game));

document.querySelectorAll('[data-drop]').forEach((drop) => {
  drop.addEventListener('click', () => {
    drop.classList.add('collected');
    document.querySelector('[data-score]').textContent = String(document.querySelectorAll('[data-drop].collected').length).padStart(2, '0');
  });
});