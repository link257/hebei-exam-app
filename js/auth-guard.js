/**
 * Auth Guard — 检查登录态，未登录重定向到 login.html
 * 无外部依赖，通过 localStorage 判断 Supabase 会话是否存在
 */
(function () {
  // 调试后门：?debug=true 绕过守卫（方便调试）
  if (window.location.search.indexOf('debug=true') !== -1) {
    console.warn('[auth-guard] ?debug=true 已绕过登录守卫');
    return;
  }

  var hasToken = Object.keys(localStorage).some(function (k) {
    return k.startsWith('sb-') && k.endsWith('-auth-token');
  });
  if (!hasToken) {
    document.body.insertAdjacentHTML(
      'afterbegin',
      '<div id="__auth_guard" style="position:fixed;inset:0;background:#fff;z-index:99999;display:flex;align-items:center;justify-content:center;color:#999;font-size:14px;">正在跳转…</div>'
    );
    window.location.replace('login.html');
  }
})();
