#!/usr/bin/env node
/**
 * MCP Server - Work Order Management (WOM) Ticket Creator
 * 用于自动化创建运维工单的 MCP 服务器
 *
 * @author Your Name
 * @version <% process.env.version %>
 */
import 'dotenv/config';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import ESBProtocolBuilder from './utils/ESBProtocolBuilder.js';
import packageJson from '../package.json' with { type: 'json' };
console.log(packageJson.version);
// ============ 常量定义 ============
/**
 * 工单创建工具定义
 */
const WOM_CREATOR_TOOL = {
    name: 'create-wom-ticket',
    description: `创建运维工单（Work Order Management）

**功能说明：**
用于自动化提交系统故障、需求变更、运维支持等工单到企业服务总线（ESB）。

**适用场景：**
- 系统故障报修（如：登录异常、功能失效）
- 功能需求提交（如：新增报表、权限调整）
- 运维支持请求（如：数据修复、配置变更）
- 事件跟踪记录（如：性能问题、安全事件）

**使用示例：**
用户："帮我报个工单，OA系统的审批流程有bug"
AI 会自动提取信息并创建工单。`,
    inputSchema: {
        type: 'object',
        required: ['empNo', 'content', 'system', 'title'],
        properties: {
            name: {
                type: 'string',
                minLength: 1,
                maxLength: 100,
                description: '提交人姓名（用于工单联系和通知）'
            },
            email: {
                type: 'string',
                format: 'email',
                description: '提交人邮箱（用于接收工单处理进度通知）'
            },
            empNo: {
                type: 'string',
                minLength: 1,
                description: '员工工号（必填，用于身份验证和工单归属）'
            },
            system: {
                type: 'string',
                minLength: 1,
                description: '问题所属系统名称（必填，如：VOSA、财务系统、OA系统、CRM等）'
            },
            eventId: {
                type: 'string',
                description: '关联的事件ID（可选，用于追踪特定监控事件或告警）'
            },
            replayId: {
                type: 'string',
                description: '会话回放ID（可选，用于问题复现和分析）'
            },
            title: {
                type: 'string',
                minLength: 1,
                maxLength: 100,
                description: '工单标题（必填，简明扼要描述问题，如："登录页面无法访问"、"审批流程卡住"）'
            },
            content: {
                type: 'string',
                minLength: 1,
                maxLength: 5000,
                description: `问题详细描述（必填）
建议包含以下信息：
- 问题现象：具体出现了什么问题
- 复现步骤：如何触发该问题
- 影响范围：影响了哪些用户或业务
- 期望结果：希望达到什么效果
- 发生时间：问题首次出现的时间`
            },
            attachments: {
                type: 'array',
                items: {
                    type: 'object',
                    required: ['filename', 'url'],
                    properties: {
                        filename: {
                            type: 'string',
                            description: '附件文件名（必须含扩展名，如：error.log、screenshot.png）'
                        },
                        url: {
                            type: 'string',
                            description: '附件访问URL（需可公网访问或内网可达，支持 http/https 协议）'
                        },
                        size: {
                            type: 'number',
                            description: '文件大小（字节，用于验证和展示）'
                        }
                    }
                },
                description: '附件列表（可选，支持截图、日志、录屏等，建议单个文件不超过10MB）'
            }
        }
    }
};
// ============ 全局配置 ============
let ESB_URL = process.env.ESB_URL || '';
// ============ 服务器配置 ============
const SERVER_CONFIG = {
    name: 'mcp-server-wom-call',
    version: packageJson.version,
    description: 'MCP Server for Work Order Management System Integration'
};
// ============ 工具函数 ============
/**
 * 验证配置是否完整
 * @throws {Error} 如果必需的配置未设置
 */
function validateConfiguration() {
    if (!ESB_URL) {
        throw new Error('ESB_URL is not configured. Please set it in .env file, system environment, or MCP client configuration.');
    }
}
/**
 * 构建 ESB 请求负载
 * @param input - 工单输入参数
 * @returns JSON 格式的 ESB 请求体
 */
function buildESBPayload(input) {
    const builder = new ESBProtocolBuilder();
    // 设置基本信息
    builder
        .setJobTitle(input.title)
        .setProposeUser(input.empNo)
        .setJobDesc(Buffer.from(input.content, 'utf-8').toString('base64')) // Base64 编码内容
        .setBusinessSystem(input.system)
        .setEventId(input.eventId || '')
        .setAppId(input.system);
    // 添加附件（如果有）
    if (input.attachments && input.attachments.length > 0) {
        const validAttachments = input.attachments.filter((att) => typeof att.filename === 'string' &&
            typeof att.url === 'string' &&
            att.filename.length > 0 &&
            att.url.length > 0);
        if (validAttachments.length > 0) {
            builder.addAttachments(validAttachments.map((attachment) => ({
                attachmentName: attachment.filename,
                attachmentDesc: attachment.url
            })));
        }
    }
    return builder.buildJSON();
}
/**
 * 调用 ESB API 创建工单
 * @param input - 工单输入参数
 * @returns ESB API 响应的 JSON 字符串
 * @throws {Error} 如果 API 调用失败
 */
