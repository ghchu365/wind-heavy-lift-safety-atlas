# 部署到 Vercel + Turso 指南

## 架构说明

```
Astro 网站 → Vercel (边缘部署)
  API Routes → Vercel Functions
  数据库 → Turso (libSQL)
  文件存储 → 阿里云 OSS
```

## 前置准备

1. [注册 Turso 账号](https://turso.xyz/)
2. [注册 Vercel 账号](https://vercel.com/)
3. 已安装 [Turso CLI](https://docs.turso.tech/reference/turso-cli)（可选，用于本地操作数据库）

## 步骤 1: 创建 Turso 数据库

### 使用 Turso CLI:

```bash
# 登录
turso auth login

# 创建数据库
turso db create wind-safety

# 获取数据库 URL
turso db show wind-safety --url

# 创建认证令牌
turso tokens create wind-safety
```

保存好返回的 `数据库 URL` 和 `认证令牌`。

### 通过 Web 控制台:

1. 登录 [Turso Console](https://console.turso.tech/)
2. 点击 "New Database" 创建数据库
3. 在数据库详情页获取 URL 和 Auth Token

## 步骤 2: 初始化数据库 Schema

在项目根目录创建 `.env.local` 文件（复制 `.env` 模板）：

```env
# Turso 数据库配置
TURSO_DATABASE_URL=libsql://your-database-name-your-username.turso.io
TURSO_AUTH_TOKEN=your-turso-auth-token

# 阿里云OSS配置（保持不变）
OSS_ACCESS_KEY_ID=your-access-key-id
OSS_ACCESS_KEY_SECRET=your-access-key-secret
OSS_REGION=oss-cn-shanghai
OSS_BUCKET=your-bucket-name
# JWT密钥（生产环境请修改为复杂随机字符串）
JWT_SECRET=your-jwt-secret-change-me
```

运行初始化脚本创建表结构：

```bash
# 安装依赖
npm install

# 执行初始化
node scripts/init-turso.cjs
```

## 步骤 3:（可选）导入现有数据

如果需要从现有 SQLite 迁移数据到 Turso:

1. 使用 `turso db shell` 导入 SQL dump，或者
2. 修改 `scripts/init-turso.cjs` 开启数据导入功能，参考代码自行实现批量迁移

## 步骤 4: 部署到 Vercel

### 方法 1: 通过 Vercel CLI 部署

```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录
vercel login

# 部署
vercel
```

在部署过程中，按照提示设置环境变量：

- `TURSO_DATABASE_URL` - 你的 Turso 数据库 URL
- `TURSO_AUTH_TOKEN` - 你的 Turso 认证令牌
- `OSS_ACCESS_KEY_ID` - 阿里云 OSS Access Key ID
- `OSS_ACCESS_KEY_SECRET` - 阿里云 OSS Access Key Secret
- `OSS_REGION` - 阿里云 OSS 区域
- `OSS_BUCKET` - 阿里云 OSS 存储桶名称
- `JWT_SECRET` - JWT 签名密钥

### 方法 2: 通过 Vercel Web 控制台

1. 将代码推送到 GitHub/GitLab
2. 在 [Vercel Console](https://vercel.com/dashboard) 导入项目
3. Vercel 会自动检测 Astro 项目，构建设置会自动配置
4. 在 "Environment Variables" 页面添加上面列出的所有环境变量
5. 点击 Deploy 部署

## 修改内容说明

本次迁移修改了以下内容：

1. **新增依赖**: `@libsql/client` - Turso 官方驱动
2. **移除依赖**: `sqlite`, `sqlite3`, `better-sqlite3` - 不再需要本地 SQLite
3. **新增文件**:
   - `src/lib/db.ts` - Turso 数据库连接封装
   - `scripts/init-turso.cjs` - 数据库初始化脚本
   - `vercel.json` - Vercel 部署配置
4. **修改文件**:
   - `package.json` - 更新依赖列表
   - `.env` - 添加 Turso 环境变量模板
   - 所有 API 路由文件 - 将本地 SQLite 调用改为 Turso libSQL 调用

## 注意事项

1. **免费额度**: Turso 免费版提供 8GB 存储，足够个人和小团队使用；Vercel 免费版的 Functions 额度也足够日常使用
2. **网络**: Turso 在中国大陆访问速度可能不稳定，如果需要更好的体验可以选择付费版或其他区域
3. **文件存储**: 项目继续使用阿里云 OSS 存储上传的文件，这部分不需要改动
4. **默认账号**: 初始化后默认管理员账号是 `admin / admin123`，部署后请及时修改密码

## 回滚

当前项目已完整备份到 `.backup/backup-YYYYMMDD-HHMMSS.tar.gz`，如果需要回滚可以解压恢复。

## 本地开发

本地开发仍然可以使用 `npm run dev` 启动，只需要在 `.env` 或 `.env.local` 中配置好 Turso 环境变量即可，不需要本地数据库。
