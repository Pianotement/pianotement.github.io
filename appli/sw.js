// Service worker de Pianotement.
// Stratégie "réseau d'abord, cache en secours" : tant qu'il y a du réseau, on récupère
// toujours la dernière version en ligne (pratique pendant les tests, aucune version
// périmée ne reste coincée) ; sans réseau, l'app se lance quand même depuis le cache.
//
// Pour forcer tous les appareils à repartir d'un cache propre après une mise à jour
// importante, il suffit de changer le numéro ci-dessous (ex: 'pianotement-v2').
const CACHE_NAME = 'pianotement-v1';

const FICHIERS_A_METTRE_EN_CACHE = [
  './v17.1.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png',
  './piano_app_bg.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FICHIERS_A_METTRE_EN_CACHE).catch(() => {}))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((noms) => Promise.all(
      noms.filter((nom) => nom !== CACHE_NAME).map((nom) => caches.delete(nom))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then((reponse) => {
        const copie = reponse.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copie));
        return reponse;
      })
      .catch(() => caches.match(event.request))
  );
});
