const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());

// 静态文件服务 - 必须在所有路由之前
// 在 Vercel 上，需要正确设置静态文件路径
let staticPath = __dirname;

if (process.env.VERCEL) {
  // 在 Vercel 上，文件在 /var/task 目录
  // 尝试多个可能的路径
  const possiblePaths = [
    '/var/task', // Vercel Serverless Functions 的标准路径
    process.cwd(), // 当前工作目录
    __dirname, // server.js 所在目录
  ];
  
  // 检查哪个路径存在且包含 index.html
  for (const testPath of possiblePaths) {
    try {
      const testFile = path.join(testPath, 'index.html');
      if (fs.existsSync(testFile)) {
        staticPath = testPath;
        console.log('✅ Found static files at:', staticPath);
        break;
      }
    } catch (e) {
      // 继续尝试下一个路径
    }
  }
  
  // 如果都没找到，使用 __dirname
  if (staticPath === __dirname) {
    console.log('⚠️ Using __dirname as static path:', __dirname);
    // 在 Vercel 上，尝试直接使用 /var/task
    if (fs.existsSync('/var/task')) {
      staticPath = '/var/task';
      console.log('✅ Switched to /var/task');
    }
  }
  
  console.log('📁 Static path configured:', staticPath);
  console.log('📄 Testing index.html exists:', fs.existsSync(path.join(staticPath, 'index.html')));
  console.log('📄 Testing style.css exists:', fs.existsSync(path.join(staticPath, 'style.css')));
}

// 静态文件服务 - 必须在 API 路由之前
// 在 Vercel 上，所有请求都会路由到 server.js，所以需要处理静态文件
app.use(express.static(staticPath, {
  dotfiles: 'ignore',
  etag: true,
  maxAge: '1d',
  index: false
}));

// 明确处理静态文件路由（作为后备，在 express.static 之后）
// 这个路由会在 express.static 找不到文件时触发
app.get(/\.(css|js|json|ico|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/, (req, res) => {
  const cleanPath = req.path.startsWith('/') ? req.path.slice(1) : req.path;
  const ext = path.extname(req.path).toLowerCase();
  
  // 设置 MIME 类型
  const mimeTypes = {
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json',
    '.ico': 'image/x-icon',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject'
  };
  
  if (mimeTypes[ext]) {
    res.setHeader('Content-Type', mimeTypes[ext]);
  }
  
  // 尝试多个路径（Vercel 和本地都适用）
  const possiblePaths = [
    path.join(staticPath, cleanPath),
    path.join(staticPath, req.path.slice(1)), // 也尝试带斜杠的路径
    path.join(__dirname, cleanPath),
    path.join(__dirname, req.path.slice(1)),
    path.join(process.cwd(), cleanPath),
    path.join(process.cwd(), req.path.slice(1)),
    path.join('/var/task', cleanPath),
    path.join('/var/task', req.path.slice(1)),
  ];
  
  for (const filePath of possiblePaths) {
    try {
      const resolvedPath = path.resolve(filePath);
      if (fs.existsSync(resolvedPath) && fs.statSync(resolvedPath).isFile()) {
        console.log('✅ Serving:', req.path, 'from', resolvedPath);
        return res.sendFile(resolvedPath);
      }
    } catch (e) {
      // 继续尝试下一个路径
    }
  }
  
  console.error('❌ Not found:', req.path);
  console.error('   Static path:', staticPath);
  console.error('   __dirname:', __dirname);
  console.error('   process.cwd():', process.cwd());
  console.error('   Tried paths:', possiblePaths);
  res.status(404).send(`File not found: ${req.path}`);
});

// DeepSeek API配置
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'sk-e8312e0eae874f2f9122f6aa334f4b3f';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';

// 存储对话历史（实际项目中应使用数据库）
const conversationHistory = new Map();

// 聊天API端点
app.post('/api/chat', async (req, res) => {
  try {
    const { message, conversationId, model = 'deepseek-chat', stream = false, systemPrompt = null, temperature = 0.7 } = req.body;

    if (!message) {
      return res.status(400).json({ error: '消息内容不能为空' });
    }

    // 获取或创建对话历史
    const conversationIdKey = conversationId || 'default';
    if (!conversationHistory.has(conversationIdKey)) {
      conversationHistory.set(conversationIdKey, []);
    }
    const messages = conversationHistory.get(conversationIdKey);

    // 如果有system prompt，检查是否已有system message，如果没有则添加
    if (systemPrompt) {
      const hasSystemMessage = messages.some(msg => msg.role === 'system');
      if (!hasSystemMessage) {
        // 将system message插入到最前面
        messages.unshift({
          role: 'system',
          content: systemPrompt
        });
      } else if (messages.length > 0 && messages[0].role === 'system') {
        // 如果第一条是system message，更新它（允许动态更新system prompt）
        messages[0].content = systemPrompt;
      }
    }

    // 添加用户消息
    messages.push({
      role: 'user',
      content: message
    });

    // 准备请求到DeepSeek API
    const requestData = {
      model: model,
      messages: messages,
      stream: stream,
      temperature: temperature
    };

    // 调用DeepSeek API
    const response = await axios.post(DEEPSEEK_API_URL, requestData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      timeout: 60000 // 60秒超时
    });

    const assistantMessage = response.data.choices[0].message.content;

    // 添加助手回复到历史记录
    messages.push({
      role: 'assistant',
      content: assistantMessage
    });

    // 返回响应
    res.json({
      success: true,
      message: assistantMessage,
      conversationId: conversationIdKey,
      usage: response.data.usage || null
    });

  } catch (error) {
    console.error('DeepSeek API错误:', error.response?.data || error.message);
    
    res.status(500).json({
      success: false,
      error: error.response?.data?.error?.message || '服务器错误，请稍后重试',
      details: error.message
    });
  }
});

