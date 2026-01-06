# Vercel 部署指南

## 🚀 快速部署（3步搞定）

### 方式一：通过 GitHub 自动部署（推荐）

#### 1. 准备 GitHub 仓库

1. 在 GitHub 上创建一个新仓库（如果还没有）
2. 把项目代码推送到 GitHub：
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/你的用户名/仓库名.git
   git push -u origin main
   ```

#### 2. 连接 Vercel

1. 访问 [Vercel 官网](https://vercel.com/)
2. 点击 **"Sign Up"** 注册账号（可以用 GitHub 账号直接登录）
3. 登录后，点击 **"Add New..."** → **"Project"**
4. 选择你的 GitHub 仓库，点击 **"Import"**

#### 3. 配置环境变量

在 Vercel 项目设置页面：

1. 找到 **"Environment Variables"**（环境变量）
2. 添加以下变量：
   - **Name**: `DEEPSEEK_API_KEY`
   - **Value**: `sk-e8312e0eae874f2f9122f6aa334f4b3f`
   - 点击 **"Save"**

#### 4. 部署

1. 点击 **"Deploy"** 按钮
2. 等待 1-2 分钟，部署完成
3. 你会得到一个类似 `https://你的项目名.vercel.app` 的网址
4. 点击网址即可访问你的应用！

---

### 方式二：通过 Vercel CLI 部署

#### 1. 安装 Vercel CLI

```bash
npm install -g vercel
```

#### 2. 登录 Vercel

```bash
vercel login
```

#### 3. 在项目目录部署

```bash
# 进入项目目录
cd 你的项目目录

# 部署（首次部署会询问配置）
vercel

# 生产环境部署
vercel --prod
```

#### 4. 配置环境变量

```bash
# 设置环境变量
vercel env add DEEPSEEK_API_KEY
# 输入值：sk-e8312e0eae874f2f9122f6aa334f4b3f

# 重新部署以应用环境变量
vercel --prod
```

---

## 📝 部署后的操作

### 查看部署状态

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击你的项目
3. 可以看到所有部署历史和日志

### 查看日志

在 Vercel Dashboard 中：
1. 点击你的项目
2. 选择某个部署
3. 点击 **"Functions"** 标签
4. 可以看到函数执行日志

### 更新代码

**如果使用 GitHub 自动部署：**
- 直接 `git push` 到 GitHub，Vercel 会自动重新部署

**如果使用 CLI：**
```bash
vercel --prod
```

---

## ⚠️ 重要提示

### 1. 对话历史会丢失

由于 Vercel 是 Serverless 架构，每次请求可能是新的实例，**对话历史不会保持**。

**解决方案（可选）：**
- 使用 Vercel KV（Redis）存储对话历史
- 使用 Vercel Postgres 数据库
- 使用外部存储服务（如 Upstash Redis）

### 2. 流式响应限制

Vercel 的 Serverless Functions 对长时间连接有限制：
- 免费版：10秒超时
- Pro版：60秒超时

如果 AI 响应时间较长，可能会超时。

### 3. 环境变量

确保在 Vercel Dashboard 中正确配置了 `DEEPSEEK_API_KEY`，否则 API 调用会失败。

---

## 🔧 故障排查

### 问题1：部署失败

**检查：**
- 确保 `package.json` 中有正确的依赖
- 检查 `vercel.json` 配置是否正确
- 查看 Vercel Dashboard 中的部署日志

### 问题2：网站打开但功能不工作

**检查：**
- 环境变量是否配置正确
- 打开浏览器开发者工具（F12），查看 Console 和 Network 标签
- 检查 API 请求是否返回错误

### 问题3：静态文件加载失败

**检查：**
- 确保所有 CSS/JS 文件都在项目根目录
- 检查 `server.js` 中的静态文件路径配置

### 问题4：API 超时

**解决方案：**
- 升级到 Vercel Pro（60秒超时）
- 或者使用非流式 API（`/api/chat` 而不是 `/api/chat/stream`）

---

## 💰 费用说明

### 免费版（Hobby）

- ✅ 无限部署
- ✅ 100GB 带宽/月
- ✅ 自动 HTTPS
- ✅ 全球 CDN
- ⚠️ 10秒函数超时
- ⚠️ 无持久化存储

### Pro 版（$20/月）

- ✅ 60秒函数超时
- ✅ 更多带宽
- ✅ 团队协作
- ✅ 优先支持

**对于个人项目，免费版完全够用！**

---

## 🎉 完成！

部署成功后，你的应用就可以通过 Vercel 提供的网址访问了。

**优势：**
- ✅ 完全免费（小项目）
- ✅ 自动 HTTPS
- ✅ 全球 CDN 加速
- ✅ 自动部署（Git 推送即部署）

**注意事项：**
- ⚠️ 对话历史不会保持（每次对话独立）
- ⚠️ 流式响应可能有限制

如果需要保持对话历史，建议使用阿里云 ECS 部署方案。


