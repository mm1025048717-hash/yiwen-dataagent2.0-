# GitHub Pages 部署完整指南

## ✅ 快速部署（3步完成）

### 第一步：提交代码到 GitHub

在项目目录执行：

```bash
# 检查 .nojekyll 文件是否存在
dir .nojekyll

# 如果不存在，创建它
echo. > .nojekyll

# 添加所有文件
git add .

# 提交
git commit -m "配置 GitHub Pages 部署"

# 推送到 GitHub
git push origin main
```

### 第二步：启用 GitHub Pages

1. **打开 GitHub 仓库**
   - 访问：https://github.com/mm1025048717-hash/yiwen-dataagent2.0-

2. **进入设置**
   - 点击 **Settings**（设置）标签

3. **找到 Pages 设置**
   - 在左侧菜单中找到 **Pages**（页面）

4. **配置 Pages**
   - 在 **Source**（源）下选择：
     - **Branch**: `main`
     - **Folder**: `/ (root)`（根目录）
   - 点击 **Save**（保存）

5. **等待部署**
   - GitHub 会自动开始部署（通常 1-2 分钟）
   - 部署完成后，你会看到一个绿色的提示，显示你的网站地址

### 第三步：访问网站

部署完成后，你的网站地址是：
```
https://mm1025048717-hash.github.io/yiwen-dataagent2.0-/
```

**注意**：仓库名末尾有横杠 `-`，URL 中也要包含这个横杠。

---

## 📋 部署检查清单

部署前确认：

- [ ] `index.html` 文件在仓库根目录
- [ ] 所有 CSS/JS 文件都在仓库中（`style.css`, `script.js`, `api-client.js` 等）
- [ ] `.nojekyll` 文件已创建并提交
- [ ] `api-client.js` 已改为直接调用 DeepSeek API 的版本（GitHub Pages 版本）
- [ ] 代码已推送到 GitHub

---

## 🔍 验证部署

### 检查部署状态

1. 在 GitHub 仓库页面，点击 **Actions** 标签
2. 查看是否有 "pages build and deployment" 工作流
3. 如果显示绿色 ✓，说明部署成功
4. 如果显示红色 ✗，点击查看错误信息

### 检查网站

1. 访问：https://mm1025048717-hash.github.io/yiwen-dataagent2.0-/
2. 打开浏览器开发者工具（F12）
3. 检查 Console 是否有错误
4. 测试聊天功能是否正常

---

## 🐛 常见问题

### 问题1：网站显示 404

**解决：**
- 确认 GitHub Pages 设置中的 Branch 和 Folder 是否正确
- 确认 `index.html` 在根目录
- 等待几分钟让 GitHub 完成部署
- 检查 URL 是否正确（注意末尾的横杠）

### 问题2：页面显示但样式错乱

**解决：**
- 检查浏览器控制台（F12）是否有 CSS 文件加载错误
- 确认所有 CSS 文件都在仓库中
- 清除浏览器缓存后重试

### 问题3：API 调用失败

**解决：**
- 检查浏览器控制台（F12）的错误信息
- 确认 `api-client.js` 中的 API Key 是否正确
- 检查网络连接
- 如果出现 CORS 错误，可能需要使用代理（但 DeepSeek API 通常支持 CORS）

### 问题4：对话历史丢失

**解决：**
- 对话历史保存在浏览器的 localStorage 中
- 清除浏览器数据会删除历史
- 这是正常行为，因为 GitHub Pages 是静态托管

---

## 📝 更新网站

每次更新代码后：

```bash
git add .
git commit -m "更新内容"
git push
```

GitHub 会自动重新部署网站（通常 1-2 分钟）。

---

## ⚠️ 重要说明

### API Key 在前端

- 当前版本中，DeepSeek API Key 直接写在前端代码中
- 这意味着任何人都可以在浏览器中看到你的 API Key
- **如果担心安全问题**，建议：
  - 使用 Vercel 部署（支持环境变量）
  - 或使用阿里云 ECS 部署

### 对话历史

- 对话历史保存在浏览器的 localStorage 中
- 清除浏览器缓存会丢失历史
- 不同设备之间不会同步

---

## 🎉 完成！

部署成功后，你的网站就可以通过以下地址访问：

**https://mm1025048717-hash.github.io/yiwen-dataagent2.0-/**

**优势：**
- ✅ 完全免费
- ✅ 自动 HTTPS
- ✅ 自动部署（Git 推送即部署）
- ✅ 全球 CDN 加速

**注意事项：**
- ⚠️ API Key 在前端代码中（可被查看）
- ⚠️ 对话历史只保存在浏览器本地

如果需要更安全的部署（隐藏 API Key），建议使用 Vercel 或阿里云 ECS。

