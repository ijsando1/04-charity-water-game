const cover = document.querySelector('[data-screen="cover"]');
const objective = document.querySelector('[data-screen="objective"]');

function showObjective() {
  cover.hidden = true;
  objective.hidden = false;
  objective.focus?.();
}

function showCover() {
  objective.hidden = true;
  cover.hidden = false;
}

document.querySelector('[data-start]').addEventListener('click', showObjective);
document.querySelector('[data-back]').addEventListener('click', showCover);
document.querySelector('[data-continue]').addEventListener('click', () => {
  document.querySelector('[data-continue]').textContent = 'COMING SOON';
});