async function createWorkOrder(input) {
    const url = ESB_URL;
    if (!url) {
        throw new Error('ESB_URL is not configured');
    }
    const requestBody = buildESBPayload(input);
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: requestBody
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`ESB API request failed: ${response.status} ${response.statusText}\nResponse: ${errorText}`);
        }
        const responseData = await response.json();
        return JSON.stringify(responseData, null, 2);
    }
    catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to create work order: ${error.message}`);
        }
        throw new Error(`Failed to create work order: ${String(error)}`);
    }
}
/**
 * 验证输入参数
 * @param args - 待验证的参数
 * @throws {Error} 如果参数验证失败
 */
function validateInput(args) {
    if (!args || typeof args !== 'object') {
        throw new Error('Invalid input: arguments must be an object');
    }
    const input = args;
    // 验证必填字段
    if (!input.empNo ||
        typeof input.empNo !== 'string' ||
        input.empNo.trim().length === 0) {
        throw new Error('Invalid input: empNo is required and must be a non-empty string');
    }
    if (!input.system ||
        typeof input.system !== 'string' ||
        input.system.trim().length === 0) {
        throw new Error('Invalid input: system is required and must be a non-empty string');
    }
    if (!input.title ||
        typeof input.title !== 'string' ||
        input.title.trim().length === 0) {
        throw new Error('Invalid input: title is required and must be a non-empty string');
    }
    if (!input.content ||
        typeof input.content !== 'string' ||
        input.content.trim().length === 0) {
        throw new Error('Invalid input: content is required and must be a non-empty string');
    }
    // 验证长度限制
    if (input.title.length > 100) {
        throw new Error('Invalid input: title must not exceed 100 characters');
    }
    if (input.content.length > 5000) {
        throw new Error('Invalid input: content must not exceed 5000 characters');
    }
    // 验证可选字段
    if (input.name !== undefined &&
        (typeof input.name !== 'string' || input.name.length > 100)) {
        throw new Error('Invalid input: name must be a string with max 100 characters');
    }
    if (input.email !== undefined && typeof input.email !== 'string') {
        throw new Error('Invalid input: email must be a string');
    }
    // 验证邮箱格式（如果提供）
    if (input.email && input.email.length > 0) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(input.email)) {
            throw new Error('Invalid input: email format is invalid');
        }
    }
    // 验证附件格式（如果提供）
    if (input.attachments !== undefined) {
        if (!Array.isArray(input.attachments)) {
            throw new Error('Invalid input: attachments must be an array');
        }
        for (const [index, attachment] of input.attachments.entries()) {
            if (!attachment || typeof attachment !== 'object') {
                throw new Error(`Invalid input: attachment at index ${index} must be an object`);
            }
            if (!attachment.filename ||
                typeof attachment.filename !== 'string' ||
                attachment.filename.trim().length === 0) {
                throw new Error(`Invalid input: attachment at index ${index} must have a valid filename`);
            }
            if (!attachment.url ||
                typeof attachment.url !== 'string' ||
                attachment.url.trim().length === 0) {
                throw new Error(`Invalid input: attachment at index ${index} must have a valid url`);
            }
            // 验证 URL 格式
            try {
                new URL(attachment.url);
            }
            catch {
                throw new Error(`Invalid input: attachment at index ${index} has an invalid URL format`);
            }
            if (attachment.size !== undefined &&
                (typeof attachment.size !== 'number' || attachment.size < 0)) {
                throw new Error(`Invalid input: attachment at index ${index} size must be a positive number`);
            }
        }
    }
}
// ============ MCP 服务器实现 ============
/**
 * 创建 MCP 服务器实例
 * 注意：Server 构造函数会自动处理 initialize 请求
 */
const server = new Server({
    name: SERVER_CONFIG.name,
    version: SERVER_CONFIG.version
}, {
    capabilities: {
        tools: {}
    }
});
/**
 * 注册工具列表处理器
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [WOM_CREATOR_TOOL]
    };
});
/**
 * 注册工具调用处理器
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
        // 验证配置
        validateConfiguration();
        const { name, arguments: args } = request.params;
        if (!args) {
            throw new Error('No arguments provided');
        }
        switch (name) {
            case 'create-wom-ticket': {
                validateInput(args);
                const result = await createWorkOrder(args);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `✅ 工单创建成功\n\n${result}`
                        }
                    ],
                    isError: false
                };
            }
            default:
                throw new Error(`Unknown tool: ${name}`);
        }
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('❌ Error handling tool call:', errorMessage);
        return {
            content: [
                {
                    type: 'text',
                    text: `❌ 工单创建失败\n\n错误信息：${errorMessage}`
                }
            ],
            isError: true
        };
    }
});
// ============ 服务器启动 ============
/**
 * 启动 MCP 服务器
 */
async function runServer() {
    try {
        // 创建传输层
        const transport = new StdioServerTransport();
        // 连接服务器（SDK 会自动处理 initialize 握手）
        await server.connect(transport);
        // 输出启动日志
        console.error(`🚀 ${SERVER_CONFIG.name} v${SERVER_CONFIG.version} is running`);
        console.error(`📝 ${SERVER_CONFIG.description}`);
        if (ESB_URL) {
            console.error(`🔗 ESB URL: ${ESB_URL}`);
        }
        else {
            console.error(`⚠️  ESB URL not configured. Please set ESB_URL environment variable.`);
        }
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        throw error;
    }
}
// 启动服务器
runServer().catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
});
