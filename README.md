# Solana Wallet Tracker

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Solana](https://img.shields.io/badge/Solana-Web3.js-purple.svg)](https://solana.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A recursive transaction history crawler for Solana blockchain that builds hierarchical transfer trees using Solscan API and web scraping.

**[中文](./README.zh-CN.md) | [日本語](./README.ja.md) | [한국어](./README.ko.md)**

## Overview

This tool recursively explores transfer histories of Solana accounts to build a hierarchical "History Tree". It combines:
- **Solscan Pro API** for token metadata and transfer records
- **Puppeteer web scraping** for public name resolution (not available via API)

The crawler stops exploration when encountering the `Pump.fun: Raydium Migration` public name, making it ideal for tracking token creation and migration patterns.

## Features

- **Token Metadata Retrieval**: Fetch comprehensive token information including creator, supply, and metadata
- **Transfer History Tracking**: Query incoming/outgoing transfers for any Solana account
- **Public Name Resolution**: Scrape Solscan to resolve account public names (e.g., "Pump.fun: Raydium Migration")
- **Recursive Tree Building**: Build transfer history trees up to 5 levels deep
- **Smart Termination**: Stop crawling when known endpoints (Raydium Migration) are reached

## Installation

```bash
# Clone the repository
git clone https://github.com/your-username/bot-solana-wallet-tracker.git
cd bot-solana-wallet-tracker

# Install dependencies
pnpm install
```

## Usage

### Basic Usage

```bash
# Run the crawler
pnpm start

# Development mode with hot reload
pnpm dev
```

### Configuration

Edit `constants.ts` to configure:

```typescript
// Target token contract address
export const TEST_CONTRACT_ADDRESS = "FLJYGHpCCcfHSeSd2peb5SMajNWaCsRnhpump";

// Termination condition
export const RADIUM_MIGRATION_PUBLIC_NAME = "Pump.fun: Raydium Migration";
```

### Output Example

```json
[
  {
    "address": "SenderAddress1",
    "name": "PublicName1",
    "children": [
      {
        "address": "SenderAddress2",
        "children": [
          {
            "address": "SenderAddress3",
            "name": "Pump.fun: Raydium Migration"
          }
        ]
      }
    ]
  }
]
```

## Architecture

```
bot-solana-wallet-tracker/
├── index.ts              # Main entry point & recursive tree builder
├── constants.ts          # Configuration constants
├── solscan/
│   ├── index.ts          # Module exports
│   ├── methods.ts        # Solscan API methods (getTokenMeta, getAccountTransfer)
│   ├── crawling.ts       # Puppeteer-based web scraper (getAccountPublicName)
│   └── types.ts          # TypeScript type definitions
└── index.test.ts         # Test suite
```

## How It Works

1. **Token Meta Query**: Retrieves token metadata to identify the creator account
2. **Transfer History Query**: Fetches transfer records from the creator account
3. **Recursive Exploration**:
   - For each sender address, calls `buildHistory()` recursively (max depth: 5)
   - If an account has a public name, stops exploring its children
   - If the public name is `Pump.fun: Raydium Migration`, terminates at root level
4. **Result Output**: Outputs the complete History Tree as JSON

## API Reference

### `getTokenMeta(address: string)`
Fetches token metadata from Solscan Pro API.

### `getAccountTransfer(address: string)`
Retrieves incoming SOL transfers for an account.

### `Crawler.getAccountPublicName(address: string)`
Scrapes Solscan web page to get the public name of an account.

## Known Issues & Solutions

### 1. Crawler Detection (30s Timeout)

Solscan may detect and block automated crawling, resulting in timeout errors.

**Solution**: Implement IP rotation or proxy servers to distribute requests.

### 2. Solscan API Limitations

- Daily/Monthly request limits
- Rate limiting
- Maximum 50 transfers per request
- No public name field in API response

**Solution**: Use direct Solana RPC calls for more granular control:

```typescript
import { Connection, PublicKey } from '@solana/web3.js';

const connection = new Connection('https://api.mainnet-beta.solana.com');
const address = new PublicKey('WALLET_ADDRESS');

async function fetchTransactions() {
  const signatures = await connection.getSignaturesForAddress(address);
  for (const sigInfo of signatures) {
    const tx = await connection.getTransaction(sigInfo.signature);
    console.log(tx);
  }
}
```

## Testing

```bash
# Run tests
pnpm test

# Run tests with coverage
pnpm test:cov
```

## Dependencies

- **@solana/web3.js**: Solana blockchain interaction
- **axios**: HTTP client for API requests
- **puppeteer**: Headless browser for web scraping

## License

MIT
