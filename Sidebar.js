/**
 * Gets campaign options from CAMPAIGN sheet for dropdown
 * @returns {Array} Array of campaign objects with id, name, and label
 */
function getCampaignOptions() {
	try {
		const campaignSheet = SHEET_CAMPAIGN;

		if (!campaignSheet) {
			console.warn("CAMPAIGN sheet not found");
			return [];
		}

		// Get the last row with data
		const lastRow = campaignSheet.getLastRow();

		if (lastRow < 2) {
			console.warn(
				"No data available in CAMPAIGN sheet (header only or empty)",
			);
			return [];
		}

		// Get data from A2:B (campaign ID and name)
		const range = campaignSheet.getRange(2, 1, lastRow - 1, 2);
		const values = range.getValues();

		// Filter out empty rows and create campaign options
		const campaigns = values
			.filter((row) => {
				// Check if both columns have valid data
				const id = row[0];
				const name = row[1];
				return (
					id !== null &&
					id !== undefined &&
					id !== "" &&
					name !== null &&
					name !== undefined &&
					name !== ""
				);
			})
			.map((row) => {
				const id = row[0].toString().trim();
				const name = row[1].toString().trim();
				return {
					id: id,
					name: name,
					label: `${id} - ${name}`,
				};
			});

		console.log(`Found ${campaigns.length} valid campaigns`);
		return campaigns;
	} catch (error) {
		console.error("Error getting campaign options:", error);
		throw new Error("Failed to load campaigns: " + error.message);
	}
}

/**
 * Refreshes the campaign options by calling getCampaignOptions
 * This function can be called from the client-side to reload campaign data
 * @returns {Array} Updated array of campaign objects
 */
function refreshCampaignOptions() {
	return getCampaignOptions();
}

/**
 * Shows the sidebar in Google Sheets
 */
function showSidebar() {
	const html = HtmlService.createTemplateFromFile("sidebar");

	// Get campaign options and pass to template
	html.campaignOptions = getCampaignOptions();

	const htmlOutput = html.evaluate().setTitle("Zone Monitor").setWidth(300);

	SpreadsheetApp.getUi().showSidebar(htmlOutput);
}

/**
 * Updates the active sheet with campaign data from the sidebar form
 * @param {string} campaignId - The campaign ID entered in the form
 * @param {string} startDate - The start date in YYYY-MM-DD format
 * @param {string} endDate - The end date in YYYY-MM-DD format
 */
function updateCampaignData(campaignId, startDate, endDate) {
	try {
		// Get the active sheet
		const activeSheet = SpreadsheetApp.getActiveSheet();

		// Validate inputs
		if (!campaignId || !startDate || !endDate) {
			throw new Error("All fields are required");
		}

		// Validate date format (YYYY-MM-DD)
		const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
		if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
			throw new Error("Invalid date format. Please use YYYY-MM-DD format");
		}

		// Validate that start date is not after end date
		if (new Date(startDate) > new Date(endDate)) {
			throw new Error("Start date cannot be after end date");
		}

		// Update the cells as specified
		// A1 = Campaign ID
		activeSheet.getRange("A1").setValue(campaignId);

		// B1 = Start Date
		activeSheet.getRange("A2").setValue(startDate);

		// B2 = End Date
		activeSheet.getRange("B2").setValue(endDate);

		// Log the action
		Logger.log(
			`Campaign data updated: ID=${campaignId}, Start=${startDate}, End=${endDate}`,
		);

		return {
			success: true,
			message: "Data successfully updated",
		};
	} catch (error) {
		console.error("Error updating campaign data:", error);
		throw new Error("Failed to update data: " + error.message);
	}
}

/**
 * Creates a menu item to open the sidebar
 * This function should be called when the spreadsheet opens
 */
function onOpen() {
	const ui = SpreadsheetApp.getUi();
	ui.createMenu("Campaign Monitor")
		.addItem("Open Sidebar", "showSidebar")
		.addToUi();
}
