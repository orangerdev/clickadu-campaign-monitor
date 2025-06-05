/**
 * Helper function to check if the current sheet is protected
 * @param {string} operation - The operation being performed (for error message)
 * @throws {Error} If the current sheet is protected
 */
function validateSheetAccess(operation = "modify") {
	const activeSheet = SpreadsheetApp.getActiveSheet();
	const activeSheetName = activeSheet.getName();

	// List of protected sheet names that should not be modified
	const protectedSheets = [
		"CONFIG",
		"CAMPAIGN",
		"YESTERDAY",
		"LAST3",
		"LAST7",
		"MONTH",
		"LASTMONTH",
		"STOPCAMPAIGN",
		"RERUNCAMPAIGN",
		"LOG",
		"STOPZONES",
	];

	// Check if current sheet is a protected sheet
	if (protectedSheets.includes(activeSheetName)) {
		throw new Error(
			`Cannot ${operation} on protected sheet "${activeSheetName}". Please create a new sheet or switch to a different sheet for zone monitoring.`,
		);
	}

	return { activeSheet, activeSheetName };
}

/**
 * Helper function to validate if the sheet has proper zone data structure
 * @param {GoogleAppsScript.Spreadsheet.Sheet} activeSheet - The sheet to validate
 * @throws {Error} If the sheet doesn't have proper zone data structure
 */
function validateZoneDataStructure(activeSheet) {
	// Get the last row with data
	const lastRow = activeSheet.getLastRow();

	// Check if there's data to format (should have at least headers at row 2 and data starting from row 3)
	if (lastRow < 3) {
		throw new Error("No zone data found. Please fetch zone data first.");
	}

	// Check if the sheet has the expected headers
	const headerRange = activeSheet.getRange("A2:E2");
	const headers = headerRange.getValues()[0];

	if (headers[0] !== "Zone" || headers[4] !== "CPA") {
		throw new Error(
			"Invalid sheet format. Please fetch zone data first to ensure proper column structure.",
		);
	}

	return { lastRow, dataRange: activeSheet.getRange(3, 1, lastRow - 2, 5) };
}

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

	const htmlOutput = html.evaluate().setTitle("Zone Monitor").setWidth(450);

	SpreadsheetApp.getUi().showSidebar(htmlOutput);
}

/**
 * Helper function to get campaign label by ID
 * @param {string} campaignId - The campaign ID to search for
 * @returns {string} Campaign label or just the ID if not found
 */
function getCampaignLabel(campaignId) {
	try {
		const campaigns = getCampaignOptions();
		const campaign = campaigns.find((c) => c.id === campaignId);
		return campaign ? campaign.label : campaignId;
	} catch (error) {
		console.warn("Error getting campaign label:", error);
		return campaignId; // Fallback to just the ID
	}
}

/**
 * Updates the active sheet with campaign data from the sidebar form
 * @param {string} campaignId - The campaign ID entered in the form
 * @param {string} startDate - The start date in YYYY-MM-DD format
 * @param {string} endDate - The end date in YYYY-MM-DD format
 */
function updateCampaignData(campaignId, startDate, endDate) {
	try {
		// Validate sheet access and get sheet info
		const { activeSheet, activeSheetName } = validateSheetAccess("update data");

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

		// Get campaign label
		const campaignLabel = getCampaignLabel(campaignId);

		// Update the cells as specified
		// A1 = Campaign ID
		activeSheet.getRange("A1").setValue(campaignId);

		// B1 = Campaign Label
		activeSheet.getRange("B1").setValue(campaignLabel);

		// C1 = Start Date
		activeSheet.getRange("F1").setValue(startDate);

		// D1 = End Date
		activeSheet.getRange("G1").setValue(endDate);

		// Set freeze panes: freeze rows 1-2 and column 1
		activeSheet.setFrozenRows(2);
		activeSheet.setFrozenColumns(1);

		// Create header at row 2
		const headerRange = activeSheet.getRange("A2:E2");
		headerRange.setValues([
			["Zone", "Impression", "Spent", "Conversion", "CPA"],
		]);

		// Make header bold
		headerRange.setFontWeight("bold");

		// Clear existing zone data (from row 3 onwards)
		const lastRow = activeSheet.getLastRow();
		if (lastRow > 2) {
			const rangeTooClear = activeSheet.getRange(3, 1, lastRow - 2, 5);
			rangeTooClear.clearContent();
		}

		// Get zones data using ClickAduCampaigns
		const clickAduCampaign = new ClickAduCampaigns();
		const zones = clickAduCampaign.getZones(campaignId, startDate, endDate);

		// Write zones data starting from row 3
		if (zones && zones.length > 0) {
			const zonesData = zones.map((zone) => [
				zone.id,
				zone.impressions,
				zone.spent,
				zone.conversions,
				zone.cpa,
			]);

			const zonesRange = activeSheet.getRange(3, 1, zones.length, 5);
			zonesRange.setValues(zonesData);
		}

		// Log the action
		Logger.log(
			`Campaign data updated on sheet "${activeSheetName}": ID=${campaignId}, Start=${startDate}, End=${endDate}, Zones count: ${
				zones ? zones.length : 0
			}`,
		);

		return {
			success: true,
			message: `Data successfully updated on sheet "${activeSheetName}" with ${
				zones ? zones.length : 0
			} zones`,
		};
	} catch (error) {
		console.error("Error updating campaign data:", error);
		throw new Error("Failed to update data: " + error.message);
	}
}

