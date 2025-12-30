# 宝塔面板部署指南

## 🚀 快速自动部署（推荐）

### 方式一：使用 Python 脚本（推荐）

**Windows 用户：**
1. 双击运行 `deploy-simple.bat`
2. 按提示输入 SSH 密码和宝塔 API 密钥
3. 等待部署完成

**手动运行：**
```bash
# 安装依赖（首次运行）
pip install requests paramiko scp

# 运行部署脚本
python deploy-auto.py
```

### 方式二：使用 Bash 脚本（Linux/Mac/服务器）

```bash
# 在服务器上直接运行
bash deploy-baota.sh
```

### 获取宝塔 API 密钥

1. 登录宝塔面板：http://47.94.146.148:8888
2. 进入 **面板设置** → **API接口**
3. 点击 **开启 API** 并设置 IP 白名单
4. 复制 **API Key** 和 **API Token**

---

## 📝 手动部署步骤

如果自动部署失败，可以按照以下步骤手动部署：

### 1. 在宝塔面板创建 Node.js 项目

1. 登录宝塔面板：http://47.94.146.148:8888
2. 进入 **软件商店** → 搜索 **Node.js版本管理器** → 安装
3. 进入 **Node.js版本管理器** → 点击 **添加Node.js项目**
4. 配置如下：
   - **项目名称**：`yiwen-dataagent`
   - **项目路径**：`/www/wwwroot/yiwen-dataagent`
   - **Node版本**：选择 18.x 或更高
   - **启动文件**：`server.js`
   - **运行端口**：`3000`
   - **运行目录**：`/www/wwwroot/yiwen-dataagent`

### 2. 上传项目文件

**方式一：通过宝塔文件管理器**
1. 进入 **文件** → 找到 `/www/wwwroot/yiwen-dataagent` 目录
2. 上传以下文件：
   - `server.js`
   - `package.json`
   - `package-lock.json`
   - `index.html`
   - `api-client.js`
   - `script.js`
   - `style.css`
   - `chat-clean.css`
   - `workflow.css`
   - `process-ui.css`
   - `indicator-platform.html`
   - `indicator-platform.js`

**方式二：通过 Git（推荐）**
在服务器终端执行：
```bash
cd /www/wwwroot
git clone https://github.com/mm1025048717-hash/yiwen-dataagent2.0-.git yiwen-dataagent
cd yiwen-dataagent
```

### 3. 安装依赖

在宝塔面板的 Node.js 项目管理器中：
- 找到 `yiwen-dataagent` 项目
- 点击 **依赖管理** → **安装依赖**

或者在服务器终端执行：
```bash
cd /www/wwwroot/yiwen-dataagent
npm install --production
```

### 4. 配置环境变量

在宝塔面板的 Node.js 项目管理器中：
- 找到 `yiwen-dataagent` 项目
- 点击 **环境变量**
- 添加：
  - `DEEPSEEK_API_KEY` = `sk-e8312e0eae874f2f9122f6aa334f4b3f`
  - `NODE_ENV` = `production`
  - `PORT` = `3000`

### 5. 启动项目

在 Node.js 项目管理器中：
- 找到 `yiwen-dataagent` 项目
- 点击 **启动** 按钮

### 6. 创建网站并配置反向代理

1. 进入 **网站** → **添加站点**
2. 填写：
   - **域名**：`dataagent.47.94.146.148`（或你想要的域名）
   - **根目录**：`/www/wwwroot/yiwen-dataagent`
   - **备注**：`亿问DataAgent`
3. 点击 **提交**

4. 配置反向代理：
   - 进入 **网站** → 找到刚创建的站点 → **设置** → **反向代理**
   - 点击 **添加反向代理**
   - 配置：
     - **代理名称**：`nodejs`
     - **代理目录**：`/`
     - **目标URL**：`http://127.0.0.1:3000`
     - **发送域名**：`$host`
   - 点击 **提交**

### 7. 测试访问

访问：`http://dataagent.47.94.146.148`（或你配置的域名）

## 故障排查

### 如果无法访问：
1. 检查 Node.js 项目是否运行：在 Node.js 管理器中查看状态
2. 检查端口 3000 是否被占用
3. 查看项目日志：在 Node.js 管理器中点击 **日志**
4. 检查 Nginx 配置：网站 → 设置 → 配置文件

### 如果静态文件 404：
确保所有 CSS/JS 文件都已上传到 `/www/wwwroot/yiwen-dataagent` 目录

