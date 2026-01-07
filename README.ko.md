# Solana 지갑 추적기

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Solana](https://img.shields.io/badge/Solana-Web3.js-purple.svg)](https://solana.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Solscan API와 웹 스크래핑을 사용하여 계층적 전송 트리를 구축하는 Solana 블록체인용 재귀적 트랜잭션 히스토리 크롤러입니다.

**[English](./README.md) | [中文](./README.zh-CN.md) | [日本語](./README.ja.md)**

## 개요

이 도구는 Solana 계정의 전송 내역을 재귀적으로 탐색하여 계층적 "히스토리 트리"를 구축합니다. 다음을 결합합니다:
- **Solscan Pro API**: 토큰 메타데이터 및 전송 기록 조회
- **Puppeteer 웹 스크래핑**: 공개 이름 해석 (API에서 제공하지 않음)

`Pump.fun: Raydium Migration` 공개 이름을 만나면 탐색을 중단하여, 토큰 생성 및 마이그레이션 패턴 추적에 적합합니다.

## 주요 기능

- **토큰 메타데이터 조회**: 생성자, 공급량, 메타데이터를 포함한 종합적인 토큰 정보 조회
- **전송 내역 추적**: 모든 Solana 계정의 입출금 전송 조회
- **공개 이름 해석**: Solscan 스크래핑을 통한 계정 공개 이름 해석 (예: "Pump.fun: Raydium Migration")
- **재귀적 트리 구축**: 최대 5단계 깊이의 전송 히스토리 트리 구축
- **스마트 종료**: 알려진 종착점 (Raydium Migration) 도달 시 크롤링 중단

## 설치

```bash
# 저장소 클론
git clone https://github.com/your-username/bot-solana-wallet-tracker.git
cd bot-solana-wallet-tracker

# 의존성 설치
pnpm install
```

## 사용법

### 기본 사용법

```bash
# 크롤러 실행
pnpm start

# 핫 리로드 개발 모드
pnpm dev
```

### 설정

`constants.ts`를 편집하여 설정:

```typescript
// 대상 토큰 컨트랙트 주소
export const TEST_CONTRACT_ADDRESS = "FLJYGHpCCcfHSeSd2peb5SMajNWaCsRnhpump";

// 종료 조건
export const RADIUM_MIGRATION_PUBLIC_NAME = "Pump.fun: Raydium Migration";
```

### 출력 예시

```json
[
  {
    "address": "발신자주소1",
    "name": "공개이름1",
    "children": [
      {
        "address": "발신자주소2",
        "children": [
          {
            "address": "발신자주소3",
            "name": "Pump.fun: Raydium Migration"
          }
        ]
      }
    ]
  }
]
```

## 아키텍처

```
bot-solana-wallet-tracker/
├── index.ts              # 메인 진입점 & 재귀 트리 빌더
├── constants.ts          # 설정 상수
├── solscan/
│   ├── index.ts          # 모듈 내보내기
│   ├── methods.ts        # Solscan API 메서드 (getTokenMeta, getAccountTransfer)
│   ├── crawling.ts       # Puppeteer 기반 웹 스크레이퍼 (getAccountPublicName)
│   └── types.ts          # TypeScript 타입 정의
└── index.test.ts         # 테스트 스위트
```

## 동작 방식

1. **토큰 메타 조회**: 토큰 메타데이터를 조회하여 생성자 계정 식별
2. **전송 내역 조회**: 생성자 계정에서 전송 기록 조회
3. **재귀적 탐색**:
   - 각 발신자 주소에 대해 `buildHistory()` 재귀 호출 (최대 깊이: 5)
   - 계정에 공개 이름이 있으면 하위 탐색 중단
   - 공개 이름이 `Pump.fun: Raydium Migration`이면 루트 레벨에서 종료
4. **결과 출력**: 완성된 히스토리 트리를 JSON 형식으로 출력

## API 레퍼런스

### `getTokenMeta(address: string)`
Solscan Pro API에서 토큰 메타데이터를 조회합니다.

### `getAccountTransfer(address: string)`
계정의 SOL 입금 전송을 조회합니다.

### `Crawler.getAccountPublicName(address: string)`
Solscan 웹 페이지를 스크래핑하여 계정의 공개 이름을 조회합니다.

## 알려진 문제 및 해결 방안

### 1. 크롤러 감지 (30초 타임아웃)

Solscan이 자동화된 크롤링을 감지하고 차단하여 타임아웃 오류가 발생할 수 있습니다.

**해결 방안**: IP 로테이션 또는 프록시 서버를 구현하여 요청을 분산합니다.

### 2. Solscan API 제한

- 일일/월간 요청 제한
- Rate Limit 존재
- 요청당 최대 50개 전송 기록
- API 응답에 공개 이름 필드 없음

**해결 방안**: 직접 Solana RPC 호출을 사용하여 더 세밀한 제어 가능:

```typescript
import { Connection, PublicKey } from '@solana/web3.js';

const connection = new Connection('https://api.mainnet-beta.solana.com');
const address = new PublicKey('지갑주소');

async function fetchTransactions() {
  const signatures = await connection.getSignaturesForAddress(address);
  for (const sigInfo of signatures) {
    const tx = await connection.getTransaction(sigInfo.signature);
    console.log(tx);
  }
}
```

## 테스트

```bash
# 테스트 실행
pnpm test

# 커버리지 포함 테스트 실행
pnpm test:cov
```

## 의존성

- **@solana/web3.js**: Solana 블록체인 연동
- **axios**: API 요청용 HTTP 클라이언트
- **puppeteer**: 웹 스크래핑용 헤드리스 브라우저

## 라이선스

MIT
