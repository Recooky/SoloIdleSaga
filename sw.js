const CACHE_NAME = 'solo-idle-saga-v1';

// 安装时预缓存核心资源（可选）
self.addEventListener('install', event => {
  self.skipWaiting();
});

// 激活后清理旧缓存
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
});

// 拦截网络请求：缓存图片
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  // 只处理 assets/images/ 下的图片请求
  if (url.pathname.startsWith('/assets/images/')) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        // 有缓存直接返回，否则去网络获取并缓存
        return cached || fetch(event.request).then(response => {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, response.clone());
            return response;
          });
        });
      })
    );
  }
  // 其他资源不拦截
});