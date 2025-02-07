import axios from "axios";
import { SOLSCAN_API_BASEURL, SOLSCAN_API_KEY } from "../constants";
import type { GetAccountTransferResponse, GetTokenMetaResponse } from "./types";

export const instance = axios.create({
	baseURL: SOLSCAN_API_BASEURL,
	headers: {
		"Content-Type": "application/json",
		Accept: "application/json",
		token: SOLSCAN_API_KEY,
	},
});

export async function getTokenMeta(address: string) {
	try {
		const response = await instance.get<GetTokenMetaResponse>(
			`/token/meta?address=${address}`,
		);

		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			console.log(error.response?.data);
		} else {
			console.log(error);
		}
	}
}

export async function getAccountTransfer(address: string) {
	try {
		const firstResponse = await instance.get<GetAccountTransferResponse>(
			`/account/transfer?address=${address}&page=1&page_size=100&flow=in&sort_order=asc&token=So11111111111111111111111111111111111111111`,
		);

		return firstResponse.data;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			console.log(error.response?.data);
		} else {
			console.log(error);
		}
	}
}
