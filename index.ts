import {
	RADIUM_MIGRATION_PUBLIC_NAME,
	TEST_CONTRACT_ADDRESS,
} from "./constants";
import { Crawler, getAccountTransfer, getTokenMeta } from "./solscan";

type History = {
	name?: string;
	address: string;
	children?: History[];
};

const HISTOROIES: History[] = [];

// 재귀적으로 History 트리를 생성하는 함수
async function buildHistory(
	crawler: Crawler,
	account: string,
	depth = 0,
): Promise<History> {
	const history: History = { address: account };

	// 최대 재귀 깊이 제한
	if (depth >= 5) return history;

	// 현재 계정의 공개 이름을 조회
	const publicName = await crawler.getAccountPublicName(account);
	console.log(`[${depth}] ${account} -> ${publicName}`);

	if (publicName) {
		history.name = publicName;
		// 공개 이름이 있으면 하위 탐색은 하지 않음.
		// (즉, children 필드는 기록하지 않음)
		return history;
	}

	// 공개 이름이 없으면, 해당 계정의 전송 내역을 조회하여 송신자 목록을 추출
	const transferResponse = await getAccountTransfer(account);

	if (
		transferResponse?.success &&
		transferResponse.data &&
		transferResponse.data.length > 0
	) {
		const senders = [
			...new Set(transferResponse.data.map((t) => t.from_address)),
		];
		const children: History[] = [];
		for (const sender of senders) {
			const childHistory = await buildHistory(crawler, sender, depth + 1);
			children.push(childHistory);

			if (childHistory.name === RADIUM_MIGRATION_PUBLIC_NAME) {
				break;
			}
		}
		if (children.length > 0) {
			history.children = children;
		}
	}

	return history;
}

export async function main() {
	const crawler = new Crawler();
	await crawler.init();

	const meta = await getTokenMeta(TEST_CONTRACT_ADDRESS);
	if (!meta) {
		throw new Error(`ERROR: GET TOKEN META FAILED, ${TEST_CONTRACT_ADDRESS}`);
	}
	const {
		data: { creator },
	} = meta;

	// creator 계정의 전송 내역을 조회
	const transferResponse = await getAccountTransfer(creator);
	if (
		!transferResponse?.success ||
		!transferResponse.data ||
		transferResponse.data.length === 0
	) {
		throw new Error(`ERROR: GET ACCOUNT TRANSFER FAILED, ${creator}`);
	}

	// creator의 전송 내역에서 고유한 송신자 주소 목록 생성
	const fromAccounts = [
		...new Set(transferResponse.data.map((transfer) => transfer.from_address)),
	];

	for (const account of fromAccounts) {
		const historyTree = await buildHistory(crawler, account);
		HISTOROIES.push(historyTree);
		// 루트 레벨에서 공개 이름이 RADIUM_MIGRATION_PUBLIC_NAME이면 중단
		if (historyTree.name === RADIUM_MIGRATION_PUBLIC_NAME) {
			break;
		}
	}

	process.exit(0);
}

main()
	.then(() => {
		console.log(JSON.stringify(HISTOROIES, null, 2));
	})
	.catch((error) => {
		console.log(JSON.stringify(HISTOROIES, null, 2));
		console.error(error);
		process.exit(1);
	});
