# mcp-server-wom-call

MCP Server for Work Order Management (WOM) System Integration - 用于自动化创建运维工单的 MCP 服务器

[![npm version](https://badge.fury.io/js/mcp-server-wom-call.svg)](https://www.npmjs.com/package/mcp-server-wom-call)

## 功能特性

- 🎫 自动化创建运维工单
- 🔌 集成企业服务总线 (ESB)
- 📎 支持附件上传
- ✅ 完整的参数验证
- 🛡️ TypeScript 类型安全

## 安装

```bash
npm install -g mcp-server-wom-call

```
## 使用方式
```json
{
  "command": "npx",
  "args": [
    "-y",
    "mcp-server-wom-call"
  ],
  "env": {
    "ESB_URL": "https://example.com/endpoint"
  }
}
```