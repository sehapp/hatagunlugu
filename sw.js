self.addEventListener('install', (e) => {
  console.log('Hata Günlüğü PWA: Servis İşçisi Kuruldu');
});

self.addEventListener('fetch', (e) => {
  // Basit geçiş (Network first or transparent)
  e.respondWith(fetch(e.request));
});
