// DBT Distress Tolerance Skills Tracker
// Main App Script - Improved Version with Error Handling

// Global variables
const SPREADSHEET_ID = '1pitmKWr-EuZBK9_A7U9bpf7Kdy8TGrzoScvUhbV6jNw'; // Main spreadsheet ID
const SHEET_NAME_USER_DATA = 'UserData';
const SHEET_NAME_SKILLS_LOG = 'SkillsLog';
const SHEET_NAME_VIEWS = 'SkillGuideViews';

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
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME_SKILLS_LOG);
    
    if (!sheet) {
      Logger.log('Skills log sheet not found, initializing');
      initializeSpreadsheet();
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
    initializeSpreadsheet();
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME_SKILLS_LOG);
    
    // Validate data
    const distressBefore = parseInt(logData.distressBefore, 10) || 0;
    const distressAfter = parseInt(logData.distressAfter, 10) || 0;
    const effectiveness = parseInt(logData.effectiveness, 10) || 3;
    
    const row = [
      new Date(),                  // Timestamp
      logData.skillType || '',     // SkillType
      logData.skillName || '',     // SkillName
      distressBefore,              // DistressBefore
      distressAfter,               // DistressAfter
      effectiveness,               // Effectiveness
      '',                          // TimeSpent
      '',                          // QuizScore
      logData.notes || ''          // Notes
    ];
    
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
    initializeSpreadsheet();
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME_SKILLS_LOG);
    
    // Validate data
    const distressBefore = parseInt(logData.distressBefore, 10) || 0;
    const distressAfter = parseInt(logData.distressAfter, 10) || 0;
    const effectiveness = parseInt(logData.effectiveness, 10) || 3;
    const timeSpent = parseFloat(logData.timeSpent) || 0;
    
    const row = [
      new Date(),                  // Timestamp
      logData.skillType || '',     // SkillType
      logData.skillName || '',     // SkillName
      distressBefore,              // DistressBefore
      distressAfter,               // DistressAfter
      effectiveness,               // Effectiveness
      timeSpent,                   // TimeSpent / min
      logData.quizScore || '',     // QuizScore
      logData.notes || ''          // Notes
    ];
    
    sheet.appendRow(row);
    Logger.log('Skill practice with time logged successfully');
    return { success: true, message: 'Skill practice logged successfully!' };
  } catch (error) {
    Logger.log('Error logging skill practice with time: ' + error.toString());
    return { success: false, message: 'Error logging skill practice: ' + error.toString() };
  }
}

/**
 * Gets data for the dashboard
 */
