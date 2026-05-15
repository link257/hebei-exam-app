/**
 * Auth Guard — 页面加载时检查登录态，未登录则重定向到 login.html
 * 依赖（需在前序 script 中加载）：
 *   1. js/config.js          — 提供 CONFIG_PROMISE
 *   2. @supabase/supabase-js  — 提供 window.supabase.createClient
 */
(async function authGuard() {
  const overlayId = '__auth_guard';
  document.body.insertAdjacentHTML(
    'afterbegin',
    `<div id="${overlayId}" style="position:fixed;inset:0;background:#fff;z-index:99999;display:flex;align-items:center;justify-content:center;color:#999;font-size:14px;">验证登录状态…</div>`
  );
  try {
    await CONFIG_PROMISE;
    if (!CONFIG.SUPABASE_URL) {
      // 配置未加载（如 Railway 缺少环境变量），仍跳转登录页
      window.location.replace('login.html');
      return;
    }
    const c = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
    const { data: { session } } = await c.auth.getSession();
    if (!session) {
      window.location.replace('login.html');
      return;
    }
  } catch (e) {
    console.error('Auth guard error:', e);
    window.location.replace('login.html');
  }
  document.getElementById(overlayId)?.remove();
})();
