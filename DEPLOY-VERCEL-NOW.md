# Vercel 快速部署指南

## 🚀 3步完成部署

### 第一步：提交代码到 GitHub

确保你的代码已经推送到 GitHub：

```bash
git add .
git commit -m "准备部署到 Vercel"
git push origin main
```

### 第二步：在 Vercel 上部署

#### 方式一：通过 GitHub 自动部署（推荐）

1. **访问 Vercel**
   - 打开 https://vercel.com/
   - 用 GitHub 账号登录（如果没有账号，先注册）

2. **导入项目**
   - 点击 **"Add New..."** → **"Project"**
   - 找到你的仓库：`mm1025048717-hash/yiwen-dataagent2.0-`
   - 点击 **"Import"**

3. **配置项目**
   - **Framework Preset**: 选择 **"Other"** 或留空
   - **Root Directory**: 留空（使用根目录）
   - **Build Command**: 留空（不需要构建）
   - **Output Directory**: 留空
   - **Install Command**: `npm install`（默认即可）

4. **配置环境变量**
   - 点击 **"Environment Variables"**
   - 添加以下变量：
     - **Name**: `DEEPSEEK_API_KEY`
     - **Value**: `sk-e8312e0eae874f2f9122f6aa334f4b3f`
     - 点击 **"Add"**

5. **部署**
   - 点击 **"Deploy"** 按钮
   - 等待 1-2 分钟，部署完成

#### 方式二：通过 Vercel CLI

```bash
# 1. 安装 Vercel CLI
npm install -g vercel

# 2. 登录
vercel login

# 3. 在项目目录部署
cd 你的项目目录
vercel

# 4. 配置环境变量
vercel env add DEEPSEEK_API_KEY
# 输入值：sk-e8312e0eae874f2f9122f6aa334f4b3f

# 5. 生产环境部署
vercel --prod
```

### 第三步：访问你的网站

部署完成后，Vercel 会给你一个网址，类似：
```
https://yiwen-dataagent2-0-xxxxx.vercel.app
```

点击这个网址就可以访问你的应用了！

---

## ✅ 部署后检查

1. **访问网站**：打开 Vercel 给你的网址
2. **检查页面**：应该能看到完整的页面和样式
3. **测试功能**：尝试使用聊天功能，看是否正常
4. **查看日志**：如果有问题，在 Vercel Dashboard 中查看部署日志

---

## 🔧 如果遇到问题

### 问题1：静态文件 404（CSS/JS 加载失败）

**解决：**
- 确保 `vercel.json` 配置正确
- 检查所有 CSS/JS 文件都在项目根目录
- 查看 Vercel 部署日志中的错误信息

### 问题2：API 调用失败

**解决：**
- 检查环境变量 `DEEPSEEK_API_KEY` 是否配置正确
- 在 Vercel Dashboard → Settings → Environment Variables 中确认
- 重新部署以应用环境变量

### 问题3：页面显示但功能不工作

**解决：**
- 打开浏览器开发者工具（F12）
- 查看 Console 标签的错误信息
- 查看 Network 标签，看哪些请求失败了

---

## 📝 更新网站

每次更新代码后：

```bash
git push
```

Vercel 会自动检测到代码更新并重新部署（通常 1-2 分钟）。

---

## 🎉 完成！

部署成功后，你的网站就可以通过 Vercel 提供的网址访问了。

**优势：**
- ✅ 完全免费（小项目）
- ✅ 自动 HTTPS
- ✅ 全球 CDN 加速
- ✅ 自动部署（Git 推送即部署）
- ✅ API Key 安全（保存在环境变量中）

**注意事项：**
- ⚠️ 对话历史不会保持（Serverless 特性，每次请求可能是新实例）
- ⚠️ 流式响应可能有限制（免费版 10 秒超时）

如果需要保持对话历史，建议使用阿里云 ECS 部署。

