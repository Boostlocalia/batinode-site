// Révélation au défilement
(function () {
  var els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { threshold: 0.12 });
  els.forEach(function (e) { io.observe(e); });
})();

// Compteur des places fondateur et des entreprises inscrites : lu en direct dans l'app,
// remis à jour chaque minute et au retour sur l'onglet (repli sur les valeurs de la page).
(function () {
  var box = document.querySelector('[data-founders]');
  if (!box) return;
  var total = 50;
  var api = 'https://bkmzstdviytslegbxsax.supabase.co/rest/v1/rpc/founder_offer';
  // Clé publique (anon) de l'app, déjà visible dans app.batinode.be.
  var key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrbXpzdGR2aXl0c2xlZ2J4c2F4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIzMjU1NTYsImV4cCI6MjEwNzkwMTU1Nn0.ktDieGxIQz9w5zCcGlAYO_AwRHln_mkJHx9U9aAGEcI';
  function render(taken, registered) {
    taken = Math.max(0, Math.min(total, taken | 0));
    box.querySelector('[data-left]').textContent = String(total - taken);
    box.querySelector('[data-taken]').textContent = String(taken);
    box.querySelector('.bar i').style.width = (taken / total * 100) + '%';
    var reg = box.querySelector('[data-registered]');
    if (reg && typeof registered === 'number') reg.textContent = String(registered);
  }
  render(parseInt(box.getAttribute('data-founders'), 10) || 0, parseInt(box.getAttribute('data-registered-count'), 10) || 0);
  function refresh() {
    fetch(api, { method: 'POST', credentials: 'omit', headers: { apikey: key, 'Content-Type': 'application/json' }, body: '{}' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) { if (d && typeof d.taken === 'number') render(d.taken, d.registered); })
      .catch(function () {});
  }
  refresh();
  setInterval(function () { if (!document.hidden) refresh(); }, 60000);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) refresh(); });
})();
