const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';

if (!DEEPSEEK_API_KEY) {
  console.error('❌ 请在 .env 中配置 DEEPSEEK_API_KEY');
  process.exit(1);
}

app.use(cors());
app.use(express.json());

// ============================================================
//  配置注入中间件 — 在 HTML 响应中注入 __ENV__
// ============================================================
const ENV_SCRIPT = `<script>window.__ENV__ = ${JSON.stringify({
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
})};</script>`;

function injectEnv(req, res, next) {
  const original = res.send;
  res.send = function (body) {
    if (body && typeof body === 'string' && res.get('Content-Type')?.startsWith('text/html')) {
      body = body.replace('</head>', ENV_SCRIPT + '</head>');
    }
    return original.call(this, body);
  };
  next();
}
app.use(injectEnv);

// ============================================================
//  API 路由（放在静态文件路由之前）
// ============================================================

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// 前端配置（从 .env 安全注入）
app.get('/api/config', (req, res) => {
  res.json({
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  });
});

// 生成参考答案（流式 SSE）
app.post('/api/generate-answer', async (req, res) => {
  const { question, userAnswer } = req.body;

  if (!question) {
    return res.status(400).json({ error: '缺少题目内容 (question)' });
  }

  // ===== Prompt 构建 =====
  const systemPrompt = `你是一位资深的河北省公务员面试考官，擅长精准评分和撰写高质量参考答案。

## 评分维度
- 观点明确 (权重20%)：立场鲜明，观点突出
- 逻辑清晰 (权重25%)：结构合理，层次分明
- 内容充实 (权重25%)：论据充分，结合实际
- 语言表达 (权重15%)：流畅自然，用词准确
- 对策可行 (权重15%)：建议具体，可操作性强

## 参考答案要求
- 总长度：500-650字
- 口述时长：2.5-3分钟
- 满分：100分（给出一个具体的整数分数，如84、87、92等）
- 击败百分比：根据分数给出合理的击败考生百分比

## 结构规范
1. **金句开场** — 用一句有感染力的话点题
2. **核心分析** — 深度剖析问题本质（2-3个层面）
3. **AI创新建议** — 必须包含数字化/AI在政府治理中的应用
4. **传统对策** — 2-3条切实可行的建议
5. **升华结语** — 结合政策高度或价值理念收尾

## 案例引用（优先使用河北本地案例）
- 雄安新区建设经验
- 首钢智新科技转型
- 塞罕坝机械林场精神

## 输出格式
以 JSON 形式输出以下字段（注意：输出纯 JSON，不要用 markdown 代码块包裹）：
{
  "score": <整数分数>,
  "beat_percent": <整数百分比>,
  "dimensions": {
    "观点明确": <0-10浮点数>,
    "逻辑清晰": <0-10浮点数>,
    "内容充实": <0-10浮点数>,
    "语言表达": <0-10浮点数>,
    "对策可行": <0-10浮点数>
  },
  "sections": {
    "opening": "金句开场段落",
    "analysis": "核心分析段落",
    "innovation": "AI创新建议段落",
    "measures": "传统对策段落",
    "conclusion": "升华结语段落"
  }
}`;

  const userPrompt = `请根据以下面试答题内容，给出评分和参考答案。

## 题目
${question}

${userAnswer ? `## 考生的回答\n${userAnswer}` : '## 考生的回答\n（暂无考生回答，请直接给出参考范文）'}`;

  try {
    const deepseekRes = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        stream: true,
        temperature: 0.7,
        max_tokens: 4096,
      }),
    });

    if (!deepseekRes.ok) {
      const errText = await deepseekRes.text().catch(() => '');
      console.error('DeepSeek API error:', deepseekRes.status, errText);
      return res.status(502).json({ error: `DeepSeek API 请求失败 (${deepseekRes.status})` });
    }

    // SSE 响应头
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    const reader = deepseekRes.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    function processChunk(chunk) {
      buffer += chunk;
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === 'data: [DONE]') {
          if (trimmed === 'data: [DONE]') {
            res.write('data: [DONE]\n\n');
          }
          continue;
        }
        if (trimmed.startsWith('data: ')) {
          try {
            const json = JSON.parse(trimmed.slice(6));
            const content = json.choices?.[0]?.delta?.content || '';
            if (content) {
              res.write(`data: ${JSON.stringify({ content })}\n\n`);
            }
          } catch { /* 跳过解析失败的行 */ }
        }
      }
    }

    function pump() {
      reader.read().then(({ done, value }) => {
        if (done) {
          if (buffer.trim()) processChunk('\n' + buffer);
          res.write('data: [DONE]\n\n');
          res.end();
          return;
        }
        processChunk(decoder.decode(value, { stream: true }));
        pump();
      }).catch(err => {
        console.error('Stream read error:', err);
        res.write('data: [DONE]\n\n');
        res.end();
      });
    }

    pump();
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// ============================================================
//  静态文件路由（前端页面）
// ============================================================

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// /xxx → /xxx.html
app.get('/:page', (req, res, next) => {
  const page = req.params.page;
  if (page.includes('.')) return next(); // 带后缀的交给 static 处理
  const filePath = path.join(__dirname, page + '.html');
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    next();
  }
});

// 静态资源（css, js, assets 等）
app.use(express.static(__dirname, {
  extensions: ['html'],
  index: false,
}));

// ============================================================
//  启动
// ============================================================
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ 服务器已启动: http://0.0.0.0:${PORT}`);
  console.log(`📡 POST http://0.0.0.0:${PORT}/api/generate-answer`);
  console.log(`🩺 GET  http://0.0.0.0:${PORT}/api/health`);
});
