// sw.js - 全量预缓存方案（修复 GitHub Pages 路径问题）
// ★ 自动获取当前 scope 路径（兼容 GitHub Pages 子目录）
const urlParams = new URLSearchParams(self.location.search);
const BASE_PATH = urlParams.get('base') || '/';
const MANIFEST_URL = BASE_PATH + 'assets/images/manifest.json';

let expectedCacheName = '';

self.addEventListener('install', event => {
  event.waitUntil(
    (async () => {
      // 1. 获取图片清单（使用基于 scope 的绝对路径）
      const resp = await fetch(MANIFEST_URL);
      const manifest = await resp.json();

      // 根据 manifest 版本号构造缓存名
      expectedCacheName = 'solo-idle-saga-' + manifest.version;

      const cache = await caches.open(expectedCacheName);

      const total = manifest.images.length;
      let loaded = 0;
      const BATCH = 8;

      for (let i = 0; i < total; i += BATCH) {
        const batch = manifest.images.slice(i, i + BATCH);
        await Promise.allSettled(
          batch.map(url => {
            // ★ 将 manifest 中的 /assets/images/... 转为带仓库名的绝对路径
            const fullUrl = BASE_PATH.replace(/\/$/, '') + url;
            return cache.add(fullUrl).catch(err => {
              console.warn('预缓存失败:', fullUrl, err.message);
            });
          })
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

      self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter(key => key !== expectedCacheName)
            .map(key => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

// ★ 拦截所有图片请求（适配带仓库前缀的路径）
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // 以实际路径判断：只要路径中包含 /assets/images/ 就认为是游戏图片
  if (!url.pathname.includes('/assets/images/')) return;

  event.respondWith(
    (async () => {
      const cache = await caches.open(expectedCacheName);
      const cached = await cache.match(event.request);
      if (cached) return cached;

      const response = await fetch(event.request);
      if (response.ok) {
        // 异步缓存新图片
        cache.put(event.request, response.clone()).catch(() => {});
      }
      return response;
    })()
  );
});