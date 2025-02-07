import axios from "axios";
import puppeteer, { type Browser, type Page } from "puppeteer";
import { SOLSACN_CRAWL_BASEURL } from "../constants";

export class Crawler {
	private browser: Browser | null = null;
	private page: Page | null = null;

	public async init() {
		this.browser = await puppeteer.launch({ headless: true });
		this.page = await this.browser.newPage();
	}

	public async getAccountPublicName(address: string) {
		if (!this.page || !this.browser) {
			throw new Error("ERROR: CRAWLER CLASS IS NOT INITIALIZED");
		}

		try {
			await this.page.goto(`${SOLSACN_CRAWL_BASEURL}/account/${address}`);

			const publicNameLabelSelector = await this.page.waitForSelector(
				"::-p-xpath(/html/body/div/div[1]/div[3]/div[1]/div[2]/div/div[1]/div[2]/div/div[2]/div[1]/div[1]/div)",
			);

			const publicNameLabel = await publicNameLabelSelector?.evaluate(
				(el) => el.textContent,
			);

			if (!publicNameLabel || publicNameLabel !== "Public name") {
				return null;
			}

			const publicNameValueSelector = await this.page.waitForSelector(
				"::-p-xpath(/html/body/div/div[1]/div[3]/div[1]/div[2]/div/div[1]/div[2]/div/div[2]/div[1]/div[2]/div/div)",
			);

			const publicNameValue = await publicNameValueSelector?.evaluate(
				(el) => el.textContent,
			);

			return publicNameValue;
		} catch (error) {
			console.log(error);
		}
	}
}
