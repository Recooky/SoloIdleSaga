// sw.js - 全量预缓存方案（修复版）

let expectedCacheName = '';

self.addEventListener('install', event => {
  event.waitUntil(
    (async () => {
      // 1. 获取图片清单 - 使用绝对路径确保正确
      const resp = await fetch('/assets/images/manifest.json');
      const manifest = await resp.json();

      // 根据 manifest 版本号构造缓存名
      expectedCacheName = 'solo-idle-saga-' + manifest.version;

      // 打开（或创建）对应的缓存
      const cache = await caches.open(expectedCacheName);

      const total = manifest.images.length;
      let loaded = 0;

      // 分批缓存，每批 8 张，控制并发
      const BATCH = 8;
      for (let i = 0; i < total; i += BATCH) {
        const batch = manifest.images.slice(i, i + BATCH);
        await Promise.allSettled(
          batch.map(url =>
            // ★ 重要: 使用 full URL 确保 cache.add 能正确解析
            cache.add(new URL(url, self.location.origin)).catch(err => {
              console.warn('预缓存失败:', url, err.message);
            })
          )
        );
        loaded += batch.length;
        // 向页面发送进度
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
          client.postMessage({
            type: 'CACHE_PROGRESS',
            loaded: Math.min(loaded, total),
            total: total
          });
        });
      }

      // 2. 立即激活
      self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    (async () => {
      // 清理所有不是预期缓存的旧缓存
      const keys = await caches.keys();
      await Promise.all(
        keys.filter(key => key !== expectedCacheName)
            .map(key => caches.delete(key))
      );
      // 立即接管所有页面
      await self.clients.claim();
    })()
  );
});

// 拦截图片请求：直接从缓存读取
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // ★ 修改：只匹配路径以 /assets/images/ 开头的请求
  if (!url.pathname.startsWith('/assets/images/')) return;

  event.respondWith(
    (async () => {
      const cache = await caches.open(expectedCacheName);
      const cached = await cache.match(event.request);
      if (cached) return cached;

      // 极端情况：新图片还没缓存到，走网络并缓存
      const response = await fetch(event.request);
      if (response.ok) {
        // 注意：这里没有 await，异步缓存即可
        cache.put(event.request, response.clone()).catch(() => {});
      }
      return response;
    })()
  );
});