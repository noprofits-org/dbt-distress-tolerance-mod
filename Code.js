// DBT Distress Tolerance Skills Tracker
// Main App Script

// Global variables
const SPREADSHEET_ID = '1pitmKWr-EuZBK9_A7U9bpf7Kdy8TGrzoScvUhbV6jNw'; // Replace with your Google Sheet ID
const SHEET_NAME_USER_DATA = 'UserData';
const SHEET_NAME_SKILLS_LOG = 'SkillsLog';

function onOpen() {
    const ui = SpreadsheetApp.getUi();
    ui.createMenu('DBT Skills Tracker')
        .addItem('Open Dashboard', 'openDashboard')
        .addItem('Log New Skills Practice', 'openLogForm')
        .addItem('View Reports', 'openReports')
        .addToUi();
}

function openDashboard() {
    const html = HtmlService.createHtmlOutputFromFile('Dashboard')
        .setWidth(800)
        .setHeight(600);
    SpreadsheetApp.getUi().showModalDialog(html, 'DBT Distress Tolerance Skills Dashboard');
}

function openLogForm() {
    const html = HtmlService.createHtmlOutputFromFile('LogForm')
        .setWidth(600)
        .setHeight(700);
    SpreadsheetApp.getUi().showModalDialog(html, 'Log Skills Practice');
}

function openReports() {
    const html = HtmlService.createHtmlOutputFromFile('Reports')
        .setWidth(800)
        .setHeight(600);
    SpreadsheetApp.getUi().showModalDialog(html, 'Skills Practice Reports');
}

function getSkillLogs() {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME_SKILLS_LOG);
    const data = sheet.getDataRange().getValues();
    data.shift(); // Remove header row
    return data;
}

function saveSkillLog(logData) {
    try {
        initializeSpreadsheet();
        const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
        const sheet = ss.getSheetByName(SHEET_NAME_SKILLS_LOG);
        const row = [
            new Date(),
            logData.skillType,
            logData.skillName,
            parseInt(logData.distressBefore, 10),
            parseInt(logData.distressAfter, 10),
            parseInt(logData.effectiveness, 10),
            '', // TimeSpent
            '', // QuizScore
            logData.notes || ''
        ];
        sheet.appendRow(row);
        return { success: true, message: 'Skill practice logged successfully!' };
    } catch (error) {
        return { success: false, message: 'Error logging skill practice: ' + error.toString() };
    }
}

function logSkillWithTime(logData) {
    try {
        initializeSpreadsheet();
        const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
        const sheet = ss.getSheetByName(SHEET_NAME_SKILLS_LOG);
        const row = [
            new Date(),                     // A: Timestamp
            logData.skillType,             // B: SkillType
            logData.skillName,             // C: SkillName
            parseInt(logData.distressBefore, 10) || 0, // D: DistressBefore
            parseInt(logData.distressAfter, 10) || 0,  // E: DistressAfter
            parseInt(logData.effectiveness, 10) || 3,  // F: Effectiveness
            parseFloat(logData.timeSpent) || 0,        // G: TimeSpent / min
            logData.quizScore || '',                   // H: QuizScore
            logData.notes || ''                        // I: Notes
        ];
        sheet.appendRow(row);
        return { success: true, message: 'Skill practice logged successfully!' };
    } catch (error) {
        return { success: false, message: 'Error logging skill practice: ' + error.toString() };
    }
}

function getDashboardData() {
    const logs = getSkillLogs();
    const totalPractices = logs.length;
    const skillTypeCount = {};
    logs.forEach(log => {
        const skillType = log[1];
        skillTypeCount[skillType] = (skillTypeCount[skillType] || 0) + 1;
    });
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
    const skillEffectivenessAvg = {};
    Object.keys(skillEffectiveness).forEach(skill => {
        skillEffectivenessAvg[skill] = skillEffectiveness[skill] / skillCounts[skill];
    });
    let totalDistressReduction = 0;
    logs.forEach(log => {
        const distressBefore = log[3];
        const distressAfter = log[4];
        totalDistressReduction += (distressBefore - distressAfter);
    });
    const avgDistressReduction = totalPractices > 0 ? totalDistressReduction / totalPractices : 0;
    const recentLogs = logs.slice(-5).reverse();
    return {
        totalPractices,
        skillTypeCount,
        skillEffectivenessAvg,
        avgDistressReduction,
        recentLogs
    };
}

function initializeSpreadsheet() {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let skillsLogSheet = ss.getSheetByName(SHEET_NAME_SKILLS_LOG);
    if (!skillsLogSheet) {
        skillsLogSheet = ss.insertSheet(SHEET_NAME_SKILLS_LOG);
    }
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
    const currentHeaders = skillsLogSheet.getRange(1, 1, 1, 9).getValues()[0];
    if (!arraysEqual(currentHeaders, expectedHeaders)) {
        skillsLogSheet.getRange(1, 1, 1, 9).setValues([expectedHeaders]);
    }
}

function arraysEqual(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

function doGet() {
    return HtmlService.createHtmlOutputFromFile('Dashboard')
        .setTitle('DBT Distress Tolerance Skills Tracker');
}

function manualInitialize() {
    initializeSpreadsheet();
}

function openSkillGuide(skillName) {
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
    try {
        const template = HtmlService.createTemplateFromFile(htmlFileName);
        const html = template.evaluate()
            .setWidth(800)
            .setHeight(600);
        SpreadsheetApp.getUi().showModalDialog(html, skillName + ' Skill Guide');
    } catch (error) {
        Logger.log('Error loading template: ' + error.toString());
        const html = HtmlService.createHtmlOutputFromFile(htmlFileName)
            .setWidth(800)
            .setHeight(600);
        SpreadsheetApp.getUi().showModalDialog(html, skillName + ' Skill Guide');
    }
}

function include(filename) {
    return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function trackSkillGuideView(skillName) {
    try {
        const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
        let viewsSheet = ss.getSheetByName('SkillGuideViews');
        if (!viewsSheet) {
            viewsSheet = ss.insertSheet('SkillGuideViews');
            viewsSheet.appendRow(['Timestamp', 'SkillName']);
        }
        viewsSheet.appendRow([new Date(), skillName]);
        return { success: true };
    } catch (error) {
        Logger.log('Error tracking skill guide view: ' + error.toString());
        return { success: false, error: error.toString() };
    }
}