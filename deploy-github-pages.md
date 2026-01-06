# GitHub Pages 部署指南

## 🚀 快速部署（2步搞定）

### 第一步：启用 GitHub Pages

1. 打开你的 GitHub 仓库：https://github.com/mm1025048717-hash/yiwen-dataagent2.0-
2. 点击 **Settings**（设置）
3. 在左侧菜单找到 **Pages**（页面）
4. 在 **Source**（源）下选择：
   - **Branch**: `main`（或 `master`）
   - **Folder**: `/ (root)`（根目录）
5. 点击 **Save**（保存）

### 第二步：等待部署完成

1. GitHub 会自动开始部署（通常 1-2 分钟）
2. 部署完成后，你会看到一个绿色的提示，显示你的网站地址：
   ```
   https://mm1025048717-hash.github.io/yiwen-dataagent2.0-/
   ```
3. 点击这个地址就可以访问你的应用了！

---

## 📝 重要说明

### ✅ 优势

- **完全免费**：GitHub Pages 完全免费
- **自动 HTTPS**：自动配置 SSL 证书
- **自动部署**：每次推送代码到 GitHub，网站自动更新
- **全球 CDN**：访问速度快

### ⚠️ 注意事项

1. **API Key 在前端**：
   - 当前版本中，DeepSeek API Key 直接写在前端代码中
   - 这意味着任何人都可以在浏览器中看到你的 API Key
   - **建议**：如果担心安全问题，可以：
     - 使用环境变量（但 GitHub Pages 不支持服务端环境变量）
     - 或者使用 GitHub Secrets + GitHub Actions（较复杂）
     - 或者继续使用 Vercel/阿里云等支持环境变量的平台

2. **对话历史存储在浏览器**：
   - 对话历史保存在浏览器的 `localStorage` 中
   - 清除浏览器缓存会丢失对话历史
   - 不同设备之间不会同步

3. **CORS 限制**：
   - 如果 DeepSeek API 有 CORS 限制，可能需要通过代理访问
   - 目前测试应该可以直接调用

---

## 🔧 更新网站

每次更新代码后：

```bash
git add .
git commit -m "更新内容"
git push
```

GitHub 会自动重新部署网站（通常 1-2 分钟）。

---

## 🐛 故障排查

### 问题1：网站显示 404

**解决：**
- 检查 GitHub Pages 设置中的 Branch 和 Folder 是否正确
- 确保 `index.html` 文件在仓库根目录
- 等待几分钟让 GitHub 完成部署

### 问题2：页面显示但样式错乱

**解决：**
- 检查浏览器控制台（F12）是否有 CSS 文件加载错误
- 确保所有 CSS 文件都在仓库中
- 清除浏览器缓存后重试

### 问题3：API 调用失败

**解决：**
- 检查浏览器控制台（F12）的错误信息
- 确认 API Key 是否正确
- 检查网络连接
- 如果出现 CORS 错误，可能需要使用代理

### 问题4：对话历史丢失

**解决：**
- 对话历史保存在浏览器的 localStorage 中
- 清除浏览器数据会删除历史
- 这是正常行为，因为 GitHub Pages 是静态托管

---

## 📦 项目结构

GitHub Pages 需要的文件结构：

```
yiwen-dataagent2.0-/
├── index.html          # 主页面（必须）
├── api-client.js       # API 客户端（已修改为直接调用 DeepSeek）
├── script.js           # 前端逻辑
├── style.css           # 样式文件
├── chat-clean.css      # 聊天样式
├── workflow.css        # 工作流样式
├── process-ui.css      # 处理UI样式
├── indicator-platform.html
├── indicator-platform.js
└── .nojekyll          # GitHub Pages 配置文件
```

---

## 🎉 完成！

部署成功后，你的网站就可以通过以下地址访问：

**https://mm1025048717-hash.github.io/yiwen-dataagent2.0-/**

**优势：**
- ✅ 完全免费
- ✅ 自动 HTTPS
- ✅ 自动部署
- ✅ 全球 CDN

**注意事项：**
- ⚠️ API Key 在前端代码中（可被查看）
- ⚠️ 对话历史只保存在浏览器本地

如果需要更安全的部署（隐藏 API Key），建议使用 Vercel 或阿里云 ECS。

