const SHEET = SpreadsheetApp.getActiveSpreadsheet();
const SHEET_CONFIG = SHEET.getSheetByName("CONFIG");
const SHEET_CAMPAIGN = SHEET.getSheetByName("CAMPAIGN");
const SHEET_CAMPAIGN_YESTERDAY = SHEET.getSheetByName("YESTERDAY");
const SHEET_CAMPAIGN_LAST_3DAYS = SHEET.getSheetByName("LAST3");
const SHEET_CAMPAIGN_LAST_7DAYS = SHEET.getSheetByName("LAST7");
const SHEET_CAMPAIGN_LAST_30DAYS = SHEET.getSheetByName("LAST30");
const SHEET_CAMPAIGN_THIS_MONTH = SHEET.getSheetByName("MONTH");
const SHEET_CAMPAIGN_LAST_MONTH = SHEET.getSheetByName("LASTMONTH");
const SHEET_STOPCAMPAIGN = SHEET.getSheetByName("STOPCAMPAIGN");
const SHEET_RERUNCAMPAIGN = SHEET.getSheetByName("RERUNCAMPAIGN");
const SHEET_STOP_ZONES = SHEET.getSheetByName("STOPZONES");
const SHEET_LOG = SHEET.getSheetByName("LOG");

const SHEET_CELL_DATE_UPDATE = "O1";

const ENABLE_AUTOMATION = SHEET_CONFIG.getRange("B1").getValue();
const CLICKADU_TOKEN = SHEET_CONFIG.getRange("B2").getValue();
const CAMPAIGN_MIN_TIME = SHEET_CONFIG.getRange("B3").getValue();
const CAMPAIGN_MAX_TIME = SHEET_CONFIG.getRange("B4").getValue();
const CAMPAIGN_ORDERBY = SHEET_CONFIG.getRange("B5").getValue();
const CAMPAIGN_ORDER = SHEET_CONFIG.getRange("B6").getValue();
const CAMPAIGN_IS_ARCHIVED = SHEET_CONFIG.getRange("B7").getValue();
const TOTAL_PAGES = parseInt(SHEET_CONFIG.getRange("B8").getValue());
const MAX_CPA = SHEET_CONFIG.getRange("B9").getValue();
const AUTOENABLE_CAMPAIGN = SHEET_CONFIG.getRange("B10").getValue();

const CURRENT_DATETIME = Utilities.formatDate(
	new Date(),
	"GMT+7",
	"MM/dd/yyyy HH:mm:ss",
);