/**
 * Stops zones by reading zone IDs from STOPZONES sheet and calling excludeZones for each campaign
 */
function stopZones() {
	try {
		// Add debugging log
		console.log("Starting stopZones function");

		// Simple approach - no activeSheet validation that might cause issues
		// Get data from STOPZONES sheet directly
		if (!SHEET_STOP_ZONES) {
			throw new Error("STOPZONES sheet not found");
		}
		console.log("STOPZONES sheet found");

		const lastRow = SHEET_STOP_ZONES.getLastRow();
		console.log("Last row in STOPZONES:", lastRow);

		if (lastRow < 1) {
			throw new Error("No data found in STOPZONES sheet");
		}

		// Get all zone IDs from column A
		const zoneRange = SHEET_STOP_ZONES.getRange(1, 1, lastRow, 1);
		const zoneValues = zoneRange.getValues();
		console.log("Zone values retrieved:", zoneValues.length);

		// Filter out empty values and convert to array of zone IDs
		const zoneIds = zoneValues
			.filter((row) => row[0] && row[0] !== "" && row[0] !== "#N/A")
			.map((row) => row[0].toString().trim());

		console.log("Filtered zone IDs:", zoneIds.length);

		if (zoneIds.length === 0) {
			throw new Error("No valid zone IDs found in STOPZONES sheet");
		}

		// Get all campaigns to apply zone exclusion
		const campaigns = getCampaignOptions();
		console.log("Campaigns found:", campaigns.length);

		if (campaigns.length === 0) {
			throw new Error("No campaigns found in CAMPAIGN sheet");
		}

		const clickAduCampaign = new ClickAduCampaigns();
		let successCount = 0;
		let errorCount = 0;
		const errors = [];

		console.log("Starting zone exclusion for campaigns");

		// Apply zone exclusion to each campaign
		campaigns.forEach((campaign) => {
			try {
				console.log("Processing campaign:", campaign.id);
				clickAduCampaign.excludeZones(campaign.id, zoneIds);
				successCount++;
				writeLog(
					`Successfully excluded zones for campaign ${
						campaign.id
					}: ${zoneIds.join(", ")}`,
				);
			} catch (error) {
				errorCount++;
				const errorMsg = `Failed to exclude zones for campaign ${campaign.id}: ${error.message}`;
				errors.push(errorMsg);
				writeLog(errorMsg);
				console.error("Campaign processing error:", errorMsg);
			}
		});

		// Log summary
		const summaryMsg = `Stop Zones completed: ${successCount} campaigns successful, ${errorCount} campaigns failed. Zones excluded: ${zoneIds.join(
			", ",
		)}`;
		writeLog(summaryMsg);

		// Log the action (similar to updateCampaignData)
		Logger.log(
			`Stop Zones completed: Excluded ${zoneIds.length} zones from ${successCount}/${campaigns.length} campaigns`,
		);

		// Return result
		return {
			success: true,
			message: `Stop Zones completed successfully! Excluded ${zoneIds.length} zones from ${successCount} campaigns.`,
			details: {
				zonesCount: zoneIds.length,
				campaignsProcessed: campaigns.length,
				successCount,
				errorCount,
				zones: zoneIds,
				errors: errors,
			},
		};
	} catch (error) {
		console.error("Error in stopZones function:", error);
		console.error("Error stack:", error.stack);
		throw new Error("Failed to stop zones: " + error.message);
	}
}

/**
 * Test function for Stop Zones - simpler version for debugging
 */
function testStopZones() {
	try {
		console.log("Test function started");

		// Simple sheet access test
		const activeSheet = SpreadsheetApp.getActiveSheet();
		console.log("Active sheet:", activeSheet.getName());

		// Test STOPZONES sheet access
		if (!SHEET_STOP_ZONES) {
			throw new Error("STOPZONES sheet not found");
		}

		const lastRow = SHEET_STOP_ZONES.getLastRow();
		console.log("STOPZONES last row:", lastRow);

		return {
			success: true,
			message: "Test completed successfully",
			details: {
				activeSheet: activeSheet.getName(),
				stopZonesLastRow: lastRow,
			},
		};
	} catch (error) {
		console.error("Test error:", error);
		throw new Error("Test failed: " + error.message);
	}
}

/**
 * Creates a menu item to open the sidebar
 * This function should be called when the spreadsheet opens
 */
function onOpen() {
	const ui = SpreadsheetApp.getUi();
	ui.createMenu("ClickAdu Monitor")
		.addItem("Open Sidebar", "showSidebar")
		.addToUi();
}
