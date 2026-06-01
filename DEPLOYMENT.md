# Netlify 部署指南

本项目可以部署到 Netlify，但需要注意 **SQLite 数据库的持久化限制**。

---

## ⚠️ 重要说明

**Netlify 是无服务器平台，不支持持久化的 SQLite 文件存储。**

每次部署后，`safety-form.db` 数据库文件会被重置为构建时的初始状态。

### 解决方案

根据你的需求选择方案：

| 方案 | 适用场景 | 说明 |
|------|---------|------|
| **A. 静态内容展示** | 只展示知识库和案例 | ✅ 推荐，最简单 |
| **B. 外部数据库** | 需要完整功能（考试、申报） | 使用 Turso/Supabase 替代 SQLite |
| **C. 只读部署** | 展示内容，不提供交互 | 不需要数据库 |

---

## 📦 方案 A：静态内容展示（推荐）

适合只需要展示知识库和事故案例的场景。

### 步骤 1：更新 astro.config.mjs

确保配置为 SSR + Netlify adapter：

```javascript
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import netlify from '@astrojs/netlify';

export default defineConfig({
  integrations: [react(), tailwind()],
  output: 'hybrid', // 或 'static' 如果完全不需要服务端渲染
  adapter: netlify(),
});
```

### 步骤 2：安装 Netlify Adapter

```bash
npm install @astrojs/netlify
```

### 步骤 3：创建 netlify.toml

在项目根目录创建 `netlify.toml`：

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/.netlify/functions/[function]"
  status = 200
```

### 步骤 4：处理数据库数据

由于 Netlify 无法持久化 SQLite，建议：

1. **预构建数据到页面** - 直接在 Astro 页面中使用静态数据
2. **或使用 API Mock** - 构建时将数据导出为 JSON 文件

### 步骤 5：连接 GitHub 到 Netlify

1. 登录 [Netlify](https://www.netlify.com)
2. 点击 "New site from Git"
3. 选择你的 GitHub 仓库
4. 配置：
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. 点击 "Deploy site"

---

## 🔄 方案 B：使用外部数据库（完整功能）

如果需要考试、申报等完整功能，建议使用 **Turso**（SQLite-compatible 数据库服务）。

### 步骤 1：注册 Turso

1. 访问 [turso.tech](https://turso.tech)
2. 创建账号
3. 创建数据库

### 步骤 2：安装 Turso 客户端

```bash
npm install @libsql/client
```

### 步骤 3：更新数据库连接

创建 `src/lib/db-turso.ts`：

```typescript
import { createClient } from '@libsql/client';

const db = createClient({
  url: import.meta.env.TURSO_DATABASE_URL,
  authToken: import.meta.env.TURSO_AUTH_TOKEN,
});

export { db };
```

### 步骤 4：迁移数据到 Turso

```bash
# 安装 turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# 登录
turso auth login

# 创建数据库
turso db create wind-safety

# 迁移本地数据
turso db shell wind-safety < dump.sql
```

### 步骤 5：配置环境变量

在 Netlify 后台设置：

| 变量名 | 值 |
|--------|-----|
| `TURSO_DATABASE_URL` | `libsql://...turso.io` |
| `TURSO_AUTH_TOKEN` | 你的认证令牌 |
| `OSS_ACCESS_KEY_ID` | 阿里云 OSS Key |
| `OSS_ACCESS_KEY_SECRET` | 阿里云 OSS Secret |
| `OSS_REGION` | `oss-cn-shanghai` |
| `OSS_BUCKET` | 你的 Bucket 名称 |
| `JWT_SECRET` | 随机字符串 |

---

## 📋 部署检查清单

### 构建前检查

- [ ] `npm run build` 在本地能成功
- [ ] `dist/` 目录正确生成
- [ ] 所有环境变量已配置
- [ ] `.env` 在 `.gitignore` 中（不提交）

### Netlify 配置检查

- [ ] Build command: `npm run build`
- [ ] Publish directory: `dist`
- [ ] Node version: 18 或更高
- [ ] 所有环境变量已在 Netlify 后台设置

### 部署后检查

- [ ] 首页正常加载
- [ ] CSS 样式正确
- [ ] 知识库文章显示
- [ ] 事故案例显示
- [ ] （如适用）考试功能正常

---

## 🎯 快速部署命令

使用 Netlify CLI 一键部署：

```bash
# 安装 Netlify CLI
npm install -g netlify-cli

# 登录
netlify login

# 初始化项目
netlify init

# 部署
netlify deploy --prod
```

---

## ⚡ 优化建议

### 1. 图片优化

- 使用 Netlify Large Media 处理大文件
- 或继续使用阿里云 OSS 存储图片

### 2. 构建缓存

在 `netlify.toml` 中添加：

```toml
[build.processing]
  skip_processing = false

[build.environment]
  NETLIFY_CACHE_DIR = ".netlify/cache"
```

### 3. 自定义域名

在 Netlify 后台 "Site settings" → "Domain management" 中设置。

---

## 🔍 常见问题

### Q: 构建失败，找不到模块？

**A:** 确保 `package.json` 中所有依赖都正确列出，运行 `npm install` 后再构建。

### Q: API 路由 404？

**A:** 确保 `astro.config.mjs` 中设置了 `output: 'server'` 或 `output: 'hybrid'`，并使用了 Netlify adapter。

### Q: 数据库数据丢失？

**A:** 这是预期行为，Netlify 不持久化文件。请使用方案 B 的外部数据库。

### Q: OSS 上传失败？

**A:** 检查 OSS 的 CORS 配置，允许 Netlify 域名访问。

---

## 📞 支持

如遇部署问题，查看：
- Netlify 部署日志
- 浏览器控制台错误
- Astro 构建输出

---

**下一步**: 选择适合你的部署方案，开始部署！ 🚀