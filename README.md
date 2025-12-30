# 亿问DataAgent 2.0

智能数据分析助手，集成DeepSeek API提供强大的对话能力。

## 功能特性

- 🎯 智能问答：基于DeepSeek大模型的自然语言对话
- 📊 数据可视化：支持多种图表和数据分析
- 🔄 多模型支持：支持deepseek-chat和deepseek-reasoner两种模型
- 💬 对话历史管理：支持多轮对话上下文记忆

## 技术栈

- 前端：HTML + CSS + JavaScript
- 后端：Node.js + Express
- AI服务：DeepSeek API

## 快速开始

### 本地开发

#### 1. 安装依赖

```bash
npm install
```

#### 2. 配置API密钥

创建 `.env` 文件（如果不存在），并配置DeepSeek API密钥：

```
DEEPSEEK_API_KEY=sk-e8312e0eae874f2f9122f6aa334f4b3f
PORT=3000
```

#### 3. 启动服务器

```bash
npm start
```

或者使用开发模式（自动重启）：

```bash
npm run dev
```

#### 4. 访问应用

打开浏览器访问：http://localhost:3000

### 在线部署

#### 🚀 宝塔面板一键部署

**Windows 用户（最简单）：**
1. 双击运行 `deploy-simple.bat`
2. 按提示输入 SSH 密码和宝塔 API 密钥
3. 等待部署完成

**详细部署指南：** 查看 [宝塔面板部署指南](./deploy-baota.md)

**部署后访问：**
- http://dataagent.47.94.146.148
- 或 http://47.94.146.148:3000

## API接口说明

### 1. 聊天接口（非流式）

```
POST /api/chat
Content-Type: application/json

{
  "message": "用户消息",
  "conversationId": "可选，会话ID",
  "model": "deepseek-chat 或 deepseek-reasoner",
  "stream": false
}
```

### 2. 聊天接口（流式）

```
POST /api/chat/stream
Content-Type: application/json

{
  "message": "用户消息",
  "conversationId": "可选，会话ID",
  "model": "deepseek-chat 或 deepseek-reasoner"
}
```

### 3. 清除对话历史

```
POST /api/chat/clear
Content-Type: application/json

{
  "conversationId": "会话ID"
}
```

### 4. 健康检查

```
GET /api/health
```

## 项目结构

```
├── server.js          # 后端服务器
├── api-client.js      # 前端API客户端
├── script.js          # 前端主要逻辑
├── index.html         # 主页面
├── package.json       # 项目配置
└── .env              # 环境变量配置（需自行创建）
```

## 使用说明

1. **智能问答**：在聊天界面输入问题，系统会调用DeepSeek API生成回复
2. **切换模型**：可以在理科生（deepseek-chat）和文科生（deepseek-reasoner）之间切换
3. **新建对话**：点击"新建问答"按钮开始新的对话会话
4. **仪表盘聊天**：在仪表盘界面也可以使用AI助手进行数据分析

## 注意事项

- API密钥请妥善保管，不要提交到代码仓库
- 对话历史目前存储在内存中，服务器重启后会丢失（生产环境建议使用数据库）
- 首次使用前请确保已安装Node.js和npm

## 许可证

MIT



