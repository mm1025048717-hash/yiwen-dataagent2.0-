# MCP 服务使用指南

## 概述

MCP (Model Context Protocol) 服务允许您的 AI 员工通过标准协议连接外部智能体平台（如 HiAgent、智办助手等），实现能力复用。

## 核心特性

✅ **统一技能管理**：工作流作为技能类型统一管理，避免层级混淆  
✅ **标准协议接入**：支持 MCP 标准协议，轻松接入外部平台  
✅ **能力复用**：复用外部智能体能力、知识库（RAG）服务和工作流平台  
✅ **动态发现**：自动发现外部平台提供的工具和工作流  
✅ **即插即用**：通过 UI 界面轻松配置，无需编写代码  

## 快速开始

### 1. 配置 HiAgent 连接

1. 打开 AI 员工配置界面
2. 进入"技能"标签页
3. 点击"添加技能" → 找到"HiAgent 连接"
4. 点击"配置"按钮，填写：
   - 客户端 ID: `hiagent_prod`
   - 服务地址: `https://api.hiagent.com`
   - API Key: `your-api-key`
5. 点击"测试连接" → "保存配置"

### 2. 使用 HiAgent 工具和工作流

配置完成后，系统会自动发现 HiAgent 提供的工具和工作流：

- **工具技能**：在技能库的"外部"分类中查看
- **工作流技能**：在技能库的"工作流"分类中查看（标记为 [hiagent]）

点击"添加"即可将工具或工作流作为技能装配到 AI 员工。

## 架构设计

### 技能体系

```
技能 (Skills)
├── 原子技能 (Atomic Skills)
│   ├── SQL 生成
│   ├── 图表生成
│   └── Python 解释器
├── 工具技能 (Tool Skills)
│   ├── 飞书通知
│   ├── 邮件发送
│   └── MCP 工具 (来自外部平台)
└── 工作流技能 (Workflow Skills) ⭐
    ├── 本地工作流模板
    └── MCP 工作流 (来自外部平台)
```

**关键设计**：工作流作为技能的一种类型，统一在技能库中管理，避免层级混淆。

### MCP 协议支持

```
┌─────────────┐
│  AI 员工    │
└──────┬──────┘
       │
       │ MCP 协议
       │
┌──────▼──────────────────┐
│   MCP 服务器            │
│  (mcp-server.js)        │
└──────┬──────────────────┘
       │
       ├──► HiAgent
       ├──► 智办助手
       └──► 自定义 MCP 服务
```

## 文件结构

```
├── mcp-server.js              # MCP 服务核心
├── mcp-hiagent-connector.js   # HiAgent 连接器
├── mcp-config-examples.md     # 配置示例文档
├── MCP-README.md              # 本文件
└── server.js                  # 主服务器（已集成 MCP）
```

## API 端点

### MCP 客户端管理

- `POST /api/mcp/register` - 注册 MCP 客户端
- `GET /api/mcp/clients` - 列出所有客户端
- `GET /api/mcp/:clientId` - 获取客户端详情
- `DELETE /api/mcp/:clientId` - 删除客户端

### 工具和工作流

- `GET /api/mcp/:clientId/tools` - 发现工具
- `GET /api/mcp/:clientId/workflows` - 发现工作流
- `POST /api/mcp/:clientId/tools/:toolId/execute` - 执行工具
- `POST /api/mcp/:clientId/workflows/:workflowId/execute` - 执行工作流

## 示例场景

### 场景 1：使用 HiAgent 的数据查询工具

```javascript
// 1. 配置 HiAgent 连接（通过 UI 或 API）
// 2. 在 AI 员工中添加 "hiagent_data_query" 工具技能
// 3. AI 员工即可使用该工具进行数据查询
```

### 场景 2：使用 HiAgent 的日报生成工作流

```javascript
// 1. 配置 HiAgent 连接
// 2. 在技能库的"工作流"分类中找到 "日报生成工作流 [hiagent]"
// 3. 点击"添加技能"
// 4. AI 员工即可使用该工作流自动生成日报
```

### 场景 3：接入自定义 MCP 服务

```javascript
// 1. 实现自定义 MCP 服务（遵循 MCP 协议规范）
// 2. 在技能库中添加"自定义 MCP 服务"技能
// 3. 配置服务地址和 API Key
// 4. 系统自动发现并加载工具和工作流
```

## 支持的平台

### 已支持

- ✅ **HiAgent** - 智能数据分析平台
- ✅ **智办助手** - 企业智能办公助手

### 扩展支持

- 🔄 **自定义 MCP 服务** - 遵循 MCP 协议规范即可接入

## 设计原则

### FR-008 实现

根据产品需求文档 FR-008：

1. **技能包含工作流**：工作流作为技能的一种类型，在技能库中统一管理
2. **避免层级混淆**：不再区分"技能"和"工作流"两个层级，统一为"技能"
3. **生态对接**：通过 MCP 标准协议接入外部平台，实现能力复用

### UI 设计调整

- **技能标签页**：显示所有技能（包括工作流技能）
- **工作流分类**：在技能库中作为分类筛选，而非独立层级
- **MCP 标识**：来自 MCP 的技能和工作流带有 [MCP] 或 [hiagent] 等标识

## 故障排查

### 连接失败

1. 检查服务地址是否正确
2. 验证 API Key 是否有效
3. 查看浏览器控制台的错误信息
4. 检查服务器日志

### 工具/工作流未显示

1. 确认 MCP 客户端已成功注册
2. 检查网络连接
3. 查看浏览器控制台的 API 响应
4. 尝试刷新技能库

### 执行失败

1. 检查工具/工作流的参数是否正确
2. 查看服务器日志中的详细错误
3. 验证外部服务的 API 是否正常

## 更多资源

- [MCP 配置示例](./mcp-config-examples.md) - 详细的配置示例和 API 使用说明
- [MCP 协议规范](https://modelcontextprotocol.io) - 官方协议文档
- [HiAgent 文档](https://docs.hiagent.com) - HiAgent 平台文档

## 贡献

欢迎提交 Issue 和 Pull Request 来改进 MCP 服务！
