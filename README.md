<h1 align="center">- ZhiXue Lite Frontend -</h1>

<p align="center">
<img src="https://img.shields.io/github/license/amakerlife/ZhiXue-Lite-frontend" alt="License" />
<img src="https://img.shields.io/github/last-commit/amakerlife/ZhiXue-Lite-frontend">
</p>
<p align="center">
    <img src="https://socialify.git.ci/amakerlife/ZhiXue-Lite-frontend/image?description=1&forks=1&issues=1&language=1&name=1&owner=1&pulls=1&stargazers=1&theme=Light">
</p>

对接智学网官方 API 的轻量 Web 前端。

---

## 快速开始

```bash
git clone https://github.com/amakerlife/ZhiXue-Lite-frontend
cd ZhiXue-Lite-frontend
mv .env.example .env
vim .env
npm install
npm run dev
```

## 技术栈

React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui

## 环境变量

```env
# 后端 API 地址
VITE_API_BASE_URL=http://localhost:5000

# Cloudflare Turnstile 验证码（可选）
VITE_TURNSTILE_ENABLED=false
VITE_CLOUDFLARE_TURNSTILE_SITE_KEY=

# 分析工具配置（可选）
VITE_CLARITY_ENABLED=false
VITE_CLARITY_PROJECT_ID=

VITE_GA_ENABLED=false
VITE_GA_TRACKING_ID=

VITE_UMAMI_ENABLED=false
VITE_UMAMI_WEBSITE_ID=
VITE_UMAMI_SCRIPT_URL=
```

## 开发

```bash
npm run dev
```

## 构建

```bash
npm run build
```

构建产物位于 `dist/` 目录。

## 项目结构

```
src/
├── api/           # API 客户端
├── components/    # React 组件
├── contexts/      # React Context
├── hooks/         # 自定义 Hooks
├── pages/         # 页面组件
├── types/         # TypeScript 类型定义
└── utils/         # 工具函数
```

## 提示

- 确保后端 API 服务已启动并可访问
- 开发环境将默认连接 `http://localhost:5000`
- 生产环境需配置正确的 `VITE_API_BASE_URL`
