# Solana Transaction History Crawler

이 프로젝트는 Solscan API를 활용하여 특정 토큰의 메타 정보와 관련 계정의 전송 내역을 재귀적으로 탐색하는 도구입니다.  
주요 기능은 **계정의 전송 내역을 기반으로 History 트리를 생성**하고, 특정 공개 이름(예: `RADIUM_MIGRATION_PUBLIC_NAME`)이 발견되면 탐색을 중단하는 것입니다.

## 주요 기능

- **토큰 메타 정보 조회:**  
  `getTokenMeta` 함수를 통해 특정 토큰(예: 테스트 컨트랙트 주소)의 메타 데이터를 가져옵니다.

- **계정 전송 내역 조회:**  
  `getAccountTransfer` 함수를 통해 지정한 계정의 전송(송금) 내역을 조회합니다.

- **계정 공개 이름 확인:**  
  `Crawler` 클래스의 `getAccountPublicName` 메서드를 사용해 계정의 공개 이름을 확인합니다.

- **재귀적 History 트리 생성:**  
  `buildHistory` 함수는 최대 5단계까지 재귀적으로 계정의 전송 내역을 탐색하며 History 트리를 구성합니다.  
  각 노드는 계정 주소와, 존재할 경우 공개 이름, 그리고 자식 노드(하위 전송 내역)를 포함합니다.

- **특정 공개 이름 탐색 중단:**  
  탐색 과정 중 계정의 공개 이름이 `RADIUM_MIGRATION_PUBLIC_NAME`과 일치하면 추가 탐색을 중단합니다.

## 동작 방식 예시

1. 토큰 메타 조회:
    - 지정된 토큰 주소(TEST_CONTRACT_ADDRESS)에 대해 메타 정보를 조회하고, 해당 토큰의 creator 계정을 확인합니다.

2. 전송 내역 조회:
    - creator 계정의 전송 내역을 기반으로 고유한 송신자 주소 목록을 생성합니다.

3. 재귀적 탐색:

    - 각 송신자 주소에 대해 buildHistory 함수를 호출하여, 최대 5단계까지 전송 내역을 재귀적으로 탐색하며 계정의 History 트리를 구성합니다.
    - 탐색 도중 계정의 공개 이름이 존재하면, 해당 노드의 하위 탐색은 중단됩니다.
    - 만약 계정의 공개 이름이 RADIUM_MIGRATION_PUBLIC_NAME과 일치하면, 루트 레벨에서 탐색을 종료합니다.

4. 결과 출력:

    - 최종적으로 생성된 History 트리(배열)는 콘솔에 JSON 형식으로 출력됩니다.

예시:

```json
[
  {
    "address": "0xSenderAddress1",
    "name": "PublicName1",
    "children": [
      {
        "address": "0xSenderAddress2",
        "children": [
          {
            "address": "0xSenderAddress3",
            "name": "RADIUM_MIGRATION_PUBLIC_NAME"
          }
        ]
      }
    ]
  }
]
```

## 문제점 / 해결방안

