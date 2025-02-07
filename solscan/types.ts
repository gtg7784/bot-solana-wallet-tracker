interface TokenMetadata {
	name: string;
	symbol: string;
	description: string;
	image: string;
	showName: boolean;
	createdOn: string;
	twitter: string;
	website: string;
}

interface TokenData {
	address: string;
	name: string;
	symbol: string;
	icon: string;
	decimals: number;
	holder: number;
	creator: string;
	create_tx: string;
	created_time: number;
	first_mint_tx: string;
	first_mint_time: number;
	metadata: TokenMetadata;
	mint_authority: null | string;
	freeze_authority: null | string;
	supply: string;
	price: number;
	market_cap: number;
}

export interface GetTokenMetaResponse {
	success: boolean;
	data: TokenData;
	metadata: Record<string, never>;
}

interface TokenInfo {
	token_address: string;
	token_name: string;
	token_symbol: string;
	token_icon: string;
}

export const TokenTransferActivity = {
	ACTIVITY_SPL_TRANSFER: "ACTIVITY_SPL_TRANSFER",
	ACTIVITY_SPL_BURN: "ACTIVITY_SPL_BURN",
	ACTIVITY_SPL_MINT: "ACTIVITY_SPL_MINT",
	ACTIVITY_SPL_CREATE_ACCOUNT: "ACTIVITY_SPL_CREATE_ACCOUNT",
} as const;

export type TokenTransferActivityType =
	(typeof TokenTransferActivity)[keyof typeof TokenTransferActivity];

interface AccountTransferMetadata {
	tokens: {
		[tokenAddress: string]: TokenInfo;
	};
}

interface AccountTransfer {
	block_id: number;
	trans_id: string;
	block_time: number;
	time: string;
	activity_type: TokenTransferActivityType;
	from_address: string;
	to_address: string;
	token_address: string;
	token_decimals: number;
	amount: number;
	flow: "in" | "out";
}

export interface GetAccountTransferResponse {
	success: boolean;
	data: AccountTransfer[];
	metadata: AccountTransferMetadata;
}