// 流式聊天API端点
app.post('/api/chat/stream', async (req, res) => {
  try {
    const { message, conversationId, model = 'deepseek-chat', systemPrompt = null, temperature = 0.7 } = req.body;

    if (!message) {
      return res.status(400).json({ error: '消息内容不能为空' });
    }

    // 获取或创建对话历史
    const conversationIdKey = conversationId || 'default';
    if (!conversationHistory.has(conversationIdKey)) {
      conversationHistory.set(conversationIdKey, []);
    }
    const messages = conversationHistory.get(conversationIdKey);

    // 如果有system prompt且历史记录为空，添加system message
    if (systemPrompt && messages.length === 0) {
      messages.push({
        role: 'system',
        content: systemPrompt
      });
    }

    // 添加用户消息
    messages.push({
      role: 'user',
      content: message
    });

    // 准备请求到DeepSeek API（流式）
    const requestData = {
      model: model,
      messages: messages,
      stream: true,
      temperature: temperature
    };

    // 设置SSE响应头
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // 调用DeepSeek API（流式）
    const response = await axios.post(DEEPSEEK_API_URL, requestData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      responseType: 'stream',
      timeout: 60000
    });

    let fullResponse = '';

    response.data.on('data', (chunk) => {
      const lines = chunk.toString().split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            // 流结束，保存完整回复到历史
            messages.push({
              role: 'assistant',
              content: fullResponse
            });
            res.write(`data: [DONE]\n\n`);
            res.end();
            return;
          }
          try {
            const json = JSON.parse(data);
            const content = json.choices?.[0]?.delta?.content || '';
            if (content) {
              fullResponse += content;
              res.write(`data: ${JSON.stringify({ content })}\n\n`);
            }
          } catch (e) {
            // 忽略JSON解析错误
          }
        }
      }
    });

    response.data.on('end', () => {
      res.end();
    });

    response.data.on('error', (error) => {
      console.error('流式响应错误:', error);
      res.write(`data: ${JSON.stringify({ error: '流式响应中断' })}\n\n`);
      res.end();
    });

  } catch (error) {
    console.error('流式聊天API错误:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: error.response?.data?.error?.message || '服务器错误，请稍后重试'
    });
  }
});

