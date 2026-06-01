# 风电大件运输安全知识中心

> Wind Power Heavy-Lift Transport Safety Knowledge Center

一个面向风电大件运输行业的综合安全知识管理平台，涵盖知识库、事故案例、安全考试等功能。

---

## 📋 项目概述

本项目旨在为风电大件运输企业提供一套完整的安全知识管理体系，帮助企业：

- 建立标准化知识库
- 积累和管理事故案例
- 进行安全知识考核
- 规范操作流程

### 核心功能

| 模块       | 说明                           |
| -------- | ---------------------------- |
| **知识库**  | 风电大件（叶片、塔筒、机舱等）运输相关技术文档和操作指南 |
| **事故案例** | 真实事故案例分析，包含原因、教训、预防措施        |
| **安全考试** | 在线安全知识考试，自动评分和成绩记录           |
| **安全申报** | 安全检查、培训记录、应急演练等申报管理          |
| **路线监控** | 模拟运输路线监控展示                   |

---

## 🛠 技术栈

| 技术                 | 版本   | 用途                |
| ------------------ | ---- | ----------------- |
| **Astro**          | 4.x  | SSR 框架            |
| **React**          | 18.x | 交互式组件             |
| **TailwindCSS**    | 3.x  | 样式框架              |
| **SQLite**         | -    | 数据库               |
| **better-sqlite3** | -    | Node.js SQLite 驱动 |
| **TypeScript**     | 5.x  | 开发语言              |

---

## 📁 项目结构

```
E:\claude desktop\V2\
├── .env                    # 环境变量配置（不上传git）
├── .gitignore              # Git忽略配置
├── astro.config.mjs        # Astro配置
├── package.json            # 依赖管理
├── tailwind.config.mjs     # Tailwind配置
├── safety-form.db           # SQLite数据库文件
│
├── public/                 # 静态资源
│
├── src/
│   ├── components/         # React组件
│   │   ├── ui/            # UI基础组件
│   │   │   ├── button.tsx
│   │   │   ├── SparklesCore.tsx
│   │   │   └── background-paths.tsx
│   │   ├── HeroParticles.tsx
│   │   ├── SiteParticles.tsx
│   │   ├── MobileNav.tsx
│   │   ├── ExamSystem.tsx       # 考试系统组件
│   │   ├── FileUpload.tsx       # 文件上传组件（OSS）
│   │   └── KnowledgeLibrarySection.tsx  # 知识库组件
│   │
│   ├── pages/              # Astro页面
│   │   ├── index.astro         # 首页
│   │   ├── exam.astro         # 考试页面
│   │   ├── form-demo.astro    # 申报表单演示
│   │   ├── 404.astro          # 404页面
│   │   │
│   │   ├── admin/            # 管理后台
│   │   │   ├── login.astro    # 登录页
│   │   │   ├── index.astro    # 管理后台首页
│   │   │   └── exam/
│   │   │       ├── dashboard.astro  # 考试仪表盘
│   │   │       └── manage.astro     # 考试管理
│   │   │
│   │   ├── api/              # API路由
│   │   │   ├── form-submit.ts      # 表单提交（数据库初始化）
│   │   │   ├── oss-sign.ts         # OSS上传签名
│   │   │   ├── auth/               # 认证相关
│   │   │   │   ├── login.ts
│   │   │   │   ├── logout.ts
│   │   │   │   └── me.ts
│   │   │   ├── knowledge/          # 知识库API
│   │   │   │   ├── articles.ts     # 文章列表
│   │   │   │   ├── cases.ts        # 案例列表
│   │   │   │   └── article/
│   │   │   │       └── [id].ts     # 文章详情
│   │   │   ├── exam/              # 考试API
│   │   │   │   ├── projects.ts
│   │   │   │   ├── questions.ts
│   │   │   │   ├── records.ts
│   │   │   │   └── stats.ts
│   │   │   └── records/            # 记录API
│   │   │       ├── list.ts
│   │   │       ├── [id].ts
│   │   │       └── download.ts
│   │   │
│   │   └── library/          # 文章详情页
│   │       └── article/
│   │           └── [id].astro
│   │
│   ├── lib/                 # 工具库
│   │   ├── auth.ts          # 认证工具
│   │   ├── utils.ts        # 通用工具
│   │   └── oss.ts          # OSS工具
│   │
│   └── styles/
│       └── global.css       # 全局样式
│
├── scripts/                # 工具脚本
│   └── init-knowledge.cjs  # 数据初始化脚本
│
└── downloaded-site/        # 下载的参考网站
```

---

## 🚀 快速开始

### 环境要求

- Node.js >= 18.x
- npm >= 9.x

### 安装依赖

```bash
npm install
```

### 配置环境变量

创建 `.env` 文件：