function getDashboardData() {
  try {
    const logs = getSkillLogs();
    const totalPractices = logs.length;
    
    // Count by skill type
    const skillTypeCount = {};
    logs.forEach(log => {
      const skillType = log[1];
      skillTypeCount[skillType] = (skillTypeCount[skillType] || 0) + 1;
    });
    
    // Calculate effectiveness by skill
    const skillEffectiveness = {};
    const skillCounts = {};
    logs.forEach(log => {
      const skillName = log[2];
      const effectiveness = log[5];
      if (!skillEffectiveness[skillName]) {
        skillEffectiveness[skillName] = 0;
        skillCounts[skillName] = 0;
      }
      skillEffectiveness[skillName] += effectiveness;
      skillCounts[skillName]++;
    });
    
    // Calculate average effectiveness
    const skillEffectivenessAvg = {};
    Object.keys(skillEffectiveness).forEach(skill => {
      skillEffectivenessAvg[skill] = skillEffectiveness[skill] / skillCounts[skill];
    });
    
    // Calculate distress reduction
    let totalDistressReduction = 0;
    logs.forEach(log => {
      const distressBefore = log[3];
      const distressAfter = log[4];
      totalDistressReduction += (distressBefore - distressAfter);
    });
    const avgDistressReduction = totalPractices > 0 ? totalDistressReduction / totalPractices : 0;
    
    // Get recent logs (last 5)
    const recentLogs = logs.slice(-5).reverse();
    
    // Get available skill guides
    const skillGuideStatus = {
      'STOP': checkFileExists('STOP.html'),
      'TIP': checkFileExists('TIP.html'),
      'Pros and Cons': checkFileExists('ProsAndCons.html'),
      'ACCEPTS': checkFileExists('ACCEPTS.html'),
      'Self-Soothe': checkFileExists('SelfSooth.html'),
      'IMPROVE': checkFileExists('IMPROVE.html'),
      'Radical Acceptance': checkFileExists('RadicalAcceptance.html'),
      'Turning the Mind': checkFileExists('TurningTheMind.html'),
      'Willingness': checkFileExists('Willingness.html'),
      'Half-Smiling': checkFileExists('HalfSmiling.html'),
      'Mindfulness of Thoughts': checkFileExists('MindfulnessOfThoughts.html')
    };
    
    return {
      totalPractices,
      skillTypeCount,
      skillEffectivenessAvg,
      avgDistressReduction,
      recentLogs,
      skillGuideStatus
    };
  } catch (error) {
    Logger.log('Error getting dashboard data: ' + error.toString());
    return {
      totalPractices: 0,
      skillTypeCount: {},
      skillEffectivenessAvg: {},
      avgDistressReduction: 0,
      recentLogs: [],
      skillGuideStatus: {}
    };
  }
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
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    // Initialize SkillsLog sheet
    let skillsLogSheet = ss.getSheetByName(SHEET_NAME_SKILLS_LOG);
    if (!skillsLogSheet) {
      Logger.log('Creating SkillsLog sheet');
      skillsLogSheet = ss.insertSheet(SHEET_NAME_SKILLS_LOG);
    }
    
    // Check and set headers
    const expectedHeaders = [
      'Timestamp',
      'SkillType',
      'SkillName',
      'DistressBefore',
      'DistressAfter',
      'Effectiveness',
      'TimeSpent / min',
      'QuizScore',
      'Notes'
    ];
    
    // Only set headers if first row is empty or different
    let currentHeaders = [];
    if (skillsLogSheet.getLastRow() > 0) {
      currentHeaders = skillsLogSheet.getRange(1, 1, 1, expectedHeaders.length).getValues()[0];
    }
    
    if (currentHeaders.length === 0 || !arraysEqual(currentHeaders, expectedHeaders)) {
      Logger.log('Setting headers for SkillsLog sheet');
      skillsLogSheet.getRange(1, 1, 1, expectedHeaders.length).setValues([expectedHeaders]);
    }
    
    // Initialize UserData sheet if needed
    let userDataSheet = ss.getSheetByName(SHEET_NAME_USER_DATA);
    if (!userDataSheet) {
      Logger.log('Creating UserData sheet');
      userDataSheet = ss.insertSheet(SHEET_NAME_USER_DATA);
      userDataSheet.getRange(1, 1, 1, 3).setValues([['ID', 'Name', 'Email']]);
    }
    
    // Initialize SkillGuideViews sheet if needed
    let viewsSheet = ss.getSheetByName(SHEET_NAME_VIEWS);
    if (!viewsSheet) {
      Logger.log('Creating SkillGuideViews sheet');
      viewsSheet = ss.insertSheet(SHEET_NAME_VIEWS);
      viewsSheet.getRange(1, 1, 1, 2).setValues([['Timestamp', 'SkillName']]);
    }
    
    Logger.log('Spreadsheet initialization complete');
    return true;
  } catch (error) {
    Logger.log('Error initializing spreadsheet: ' + error.toString());
    return false;
  }
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
    
    const htmlFileName = skillGuideMap[skillName] || 'Dashboard';
    let html;
    
    try {
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
    trackSkillGuideView(skillName);
    return true;
    
  } catch (error) {
    Logger.log('Error opening skill guide: ' + error.toString());
    showError('Error opening skill guide: ' + error.message);
    return false;
  }
}

/**
 * Generates placeholder content for missing skill guides
 */
function getPlaceholderContent(skillName) {
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
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let viewsSheet = ss.getSheetByName(SHEET_NAME_VIEWS);
    
    if (!viewsSheet) {
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
    const sheets = ss.getSheets().map(sheet => sheet.getName());
    Logger.log('Accessible sheets: ' + sheets.join(', '));
    return 'Success: ' + sheets.join(', ');
  } catch (error) {
    Logger.log('Error: ' + error.toString());
    return 'Error: ' + error.toString();
  }
}