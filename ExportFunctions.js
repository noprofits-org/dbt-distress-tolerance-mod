/**
 * Exports all skills logs to a CSV file and returns the URL to download it.
 */
function exportLogsToCSV() {
  try {
    // Get all the logs
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME_SKILLS_LOG);
    const data = sheet.getDataRange().getValues();
    
    // Headers for the CSV
    const headers = data[0];
    
    // Create CSV content
    let csvContent = headers.join(',') + '\n';
    
    // Add each row of data
    for (let i = 1; i < data.length; i++) {
      // Format the date
      data[i][0] = Utilities.formatDate(new Date(data[i][0]), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
      
      // Format each cell and handle commas
      const formattedRow = data[i].map(cell => {
        // Convert to string and escape quotes
        const cellStr = String(cell).replace(/"/g, '""');
        
        // If cell contains commas, quotes, or newlines, wrap in quotes
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return `"${cellStr}"`;
        }
        return cellStr;
      });
      
      csvContent += formattedRow.join(',') + '\n';
    }
    
    // Create file in Google Drive
    const fileName = `DBT_Skills_Log_${Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd')}.csv`;
    const file = DriveApp.createFile(fileName, csvContent, MimeType.CSV);
    
    // Make the file accessible via URL
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    return file.getDownloadUrl();
  } catch (error) {
    Logger.log('Error exporting CSV: ' + error.toString());
    throw error;
  }
}

/**
 * Creates a weekly summary report and emails it to the user.
 * This can be set up as a time-based trigger.
 */
function sendWeeklySummaryEmail() {
  try {
    // Get all logs
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const userDataSheet = ss.getSheetByName(SHEET_NAME_USER_DATA);
    const skillsLogSheet = ss.getSheetByName(SHEET_NAME_SKILLS_LOG);
    
    // Get user info
    const userData = userDataSheet.getDataRange().getValues();
    if (userData.length <= 1) {
      Logger.log('No users found');
      return;
    }
    
    // Assuming first user in the sheet
    const userEmail = userData[1][2]; // Email is in the 3rd column
    const userName = userData[1][1];  // Name is in the 2nd column
    
    // Get logs data
    const logsData = skillsLogSheet.getDataRange().getValues();
    logsData.shift(); // Remove header row
    
    // Calculate start and end dates for the past week
    const today = new Date();
    const lastWeek = new Date();
    lastWeek.setDate(today.getDate() - 7);
    
    // Filter logs for the past week
    const weekLogs = logsData.filter(log => {
      const logDate = new Date(log[0]);
      return logDate >= lastWeek && logDate <= today;
    });
    
    if (weekLogs.length === 0) {
      Logger.log('No logs for the past week');
      return;
    }
    
    // Calculate summary statistics
    const totalPractices = weekLogs.length;
    
    // Count by skill type
    const skillTypeCounts = {};
    weekLogs.forEach(log => {
      const skillType = log[1];
      skillTypeCounts[skillType] = (skillTypeCounts[skillType] || 0) + 1;
    });
    
    // Calculate average effectiveness
    const totalEffectiveness = weekLogs.reduce((sum, log) => sum + log[5], 0);
    const avgEffectiveness = totalEffectiveness / totalPractices;
    
    // Calculate average distress reduction
    let totalDistressReduction = 0;
    weekLogs.forEach(log => {
      totalDistressReduction += (log[3] - log[4]);
    });
    const avgDistressReduction = totalDistressReduction / totalPractices;
    
    // Create email content
    const emailSubject = 'Your Weekly DBT Skills Practice Summary';
    
    let emailBody = `
      <h2>Weekly DBT Skills Practice Summary</h2>
      <p>Hello ${userName},</p>
      <p>Here's a summary of your DBT Distress Tolerance skills practice for the past week:</p>
      
      <h3>Overview</h3>
      <ul>
        <li><strong>Total Practices:</strong> ${totalPractices}</li>
        <li><strong>Average Effectiveness:</strong> ${avgEffectiveness.toFixed(1)}/5</li>
        <li><strong>Average Distress Reduction:</strong> ${avgDistressReduction.toFixed(1)} points</li>
      </ul>
      
      <h3>Skills Used This Week</h3>
      <ul>
    `;
    
    // Add skill types
    for (const skillType in skillTypeCounts) {
      emailBody += `<li><strong>${skillType}:</strong> ${skillTypeCounts[skillType]} times</li>`;
    }
    
    emailBody += `
      </ul>
      
      <h3>Recent Practice Logs</h3>
      <table border="1" cellpadding="5" style="border-collapse: collapse;">
        <tr>
          <th>Date</th>
          <th>Skill</th>
          <th>Distress Before → After</th>
          <th>Effectiveness</th>
        </tr>
    `;
    
    // Add the 5 most recent logs
    const recentLogs = weekLogs.sort((a, b) => new Date(b[0]) - new Date(a[0])).slice(0, 5);
    
    recentLogs.forEach(log => {
      const logDate = Utilities.formatDate(new Date(log[0]), Session.getScriptTimeZone(), 'MM/dd/yyyy HH:mm');
      emailBody += `
        <tr>
          <td>${logDate}</td>
          <td>${log[2]}</td>
          <td>${log[3]} → ${log[4]}</td>
          <td>${log[5]}/5</td>
        </tr>
      `;
    });
    
    emailBody += `
      </table>
      
      <p>Keep up the good work! Remember that consistent practice of these skills helps build them into habits.</p>
      
      <p>To view your full reports and continue tracking your progress, open the DBT Skills Tracker.</p>
      
      <p>Best regards,<br>Your DBT Skills Tracker</p>
    `;
    
    // Send the email
    MailApp.sendEmail({
      to: userEmail,
      subject: emailSubject,
      htmlBody: emailBody
    });
    
    Logger.log('Weekly summary email sent to ' + userEmail);
    
  } catch (error) {
    Logger.log('Error sending weekly summary: ' + error.toString());
  }
}

/**
 * Sets up a weekly trigger for sending summary emails.
 * Run this function once to set up the trigger.
 */
function setupWeeklyEmailTrigger() {
  // Delete any existing triggers
  const triggers = ScriptApp.getProjectTriggers();
  for (const trigger of triggers) {
    if (trigger.getHandlerFunction() === 'sendWeeklySummaryEmail') {
      ScriptApp.deleteTrigger(trigger);
    }
  }
  
  // Create a new trigger for Sunday at 9 AM
  ScriptApp.newTrigger('sendWeeklySummaryEmail')
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.SUNDAY)
    .atHour(9)
    .create();
}