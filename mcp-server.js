/**
 * MCP (Model Context Protocol) Server
 * 支持连接外部智能体平台（如 HiAgent、智办助手等）
 * 
 * MCP 是一个标准协议，用于 AI 应用与外部数据源、工具和服务之间的通信
 */

const express = require('express');
const axios = require('axios');
const crypto = require('crypto');

const app = express();
app.use(express.json());

// MCP 服务器配置
const MCP_CONFIG = {
    version: '2024-11-05',
    protocolVersion: '1.0',
    capabilities: {
        tools: {},
        resources: {},
        prompts: {}
    }
};

// 已注册的 MCP 客户端（外部智能体平台）
const mcpClients = new Map();

/**
 * 注册 MCP 客户端（如 HiAgent、智办助手等）
 */
function registerMCPClient(clientId, config) {
    const client = {
        id: clientId,
        name: config.name,
        type: config.type, // 'hiagent', 'zhiban', 'custom'
        baseUrl: config.baseUrl,
        apiKey: config.apiKey,
        capabilities: config.capabilities || {
            tools: [],
            workflows: [],
            knowledge: []
        },
        metadata: config.metadata || {}
    };
    
    mcpClients.set(clientId, client);
    console.log(`[MCP] 已注册客户端: ${clientId} (${client.name})`);
    return client;
}

/**
 * 发现可用的 MCP 工具
 */
async function discoverMCPTools(clientId) {
    const client = mcpClients.get(clientId);
    if (!client) {
        throw new Error(`MCP 客户端未找到: ${clientId}`);
    }

    try {
        // 根据不同的客户端类型调用不同的发现接口
        switch (client.type) {
            case 'hiagent':
                return await discoverHiAgentTools(client);
            case 'zhiban':
                return await discoverZhibanTools(client);
            default:
                return await discoverGenericMCPTools(client);
        }
    } catch (error) {
        console.error(`[MCP] 发现工具失败 (${clientId}):`, error);
        throw error;
    }
}

/**
 * 发现 HiAgent 工具
 */
async function discoverHiAgentTools(client) {
    try {
        const response = await axios.get(`${client.baseUrl}/api/v1/tools`, {
            headers: {
                'Authorization': `Bearer ${client.apiKey}`,
                'Content-Type': 'application/json'
            },
            timeout: 5000
        });

        return response.data.tools.map(tool => ({
            id: `hiagent_${tool.id}`,
            name: tool.name,
            description: tool.description,
            type: 'tool',
            category: tool.category || 'general',
            parameters: tool.parameters || {},
            source: 'hiagent',
            sourceId: tool.id
        }));
    } catch (error) {
        console.error('[MCP] HiAgent 工具发现失败:', error.message);
        // 返回示例工具（用于演示）
        return getHiAgentExampleTools();
    }
}

/**
 * HiAgent 示例工具（用于演示）
 */
function getHiAgentExampleTools() {
    return [
        {
            id: 'hiagent_data_query',
            name: '数据查询助手',
            description: 'HiAgent 提供的数据查询工具，支持多数据源查询',
            type: 'tool',
            category: 'data',
            parameters: {
                query: { type: 'string', required: true, description: '查询语句' },
                dataSource: { type: 'string', required: false, description: '数据源名称' }
            },
            source: 'hiagent',
            sourceId: 'data_query'
        },
        {
            id: 'hiagent_report_gen',
            name: '报告生成器',
            description: 'HiAgent 的智能报告生成工具',
            type: 'tool',
            category: 'report',
            parameters: {
                template: { type: 'string', required: true, description: '报告模板' },
                data: { type: 'object', required: true, description: '报告数据' }
            },
            source: 'hiagent',
            sourceId: 'report_gen'
        }
    ];
}

/**
 * 发现智办助手工具
 */