```bash
# 阿里云OSS配置
OSS_ACCESS_KEY_ID=your_access_key_id
OSS_ACCESS_KEY_SECRET=your_access_key_secret
OSS_REGION=oss-cn-shanghai
OSS_BUCKET=your_bucket_name

# JWT密钥
JWT_SECRET=your-secret-key-change-in-production
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:4321

### 构建生产版本

```bash
npm run build
npm run preview
```

---

## 📊 数据库

### 数据库文件

- 位置: `./safety-form.db`
- 类型: SQLite

### 数据表

| 表名                   | 说明     |
| -------------------- | ------ |
| `form_records`       | 安全申报记录 |
| `users`              | 用户账户   |
| `exam_projects`      | 考试项目   |
| `exam_questions`     | 考试题目   |
| `exam_records`       | 考试记录   |
| `knowledge_articles` | 知识库文章  |
| `accident_cases`     | 事故案例   |

### 数据初始化

运行 `scripts/init-knowledge.cjs` 初始化知识库和案例数据：

```bash
node scripts/init-knowledge.cjs
```

---

## 🔌 API 文档

### 知识库 API

| 方法  | 路径                                | 说明     |
| --- | --------------------------------- | ------ |
| GET | `/api/knowledge/articles`         | 获取文章列表 |
| GET | `/api/knowledge/articles?id={id}` | 获取文章详情 |
| GET | `/api/knowledge/cases`            | 获取案例列表 |
| GET | `/api/knowledge/cases?id={id}`    | 获取案例详情 |

### 考试 API

| 方法   | 路径                                    | 说明       |
| ---- | ------------------------------------- | -------- |
| GET  | `/api/exam/projects`                  | 获取考试项目列表 |
| GET  | `/api/exam/questions?project_id={id}` | 获取题目     |
| POST | `/api/exam/records`                   | 提交考试记录   |
| GET  | `/api/exam/stats`                     | 获取统计信息   |

### 文件上传 API

| 方法   | 路径              | 说明        |
| ---- | --------------- | --------- |
| POST | `/api/oss-sign` | 获取OSS上传签名 |

---

## 🔐 安全配置

### 敏感信息

| 项目            | 处理方式                     |
| ------------- | ------------------------ |
| `.env`        | 不上传git，已在`.gitignore`中排除 |
| OSS AccessKey | 通过后端签名避免前端暴露             |
| JWT Secret    | 环境变量配置                   |

### 建议

1. **定期轮换 AccessKey** - 在阿里云控制台删除旧密钥并创建新密钥
2. **使用HTTPS** - 生产环境务必使用HTTPS
3. **限制OSS权限** - 使用RAM子账号，限制OSS权限

---

## 🎨 自定义配置

### Tailwind 主题

编辑 `tailwind.config.mjs` 自定义主题色：

```javascript
colors: {
  'navy-950': '#040E1A',
  'orange-safety': '#F97316',
  'cyan-wind': '#22D3EE',
}
```

### 样式类

| 类名                 | 说明                |
| ------------------ | ----------------- |
| `font-display`     | Chakra Petch 字体   |
| `font-mono`        | JetBrains Mono 字体 |
| `glass-panel`      | 玻璃态面板             |
| `technical-border` | 技术感边框             |

---

## 📦 部署

### 构建

```bash
npm run build
```

生成 `dist/` 目录。

### 环境变量

部署时需要配置：

- `OSS_ACCESS_KEY_ID`
- `OSS_ACCESS_KEY_SECRET`
- `OSS_REGION`
- `OSS_BUCKET`
- `JWT_SECRET`

### 注意事项

1. 数据库文件 `safety-form.db` 需要随项目部署
2. 确保服务器可以访问阿里云OSS
3. CORS 配置需要允许前端域名

---

## 🧪 开发指南

### 添加新的API路由

在 `src/pages/api/` 下创建新文件：

```typescript
// src/pages/api/example.ts
import type { APIRoute } from "astro";
import { initDB } from "../form-submit";

export const GET: APIRoute = async () => {
  const db = await initDB();
  const data = await db.all('SELECT * FROM table');
  await db.close();
  return new Response(JSON.stringify({ success: true, data }));
};
```

### 添加新的React组件

在 `src/components/` 下创建：

```tsx
"use client";
import React, { useState } from "react";

export function MyComponent() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

在 Astro 页面中使用：

```astro
<MyComponent client:load />
```

### 路径引用规则

| 文件位置                                      | 引用 `form-submit.ts` 路径 |
| ----------------------------------------- | ---------------------- |
| `src/pages/api/knowledge/article/[id].ts` | `../../form-submit`    |
| `src/pages/index.astro`                   | `./api/form-submit`    |

---

## 📄 许可证

MIT License

---

## 🙏 致谢

- Astro 框架
- TailwindCSS
- React
- 阿里云OSS

---

**版本**: 1.0.0
**最后更新**: 2026-05-31