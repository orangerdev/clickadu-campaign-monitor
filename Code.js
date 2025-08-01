function updateLastUpdate(theSheet) {
	const currentDateTime = new Date();
	const formattedDateTime = Utilities.formatDate(
		currentDateTime,
		"GMT+7",
		"MM/dd/yyyy HH:mm:ss",
	);
	theSheet.getRange(SHEET_CELL_DATE_UPDATE).setValue(formattedDateTime);
}

function clickAduGetCampaigns() {
	const clickaduCampaign = new ClickAduCampaigns(SHEET_CAMPAIGN);

	const minDate = new Date(CAMPAIGN_MIN_TIME);
	const maxDate = new Date(CAMPAIGN_MAX_TIME);

	updateLastUpdate(SHEET_CAMPAIGN);

	clickaduCampaign.getCampaigns(minDate, maxDate);
}

function clickAduGetCampaignsYesterday() {
	const clickaduCampaign = new ClickAduCampaigns(SHEET_CAMPAIGN_YESTERDAY);

	// Set maxDate to 23:59:59 of yesterday
	const maxDate = new Date(CAMPAIGN_MAX_TIME);
	maxDate.setDate(maxDate.getDate() - 1);
	maxDate.setHours(23, 59, 59, 999);

	// Set minDate to 00:00:00 of yesterday
	const minDate = new Date(maxDate);
	minDate.setHours(0, 0, 0, 0);

	updateLastUpdate(SHEET_CAMPAIGN_YESTERDAY);

	clickaduCampaign.getCampaigns(minDate, maxDate);
}

function clickAduGetCampaignsLast2Days() {
	const clickaduCampaign = new ClickAduCampaigns(SHEET_CAMPAIGN_LAST_2DAYS);

	const maxDate = new Date(CAMPAIGN_MAX_TIME);

	const minDate = new Date(maxDate);
	minDate.setDate(minDate.getDate() - 2); // Mengurangi 3 hari dari maxDate

	updateLastUpdate(SHEET_CAMPAIGN_LAST_3DAYS);

	clickaduCampaign.getCampaigns(minDate, maxDate);
}

function clickAduGetCampaignsLast3Days() {
	const clickaduCampaign = new ClickAduCampaigns(SHEET_CAMPAIGN_LAST_3DAYS);

	const maxDate = new Date(CAMPAIGN_MAX_TIME);

	const minDate = new Date(maxDate);
	minDate.setDate(minDate.getDate() - 3); // Mengurangi 3 hari dari maxDate

	updateLastUpdate(SHEET_CAMPAIGN_LAST_3DAYS);

	clickaduCampaign.getCampaigns(minDate, maxDate);
}

function clickAduGetCampaignsLast7Days() {
	const clickaduCampaign = new ClickAduCampaigns(SHEET_CAMPAIGN_LAST_7DAYS);

	const maxDate = new Date(CAMPAIGN_MAX_TIME);

	const minDate = new Date(maxDate);
	minDate.setDate(minDate.getDate() - 7); // Mengurangi 7 hari dari maxDate

	updateLastUpdate(SHEET_CAMPAIGN_LAST_7DAYS);

	clickaduCampaign.getCampaigns(minDate, maxDate);
}

function clickAduGetCampaignsLast30Days() {
	const clickaduCampaign = new ClickAduCampaigns(SHEET_CAMPAIGN_LAST_30DAYS);

	const maxDate = new Date(CAMPAIGN_MAX_TIME);

	const minDate = new Date(maxDate);
	minDate.setDate(minDate.getDate() - 30); // Mengurangi 30 hari dari maxDate

	updateLastUpdate(SHEET_CAMPAIGN_LAST_30DAYS);

	clickaduCampaign.getCampaigns(minDate, maxDate);
}