1. Solscan에서 크롤러로 인식되어 30,000ms 타임아웃 발생

    ```
    [4] B9dzDNicwA7WHgR5oeGNUTrRF5cuBTnL6kPD2xQaUu1f -> null
    [4] 3UQBB7Agp6vCvd3Pb6NMt7vMsotd5h7yXgR2wiXN1xJq -> null
    [4] 5M6cv3ERUdmsht3c4u8m3PhcchXHhNdKe6J8qj54nQzs -> null
    [4] GkhNn69CRDjHztkAbKFHomn2XxVbpnLmXs1QReAyeRqh -> null
    [4] DMj8JCb9dWJuNp9otkveqJv5YSPEw5CD7Mj4DTSVefdU -> null
    [4] HB5D29YduD71rrgNQHhfw1GiBLdNPumRZAWvMEMcE1T9 -> null
    [4] Eur53RPYYGK6jBMEoEN27MUE3jiZ4Urbq41mC18w7wu5 -> null
    [4] EmtQTCj77dLAHvptvcjkwG9cbMFVarxpFrTKRHxiwHP1 -> null
    [4] 4kLBebwanKLVh5hH6CMCwqRHqkk2XzXdSSPhfSdJLfyb -> null
    [4] E6CWb51ynG34o1Kwijmv3Sm9DcYYy1QgkYQvYgPbARyy -> null
    [4] 4k9TAaL8VTQF3ryCiv7LwwynqeGndr6NWXjZT5qXxKat -> null
    [4] CAT2whmLkodDrCtEFzQtJdtoVK7UZMNGNm4aHhcosGEL -> null
    [4] C4pQQiCpzu31mAnmqnjuMZbuExnMZ9Z1FEhRZPq82vWJ -> null
    [4] FuhoUXek9tNUbZgE7VsVCYPzN2UPPiL4mfLSCiAgWMde -> null
    [4] 854s5xYqK27AWLvuwupiZBNMgM4KgnFd8nUWCgRa7wbm -> null
    [4] PmYVUH86rtuUVYXND4DAY6S4eAqcdQWpBEiuoBrqPug -> null
    [4] 3MhyDurrDfbjkeLc3tPKn7ETyp3RdGsmUR8pw1rVwuCP -> null
    [3] FEGAtQgKYf6XrFeTvRkePWir9pegkwrg6YrgozaXhFsW -> null
    [4] 6pAzZNKeMFkWRDHRUENxs5uCArHwwNGcPonqSVVi4vS8 -> null
    [4] wafydZpGcTLk3FYEQ5Q4wwSKJXMy3EMTngxeVEXG45e -> null
    [4] BYypsHEYB4AYGPaDrgBpXByPvdYMcS8EiRSm4n8SmMgb -> null
    [4] FEGAtQgKYf6XrFeTvRkePWir9pegkwrg6YrgozaXhFsW -> null
    [4] FLiPggWYQyKVTULFWMQjAk26JfK5XRCajfyTmD5weaZ7 -> null
    TimeoutError: Waiting for selector `[[[{"name":"xpath","value":"/html/body/div/div[1]/div[3]/div[1]/div[2]/div/div[1]/div[2]/div/div[2]/div[1]/div[1]/div"}]]]` failed: Waiting failed: 30000ms exceeded
    ```

    이런식으로 잘 검색이 되다가 갑자기 타임아웃이 발생하는 경우가 있습니다.

    IP 로테이션 / 프록시 사용으로 해결할 수 있습니다.
    동일 IP에서 다수의 요청을 보내면 차단될 수 있으므로, 프록시 서버나 IP 로테이션 기법을 사용하여 요청 빈도를 분산시킵니다.

2. Solscan API의 제한

    Solscan API는 다양한 제한과 문제가 있습니다.
    1. Daily / Monthly Requests 수 제한이 있습니다.
    2. Rate Limit이 존재합니다.
    3. 요청에 원하는 답을 구하지 못합니다.
        - 예를 들어, 특정 계정의 전송 내역을 조회할 때, 최대 50개 전송 내역만 반환합니다.
        - 계정의 전체 전송 내역의 개수를 파악하지 못합니다.
        - Public Name을 조회하지 못합니다 (크롤러로 해결)
        - => 사실상 사용하는 이유가 없는거나 마찬가지입니다.
  
    해당 문제를 해결하기 위해 직접 RPC call을 사용하면 보다 세부적인 트랜잭션 데이터 접근 및 제어가 가능해집니다.

    예를 들어, getSignaturesForAddress, getConfirmedSignaturesForAddress, getTransaction 등의 RPC 메서드를 사용하여 필요한 데이터를 직접 가져옵니다.

    ```ts
    import { Connection, PublicKey } from '@solana/web3.js';

    const connection = new Connection('https://api.mainnet-beta.solana.com');
    const address = new PublicKey('대상_지갑_주소');

    async function fetchTransactions() {
      const signatures = await connection.getSignaturesForAddress(address);
      // 각 서명에 대해 getTransaction 호출하여 상세 정보 획득 가능
      for (const sigInfo of signatures) {
        const tx = await connection.getTransaction(sigInfo.signature);
        console.log(tx);
      }
    }
    fetchTransactions();
    ```

    이런식으로 직접 RPC call을 사용하면 Solscan API의 제한을 우회하고, 더 세부적인 데이터를 가져올 수 있습니다.
