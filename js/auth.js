/**
 * Supabase Auth 工具函数
 * 依赖：js/config.js (需先加载)
 * CDN: @supabase/supabase-js@2 (需先加载 UMD 版本)
 */
const AUTH = (() => {
  let client = null;

  async function initClient() {
    if (client) return client;
    await CONFIG_PROMISE;
    if (typeof supabase === 'undefined') {
      throw new Error('请先加载 @supabase/supabase-js');
    }
    client = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY, {
      auth: { autoRefreshToken: true, persistSession: true },
    });
    return client;
  }

  /** 邮箱密码登录 */
  async function login(email, password) {
    const c = await initClient();
    const { data, error } = await c.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  /** 邮箱密码注册 */
  async function register(email, password) {
    const c = await initClient();
    const { data, error } = await c.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  }

  /** 退出登录 */
  async function logout() {
    const c = await initClient();
    const { error } = await c.auth.signOut();
    if (error) throw error;
  }

  /** 获取当前登录用户（未登录返回 null） */
  async function getCurrentUser() {
    const c = await initClient();
    const { data: { session } } = await c.auth.getSession();
    return session?.user ?? null;
  }

  /** 监听 Auth 状态变化 */
  function onAuthChange(callback) {
    initClient().then(c => {
      c.auth.onAuthStateChange(callback);
    });
  }

  /** 从 user_profiles 表获取用户资料 */
  async function getUserProfile(userId) {
    const c = await initClient();
    const { data, error } = await c
      .from('user_profiles')
      .select('is_vip, vip_expire_at, ai_quota_used')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data;
  }

  return { login, register, logout, getCurrentUser, onAuthChange, getUserProfile };
})();
