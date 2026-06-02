# 风电大件运输安全知识平台 - 项目文档

## 📋 项目简介

**风电大件运输安全知识平台** 是一个面向风电工程行业的安全管理系统，包含：

- 📚 **安全知识库** - 整理各种运输场景的安全知识文章
- 📋 **事故案例库** - 分类整理历史事故案例，分析原因和预防措施
- 📝 **安全检查记录** - 支持现场填写安全检查记录表，上传附件照片，存储到云端
- 📋 **在线安全考试系统** - 支持创建考试项目，添加考题，驾驶员在线考试，自动统计成绩

---

## 🏗️ 技术架构

### 当前部署架构（Vercel + Turso + 阿里云 OSS）

```
┌─────────────┐
│   浏览器用户   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Vercel CDN   │  静态资源
│  Edge Network │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Vercel Functions │  API 路由 & 服务端渲染
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Turso      │  libSQL 数据库  ← 存储业务数据
│  (edge)      │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  阿里云 OSS  │  文件存储     ← 存储用户上传的附件照片
└─────────────┘
```

### 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 框架 | [Astro](https://astro.build/) | 全栈 SSR 框架 |
| 样式 | [Tailwind CSS](https://tailwindcss.com/) | 原子化 CSS |
| 前端组件 | [React](https://reactjs.org/) | 交互组件 |
| 数据库 | [Turso](https://turso.tech/) | 边缘 libSQL 数据库 |
| 部署 | [Vercel](https://vercel.com/) | 边缘计算部署 |
| 文件存储 | 阿里云 OSS | 用户上传附件存储 |
| 认证 | JWT + bcrypt | 管理员登录认证 |

---

## ✨ 功能模块

### 1. 🏠 首页
- 展示网站介绍
- 加载最新事故案例列表
- 加载知识库分类导航
- 粒子动画背景效果

### 2. 📚 知识库
- 按分类浏览文章
- 支持文章详情页阅读
- 已经整理了 **20 篇** 风电大件运输相关安全知识文章

### 3. 📂 事故案例
- 分类展示历史事故案例
- 包含 **事故描述 / 原因分析 / 预防措施** 完整结构
- 已经整理了 **18 个** 典型事故案例

### 4. 📝 安全检查记录
- 表单填写：项目名称 / 检查日期 / 物流公司 / 执行人 / 类型 / 地点 / 描述
- 文件上传：支持多文件拖拽上传，上传到阿里云 OSS
- 提交后保存到 Turso 数据库
- 管理员后台可以查看所有记录

### 5. 📋 在线安全考试
- 管理员后台：创建考试项目 / 添加考题 / 统计成绩
- 考生前台：选择考试项目 → 在线答题 → 自动计算成绩 → 判断是否及格
- 支持单选题 / 多选题
- 自动统计所有考试记录

### 6. 🔐 管理员后台
- 登录 / 登出
- 安全检查记录列表查看
- 考试项目管理
- 考题管理
- 考试成绩统计 Dashboard
  - 总体统计：总人数 / 通过人数 / 通过率 / 平均分
  - 按公司统计
  - 按日期统计图表

---

## 🗄️ 数据库表结构

### `form_records` - 安全检查记录表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键，自增 |
| project_name | TEXT | 项目名称 |
| check_date | TEXT | 检查日期 |
| logistics_company | TEXT | 物流公司 |
| operator | TEXT | 执行人 |
| type | TEXT | 类型：安全检查 / 安全培训 / 应急演练 / 其他 |
| location | TEXT | 检查地点 |
| description | TEXT | 检查内容描述 |
| files | TEXT | JSON 字符串，存储上传文件列表 |
| created_at | DATETIME | 创建时间 |

### `users` - 用户管理员表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| username | TEXT | 用户名，唯一 |
| password | TEXT | bcrypt 加密密码 |
| role | TEXT | 角色：admin / user |
| created_at | DATETIME | 创建时间 |

### `exam_projects` - 考试项目表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| name | TEXT | 考试项目名称 |
| description | TEXT | 描述 |
| pass_score | INTEGER | 及格分数 |
| total_score | INTEGER | 总分 |
| duration | INTEGER | 考试限时（分钟） |
| is_active | BOOLEAN | 是否启用 |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

### `exam_questions` - 考试题表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| project_id | INTEGER | 关联考试项目，外键 |
| type | TEXT | 类型：single / multiple |
| question | TEXT | 题目内容 |
| options | TEXT | JSON 选项列表 |
| answer | TEXT | JSON 正确答案 |
| score | INTEGER | 本题分值 |
| sort_order | INTEGER | 排序 |
| created_at | DATETIME | 创建时间 |

### `exam_records` - 考试记录表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| project_id | INTEGER | 关联考试项目 |
| company | TEXT | 考生公司 |
| name | TEXT | 考生姓名 |
| position | TEXT | 考生岗位 |
| score | INTEGER | 得分 |
| total_score | INTEGER | 总分 |
| duration | INTEGER | 用时（分钟） |
| passed | BOOLEAN | 是否及格 |
| answers | TEXT | JSON 用户答案 |
| created_at | DATETIME | 考试时间 |

### `knowledge_articles` - 知识库文章表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| title | TEXT | 文章标题 |
| category | TEXT | 文章分类 |
| content | TEXT | 文章内容（HTML） |
| author | TEXT | 作者 |
| views | INTEGER | 浏览次数 |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

### `accident_cases` - 事故案例表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| title | TEXT | 案例标题 |
| description | TEXT | 事故描述 |
| severity | TEXT | 严重程度：一般 / 较大 / 重大 / 特别重大 |
| cause | TEXT | 事故原因分析 |
| prevention | TEXT | 预防改进措施 |
| location | TEXT | 发生地点 |
| date | TEXT | 发生日期 |
| created_at | DATETIME | 记录创建时间 |
| updated_at | DATETIME | 记录更新时间 |

---

## 🚀 部署说明

### 前置要求

- [Turso](https://turso.tech/) 账号 - 免费额度足够个人使用
- [Vercel](https://vercel.com/) 账号 - 免费部署
- 阿里云 OSS - 存储用户上传附件（可选，如果不需要上传功能可以去掉）
- Node.js 18+ 开发环境

### 环境变量配置

在 `.env` 文件或 Vercel 环境变量页面设置：

```env
# Turso 数据库
TURSO_DATABASE_URL=libsql://your-database-yourname.turso.io
TURSO_AUTH_TOKEN=your-auth-token-here

# 阿里云 OSS（文件存储）
OSS_ACCESS_KEY_ID=your-access-key-id
OSS_ACCESS_KEY_SECRET=your-access-key-secret
OSS_REGION=oss-cn-shanghai
OSS_BUCKET=your-bucket-name

# JWT 签名密钥（改一个复杂的随机字符串）
JWT_SECRET=your-jwt-secret-change-in-production
```

### 本地开发

```bash
# 安装依赖
npm install

# 开发模式启动
npm run dev

# 构建
npm run build
```

### 数据库初始化

如果你是第一次部署，需要先初始化数据库：

```bash
# 确保已经设置了 .env 文件中的 TURSO_* 变量
node scripts/init-turso.mjs
```

### 数据迁移从 SQLite 到 Turso

如果原来本地 SQLite 已经有数据了，可以迁移到 Turso：

```bash
node scripts/migrate-to-turso.mjs
```

这个脚本会读取本地 `safety-form.db` 并把所有数据插入到 Turso。

---

## 🌿 维护指南

### 添加新的知识库文章

有两种方式：

**方式 1：** 通过脚本生成（推荐）

```bash
node scripts/generate-knowledge.cjs "文章标题" "分类名称"
```

脚本会自动在 `downloaded-site/assets` 生成 `.md` 文件，然后你编辑内容后，运行脚本导入到数据库：

```bash
node scripts/init-knowledge.cjs
```

**方式 2：** 直接在管理员后台添加

### 添加新的事故案例

类似知识库，使用脚本：

```bash
node scripts/update-cases.cjs
```

### 添加新的考试项目

1. 登录管理员后台 `/admin/exam/manage`
2. 点击 "新建考试项目"
3. 填写项目信息，创建
4. 在考题管理页面添加考题

---

## 📁 文件目录说明

```
E:\claude desktop\V2
├── .backup/                    # 备份目录
│   └── backup-*.tar.gz        # 完整项目备份
├── .vercel/                   # Vercel 构建输出（不提交 git）
├── node_modules/              # npm 依赖（不提交 git）
├── public/                   # 静态资源
├── scripts/                  # 工具脚本
│   ├── generate-exam.cjs       # 生成考试数据
│   ├── generate-knowledge.cjs # 生成知识库文章
│   ├── init-knowledge.cjs     # 初始化知识库到数据库
│   ├── init-turso.mjs         # 初始化 Turso 数据库 schema
│   ├── migrate-to-turso.mjs   # 从 SQLite 迁移数据到 Turso
│   └── update-cases.cjs      # 更新事故案例
├── src/
│   ├── components/           # React 组件
│   ├── lib/
│   │   ├── auth.ts            # JWT 认证工具
│   │   ├── db.ts             # Turso 数据库连接
│   │   ├── oss.ts            # 阿里云 OSS 签名工具
│   │   └── utils.ts          # 通用工具
│   ├── pages/               # Astro 页面
│   │   ├── admin/           # 管理员后台页面
│   │   │   └── exam/        # 考试管理
│   │   ├── api/             # API 路由
│   │   │   ├── auth/        # 认证登录
│   │   │   ├── exam/        # 考试相关 API
│   │   │   ├── knowledge/   # 知识库 API
│   │   │   └── records/     # 检查记录 API
│   │   ├── library/        # 知识库文章页面
│   │   └── *.astro          # Astro 页面文件
│   └── styles/             # 全局样式
├── .env                    # 环境变量模板（git 跟踪，方便本地开发）
├── .gitignore              # git 忽略文件
├── DEPLOY_TO_VERCEL_TURSO.md # 部署指南
├── PROJECT.md              # 本文档
├── README.md              # 项目简介
├── astro.config.mjs        # Astro 配置
├── package.json           # npm 依赖
├── tailwind.config.mjs    # Tailwind 配置
├── vercel.json             # Vercel 配置
└── safety-form.db         # 原始 SQLite 数据库（开发用）
```

---

## 🔧 常见问题

### Q: 提交表单提示 "请填写完整信息"，但是我都填了

**A:** 检查：
1. 是否至少上传了一个附件？代码要求 `files.length > 0`
2. 检查每个字段是否都填写了，后端校验要求所有字段都不为空

### Q: 上传文件失败

**A:** 检查：
1. 阿里云 OSS 环境变量是否正确配置
2. 检查 OSS CORS 配置，允许跨域从你的网站上传
3. 检查文件大小，单个文件限制 50MB，总共 10 个文件

### Q: 网站打开正常，但是知识库 / 案例列表是空的

**A:** 说明数据没有迁移成功，请重新运行：

```bash
node scripts/migrate-to-turso.mjs
```

确保输出显示 "Migration completed successfully" 并且统计各表数据条数正确。

### Q: 修改代码后，Vercel 没有更新

**A:** 在 Vercel 项目页面点击 "Redeploy" 强制重新部署，或者等待 GitHub webhook 触发部署。

### Q: 怎么回滚到原来本地 SQLite 版本？

**A:** 项目完整备份在 `.backup/backup-*.tar.gz`，解压恢复即可，代码 git 可以切回迁移前分支。

---

## 📊 当前数据统计

| 模块 | 数据条数 |
|------|---------|
| 安全检查记录 | 6 |
| 考试项目 | 4 |
| 考试题 | 69 |
| 考试记录 | 6 |
| 知识库文章 | 20 |
| 事故案例 | 18 |
| **总计** | **123** |

---

## 📝 开发日志

### 2026-06-01 迁移完成

- ✅ 从本地 SQLite 成功迁移到 **Vercel + Turso** 架构
- ✅ 所有 123 条数据完整迁移
- ✅ 适配 Turso libSQL 客户端
- ✅ 修复 null 值类型问题
- ✅ GitHub PR 创建完成

---

## 📄 License

MIT

---

**维护者：** 项目团队

**最后更新：** 2026-06-01
