/**
 * Supabase 数据库工具函数
 * 依赖：js/config.js (需在页面中先加载 config.js)
 *
 * 用法示例：
 *   const list = await SUPABASE.fetchQuestions('2024', '综合分析');
 *   const q = await SUPABASE.fetchQuestionById(1);
 */
const SUPABASE = (() => {
  const BASE_URL = CONFIG.SUPABASE_URL.replace(/\/+$/, '');
  const API_KEY  = CONFIG.SUPABASE_KEY;

  /**
   * 对 Supabase REST API 发起 GET 请求
   * @param {string} path - 请求路径（如 'questions?select=id&year=eq.2024'）
   */
  async function request(path) {
    const url = BASE_URL + '/rest/v1/' + path.replace(/^\//, '');
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        apikey: API_KEY,
        Authorization: 'Bearer ' + API_KEY,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`Supabase 请求失败 (${res.status}): ${res.statusText}`);
    }

    return res.json();
  }

  /**
   * 查询题目列表
   * @param {string} [year] - 年份，为空则查全部（如 '2024'）
   * @param {string} [type] - 题型，为空则查全部（如 '综合分析'）
   * @returns {Promise<Array>} 题目数组 [{id, year, question_type, content, difficulty}]
   */
  async function fetchQuestions(year, type) {
    let path = 'questions?select=id,year,question_type,content,difficulty';

    if (year) {
      path += '&year=eq.' + encodeURIComponent(year);
    }
    if (type) {
      path += '&question_type=eq.' + encodeURIComponent(type);
    }

    path += '&order=id.asc';

    return request(path);
  }

  /**
   * 根据 ID 查询单道题目的完整信息
   * @param {number|string} id - 题目 ID
   * @returns {Promise<Object|null>} 题目对象，未找到时返回 null
   */
  async function fetchQuestionById(id) {
    const path = 'questions?select=*&id=eq.' + encodeURIComponent(id) + '&limit=1';
    const result = await request(path);
    return result.length > 0 ? result[0] : null;
  }

  return {
    fetchQuestions,
    fetchQuestionById,
  };
})();
