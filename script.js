(function () {
  const body = document.body;
  const introLayer = document.getElementById('intro-layer');
  const analysisLayer = document.getElementById('analysis-layer');
  const enterBtn = document.getElementById('enter-btn');
  const backBtn = document.getElementById('back-btn');
  const yearRange = document.getElementById('year-range');
  const yearValue = document.getElementById('year-value');

  function showAnalysis() {
    body.classList.remove('theme-dark');
    body.classList.add('theme-light');
    introLayer.classList.add('hidden');
    analysisLayer.classList.remove('hidden');
  }

  function showIntro() {
    body.classList.remove('theme-light');
    body.classList.add('theme-dark');
    analysisLayer.classList.add('hidden');
    introLayer.classList.remove('hidden');
  }

  enterBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    showAnalysis();
  });

  introLayer.addEventListener('click', function (e) {
    if (e.target === enterBtn) return;
    showAnalysis();
  });

  backBtn.addEventListener('click', showIntro);

  yearRange.addEventListener('input', function () {
    yearValue.textContent = yearRange.value;
  });
})();
