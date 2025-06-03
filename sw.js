// Create a new file called sw.js
const CACHE_NAME = 'image-cache-v1';
const IMAGE_CACHE_URLS = [
    'https://aa-automods.ca/photos/',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then((cache) => cache.addAll(IMAGE_CACHE_URLS))
    );
});

self.addEventListener('fetch', (event) => {
    if (event.request.url.match(/\.(jpg|jpeg|png|gif|webp|mp4|webm)$/)) {
        event.respondWith(
            caches.match(event.request)
            .then((response) => response || fetch(event.request))
        );
    }
});