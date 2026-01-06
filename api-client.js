// API客户端配置 - GitHub Pages 版本（直接调用 DeepSeek API）
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';
const DEEPSEEK_API_KEY = 'sk-e8312e0eae874f2f9122f6aa334f4b3f'; // 可以直接在前端使用，或从环境变量读取

let currentConversationId = 'default-' + Date.now();

// 从 localStorage 获取对话历史
function getConversationHistory(conversationId) {
    const key = `conversation_${conversationId}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
}

// 保存对话历史到 localStorage
function saveConversationHistory(conversationId, messages) {
    const key = `conversation_${conversationId}`;
    localStorage.setItem(key, JSON.stringify(messages));
}

// 生成新的会话ID
function generateConversationId() {
    currentConversationId = 'conv-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    return currentConversationId;
}

// 获取会话ID
function getConversationId() {
    return currentConversationId;
}

// 清除会话
function clearConversation() {
    currentConversationId = 'default-' + Date.now();
}

// 调用DeepSeek API（非流式）
async function callDeepSeekAPI(message, model = 'deepseek-chat', conversationId = null, systemPrompt = null, temperature = 0.7) {
    try {
        const conversationIdKey = conversationId || getConversationId();
        let messages = getConversationHistory(conversationIdKey);

        // 如果有system prompt，检查是否已有system message
        if (systemPrompt) {
            const hasSystemMessage = messages.some(msg => msg.role === 'system');
            if (!hasSystemMessage) {
                messages.unshift({
                    role: 'system',
                    content: systemPrompt
                });
            } else if (messages.length > 0 && messages[0].role === 'system') {
                messages[0].content = systemPrompt;
            }
        }

        // 添加用户消息
        messages.push({
            role: 'user',
            content: message
        });

        // 调用 DeepSeek API
        const response = await fetch(DEEPSEEK_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
                model: model,
                messages: messages,
                stream: false,
                temperature: temperature
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || '请求失败');
        }

        const data = await response.json();
        const assistantMessage = data.choices[0].message.content;

        // 添加助手回复到历史记录
        messages.push({
            role: 'assistant',
            content: assistantMessage
        });

        // 保存对话历史
        saveConversationHistory(conversationIdKey, messages);

        return {
            success: true,
            message: assistantMessage,
            conversationId: conversationIdKey,
            usage: data.usage || null
        };
    } catch (error) {
        console.error('API调用错误:', error);
        return {
            success: false,
            error: error.message || '网络错误，请稍后重试'
        };
    }
}

// 调用DeepSeek API（流式）
async function callDeepSeekAPIStream(message, model = 'deepseek-chat', conversationId = null, onChunk = null, onComplete = null, onError = null, systemPrompt = null, temperature = 0.7) {
    try {
        const conversationIdKey = conversationId || getConversationId();
        let messages = getConversationHistory(conversationIdKey);

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

        // 调用 DeepSeek API（流式）
        const response = await fetch(DEEPSEEK_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
                model: model,
                messages: messages,
                stream: true,
                temperature: temperature
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || '请求失败');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let fullMessage = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6);
                    if (data === '[DONE]') {
                        // 流结束，保存完整回复到历史
                        messages.push({
                            role: 'assistant',
                            content: fullMessage
                        });
                        saveConversationHistory(conversationIdKey, messages);
                        if (onComplete) onComplete(fullMessage);
                        return { success: true, message: fullMessage };
                    }
                    try {
                        const json = JSON.parse(data);
                        const content = json.choices?.[0]?.delta?.content || '';
                        if (content) {
                            fullMessage += content;
                            if (onChunk) onChunk(content);
                        }
                        if (json.error) {
                            throw new Error(json.error);
                        }
                    } catch (e) {
                        // 忽略JSON解析错误
                    }
                }
            }
        }

        // 保存对话历史
        messages.push({
            role: 'assistant',
            content: fullMessage
        });
        saveConversationHistory(conversationIdKey, messages);

        if (onComplete) onComplete(fullMessage);
        return { success: true, message: fullMessage };
    } catch (error) {
        console.error('流式API调用错误:', error);
        if (onError) onError(error);
        return {
            success: false,
            error: error.message || '网络错误，请稍后重试'
        };
    }
}

// 清除对话历史
async function clearConversationHistory(conversationId = null) {
    try {
        const conversationIdKey = conversationId || getConversationId();
        const key = `conversation_${conversationIdKey}`;
        localStorage.removeItem(key);
        return { success: true, message: '对话历史已清除' };
    } catch (error) {
        console.error('清除对话历史错误:', error);
        return { success: false, error: error.message };
    }
}

// 获取对话历史
function getConversationHistoryAPI(conversationId = null) {
    const conversationIdKey = conversationId || getConversationId();
    const messages = getConversationHistory(conversationIdKey);
    return {
        success: true,
        messages: messages
    };
}

// 健康检查（GitHub Pages 版本不需要后端）
async function checkAPIHealth() {
    try {
        // 简单测试 API Key 是否有效
        return { 
            status: 'ok', 
            timestamp: new Date().toISOString(),
            apiKeyConfigured: !!DEEPSEEK_API_KEY,
            platform: 'github-pages'
        };
    } catch (error) {
        return { status: 'error', error: error.message };
    }
}