function clickAduGetCampaignsLast60Days() {
	const clickaduCampaign = new ClickAduCampaigns(SHEET_CAMPAIGN_LAST_60DAYS);

	const maxDate = new Date(CAMPAIGN_MAX_TIME);

	const minDate = new Date(maxDate);
	minDate.setDate(minDate.getDate() - 60); // Mengurangi 60 hari dari maxDate

	updateLastUpdate(SHEET_CAMPAIGN_LAST_60DAYS);

	clickaduCampaign.getCampaigns(minDate, maxDate);
}

function clickAduGetCampaignsThisMonth() {
	const clickaduCampaign = new ClickAduCampaigns(SHEET_CAMPAIGN_THIS_MONTH);

	const maxDate = new Date(CAMPAIGN_MAX_TIME);

	const minDate = new Date(maxDate);
	minDate.setDate(1); // Mengatur tanggal menjadi 1 untuk mendapatkan awal bulan

	updateLastUpdate(SHEET_CAMPAIGN_THIS_MONTH);

	clickaduCampaign.getCampaigns(minDate, maxDate);
}

function clickAduGetCampaignsLastMonth() {
	const clickaduCampaign = new ClickAduCampaigns(SHEET_CAMPAIGN_LAST_MONTH);

	// Mendapatkan tanggal hari ini
	const today = new Date();

	// Mengatur maxDate ke hari terakhir bulan lalu
	const maxDate = new Date(today.getFullYear(), today.getMonth() - 1 + 1, 0); // +1 lalu -1 = bulan lalu, 0 = hari terakhir
	maxDate.setHours(23, 59, 59, 999); // Set ke akhir hari

	// Mengatur minDate ke hari pertama bulan lalu
	const minDate = new Date(today.getFullYear(), today.getMonth() - 1, 1); // Bulan lalu, tanggal 1
	minDate.setHours(0, 0, 0, 0); // Set ke awal hari

	Logger.log({ minDate, maxDate });

	updateLastUpdate(SHEET_CAMPAIGN_LAST_MONTH);

	clickaduCampaign.getCampaigns(minDate, maxDate);
}

function clickAduGetCampaignsLas2MonthsAgo() {
	const clickaduCampaign = new ClickAduCampaigns(SHEET_CAMPAIGN_LAST_2_MONTH);

	// Mendapatkan tanggal hari ini
	const today = new Date();

	// Mendapatkan tangal akhir 2 bulan yang lalu
	const maxDate = new Date(today.getFullYear(), today.getMonth() - 2 + 1, 0);
	maxDate.setHours(23, 59, 59, 999); // Set ke akhir hari

	// Mendapatkan tanggal awal 2 bulan yang lalu
	const minDate = new Date(today.getFullYear(), today.getMonth() - 2, 1);
	minDate.setHours(0, 0, 0, 0); // Set ke awal hari

	Logger.log({ minDate, maxDate });

	updateLastUpdate(SHEET_CAMPAIGN_LAST_2_MONTH);

	clickaduCampaign.getCampaigns(minDate, maxDate);
}

function clickAduStopCampaigns() {
	const clickaduCampaign = new ClickAduCampaigns();

	clickaduCampaign.stopCampaigns();
}

function clickAduRerunCampaigns() {
	const clickaduCampaign = new ClickAduCampaigns();

	clickaduCampaign.rerunCampaigns();
}

function checkAndUpdateAutomation() {
	const currentDateTime = new Date(); // Waktu saat ini
	const autoEnableDateTime = new Date(AUTOENABLE_CAMPAIGN); // Konversi AUTOENABLE_CAMPAIGN ke Date object

	if (ENABLE_AUTOMATION != "y" && currentDateTime > autoEnableDateTime) {
		SHEET_CONFIG.getRange("B1").setValue("y"); // Update nilai pada range B1 menjadi 'y'
		writeLog("Automation enabled: Updated CONFIG B1 to 'y'");
	}
}

function clickAduGetCampainZones() {
	const clickAduCampaign = new ClickAduCampaigns();

	const zones = clickAduCampaign.getZones(
		"3410554",
		"2025-06-01",
		"2025-06-04",
	);

	zones.forEach((zone) => {
		Logger.log(zone);
	});
}
