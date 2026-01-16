# MCP 服务配置示例

本文档提供 MCP (Model Context Protocol) 服务的配置示例，用于连接外部智能体平台（如 HiAgent、智办助手等）。

## 目录

- [快速开始](#快速开始)
- [HiAgent 配置示例](#hiagent-配置示例)
- [智办助手配置示例](#智办助手配置示例)
- [自定义 MCP 服务配置](#自定义-mcp-服务配置)
- [API 使用示例](#api-使用示例)

## 快速开始

### 1. 安装依赖

```bash
npm install axios express
```

### 2. 启动 MCP 服务

MCP 服务已集成到 `server.js` 中，启动主服务器即可：

```bash
node server.js
```

MCP API 端点会自动可用：
- `POST /api/mcp/register` - 注册 MCP 客户端
- `GET /api/mcp/clients` - 列出所有客户端
- `GET /api/mcp/:clientId/tools` - 发现工具
- `GET /api/mcp/:clientId/workflows` - 发现工作流
- `POST /api/mcp/:clientId/tools/:toolId/execute` - 执行工具
- `POST /api/mcp/:clientId/workflows/:workflowId/execute` - 执行工作流

## HiAgent 配置示例

### 方式一：通过 UI 配置

1. 打开 AI 员工配置界面
2. 进入"技能"标签页
3. 点击"添加技能"
4. 在技能库中找到"HiAgent 连接"
5. 点击"配置"按钮
6. 填写以下信息：
   - **客户端 ID**: `hiagent_prod` (自定义唯一标识)
   - **服务名称**: `HiAgent 生产环境`
   - **服务地址**: `https://api.hiagent.com`
   - **API Key**: `your-hiagent-api-key`
7. 点击"测试连接"
8. 连接成功后，点击"保存配置"

### 方式二：通过 API 配置

```javascript
// 注册 HiAgent 客户端
const response = await fetch('/api/mcp/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    clientId: 'hiagent_prod',
    config: {
      name: 'HiAgent 生产环境',
      type: 'hiagent',
      baseUrl: 'https://api.hiagent.com',
      apiKey: 'your-hiagent-api-key',
      capabilities: {
        tools: [],
        workflows: [],
        knowledge: []
      }
    }
  })
});

const data = await response.json();
console.log('注册成功:', data);
```

### 使用 HiAgent 工具

```javascript
// 发现可用工具
const toolsResponse = await fetch('/api/mcp/hiagent_prod/tools');
const toolsData = await toolsResponse.json();
console.log('可用工具:', toolsData.tools);

// 执行工具
const executeResponse = await fetch('/api/mcp/hiagent_prod/tools/hiagent_data_query/execute', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    parameters: {
      query: '查询最近7天的销售数据',
      dataSource: 'sales_mart'
    }
  })
});

const result = await executeResponse.json();
console.log('执行结果:', result);
```

### 使用 HiAgent 工作流

```javascript
// 发现可用工作流
const workflowsResponse = await fetch('/api/mcp/hiagent_prod/workflows');
const workflowsData = await workflowsResponse.json();
console.log('可用工作流:', workflowsData.workflows);

// 执行工作流
const executeResponse = await fetch('/api/mcp/hiagent_prod/workflows/hiagent_wf_daily_report/execute', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    input: {
      date: '2024-01-15',
      department: 'sales'
    }
  })
});

const result = await executeResponse.json();
console.log('工作流执行结果:', result);
```

## 智办助手配置示例

### 通过 UI 配置

1. 在技能库中找到"智办助手连接"
2. 点击"配置"按钮
3. 填写配置信息：
   - **客户端 ID**: `zhiban_prod`
   - **服务名称**: `智办助手`
   - **服务地址**: `https://api.zhiban.com`
   - **API Key**: `your-zhiban-api-key`

### 通过 API 配置

```javascript
const response = await fetch('/api/mcp/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    clientId: 'zhiban_prod',
    config: {
      name: '智办助手',
      type: 'zhiban',
      baseUrl: 'https://api.zhiban.com',
      apiKey: 'your-zhiban-api-key'
    }
  })
});
```

## 自定义 MCP 服务配置

### 配置自定义 MCP 服务

```javascript
const response = await fetch('/api/mcp/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    clientId: 'custom_mcp_service',
    config: {
      name: '自定义 MCP 服务',
      type: 'custom',
      baseUrl: 'https://your-mcp-service.com',
      apiKey: 'your-api-key',
      capabilities: {
        tools: ['tool1', 'tool2'],
        workflows: ['workflow1'],
        knowledge: ['knowledge_base_1']
      }
    }
  })
});
```

### 自定义 MCP 服务 API 规范

自定义 MCP 服务需要实现以下端点：

1. **工具发现**: `GET /mcp/tools`
   ```json
   {
     "tools": [
       {
         "id": "tool_id",
         "name": "工具名称",
         "description": "工具描述",
         "parameters": {}
       }
     ]
   }
   ```

2. **工具执行**: `POST /mcp/tools/:toolId/execute`
   ```json
   {
     "parameters": {}
   }
   ```

3. **工作流发现**: `GET /mcp/workflows`
   ```json
   {
     "workflows": [
       {
         "id": "workflow_id",
         "name": "工作流名称",
         "description": "工作流描述",
         "steps": []
       }
     ]
   }
   ```

4. **工作流执行**: `POST /mcp/workflows/:workflowId/execute`
   ```json
   {
     "input": {}
   }
   ```

## API 使用示例

### 完整示例：使用 HiAgent 生成日报

```javascript
// 1. 注册客户端（如果尚未注册）
await fetch('/api/mcp/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    clientId: 'hiagent_prod',
    config: {
      name: 'HiAgent',
      type: 'hiagent',
      baseUrl: 'https://api.hiagent.com',
      apiKey: 'your-api-key'
    }
  })
});

// 2. 发现可用工作流
const workflowsRes = await fetch('/api/mcp/hiagent_prod/workflows');
const { workflows } = await workflowsRes.json();

// 3. 找到日报生成工作流
const dailyReportWorkflow = workflows.find(wf => wf.id === 'hiagent_wf_daily_report');

// 4. 执行工作流
const executeRes = await fetch('/api/mcp/hiagent_prod/workflows/hiagent_wf_daily_report/execute', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    input: {
      date: new Date().toISOString().split('T')[0],
      department: 'sales'
    }
  })
});

const result = await executeRes.json();
console.log('日报生成完成:', result);
```

### 在 AI 员工中使用 MCP 技能

1. **添加 MCP 客户端技能**：
   - 打开 AI 员工配置
   - 进入"技能"标签页
   - 添加"HiAgent 连接"或"智办助手连接"技能
   - 配置连接信息

2. **添加 MCP 工具技能**：
   - 配置 MCP 客户端后，系统会自动发现可用工具
   - 在技能库的"外部"分类中找到 MCP 工具
   - 点击"添加"即可将工具作为技能使用

3. **添加 MCP 工作流技能**：
   - 在技能库的"工作流"分类中
   - 可以看到来自 MCP 客户端的工作流（标记为 [hiagent] 或 [zhiban]）
   - 点击"添加技能"即可将工作流作为技能使用

## 注意事项

1. **API Key 安全**：
   - 不要在前端代码中硬编码 API Key
   - 使用环境变量或安全的配置管理

2. **错误处理**：
   - MCP 服务会返回模拟数据（如果真实 API 不可用）
   - 检查响应中的 `simulated` 字段判断是否为模拟数据

3. **工作流作为技能**：
   - 工作流在技能库中作为技能类型管理
   - 工作流技能可以像普通技能一样添加到 AI 员工

4. **能力复用**：
   - 通过 MCP 协议，可以复用外部平台的智能体能力
   - 支持工具、工作流和知识库的统一接入

## 示例工具和工作流

### HiAgent 示例工具

- **数据查询助手** (`hiagent_data_query`): 支持多数据源查询
- **智能报告生成器** (`hiagent_report_gen`): 生成多种格式的报告
- **异常检测** (`hiagent_anomaly_detect`): 自动识别数据异常
- **消息通知** (`hiagent_notification`): 多渠道消息推送

### HiAgent 示例工作流

- **日报生成工作流** (`hiagent_wf_daily_report`): 自动生成每日数据报告
- **异常检测工作流** (`hiagent_wf_anomaly_detect`): 智能异常检测与告警
- **数据分析工作流** (`hiagent_wf_data_analysis`): 完整的数据分析流程

## 更多信息

- MCP 协议规范: [Model Context Protocol](https://modelcontextprotocol.io)
- HiAgent 文档: [HiAgent API Documentation](https://docs.hiagent.com)
- 智办助手文档: [智办助手 API Documentation](https://docs.zhiban.com)
