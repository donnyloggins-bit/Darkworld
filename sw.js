const CACHE = 'darkworld-v7'; // v7: flush the old keyless CARTO "API KEY REQUIRED" tiles

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
  '/BRIDGE TROLL.jpg',
  '/GRAVEMASTER.jpg',
  '/RIVER WRATH.jpg',
  '/aerial-city.jpg',
  '/blood-wraith-sword.jpg',
  '/bloodwraith.jpeg',
  '/bogspecter.jpeg',
  '/bonearcher.jpeg',
  '/boyds-blood.jpg',
  '/boyds-chaos.jpg',
  '/boyds-elegant.jpg',
  '/boyds-mannequin.jpg',
  '/char-create-bg.jpeg',
  '/chef-alonzo.jpg',
  '/city-beast-frazetta.jpg',
  '/city-beast.jpg',
  '/colonial-shade.jpeg',
  '/cursedrat.jpeg',
  '/delaware-night.jpg',
  '/delaware-tallship.jpg',
  '/drowned-sailor.jpg',
  '/eastern-state-gate.jpg',
  '/eastern-state-night.jpg',
  '/eastern-state-yard.jpg',
  '/edward.jpeg',
  '/forgotten-founder.jpg',
  '/gravewanderer.jpeg',
  '/hellgate-arch.jpg',
  '/hellgate-staircase.jpg',
  '/hellgate.jpg',
  '/hollowknight.jpeg',
  '/iron ghost.jpg',
  '/iron-meridian-dining.jpg',
  '/iron-meridian.jpg',
  '/iron-officer.jpg',
  '/jackburton_can_you_make_a_demon_in_a_cathedral_like_a_boss_fi_8ba5a125-cdfb-4f8f-ad6c-93384cfb0d1b_1.jpg',
  '/ledger-wraith.jpg',
  '/lichservant.jpeg',
  '/living-mannequin.jpeg',
  '/lord-malachar.jpg',
  '/lostsoul.jpeg',
  '/mannequin-horror.jpg',
  '/map-bg.jpeg',
  '/papi1.jpeg',
  '/papi2.jpeg',
  '/philly-dark-skyline.jpg',
  '/philly-skyline.jpg',
  '/plague mother.jpg',
  '/plaguehound.jpeg',
  '/rotgolem.jpeg',
  '/shadowimp.jpeg',
  '/spooky-aerial.jpg',
  '/storm-wraith.jpg',
  '/swamp-colossus.jpg',
  '/swamp-giant.jpg',
  '/title screen.jpg',
  '/title3.jpeg',
  '/title4.jpeg',
  '/voidshade.jpeg',
  '/wailing-ghost.jpg',
  '/wailingbanshee.jpeg',
  '/water-wraith.jpg',
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

  // Supabase (auth, saves, live raid) — never cache, always live
  if (url.includes('.supabase.co') || e.request.method !== 'GET') return;

  // Music streams with range requests: let the browser handle it directly
  if (new URL(url).pathname.startsWith('/music/')) return;

  // Runtime config — network-first so key changes take effect, cached copy offline
  if (new URL(url).pathname === '/config.js') {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          if (res.ok) { const clone = res.clone(); caches.open(CACHE).then(c => c.put(e.request, clone)); }
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

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

  // OpenStreetMap tiles (keyless fallback): leave them to the browser's HTTP cache,
  // which honours OSM's caching headers as their tile policy asks
  if (url.includes('tile.openstreetmap.org')) return;

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
