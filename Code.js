// DBT Distress Tolerance Skills Tracker
// Main App Script - Improved Version with Error Handling

// Global variables
const SPREADSHEET_ID = '1pitmKWr-EuZBK9_A7U9bpf7Kdy8TGrzoScvUhbV6jNw'; // Main spreadsheet ID
const SHEET_NAME_USER_DATA = 'UserData';
const SHEET_NAME_SKILLS_LOG = 'SkillsLog';
const SHEET_NAME_VIEWS = 'SkillGuideViews';

/**
 * Helper function to safely access the spreadsheet
 */
function getSpreadsheet() {
  try {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  } catch (error) {
    Logger.log(`Error accessing spreadsheet: ${error.toString()}`);
    throw new Error(`Could not access spreadsheet. Verify permissions and ID: ${SPREADSHEET_ID}`);
  }
}

/**
 * Helper function to safely log messages
 */
function safeLog(message, data) {
  try {
    if (data !== undefined) {
      Logger.log(message + ": " + JSON.stringify(data));
    } else {
      Logger.log(message);
    }
  } catch (error) {
    Logger.log("Error in safeLog: " + error.toString());
  }
}

/**
 * Debug function to test data retrieval
 */
function testDashboardData() {
  Logger.log("Starting testDashboardData");

  try {
    // Try to access spreadsheet
    try {
      const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
      Logger.log("Successfully accessed spreadsheet: " + ss.getName());

      // Try to get dashboard data
      const data = getDashboardData();
      Logger.log("getDashboardData returned: " + JSON.stringify(data));

      if (data === null) {
        Logger.log("ERROR: getDashboardData returned null!");
        return { error: "getDashboardData returned null!" };
      }

      return data;
    } catch (error) {
      Logger.log("Error in testDashboardData: " + error.toString());
      return { error: error.toString() };
    }
  } catch (error) {
    Logger.log("Fatal error in testDashboardData: " + error.toString());
    return { error: "Fatal error: " + error.toString() };
  }
}
/**
 * Runs when the spreadsheet is opened
 */
function onOpen() {
  try {
    const ui = SpreadsheetApp.getUi();
    ui.createMenu('DBT Skills Tracker')
      .addItem('Open Dashboard', 'openDashboard')
      .addItem('Log New Skills Practice', 'openLogForm')
      .addItem('View Reports', 'openReports')
      .addItem('Run Initialization', 'manualInitialize')
      .addToUi();
    Logger.log('Menu created successfully');
  } catch (error) {
    Logger.log('Error in onOpen: ' + error.toString());
  }
}

/**
 * Opens the dashboard dialog
 */
function openDashboard() {
  try {
    const html = HtmlService.createHtmlOutputFromFile('Dashboard')
      .setWidth(800)
      .setHeight(600)
      .setTitle('DBT Distress Tolerance Skills Dashboard');
    SpreadsheetApp.getUi().showModalDialog(html, 'DBT Distress Tolerance Skills Dashboard');
    Logger.log('Dashboard opened successfully');
  } catch (error) {
    Logger.log('Error opening dashboard: ' + error.toString());
    showError('Error opening dashboard: ' + error.message);
  }
}

/**
 * Opens the log form dialog
 */
function openLogForm() {
  try {
    const html = HtmlService.createHtmlOutputFromFile('LogForm')
      .setWidth(600)
      .setHeight(700)
      .setTitle('Log Skills Practice');
    SpreadsheetApp.getUi().showModalDialog(html, 'Log Skills Practice');
    Logger.log('Log form opened successfully');
  } catch (error) {
    Logger.log('Error opening log form: ' + error.toString());
    showError('Error opening log form: ' + error.message);
  }
}

/**
 * Opens the reports dialog
 */
function openReports() {
  try {
    const html = HtmlService.createHtmlOutputFromFile('Reports')
      .setWidth(800)
      .setHeight(600)
      .setTitle('Skills Practice Reports');
    SpreadsheetApp.getUi().showModalDialog(html, 'Skills Practice Reports');
    Logger.log('Reports opened successfully');
  } catch (error) {
    Logger.log('Error opening reports: ' + error.toString());
    showError('Error opening reports: ' + error.message);
  }
}

/**
 * Shows an error message dialog
 */
function showError(message) {
  try {
    const ui = SpreadsheetApp.getUi();
    ui.alert('Error', message, ui.ButtonSet.OK);
  } catch (error) {
    Logger.log('Error showing error dialog: ' + error.toString());
  }
}

/**
 * Gets all skill logs from the spreadsheet
 */
