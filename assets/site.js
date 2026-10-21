// Révélation au défilement
(function () {
  var els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { threshold: 0.12 });
  els.forEach(function (e) { io.observe(e); });
})();

// Compteur des places fondateur (valeur réelle fournie par l'app ; repli sur la valeur affichée dans la page)
(function () {
  var box = document.querySelector('[data-founders]');
  if (!box) return;
  var total = 100;
  function render(taken) {
    taken = Math.max(0, Math.min(total, taken | 0));
    box.querySelector('[data-left]').textContent = String(total - taken);
    box.querySelector('[data-taken]').textContent = String(taken);
    box.querySelector('.bar i').style.width = (taken / total * 100) + '%';
  }
  render(parseInt(box.getAttribute('data-founders'), 10) || 0);
  var url = box.getAttribute('data-src');
  if (!url) return;
  fetch(url, { credentials: 'omit' }).then(function (r) { return r.ok ? r.json() : null; })
    .then(function (d) { if (d && typeof d.taken === 'number') render(d.taken); })
    .catch(function () {});
})();