// 清除对话历史
app.post('/api/chat/clear', (req, res) => {
  const { conversationId } = req.body;
  const conversationIdKey = conversationId || 'default';
  
  if (conversationHistory.has(conversationIdKey)) {
    conversationHistory.delete(conversationIdKey);
  }
  
  res.json({ success: true, message: '对话历史已清除' });
});

// 获取对话历史
app.get('/api/chat/history/:conversationId', (req, res) => {
  const conversationId = req.params.conversationId || 'default';
  const messages = conversationHistory.get(conversationId) || [];
  
  res.json({
    success: true,
    messages: messages
  });
});

// ==========================================
// MCP (Model Context Protocol) 服务路由
// ==========================================
const mcpServer = require('./mcp-server');

// 注册 MCP 客户端
app.post('/api/mcp/register', (req, res) => {
  try {
    const { clientId, config } = req.body;
    
    if (!clientId || !config) {
      return res.status(400).json({ error: '缺少必要参数: clientId, config' });
    }

    const client = mcpServer.registerMCPClient(clientId, config);
    res.json({ success: true, client });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 列出所有已注册的 MCP 客户端
app.get('/api/mcp/clients', (req, res) => {
  const clients = Array.from(mcpServer.mcpClients.values()).map(client => ({
    id: client.id,
    name: client.name,
    type: client.type,
    capabilities: client.capabilities
  }));
  res.json({ clients });
});

// 发现 MCP 工具
app.get('/api/mcp/:clientId/tools', async (req, res) => {
  try {
    const { clientId } = req.params;
    const tools = await mcpServer.discoverMCPTools(clientId);
    res.json({ tools });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 发现 MCP 工作流
app.get('/api/mcp/:clientId/workflows', async (req, res) => {
  try {
    const { clientId } = req.params;
    const workflows = await mcpServer.discoverMCPWorkflows(clientId);
    res.json({ workflows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 执行 MCP 工具
app.post('/api/mcp/:clientId/tools/:toolId/execute', async (req, res) => {
  try {
    const { clientId, toolId } = req.params;
    const { parameters } = req.body;
    
    const result = await mcpServer.executeMCPTool(clientId, toolId, parameters || {});
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 执行 MCP 工作流
app.post('/api/mcp/:clientId/workflows/:workflowId/execute', async (req, res) => {
  try {
    const { clientId, workflowId } = req.params;
    const { input } = req.body;
    
    const result = await mcpServer.executeMCPWorkflow(clientId, workflowId, input || {});
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取 MCP 客户端详情
app.get('/api/mcp/:clientId', (req, res) => {
  const client = mcpServer.mcpClients.get(req.params.clientId);
  if (!client) {
    return res.status(404).json({ error: 'MCP 客户端未找到' });
  }
  
  // 不返回敏感信息（如 API Key）
  const { apiKey, ...safeClient } = client;
  res.json({ client: safeClient });
});

// 删除 MCP 客户端
app.delete('/api/mcp/:clientId', (req, res) => {
  const deleted = mcpServer.mcpClients.delete(req.params.clientId);
  if (deleted) {
    res.json({ success: true, message: 'MCP 客户端已删除' });
  } else {
    res.status(404).json({ error: 'MCP 客户端未找到' });
  }
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    apiKeyConfigured: !!DEEPSEEK_API_KEY,
    mcpClients: mcpServer.mcpClients.size
  });
});

// API 路由必须在静态文件之前
// 静态文件服务会自动处理 CSS/JS 等文件

// 提供前端页面（放在最后，作为 fallback）
app.get('*', (req, res) => {
  // 如果是静态文件请求，让 express.static 处理（应该已经被处理了）
  // 如果到这里，说明是页面请求
  res.sendFile(path.join(staticPath, 'index.html'));
});

// 启动服务器（仅在非 Vercel 环境下）
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
    console.log(`DeepSeek API Key: ${DEEPSEEK_API_KEY ? '已配置' : '未配置'}`);
  });
}

// 导出 app 供 Vercel 使用
module.exports = app;

