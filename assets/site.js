// Révélation au défilement
(function () {
  var els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { threshold: 0.12 });
  els.forEach(function (e) { io.observe(e); });
})();

// Compteur des places fondateur, des entreprises inscrites (dont en essai) et des fournisseurs : lu en direct dans l'app,
// remis à jour chaque minute et au retour sur l'onglet (repli sur les valeurs de la page).
(function () {
  var box = document.querySelector('[data-founders]');
  if (!box) return;
  var total = 50;
  var api = 'https://bkmzstdviytslegbxsax.supabase.co/rest/v1/rpc/founder_offer';
  // Clé publique (anon) de l'app, déjà visible dans app.batinode.be.
  var key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrbXpzdGR2aXl0c2xlZ2J4c2F4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIzMjU1NTYsImV4cCI6MjEwNzkwMTU1Nn0.ktDieGxIQz9w5zCcGlAYO_AwRHln_mkJHx9U9aAGEcI';
  function render(taken, d) {
    d = d || {};
    taken = Math.max(0, Math.min(total, taken | 0));
    box.querySelector('[data-left]').textContent = String(total - taken);
    box.querySelector('[data-taken]').textContent = String(taken);
    box.querySelector('.bar i').style.width = (taken / total * 100) + '%';
    ['registered', 'trial', 'suppliers'].forEach(function (k) {
      var el = box.querySelector('[data-' + k + ']');
      if (el && typeof d[k] === 'number') el.textContent = String(d[k]);
    });
  }
  render(parseInt(box.getAttribute('data-founders'), 10) || 0);
  function refresh() {
    fetch(api, { method: 'POST', credentials: 'omit', headers: { apikey: key, 'Content-Type': 'application/json' }, body: '{}' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) { if (d && typeof d.taken === 'number') render(d.taken, d); })
      .catch(function () {});
  }
  refresh();
  setInterval(function () { if (!document.hidden) refresh(); }, 60000);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) refresh(); });
})();

// Pixel Meta : chargé uniquement après accord explicite (bandeau, refuser aussi simple qu'accepter).
// Le choix est gardé 6 mois dans ce navigateur ; le lien « Choix cookies » du pied de page le rouvre.
(function () {
  var PIXEL = '1604783871421166';
  var KEY = 'bn_consent';
  var box = document.getElementById('consent');
  if (!box) return;
  function read() {
    try {
      var v = JSON.parse(localStorage.getItem(KEY) || 'null');
      return v && Date.now() - v.at < 182 * 864e5 ? v.choice : null;
    } catch (e) { return null; }
  }
  function save(choice) {
    try { localStorage.setItem(KEY, JSON.stringify({ choice: choice, at: Date.now() })); } catch (e) {}
  }
  var loaded = false;
  function load() {
    if (loaded) return;
    loaded = true;
    var n = (window.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); });
    if (!window._fbq) window._fbq = n;
    n.push = n; n.loaded = true; n.version = '2.0'; n.queue = [];
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.appendChild(s);
    window.fbq('init', PIXEL);
    window.fbq('track', 'PageView');
  }
  // Un clic vers l'inscription dans l'app compte comme « Lead ».
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="https://app.batinode.be"]');
    if (a && loaded && window.fbq) window.fbq('track', 'Lead', { content_name: a.textContent.trim() });
  });
  box.addEventListener('click', function (e) {
    var b = e.target.closest('[data-consent]');
    if (!b) return;
    var choice = b.getAttribute('data-consent');
    save(choice);
    box.hidden = true;
    if (choice === 'yes') load();
    else if (loaded) location.reload();
  });
  document.querySelectorAll('[data-consent-open]').forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); box.hidden = false; });
  });
  var choice = read();
  if (choice === 'yes') load();
  else if (choice !== 'no') box.hidden = false;
})();