function getSkillLogs() {
  try {
    // Ensure spreadsheet is initialized
    initializeSpreadsheet();

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME_SKILLS_LOG);

    if (!sheet) {
      Logger.log('Skills log sheet not found after initialization - critical error');
      return [];
    }

    const dataRange = sheet.getDataRange();
    if (dataRange.getNumRows() <= 1) {
      Logger.log('No skill logs found (only header row)');
      return [];
    }

    const data = dataRange.getValues();
    data.shift(); // Remove header row
    return data;
  } catch (error) {
    Logger.log('Error getting skill logs: ' + error.toString());
    return [];
  }
}

/**
 * Saves a skill log entry to the spreadsheet
 */
function saveSkillLog(logData) {
  try {
    // Validate input data before proceeding
    if (!logData || typeof logData !== 'object') {
      return {
        success: false,
        message: 'Invalid log data provided. Please try again.'
      };
    }

    // Ensure spreadsheet is initialized
    initializeSpreadsheet();

    // Get spreadsheet and sheet
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME_SKILLS_LOG);

    if (!sheet) {
      return {
        success: false,
        message: 'Could not find or create skills log sheet. Please check permissions.'
      };
    }

    // Validate and sanitize data
    const distressBefore = validateNumeric(logData.distressBefore, 0, 0, 100);
    const distressAfter = validateNumeric(logData.distressAfter, 0, 0, 100);
    const effectiveness = validateNumeric(logData.effectiveness, 3, 1, 5);
    const skillType = sanitizeString(logData.skillType);
    const skillName = sanitizeString(logData.skillName);
    const notes = sanitizeString(logData.notes);

    // Create the row
    const row = [
      new Date(),                  // Timestamp
      skillType,                   // SkillType
      skillName,                   // SkillName
      distressBefore,              // DistressBefore
      distressAfter,               // DistressAfter
      effectiveness,               // Effectiveness
      '',                          // TimeSpent
      '',                          // QuizScore
      notes                        // Notes
    ];

    // Append row
    sheet.appendRow(row);
    Logger.log('Skill practice logged successfully');
    return { success: true, message: 'Skill practice logged successfully!' };
  } catch (error) {
    Logger.log('Error logging skill practice: ' + error.toString());
    return { success: false, message: 'Error logging skill practice: ' + error.toString() };
  }
}

/**
 * Logs a skill practice with time spent
 */
function logSkillWithTime(logData) {
  try {
    // Validate input data before proceeding
    if (!logData || typeof logData !== 'object') {
      return {
        success: false,
        message: 'Invalid log data provided. Please try again.'
      };
    }

    // Ensure spreadsheet is initialized
    initializeSpreadsheet();

    // Get spreadsheet and sheet
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME_SKILLS_LOG);

    if (!sheet) {
      return {
        success: false,
        message: 'Could not find or create skills log sheet. Please check permissions.'
      };
    }

    // Validate and sanitize data
    const distressBefore = validateNumeric(logData.distressBefore, 0, 0, 100);
    const distressAfter = validateNumeric(logData.distressAfter, 0, 0, 100);
    const effectiveness = validateNumeric(logData.effectiveness, 3, 1, 5);
    const timeSpent = parseFloat(logData.timeSpent) || 0;
    const skillType = sanitizeString(logData.skillType);
    const skillName = sanitizeString(logData.skillName);
    const quizScore = logData.quizScore || '';
    const notes = sanitizeString(logData.notes);

    // Create the row
    const row = [
      new Date(),                  // Timestamp
      skillType,                   // SkillType
      skillName,                   // SkillName
      distressBefore,              // DistressBefore
      distressAfter,               // DistressAfter
      effectiveness,               // Effectiveness
      timeSpent,                   // TimeSpent / min
      quizScore,                   // QuizScore
      notes                        // Notes
    ];

    // Append row
    sheet.appendRow(row);
    Logger.log('Skill practice with time logged successfully');
    return { success: true, message: 'Skill practice logged successfully!' };
  } catch (error) {
    Logger.log('Error logging skill practice with time: ' + error.toString());
    return { success: false, message: 'Error logging skill practice: ' + error.toString() };
  }
}

/**
 * Gets data for the dashboard - with guaranteed output
 */
