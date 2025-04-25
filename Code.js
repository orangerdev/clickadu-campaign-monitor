function clickAduGetCampaigns() {
	const clickaduCampaign = new ClickAduCampaigns();

	clickaduCampaign.getCampaigns();
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
