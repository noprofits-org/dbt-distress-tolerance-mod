// DBT Distress Tolerance Skills Tracker
// Main App Script

// Global variables
const SPREADSHEET_ID = '1pitmKWr-EuZBK9_A7U9bpf7Kdy8TGrzoScvUhbV6jNw'; // Enter your Google Sheet ID here
const SHEET_NAME_USER_DATA = 'UserData';
const SHEET_NAME_SKILLS_LOG = 'SkillsLog';

/**
 * Creates the menu items for the spreadsheet.
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('DBT Skills Tracker')
    .addItem('Open Dashboard', 'openDashboard')
    .addItem('Log New Skills Practice', 'openLogForm')
    .addItem('View Reports', 'openReports')
    .addToUi();
}

/**
 * Opens the main dashboard web app.
 */
function openDashboard() {
  const html = HtmlService.createHtmlOutputFromFile('Dashboard')
    .setWidth(800)
    .setHeight(600);
  SpreadsheetApp.getUi().showModalDialog(html, 'DBT Distress Tolerance Skills Dashboard');
}

/**
 * Opens the form to log new skills practice.
 */
function openLogForm() {
  const html = HtmlService.createHtmlOutputFromFile('LogForm')
    .setWidth(600)
    .setHeight(700);
  SpreadsheetApp.getUi().showModalDialog(html, 'Log Skills Practice');
}

/**
 * Opens the reports page.
 */
function openReports() {
  const html = HtmlService.createHtmlOutputFromFile('Reports')
    .setWidth(800)
    .setHeight(600);
  SpreadsheetApp.getUi().showModalDialog(html, 'Skills Practice Reports');
}

/**
 * Gets all skill logs for the user.
 */
function getSkillLogs() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME_SKILLS_LOG);
  const data = sheet.getDataRange().getValues();

  // Remove header row
  data.shift();

  return data;
}

/**
 * Saves a new skill practice log.
 */
function saveSkillLog(logData) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME_SKILLS_LOG);

    // Format: [timestamp, skillType, skillName, distressBefore, distressAfter, effectiveness, notes]
    const row = [
      new Date(),
      logData.skillType,
      logData.skillName,
      parseInt(logData.distressBefore, 10),
      parseInt(logData.distressAfter, 10),
      parseInt(logData.effectiveness, 10),
      logData.notes
    ];

    sheet.appendRow(row);
    return { success: true, message: 'Skill practice logged successfully!' };
  } catch (error) {
    return { success: false, message: 'Error logging skill practice: ' + error.toString() };
  }
}

/**
 * Gets data for the dashboard summary.
 */
function getDashboardData() {
  const logs = getSkillLogs();

  // Calculate summary statistics
  const totalPractices = logs.length;

  // Group practices by skill type
  const skillTypeCount = {};
  logs.forEach(log => {
    const skillType = log[1]; // skillType is in column 1
    skillTypeCount[skillType] = (skillTypeCount[skillType] || 0) + 1;
  });

  // Calculate average effectiveness by skill
  const skillEffectiveness = {};
  const skillCounts = {};

  logs.forEach(log => {
    const skillName = log[2]; // skillName is in column 2
    const effectiveness = log[5]; // effectiveness is in column 5

    if (!skillEffectiveness[skillName]) {
      skillEffectiveness[skillName] = 0;
      skillCounts[skillName] = 0;
    }

    skillEffectiveness[skillName] += effectiveness;
    skillCounts[skillName]++;
  });

  // Calculate averages
  const skillEffectivenessAvg = {};
  Object.keys(skillEffectiveness).forEach(skill => {
    skillEffectivenessAvg[skill] = skillEffectiveness[skill] / skillCounts[skill];
  });

  // Calculate average distress reduction
  let totalDistressReduction = 0;
  logs.forEach(log => {
    const distressBefore = log[3]; // distressBefore is in column 3
    const distressAfter = log[4]; // distressAfter is in column 4
    totalDistressReduction += (distressBefore - distressAfter);
  });

  const avgDistressReduction = totalPractices > 0 ? totalDistressReduction / totalPractices : 0;

  // Get recent logs (last 5)
  const recentLogs = logs.slice(-5).reverse();

  return {
    totalPractices,
    skillTypeCount,
    skillEffectivenessAvg,
    avgDistressReduction,
    recentLogs
  };
}

/**
 * Initializes the spreadsheet with necessary sheets and headers if they don't exist.
 */
function initializeSpreadsheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  // Check if UserData sheet exists, create if not
  let userDataSheet = ss.getSheetByName(SHEET_NAME_USER_DATA);
  if (!userDataSheet) {
    userDataSheet = ss.insertSheet(SHEET_NAME_USER_DATA);
    userDataSheet.appendRow(['UserID', 'Name', 'Email', 'DateJoined']);
  }

  // Check if SkillsLog sheet exists, create if not
  let skillsLogSheet = ss.getSheetByName(SHEET_NAME_SKILLS_LOG);
  if (!skillsLogSheet) {
    skillsLogSheet = ss.insertSheet(SHEET_NAME_SKILLS_LOG);
    skillsLogSheet.appendRow([
      'Timestamp',
      'SkillType',
      'SkillName',
      'DistressBefore',
      'DistressAfter',
      'Effectiveness',
      'Notes'
    ]);
  }
}

/**
 * Serves the web app.
 */
function doGet() {
  return HtmlService.createHtmlOutputFromFile('Dashboard')
    .setTitle('DBT Distress Tolerance Skills Tracker');
}

function manualInitialize() {
  initializeSpreadsheet();
}
