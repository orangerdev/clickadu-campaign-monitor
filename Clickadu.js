class ClickAduCampaigns {
	constructor(sheetTarget = SHEET_CAMPAIGN) {
		this.url = "https://adv.clickadu.com/api/v1.0/";
		this.sheetTarget = sheetTarget;
	}

	/**
	 * Send request data to clickadu
	 * @param object params
	 */
	sendGetRequest(page, params) {
		let url = this.url + page;

		if (params instanceof Object) {
			url += "?";
			const Aparams = [];

			Object.keys(params).forEach((key) => {
				const value = params[key];
				if (value instanceof Array) {
					value.forEach((_v) => {
						Aparams.push(`${key}[]=${_v}`);
					});
				} else {
					if (value) {
						Aparams.push(`${key}=${value}`);
					}
				}
			});

			url = url + Aparams.join("&");
		}

		const response = UrlFetchApp.fetch(url, {
			headers: {
				Authorization: `Bearer ${CLICKADU_TOKEN}`,
				Referer: "https://adv.clickadu.com/dashboard/",
			},
			muteHttpExceptions: true,
		});

		return JSON.parse(response.getContentText());
	}

	/**
	 * Send post data to clickadu
	 */
	sendPostRequest(page, params) {
		let url = this.url + page;

		const options = {
			headers: {
				Authorization: `Bearer ${CLICKADU_TOKEN}`,
				Referer: "https://adv.clickadu.com/dashboard/",
			},
			contentType: "application/json",
			method: "post",
			payload: JSON.stringify(params),
			muteHttpExceptions: true,
		};

		const response = UrlFetchApp.fetch(url, options);

		return JSON.parse(response.getContentText());
	}

	/**
	 * Send put data to clickadu
	 */
	sendPutRequest(page, params) {
		let url = this.url + page;

		Logger.log({ url });

		const options = {
			headers: {
				Authorization: `Bearer ${CLICKADU_TOKEN}`,
				Referer: "https://adv.clickadu.com/campaigns",
			},
			contentType: "application/json",
			method: "put",
			payload: JSON.stringify(params),
			muteHttpExceptions: true,
		};

		const response = UrlFetchApp.fetch(url, options);

		return JSON.parse(response.getContentText());
	}

	getCampaignStatus(status) {
		switch (status) {
			case 6:
				return "working";
			case 7:
				return "paused";
			case 8:
				return "stopped";
			case 9:
				return "completed";
		}
	}

	clearCampaigns() {
		if (this.sheetTarget.getLastRow() === 0) {
			Logger.log("No data available to clear.");
			return;
		}

		const startCell = this.sheetTarget.getRange("A2:G");

		const startRow = startCell.getRow();
		const startColumn = startCell.getColumn();

		const lastRow = this.sheetTarget.getLastRow();
		const lastColumn = this.sheetTarget.getLastColumn() + 1;

		if (lastRow < startRow || lastColumn < startColumn) {
			Logger.log("No data available to clear.");
			return;
		}

		const range = this.sheetTarget.getRange(
			startRow,
			startColumn,
			lastRow - startRow + 1,
			lastColumn - startColumn + 1,
		);

		range.clearContent();
	}

	/**
	 * Get all campaigns data
	 */
	getCampaigns(minDate, maxDate) {
		this.clearCampaigns();

		const strMinDate =
			minDate.getFullYear() +
			"-" +
			addLeadingZero(minDate.getMonth() + 1) +
			"-" +
			addLeadingZero(minDate.getDate());
		const strMaxDate =
			maxDate.getFullYear() +
			"-" +
			addLeadingZero(maxDate.getMonth() + 1) +
			"-" +
			addLeadingZero(maxDate.getDate());
		const paramMinDate = minDate.getFullYear() + ",%0201,%0201";

		let runningCampaigns = 0;

		for (let thePage = 1; thePage <= TOTAL_PAGES; thePage++) {
			const response = this.sendGetRequest("client/campaigns/", {
				page: thePage,
				dateFrom: strMinDate,
				dateTill: strMaxDate,
				dateMin: paramMinDate,
				orderBy: CAMPAIGN_ORDERBY,
				orderDest: CAMPAIGN_ORDER,
				isArchived: CAMPAIGN_IS_ARCHIVED,
				isEasyListBanned: 0,
				perPage: 100,
				priceModel: 0,
				addFormat: 0,
				totalPages: 10,
				refresh: 0,
			});

			if (response?.error && response.error.code === 1.0) {
				writeLog(response.error.message);
				return;
			}

			if (response?.errors) {
				Logger.log({
					page: thePage,
					dateFrom: strMinDate,
					dateTill: strMaxDate,
					dateMin: paramMinDate,
					orderBy: CAMPAIGN_ORDERBY,
					orderDest: CAMPAIGN_ORDER,
					isArchived: CAMPAIGN_IS_ARCHIVED,
					isEasyListBanned: 0,
					perPage: 100,
					priceModel: 0,
					addFormat: 0,
					totalPages: 10,
					refresh: 0,
				});
			}

			if (
				!response.result ||
				!response.result.items ||
				response.result.items.length === 0
			) {
				writeLog("No result at all. Respond: ");
				return;
			}

			response.result.items.forEach((campaign) => {
				runningCampaigns++;

				let should = "running";
				let max = MAX_CPA;

				if (
					!campaign.name.includes("STOP") &&
					!campaign.name.includes("REST")
				) {
					let findMax = findCampaignParameter(campaign.name, "MAX");

					if (findMax) max = findMax;

					let conversion = parseInt(campaign.conversions ?? 0),
						spent = parseFloat(campaign.spent ?? 0),
						cpa = parseFloat(campaign.cpa ?? 0);

					if (conversion === 0) {
						cpa = spent;

						Logger.log({ conversion, cpa, spent });
					}

					Logger.log({
						id: campaign.id,
						name: campaign.name,
						rate: parseFloat(campaign.rate ?? 0),
						spent,
						cpm: parseFloat(campaign.currentCpm ?? 0),
						cpa,
						conversion,
						status: this.getCampaignStatus(campaign.status),
					});

					const nextRow = this.sheetTarget.getLastRow() + 1;

					this.sheetTarget
						.getRange(nextRow, 1, 1, 9)
						.setValues([
							[
								campaign.id,
								campaign.name,
								parseInt(campaign.impressions ?? 0),
								parseFloat(campaign.rate ?? 0),
								spent,
								conversion,
								cpa,
								this.getCampaignStatus(campaign.status),
								max,
							],
						]);
				}
			});
		}

		Logger.log(`Total running campaigns: ${runningCampaigns}`);
	}

	stopCampaigns() {
		let campaigns = [];

		const theLastRow = SHEET_STOPCAMPAIGN.getLastRow();
		const theValues = SHEET_STOPCAMPAIGN.getRange(
			"A1:A" + theLastRow,
		).getValues();

		if (theValues.length == 0) return;

		if (theValues[0].length == 0) return;

		if (theValues[0][0] == "#N/A") return;

		campaigns = theValues.map((dvalue) => {
			return dvalue[0];
		});

		const response = this.sendPutRequest("client/campaigns/stop/", {
			campaignIds: campaigns,
		});

		Logger.log({ response });

		if (response.result === "success") {
			writeLog(`Stop campaigns : ${campaigns.join(", ")}`);
		} else if (response?.error?.message) {
			writeLog(
				`Cant stop campaigns : ${campaigns.join(", ")} | Reason: ${
					response.error.message
				}`,
			);
		}
	}

	rerunCampaigns() {
		let campaigns = [];

		if (ENABLE_AUTOMATION !== "y") {
			writeLog("Rerun disabled");
			return false;
		}

		const theLastRow = SHEET_RERUNCAMPAIGN.getLastRow();
		const theValues = SHEET_RERUNCAMPAIGN.getRange(
			"A1:A" + theLastRow,
		).getValues();

		if (theValues.length == 0) return;

		if (theValues[0].length == 0) return;

		if (theValues[0][0] == "#N/A") return;

		campaigns = theValues.map((dvalue) => {
			return dvalue[0];
		});

		const response = this.sendPutRequest("client/campaigns/start/", {
			campaignIds: campaigns,
		});

		Logger.log({ response, campaigns, theValues });

		if (response.result === "success") {
			writeLog(`Start campaigns : ${campaigns.join(", ")}`);
		} else if (response?.error?.message) {
			writeLog(
				`Cant start campaigns : ${campaigns.join(", ")} | Reason: ${
					response.error.message
				}`,
			);
		}
	}
}
