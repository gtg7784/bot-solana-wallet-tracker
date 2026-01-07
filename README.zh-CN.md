# Solana 钱包追踪器

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Solana](https://img.shields.io/badge/Solana-Web3.js-purple.svg)](https://solana.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

一个用于 Solana 区块链的递归交易历史爬虫，使用 Solscan API 和网页抓取构建层级转账树。

**[English](./README.md) | [日本語](./README.ja.md) | [한국어](./README.ko.md)**

## 概述

该工具递归探索 Solana 账户的转账历史，构建层级"历史树"。它结合了：
- **Solscan Pro API**：获取代币元数据和转账记录
- **Puppeteer 网页抓取**：解析公开名称（API 不提供此功能）

当遇到 `Pump.fun: Raydium Migration` 公开名称时，爬虫会停止探索，非常适合追踪代币创建和迁移模式。

## 功能特性

- **代币元数据获取**：获取完整的代币信息，包括创建者、供应量和元数据
- **转账历史追踪**：查询任意 Solana 账户的收入/支出转账
- **公开名称解析**：抓取 Solscan 解析账户公开名称（如 "Pump.fun: Raydium Migration"）
- **递归树构建**：构建最多 5 层深度的转账历史树
- **智能终止**：到达已知端点（Raydium Migration）时停止爬取

## 安装

```bash
# 克隆仓库
git clone https://github.com/your-username/bot-solana-wallet-tracker.git
cd bot-solana-wallet-tracker

# 安装依赖
pnpm install
```

## 使用方法

### 基本用法

```bash
# 运行爬虫
pnpm start

# 开发模式（热重载）
pnpm dev
```

### 配置

编辑 `constants.ts` 进行配置：

```typescript
// 目标代币合约地址
export const TEST_CONTRACT_ADDRESS = "FLJYGHpCCcfHSeSd2peb5SMajNWaCsRnhpump";

// 终止条件
export const RADIUM_MIGRATION_PUBLIC_NAME = "Pump.fun: Raydium Migration";
```

### 输出示例

```json
[
  {
    "address": "发送者地址1",
    "name": "公开名称1",
    "children": [
      {
        "address": "发送者地址2",
        "children": [
          {
            "address": "发送者地址3",
            "name": "Pump.fun: Raydium Migration"
          }
        ]
      }
    ]
  }
]
```

## 架构

```
bot-solana-wallet-tracker/
├── index.ts              # 主入口 & 递归树构建器
├── constants.ts          # 配置常量
├── solscan/
│   ├── index.ts          # 模块导出
│   ├── methods.ts        # Solscan API 方法 (getTokenMeta, getAccountTransfer)
│   ├── crawling.ts       # 基于 Puppeteer 的网页抓取器 (getAccountPublicName)
│   └── types.ts          # TypeScript 类型定义
└── index.test.ts         # 测试套件
```

## 工作原理

1. **代币元数据查询**：获取代币元数据以识别创建者账户
2. **转账历史查询**：从创建者账户获取转账记录
3. **递归探索**：
   - 对每个发送者地址，递归调用 `buildHistory()`（最大深度：5）
   - 如果账户有公开名称，停止探索其子节点
   - 如果公开名称是 `Pump.fun: Raydium Migration`，在根级别终止
4. **结果输出**：以 JSON 格式输出完整的历史树

## API 参考

### `getTokenMeta(address: string)`
从 Solscan Pro API 获取代币元数据。

### `getAccountTransfer(address: string)`
获取账户的 SOL 转入记录。

### `Crawler.getAccountPublicName(address: string)`
抓取 Solscan 网页获取账户的公开名称。

## 已知问题与解决方案

### 1. 爬虫检测（30秒超时）

Solscan 可能检测并阻止自动化爬取，导致超时错误。

**解决方案**：实施 IP 轮换或代理服务器分散请求。

### 2. Solscan API 限制

- 每日/每月请求限制
- 速率限制
- 每次请求最多返回 50 条转账记录
- API 响应中无公开名称字段

**解决方案**：使用直接的 Solana RPC 调用获得更精细的控制：

```typescript
import { Connection, PublicKey } from '@solana/web3.js';

const connection = new Connection('https://api.mainnet-beta.solana.com');
const address = new PublicKey('钱包地址');

async function fetchTransactions() {
  const signatures = await connection.getSignaturesForAddress(address);
  for (const sigInfo of signatures) {
    const tx = await connection.getTransaction(sigInfo.signature);
    console.log(tx);
  }
}
```

## 测试

```bash
# 运行测试
pnpm test

# 运行测试（含覆盖率）
pnpm test:cov
```

## 依赖项

- **@solana/web3.js**：Solana 区块链交互
- **axios**：API 请求的 HTTP 客户端
- **puppeteer**：用于网页抓取的无头浏览器

## 许可证

MIT