function getDashboardData() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName('SkillsLog');
    const fallbackData = {
      totalPractices: 0,
      averageEffectiveness: 0,
      averageDistressReduction: 0,
      recentLogs: []
    };
    if (!sheet || sheet.getDataRange().getNumRows() <= 1) {
      Logger.log("No data in SkillsLog sheet");
      return fallbackData;
    }
    const data = sheet.getDataRange().getValues();
    const logs = data.slice(1); // Remove header row
    fallbackData.totalPractices = logs.length;
    fallbackData.recentLogs = logs.slice(-5).reverse();
    return fallbackData;
  } catch (error) {
    Logger.log("Error in getDashboardData: " + error);
    return fallbackData;
  }
}

/**
 * Helper function to get skill guide status
 */
function getSkillGuideStatus() {
  return {
    'STOP': true,
    'TIP': true,
    'ACCEPTS': true,
    'Pros and Cons': false,
    'Self-Soothe': false,
    'IMPROVE': false,
    'Radical Acceptance': false,
    'Turning the Mind': false,
    'Willingness': false,
    'Half-Smiling': false,
    'Mindfulness of Thoughts': false
  };
}

/**
 * Checks if a file exists in the project
 */
function checkFileExists(filename) {
  try {
    // Try to get the file content, if it fails, file doesn't exist
    HtmlService.createHtmlOutputFromFile(filename);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Initializes the spreadsheet with required sheets and headers
 */
function initializeSpreadsheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheetsToCreate = [
    { name: 'SkillsLog', headers: ['Timestamp', 'SkillType', 'SkillName', 'DistressBefore', 'DistressAfter', 'Effectiveness', 'TimeSpent / min', 'QuizScore', 'Notes'] },
    { name: 'UserData', headers: ['UserId', 'Name', 'Email'] },
    { name: 'SkillGuideViews', headers: ['Timestamp', 'SkillName', 'UserId'] }
  ];

  sheetsToCreate.forEach(sheetInfo => {
    let sheet = ss.getSheetByName(sheetInfo.name);
    if (!sheet) {
      sheet = ss.insertSheet(sheetInfo.name);
      sheet.appendRow(sheetInfo.headers);
    } else {
      const existingHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      if (JSON.stringify(existingHeaders) !== JSON.stringify(sheetInfo.headers)) {
        sheet.clear();
        sheet.appendRow(sheetInfo.headers);
      }
    }
  });
}

/**
 * Compares two arrays for equality
 */
function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

/**
 * Entry point for web app
 */
function doGet() {
  return HtmlService.createHtmlOutputFromFile('Dashboard')
    .setTitle('DBT Distress Tolerance Skills Tracker');
}

/**
 * Manual initialization function for testing
 */
function manualInitialize() {
  const result = initializeSpreadsheet();
  if (result) {
    SpreadsheetApp.getUi().alert('Initialization successful!', 'The spreadsheet has been initialized with all required sheets.', SpreadsheetApp.getUi().ButtonSet.OK);
  } else {
    SpreadsheetApp.getUi().alert('Initialization failed', 'There was an error initializing the spreadsheet. Check the logs for details.', SpreadsheetApp.getUi().ButtonSet.OK);
  }
  return result;
}

/**
 * Opens a skill guide dialog
 */
function openSkillGuide(skillName) {
  try {
    Logger.log('Opening skill guide: ' + skillName);

    // Define the mapping for skill guides
    const skillGuideMap = {
      'STOP': 'STOP',
      'TIP': 'TIP',
      'Pros and Cons': 'ProsAndCons',
      'ACCEPTS': 'ACCEPTS',
      'Self-Soothe': 'SelfSooth',
      'IMPROVE': 'IMPROVE',
      'Radical Acceptance': 'RadicalAcceptance',
      'Turning the Mind': 'TurningTheMind',
      'Willingness': 'Willingness',
      'Half-Smiling': 'HalfSmiling',
      'Mindfulness of Thoughts': 'MindfulnessOfThoughts'
    };

    const htmlFileName = skillGuideMap[skillName] || '';

    let html;

    try {
      // Try to track the view regardless of success opening the file
      trackSkillGuideView(skillName);

      // Try to load the skill guide
      html = HtmlService.createHtmlOutputFromFile(htmlFileName)
        .setWidth(800)
        .setHeight(600)
        .setTitle(skillName + ' Skill Guide');
    } catch (error) {
      // If the specific guide doesn't exist, show placeholder
      Logger.log(`Skill guide ${htmlFileName} not found, showing placeholder: ${error.toString()}`);
      html = HtmlService.createHtmlOutput(getPlaceholderContent(skillName))
        .setWidth(800)
        .setHeight(600)
        .setTitle(skillName + ' Skill Guide (Coming Soon)');
    }

    SpreadsheetApp.getUi().showModalDialog(html, skillName + ' Skill Guide');
    return true;

  } catch (error) {
    Logger.log('Error opening skill guide: ' + error.toString());
    try {
      SpreadsheetApp.getUi().alert('Error', 'Could not open skill guide: ' + error.message, SpreadsheetApp.getUi().ButtonSet.OK);
    } catch (alertError) {
      Logger.log('Could not show alert: ' + alertError.toString());
    }
    return false;
  }
}

/**
 * Generates placeholder content for missing skill guides
 */
function getPlaceholderContent(skillName) {
  // Use a simpler placeholder to avoid potential script errors
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <base target="_top">
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>${skillName} Skill Guide (Coming Soon)</title>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
          background-color: #f8f9fa;
        }
        .placeholder-card {
          background-color: white;
          border-radius: 5px;
          padding: 30px;
          margin: 50px auto;
          max-width: 600px;
          text-align: center;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .coming-soon {
          color: #1890ff;
          font-size: 24px;
          margin-bottom: 20px;
        }
        .skill-icon {
          font-size: 48px;
          margin-bottom: 20px;
          color: #1890ff;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="placeholder-card">
          <div class="skill-icon">📝</div>
          <h2>${skillName}</h2>
          <p class="coming-soon">Coming Soon!</p>
          <p>We're currently developing this skill guide. Check back soon for interactive content on this DBT skill.</p>
          <p>In the meantime, you can still log your practice of this skill using the dashboard.</p>
          <button class="btn btn-primary mt-3" onclick="google.script.run.openDashboard()">Return to Dashboard</button>
        </div>
      </div>
      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
    </body>
    </html>
  `;
}

/**
 * Helper function to include HTML content
 */
function include(filename) {
  try {
    return HtmlService.createHtmlOutputFromFile(filename).getContent();
  } catch (error) {
    Logger.log(`Error including file ${filename}: ${error.toString()}`);
    return `<!-- Error loading ${filename} -->`;
  }
}

/**
 * Tracks when a skill guide is viewed
 */
function trackSkillGuideView(skillName) {
  try {
    if (!skillName) {
      Logger.log('No skill name provided for tracking');
      return { success: false, error: 'No skill name provided' };
    }

    // Ensure spreadsheet is initialized
    initializeSpreadsheet();

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let viewsSheet = ss.getSheetByName(SHEET_NAME_VIEWS);

    if (!viewsSheet) {
      Logger.log('Views sheet not found after initialization - creating it');
      viewsSheet = ss.insertSheet(SHEET_NAME_VIEWS);
      viewsSheet.appendRow(['Timestamp', 'SkillName']);
    }

    viewsSheet.appendRow([new Date(), skillName]);
    return { success: true };
  } catch (error) {
    Logger.log('Error tracking skill guide view: ' + error.toString());
    return { success: false, error: error.toString() };
  }
}

/**
 * Tests spreadsheet access for troubleshooting
 */
function testSpreadsheetAccess() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheets = ss.getSheets();
    Logger.log("Accessible sheets: " + sheets.map(sheet => sheet.getName()).join(", "));
  } catch (error) {
    Logger.log("Error accessing spreadsheet: " + error);
  }
}

/**
 * Helper function to validate numeric values
 */
function validateNumeric(value, defaultValue, min, max) {
  const num = parseInt(value, 10);
  if (isNaN(num)) {
    return defaultValue;
  }
  if (min !== undefined && num < min) {
    return min;
  }
  if (max !== undefined && num > max) {
    return max;
  }
  return num;
}

/**
 * Helper function to sanitize strings
 */
function sanitizeString(value) {
  if (value === undefined || value === null) {
    return '';
  }
  // Convert to string and trim
  return String(value).trim();
}

/**
 * Helper function to ensure a sheet exists with the correct headers
 */
function ensureSheetExists(spreadsheet, sheetName, headers) {
  let sheet = spreadsheet.getSheetByName(sheetName);

  if (!sheet) {
    Logger.log(`Creating ${sheetName} sheet`);
    sheet = spreadsheet.insertSheet(sheetName);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
    return;
  }

  // Check if headers need to be set
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
    return;
  }

  // Verify existing headers match expected headers
  try {
    const existingHeaders = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
    let headersMatch = true;

    for (let i = 0; i < headers.length; i++) {
      if (existingHeaders[i] !== headers[i]) {
        headersMatch = false;
        break;
      }
    }

    if (!headersMatch) {
      Logger.log(`Updating headers for ${sheetName} sheet`);
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
  } catch (error) {
    Logger.log(`Error checking/updating headers for ${sheetName}: ${error.toString()}`);
    // Still try to set headers in case of error
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
}