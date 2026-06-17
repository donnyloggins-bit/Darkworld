const CACHE = 'darkworld-v2';

const CORE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
  '/icons/icon-72.png',
  '/icons/icon-96.png',
  '/icons/icon-144.png',
  '/icons/icon-180.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

const ASSETS = [
  '/0_0.jpeg',
  '/BRIDGE TROLL.png',
  '/GRAVEMASTER.png',
  '/RIVER WRATH.png',
  '/aerial-city.png',
  '/blood-wraith-sword.png',
  '/bloodwraith.jpeg',
  '/bogspecter.jpeg',
  '/bonearcher.jpeg',
  '/boyds-blood.png',
  '/boyds-chaos.png',
  '/boyds-elegant.png',
  '/boyds-mannequin.png',
  '/char-create-bg.jpeg',
  '/chef-alonzo.png',
  '/city-beast-frazetta.png',
  '/city-beast.png',
  '/colonial-shade.jpeg',
  '/cursedrat.jpeg',
  '/delaware-night.png',
  '/delaware-tallship.png',
  '/drowned-sailor.png',
  '/edward.jpeg',
  '/forgotten-founder.png',
  '/gravewanderer.jpeg',
  '/hellgate-arch.png',
  '/hellgate-staircase.png',
  '/hellgate.png',
  '/hollowknight.jpeg',
  '/iron ghost.png',
  '/iron-meridian-dining.png',
  '/iron-meridian.png',
  '/iron-officer.png',
  '/jackburton_can_you_make_a_demon_in_a_cathedral_like_a_boss_fi_8ba5a125-cdfb-4f8f-ad6c-93384cfb0d1b_1.png',
  '/ledger-wraith.png',
  '/lichservant.jpeg',
  '/living-mannequin.jpeg',
  '/lord-malachar.png',
  '/lostsoul.jpeg',
  '/mannequin-horror.png',
  '/map-bg.jpeg',
  '/papi1.jpeg',
  '/papi2.jpeg',
  '/philly-dark-skyline.png',
  '/philly-skyline.png',
  '/plague mother.png',
  '/plaguehound.jpeg',
  '/rev-ghost.png',
  '/rotgolem.jpeg',
  '/shadowimp.jpeg',
  '/spooky-aerial.png',
  '/storm-wraith.png',
  '/swamp-colossus.png',
  '/swamp-giant.png',
  '/the-hollow.png',
  '/title screen.png',
  '/title3.jpeg',
  '/title4.jpeg',
  '/voidshade.jpeg',
  '/wailing-ghost.png',
  '/wailingbanshee.jpeg',
  '/water-wraith.png',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => {
      // Cache core files immediately; assets in background (don't block install)
      c.addAll(ASSETS).catch(() => {});
      return c.addAll(CORE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = e.request.url;

  // Google Fonts — cache-first with network fallback
  if (url.includes('fonts.googleapis') || url.includes('fonts.gstatic')) {
    e.respondWith(
      caches.match(e.request).then(cached =>
        cached || fetch(e.request).then(res => {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return res;
        })
      )
    );
    return;
  }

  // Map tiles — cache-first, silently update in background
  if (url.includes('basemaps.cartocdn.com')) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        const network = fetch(e.request).then(res => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE).then(c => c.put(e.request, clone));
          }
          return res;
        }).catch(() => cached);
        return cached || network;
      })
    );
    return;
  }

  // Navigation — network-first so updates deploy immediately
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match('/'))
    );
    return;
  }

  // Everything else (images, icons) — cache-first
  e.respondWith(
    caches.match(e.request).then(cached =>
      cached || fetch(e.request).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => cached)
    )
  );
});
