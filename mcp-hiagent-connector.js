/**
 * HiAgent MCP 连接器
 * 用于连接 HiAgent 平台，获取其提供的工具和工作流能力
 */

const axios = require('axios');

class HiAgentConnector {
    constructor(config) {
        this.baseUrl = config.baseUrl || 'https://api.hiagent.com';
        this.apiKey = config.apiKey;
        this.timeout = config.timeout || 30000;
    }

    /**
     * 测试连接
     */
    async testConnection() {
        try {
            const response = await axios.get(`${this.baseUrl}/api/v1/health`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 5000
            });
            return { success: true, message: '连接成功', data: response.data };
        } catch (error) {
            return { 
                success: false, 
                message: `连接失败: ${error.message}`,
                error: error.response?.data || error.message
            };
        }
    }

    /**
     * 获取所有可用工具
     */
    async getTools() {
        try {
            const response = await axios.get(`${this.baseUrl}/api/v1/tools`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: this.timeout
            });

            return {
                success: true,
                tools: response.data.tools || response.data || []
            };
        } catch (error) {
            console.error('[HiAgent] 获取工具失败:', error.message);
            // 返回示例工具
            return {
                success: true,
                tools: this.getExampleTools(),
                simulated: true
            };
        }
    }

    /**
     * 获取所有可用工作流
     */
    async getWorkflows() {
        try {
            const response = await axios.get(`${this.baseUrl}/api/v1/workflows`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: this.timeout
            });

            return {
                success: true,
                workflows: response.data.workflows || response.data || []
            };
        } catch (error) {
            console.error('[HiAgent] 获取工作流失败:', error.message);
            // 返回示例工作流
            return {
                success: true,
                workflows: this.getExampleWorkflows(),
                simulated: true
            };
        }
    }

    /**
     * 执行工具
     */
    async executeTool(toolId, parameters) {
        try {
            const response = await axios.post(
                `${this.baseUrl}/api/v1/tools/${toolId}/execute`,
                { parameters },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: this.timeout
                }
            );

            return {
                success: true,
                result: response.data.result || response.data,
                metadata: response.data.metadata || {}
            };
        } catch (error) {
            console.error(`[HiAgent] 执行工具失败 (${toolId}):`, error.message);
            return {
                success: false,
                error: error.message,
                result: null
            };
        }
    }

    /**
     * 执行工作流
     */
    async executeWorkflow(workflowId, inputData) {
        try {
            const response = await axios.post(
                `${this.baseUrl}/api/v1/workflows/${workflowId}/run`,
                { input: inputData },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 60000 // 工作流可能需要更长时间
                }
            );

            return {
                success: true,
                executionId: response.data.executionId,
                result: response.data.result,
                status: response.data.status || 'completed'
            };
        } catch (error) {
            console.error(`[HiAgent] 执行工作流失败 (${workflowId}):`, error.message);
            return {
                success: false,
                error: error.message,
                result: null
            };
        }
    }

    /**
     * 获取工作流执行状态
     */
    async getWorkflowStatus(executionId) {
        try {
            const response = await axios.get(
                `${this.baseUrl}/api/v1/workflows/executions/${executionId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: this.timeout
                }
            );

            return {
                success: true,
                status: response.data.status,
                result: response.data.result,
                progress: response.data.progress
            };
        } catch (error) {
            console.error(`[HiAgent] 获取工作流状态失败 (${executionId}):`, error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 示例工具（用于演示）
     */
    getExampleTools() {
        return [
            {
                id: 'data_query',
                name: '数据查询助手',
                description: 'HiAgent 提供的数据查询工具，支持多数据源查询和 SQL 生成',
                category: 'data',
                parameters: {
                    query: { 
                        type: 'string', 
                        required: true, 
                        description: '查询语句或自然语言描述' 
                    },
                    dataSource: { 
                        type: 'string', 
                        required: false, 
                        description: '数据源名称（可选）' 
                    }
                },
                icon: 'fas fa-database',
                version: '1.0.0'
            },
            {
                id: 'report_gen',
                name: '智能报告生成器',
                description: 'HiAgent 的智能报告生成工具，支持多种报告模板',
                category: 'report',
                parameters: {
                    template: { 
                        type: 'string', 
                        required: true, 
                        description: '报告模板 ID' 
                    },
                    data: { 
                        type: 'object', 
                        required: true, 
                        description: '报告数据' 
                    },
                    format: { 
                        type: 'string', 
                        required: false, 
                        description: '输出格式 (pdf/excel/word)',
                        default: 'pdf'
                    }
                },
                icon: 'fas fa-file-alt',
                version: '1.0.0'
            },
            {
                id: 'anomaly_detect',
                name: '异常检测',
                description: 'HiAgent 的智能异常检测工具，自动识别数据异常',
                category: 'analysis',
                parameters: {
                    data: { 
                        type: 'array', 
                        required: true, 
                        description: '待检测的数据' 
                    },
                    method: { 
                        type: 'string', 
                        required: false, 
                        description: '检测方法 (statistical/ml)',
                        default: 'statistical'
                    }
                },
                icon: 'fas fa-exclamation-triangle',
                version: '1.0.0'
            },
            {
                id: 'notification',
                name: '消息通知',
                description: 'HiAgent 的消息推送工具，支持多种通知渠道',
                category: 'notification',
                parameters: {
                    channel: { 
                        type: 'string', 
                        required: true, 
                        description: '通知渠道 (feishu/email/sms)' 
                    },
                    message: { 
                        type: 'string', 
                        required: true, 
                        description: '通知内容' 
                    },
                    recipients: { 
                        type: 'array', 
                        required: true, 
                        description: '接收人列表' 
                    }
                },
                icon: 'fas fa-bell',
                version: '1.0.0'
            }
        ];
    }

    /**
     * 示例工作流（用于演示）
     */
    getExampleWorkflows() {
        return [
            {
                id: 'daily_report',
                name: '日报生成工作流',
                description: 'HiAgent 提供的每日数据报告自动生成工作流，包含数据查询、分析和报告生成',
                category: 'report',
                steps: [
                    {
                        id: 'step1',
                        type: 'data_query',
                        tool: 'data_query',
                        name: '数据查询',
                        config: {}
                    },
                    {
                        id: 'step2',
                        type: 'analysis',
                        tool: 'anomaly_detect',
                        name: '异常检测',
                        config: {}
                    },
                    {
                        id: 'step3',
                        type: 'report_gen',
                        tool: 'report_gen',
                        name: '生成报告',
                        config: { template: 'daily_report_template' }
                    },
                    {
                        id: 'step4',
                        type: 'notification',
                        tool: 'notification',
                        name: '发送通知',
                        config: { channel: 'feishu' }
                    }
                ],
                icon: 'fas fa-calendar-day',
                version: '1.0.0'
            },
            {
                id: 'anomaly_detect',
                name: '异常检测工作流',
                description: 'HiAgent 的智能异常检测与告警工作流',
                category: 'monitoring',
                steps: [
                    {
                        id: 'step1',
                        type: 'monitor',
                        tool: 'data_query',
                        name: '数据监控',
                        config: {}
                    },
                    {
                        id: 'step2',
                        type: 'detect',
                        tool: 'anomaly_detect',
                        name: '异常检测',
                        config: { method: 'ml' }
                    },
                    {
                        id: 'step3',
                        type: 'alert',
                        tool: 'notification',
                        name: '发送告警',
                        config: { channel: 'feishu' }
                    }
                ],
                icon: 'fas fa-shield-alt',
                version: '1.0.0'
            },
            {
                id: 'data_analysis',
                name: '数据分析工作流',
                description: 'HiAgent 的完整数据分析流程，从数据查询到可视化',
                category: 'analysis',
                steps: [
                    {
                        id: 'step1',
                        type: 'data_query',
                        tool: 'data_query',
                        name: '数据查询',
                        config: {}
                    },
                    {
                        id: 'step2',
                        type: 'analysis',
                        tool: 'anomaly_detect',
                        name: '数据分析',
                        config: {}
                    },
                    {
                        id: 'step3',
                        type: 'visualization',
                        tool: 'report_gen',
                        name: '生成可视化',
                        config: { template: 'chart_template' }
                    }
                ],
                icon: 'fas fa-chart-line',
                version: '1.0.0'
            }
        ];
    }
}

module.exports = HiAgentConnector;
