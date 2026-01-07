# Solana ウォレットトラッカー

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Solana](https://img.shields.io/badge/Solana-Web3.js-purple.svg)](https://solana.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Solscan API とウェブスクレイピングを使用して、階層的な転送ツリーを構築する Solana ブロックチェーン用の再帰的トランザクション履歴クローラー。

**[English](./README.md) | [中文](./README.zh-CN.md) | [한국어](./README.ko.md)**

## 概要

このツールは、Solana アカウントの転送履歴を再帰的に探索し、階層的な「履歴ツリー」を構築します。以下を組み合わせています：
- **Solscan Pro API**：トークンメタデータと転送記録の取得
- **Puppeteer ウェブスクレイピング**：パブリック名の解決（API では利用不可）

`Pump.fun: Raydium Migration` というパブリック名に遭遇すると探索を停止するため、トークンの作成とマイグレーションパターンの追跡に最適です。

## 機能

- **トークンメタデータ取得**：作成者、供給量、メタデータを含む包括的なトークン情報を取得
- **転送履歴追跡**：任意の Solana アカウントの入出金転送を照会
- **パブリック名解決**：Solscan をスクレイピングしてアカウントのパブリック名を解決（例：「Pump.fun: Raydium Migration」）
- **再帰的ツリー構築**：最大5階層の転送履歴ツリーを構築
- **スマート終了**：既知のエンドポイント（Raydium Migration）に到達したらクロールを停止

## インストール

```bash
# リポジトリをクローン
git clone https://github.com/your-username/bot-solana-wallet-tracker.git
cd bot-solana-wallet-tracker

# 依存関係をインストール
pnpm install
```

## 使用方法

### 基本的な使い方

```bash
# クローラーを実行
pnpm start

# ホットリロード付き開発モード
pnpm dev
```

### 設定

`constants.ts` を編集して設定：

```typescript
// 対象トークンコントラクトアドレス
export const TEST_CONTRACT_ADDRESS = "FLJYGHpCCcfHSeSd2peb5SMajNWaCsRnhpump";

// 終了条件
export const RADIUM_MIGRATION_PUBLIC_NAME = "Pump.fun: Raydium Migration";
```

### 出力例

```json
[
  {
    "address": "送信者アドレス1",
    "name": "パブリック名1",
    "children": [
      {
        "address": "送信者アドレス2",
        "children": [
          {
            "address": "送信者アドレス3",
            "name": "Pump.fun: Raydium Migration"
          }
        ]
      }
    ]
  }
]
```

## アーキテクチャ

```
bot-solana-wallet-tracker/
├── index.ts              # メインエントリーポイント & 再帰ツリービルダー
├── constants.ts          # 設定定数
├── solscan/
│   ├── index.ts          # モジュールエクスポート
│   ├── methods.ts        # Solscan API メソッド (getTokenMeta, getAccountTransfer)
│   ├── crawling.ts       # Puppeteer ベースのウェブスクレイパー (getAccountPublicName)
│   └── types.ts          # TypeScript 型定義
└── index.test.ts         # テストスイート
```

## 動作原理

1. **トークンメタ照会**：トークンメタデータを取得し、作成者アカウントを特定
2. **転送履歴照会**：作成者アカウントから転送記録を取得
3. **再帰的探索**：
   - 各送信者アドレスに対して `buildHistory()` を再帰的に呼び出し（最大深度：5）
   - アカウントにパブリック名がある場合、その子の探索を停止
   - パブリック名が `Pump.fun: Raydium Migration` の場合、ルートレベルで終了
4. **結果出力**：完全な履歴ツリーを JSON 形式で出力

## API リファレンス

### `getTokenMeta(address: string)`
Solscan Pro API からトークンメタデータを取得します。

### `getAccountTransfer(address: string)`
アカウントへの SOL 入金転送を取得します。

### `Crawler.getAccountPublicName(address: string)`
Solscan ウェブページをスクレイピングしてアカウントのパブリック名を取得します。

## 既知の問題と解決策

### 1. クローラー検出（30秒タイムアウト）

Solscan は自動化されたクローリングを検出してブロックする場合があり、タイムアウトエラーが発生します。

**解決策**：IP ローテーションまたはプロキシサーバーを実装してリクエストを分散します。

### 2. Solscan API の制限

- 日次/月次リクエスト制限
- レート制限
- リクエストあたり最大50件の転送
- API レスポンスにパブリック名フィールドなし

**解決策**：直接 Solana RPC コールを使用してより詳細な制御を行います：

```typescript
import { Connection, PublicKey } from '@solana/web3.js';

const connection = new Connection('https://api.mainnet-beta.solana.com');
const address = new PublicKey('ウォレットアドレス');

async function fetchTransactions() {
  const signatures = await connection.getSignaturesForAddress(address);
  for (const sigInfo of signatures) {
    const tx = await connection.getTransaction(sigInfo.signature);
    console.log(tx);
  }
}
```

## テスト

```bash
# テストを実行
pnpm test

# カバレッジ付きでテストを実行
pnpm test:cov
```

## 依存関係

- **@solana/web3.js**：Solana ブロックチェーンとの連携
- **axios**：API リクエスト用 HTTP クライアント
- **puppeteer**：ウェブスクレイピング用ヘッドレスブラウザ

## ライセンス

MIT