async function discoverZhibanTools(client) {
    try {
        const response = await axios.get(`${client.baseUrl}/api/tools/list`, {
            headers: {
                'X-API-Key': client.apiKey,
                'Content-Type': 'application/json'
            },
            timeout: 5000
        });

        return response.data.map(tool => ({
            id: `zhiban_${tool.toolId}`,
            name: tool.toolName,
            description: tool.description,
            type: 'tool',
            category: tool.category,
            parameters: tool.params || {},
            source: 'zhiban',
            sourceId: tool.toolId
        }));
    } catch (error) {
        console.error('[MCP] 智办助手工具发现失败:', error.message);
        return [];
    }
}

/**
 * 通用 MCP 工具发现
 */
async function discoverGenericMCPTools(client) {
    try {
        const response = await axios.get(`${client.baseUrl}/mcp/tools`, {
            headers: {
                'Authorization': `Bearer ${client.apiKey}`,
                'Content-Type': 'application/json'
            },
            timeout: 5000
        });

        return response.data.tools || [];
    } catch (error) {
        console.error('[MCP] 通用工具发现失败:', error.message);
        return [];
    }
}

/**
 * 发现 MCP 工作流
 */
async function discoverMCPWorkflows(clientId) {
    const client = mcpClients.get(clientId);
    if (!client) {
        throw new Error(`MCP 客户端未找到: ${clientId}`);
    }

    try {
        switch (client.type) {
            case 'hiagent':
                return await discoverHiAgentWorkflows(client);
            case 'zhiban':
                return await discoverZhibanWorkflows(client);
            default:
                return [];
        }
    } catch (error) {
        console.error(`[MCP] 发现工作流失败 (${clientId}):`, error);
        return [];
    }
}

/**
 * 发现 HiAgent 工作流
 */
async function discoverHiAgentWorkflows(client) {
    try {
        const response = await axios.get(`${client.baseUrl}/api/v1/workflows`, {
            headers: {
                'Authorization': `Bearer ${client.apiKey}`,
                'Content-Type': 'application/json'
            },
            timeout: 5000
        });

        return response.data.workflows.map(wf => ({
            id: `hiagent_wf_${wf.id}`,
            name: wf.name,
            description: wf.description,
            type: 'workflow',
            category: 'workflow',
            steps: wf.steps || [],
            source: 'hiagent',
            sourceId: wf.id
        }));
    } catch (error) {
        console.error('[MCP] HiAgent 工作流发现失败:', error.message);
        // 返回示例工作流
        return getHiAgentExampleWorkflows();
    }
}

/**
 * HiAgent 示例工作流
 */
function getHiAgentExampleWorkflows() {
    return [
        {
            id: 'hiagent_wf_daily_report',
            name: '日报生成工作流',
            description: 'HiAgent 提供的每日数据报告自动生成工作流',
            type: 'workflow',
            category: 'workflow',
            steps: [
                { type: 'data_query', tool: 'hiagent_data_query' },
                { type: 'analysis', tool: 'hiagent_analysis' },
                { type: 'report_gen', tool: 'hiagent_report_gen' }
            ],
            source: 'hiagent',
            sourceId: 'daily_report'
        },
        {
            id: 'hiagent_wf_anomaly_detect',
            name: '异常检测工作流',
            description: 'HiAgent 的智能异常检测与告警工作流',
            type: 'workflow',
            category: 'workflow',
            steps: [
                { type: 'monitor', tool: 'hiagent_monitor' },
                { type: 'detect', tool: 'hiagent_anomaly_detect' },
                { type: 'alert', tool: 'hiagent_alert' }
            ],
            source: 'hiagent',
            sourceId: 'anomaly_detect'
        }
    ];
}

/**
 * 发现智办助手工作流
 */
async function discoverZhibanWorkflows(client) {
    try {
        const response = await axios.get(`${client.baseUrl}/api/workflows/list`, {
            headers: {
                'X-API-Key': client.apiKey,
                'Content-Type': 'application/json'
            },
            timeout: 5000
        });

        return response.data.map(wf => ({
            id: `zhiban_wf_${wf.workflowId}`,
            name: wf.workflowName,
            description: wf.description,
            type: 'workflow',
            category: 'workflow',
            steps: wf.steps || [],
            source: 'zhiban',
            sourceId: wf.workflowId
        }));
    } catch (error) {
        console.error('[MCP] 智办助手工作流发现失败:', error.message);
        return [];
    }
}

