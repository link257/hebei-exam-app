# 河北省公务员面试模拟练习 App 🇨🇳

> 基于 AI 的河北省公务员面试备考练习工具，支持 AI 智能答题、模拟练习、语音作答、统计分析等功能。

[![GitHub stars](https://img.shields.io/github/stars/link257/hebei-exam-app?style=social)](https://github.com/link257/hebei-exam-app)
[![GitHub license](https://img.shields.io/github/license/link257/hebei-exam-app)](https://github.com/link257/hebei-exam-app/blob/main/LICENSE)

## ✨ 功能特性

- 🎯 **AI 智能模拟面试** — 基于 DeepSeek API 的 AI 面试官，模拟真实面试场景
- 🧠 **AI 答题偏好设置** — 支持 5 种题型开场/分析/结尾自定义，AI 回答风格可调
- 🎤 **语音 & 文字双模式作答** — 支持语音录制和文字输入两种答题方式
- 📊 **多维统计分析** — 答题记录、成绩分布、薄弱环节分析
- 📚 **题库管理** — 结构化面试题目分类浏览与练习
- 👑 **尊享会员 VIP 系统** — 会员专享功能与 AI 配额管理
- 📱 **PWA 支持** — 可安装到手机桌面，类原生体验
- ⏱ **省考倒计时** — 实时距省考面试剩余天数

## 🛠 技术栈

| 层级 | 技术 |
|------|------|
| **前端** | HTML5 / CSS3 / JavaScript (原生) |
| **后端** | Node.js + Express |
| **数据库** | Supabase (PostgreSQL) |
| **AI** | DeepSeek API |
| **认证** | Supabase Auth (邮箱/密码) |
| **PWA** | Service Worker + Web Manifest |
| **部署** | 静态文件 + Node.js 服务 |

## 🚀 快速开始

### 前置要求

- Node.js >= 18
- Supabase 项目（用于认证和数据存储）
- DeepSeek API Key

### 安装与运行

```bash
# 克隆仓库
git clone https://github.com/link257/hebei-exam-app.git
cd hebei-exam-app

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 填入以下配置：
#   DEEPSEEK_API_KEY=your_deepseek_api_key
#   SUPABASE_URL=your_supabase_url
#   SUPABASE_ANON_KEY=your_supabase_anon_key

# 启动服务
npm start
```

访问 `http://localhost:3000` 即可使用。

## 📁 项目结构

```
hebei-exam-app/
├── server.js          # Express 服务端入口
├── package.json       # 项目依赖配置
├── .env               # 环境变量配置
├── index.html         # 首页（倒计时/快捷入口）
├── login.html         # 登录页
├── register.html      # 注册页
├── profile.html       # 个人中心 / VIP 会员
├── simulate-prep.html # 模拟面试准备页
├── question-bank.html # 题库浏览
├── question-detail.html # 题目详情
├── voice-answer.html  # 语音作答
├── text-answer.html   # 文字作答
├── ai-answer.html     # AI 智能回答
├── analysis.html      # AI 分析报告
├── record.html        # 答题记录
├── statistics.html    # 统计分析
├── splash.html        # 启动屏
├── sw.js              # Service Worker
├── manifest.json      # PWA 清单
├── css/
│   └── shared.css     # 全局样式
├── js/
│   ├── config.js      # 前端配置
│   ├── auth.js        # 认证逻辑
│   ├── auth-guard.js  # 路由守卫
│   └── supabase.js    # Supabase 客户端
└── assets/
    ├── icon-192.png   # PWA 图标
    └── icon-512.png   # PWA 图标
```

## 📱 PWA 支持

本应用支持作为渐进式 Web 应用（PWA）安装到手机桌面：
- ✅ 离线缓存策略
- ✅ 独立窗口运行
- ✅ 适合移动端练习场景

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 提交 Pull Request

## 📄 开源协议

本项目基于 MIT 协议开源 — 详见 [LICENSE](LICENSE) 文件。

---

<p align="center">Made with ❤️ for 河北省考面试考生 · 坚持练习，从容上岸</p>
