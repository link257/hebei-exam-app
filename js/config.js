/**
 * 应用配置
 * 优先读取服务端注入的 __ENV__（同步，无网络开销），
 * 兜底通过 /api/config 异步拉取。
 */
const CONFIG = {};

var CONFIG_PROMISE;

if (window.__ENV__ && window.__ENV__.SUPABASE_URL) {
  Object.assign(CONFIG, window.__ENV__);
  CONFIG_PROMISE = Promise.resolve();
} else {
  CONFIG_PROMISE = fetch('/api/config').then(function (r) {
    if (!r.ok) throw new Error('配置加载失败');
    return r.json();
  }).then(function (data) {
    Object.assign(CONFIG, data);
  }).catch(function (err) {
    console.error('[config] /api/config 加载失败:', err);
  });
}