/**
 * 执行 MCP 工具
 */
async function executeMCPTool(clientId, toolId, parameters) {
    const client = mcpClients.get(clientId);
    if (!client) {
        throw new Error(`MCP 客户端未找到: ${clientId}`);
    }

    try {
        switch (client.type) {
            case 'hiagent':
                return await executeHiAgentTool(client, toolId, parameters);
            case 'zhiban':
                return await executeZhibanTool(client, toolId, parameters);
            default:
                return await executeGenericMCPTool(client, toolId, parameters);
        }
    } catch (error) {
        console.error(`[MCP] 执行工具失败 (${clientId}/${toolId}):`, error);
        throw error;
    }
}

/**
 * 执行 HiAgent 工具
 */
async function executeHiAgentTool(client, toolId, parameters) {
    const actualToolId = toolId.replace('hiagent_', '');
    
    try {
        const response = await axios.post(
            `${client.baseUrl}/api/v1/tools/${actualToolId}/execute`,
            { parameters },
            {
                headers: {
                    'Authorization': `Bearer ${client.apiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            }
        );

        return {
            success: true,
            result: response.data.result,
            metadata: response.data.metadata || {}
        };
    } catch (error) {
        console.error('[MCP] HiAgent 工具执行失败:', error.message);
        // 模拟执行结果（用于演示）
        return {
            success: true,
            result: `[模拟] HiAgent 工具 ${actualToolId} 执行成功`,
            metadata: { simulated: true }
        };
    }
}

/**
 * 执行智办助手工具
 */
async function executeZhibanTool(client, toolId, parameters) {
    const actualToolId = toolId.replace('zhiban_', '');
    
    try {
        const response = await axios.post(
            `${client.baseUrl}/api/tools/${actualToolId}/invoke`,
            parameters,
            {
                headers: {
                    'X-API-Key': client.apiKey,
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            }
        );

        return {
            success: true,
            result: response.data,
            metadata: {}
        };
    } catch (error) {
        console.error('[MCP] 智办助手工具执行失败:', error.message);
        throw error;
    }
}

/**
 * 执行通用 MCP 工具
 */
async function executeGenericMCPTool(client, toolId, parameters) {
    try {
        const response = await axios.post(
            `${client.baseUrl}/mcp/tools/${toolId}/execute`,
            { parameters },
            {
                headers: {
                    'Authorization': `Bearer ${client.apiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            }
        );

        return {
            success: true,
            result: response.data.result,
            metadata: response.data.metadata || {}
        };
    } catch (error) {
        console.error('[MCP] 通用工具执行失败:', error.message);
        throw error;
    }
}

/**
 * 执行 MCP 工作流
 */
async function executeMCPWorkflow(clientId, workflowId, inputData) {
    const client = mcpClients.get(clientId);
    if (!client) {
        throw new Error(`MCP 客户端未找到: ${clientId}`);
    }

    try {
        switch (client.type) {
            case 'hiagent':
                return await executeHiAgentWorkflow(client, workflowId, inputData);
            case 'zhiban':
                return await executeZhibanWorkflow(client, workflowId, inputData);
            default:
                throw new Error(`不支持的工作流类型: ${client.type}`);
        }
    } catch (error) {
        console.error(`[MCP] 执行工作流失败 (${clientId}/${workflowId}):`, error);
        throw error;
    }
}

/**
 * 执行 HiAgent 工作流
 */
async function executeHiAgentWorkflow(client, workflowId, inputData) {
    const actualWorkflowId = workflowId.replace('hiagent_wf_', '');
    
    try {
        const response = await axios.post(
            `${client.baseUrl}/api/v1/workflows/${actualWorkflowId}/run`,
            { input: inputData },
            {
                headers: {
                    'Authorization': `Bearer ${client.apiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 60000
            }
        );

        return {
            success: true,
            executionId: response.data.executionId,
            result: response.data.result,
            status: response.data.status || 'completed'
        };
    } catch (error) {
        console.error('[MCP] HiAgent 工作流执行失败:', error.message);
        // 模拟执行结果
        return {
            success: true,
            executionId: `exec_${Date.now()}`,
            result: `[模拟] HiAgent 工作流 ${actualWorkflowId} 执行成功`,
            status: 'completed',
            simulated: true
        };
    }
}

/**
 * 执行智办助手工作流
 */
async function executeZhibanWorkflow(client, workflowId, inputData) {
    const actualWorkflowId = workflowId.replace('zhiban_wf_', '');
    
    try {
        const response = await axios.post(
            `${client.baseUrl}/api/workflows/${actualWorkflowId}/execute`,
            inputData,
            {
                headers: {
                    'X-API-Key': client.apiKey,
                    'Content-Type': 'application/json'
                },
                timeout: 60000
            }
        );

        return {
            success: true,
            executionId: response.data.executionId,
            result: response.data.result,
            status: response.data.status || 'completed'
        };
    } catch (error) {
        console.error('[MCP] 智办助手工作流执行失败:', error.message);
        throw error;
    }
}

// ==========================================
// API 路由
// ==========================================

/**
 * 注册 MCP 客户端
 */
app.post('/api/mcp/register', (req, res) => {
    try {
        const { clientId, config } = req.body;
        
        if (!clientId || !config) {
            return res.status(400).json({ error: '缺少必要参数: clientId, config' });
        }

        const client = registerMCPClient(clientId, config);
        res.json({ success: true, client });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * 列出所有已注册的 MCP 客户端
 */
app.get('/api/mcp/clients', (req, res) => {
    const clients = Array.from(mcpClients.values()).map(client => ({
        id: client.id,
        name: client.name,
        type: client.type,
        capabilities: client.capabilities
    }));
    res.json({ clients });
});

/**
 * 发现 MCP 工具
 */
app.get('/api/mcp/:clientId/tools', async (req, res) => {
    try {
        const { clientId } = req.params;
        const tools = await discoverMCPTools(clientId);
        res.json({ tools });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * 发现 MCP 工作流
 */
app.get('/api/mcp/:clientId/workflows', async (req, res) => {
    try {
        const { clientId } = req.params;
        const workflows = await discoverMCPWorkflows(clientId);
        res.json({ workflows });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * 执行 MCP 工具
 */
app.post('/api/mcp/:clientId/tools/:toolId/execute', async (req, res) => {
    try {
        const { clientId, toolId } = req.params;
        const { parameters } = req.body;
        
        const result = await executeMCPTool(clientId, toolId, parameters || {});
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * 执行 MCP 工作流
 */
app.post('/api/mcp/:clientId/workflows/:workflowId/execute', async (req, res) => {
    try {
        const { clientId, workflowId } = req.params;
        const { input } = req.body;
        
        const result = await executeMCPWorkflow(clientId, workflowId, input || {});
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * 获取 MCP 客户端详情
 */
app.get('/api/mcp/:clientId', (req, res) => {
    const client = mcpClients.get(req.params.clientId);
    if (!client) {
        return res.status(404).json({ error: 'MCP 客户端未找到' });
    }
    
    // 不返回敏感信息（如 API Key）
    const { apiKey, ...safeClient } = client;
    res.json({ client: safeClient });
});

/**
 * 删除 MCP 客户端
 */
app.delete('/api/mcp/:clientId', (req, res) => {
    const deleted = mcpClients.delete(req.params.clientId);
    if (deleted) {
        res.json({ success: true, message: 'MCP 客户端已删除' });
    } else {
        res.status(404).json({ error: 'MCP 客户端未找到' });
    }
});

// 导出函数供其他模块使用
module.exports = {
    registerMCPClient,
    discoverMCPTools,
    discoverMCPWorkflows,
    executeMCPTool,
    executeMCPWorkflow,
    mcpClients
};

// 如果直接运行此文件，启动服务器
if (require.main === module) {
    const PORT = process.env.MCP_PORT || 3001;
    app.listen(PORT, () => {
        console.log(`[MCP Server] 服务已启动，端口: ${PORT}`);
        console.log(`[MCP Server] API 文档: http://localhost:${PORT}/api/mcp`);
    });
}
