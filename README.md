# DBT Distress Tolerance Skills Tracker
## Setup Guide

This guide will help you set up the DBT Distress Tolerance Skills Tracker as a Google Apps Script web application. The tracker helps you practice and log your usage of DBT distress tolerance skills.

## Step 1: Create a Google Spreadsheet

1. Go to [Google Drive](https://drive.google.com) and create a new Google Spreadsheet
2. Rename it to "DBT Skills Tracker"
3. Note the Spreadsheet ID from the URL. It's the long string of letters and numbers in the URL: `https://docs.google.com/spreadsheets/d/`**`SPREADSHEET_ID`**`/edit`

## Step 2: Create the Google Apps Script Project

1. While in your spreadsheet, click on "Extensions" > "Apps Script"
2. This will open a new Apps Script project
3. Rename the project to "DBT Skills Tracker"

## Step 3: Create Script Files

1. Delete any code in the default `Code.gs` file
2. Paste the code from `Main App Script.js` into this file
3. Replace the empty `SPREADSHEET_ID` value with your actual spreadsheet ID:
   ```javascript
   const SPREADSHEET_ID = 'your-spreadsheet-id-here';
   ```

4. Create additional script files for the other JavaScript functions:
   - Click the "+" button next to "Files" to create a new file
   - Name it "ExportFunctions.gs"
   - Paste the code from `Export Functions.js`

5. Create HTML files for the user interface:
   - Click the "+" button next to "Files"
   - Select "HTML" to create a new HTML file
   - Create the following files and paste their respective code:
     - `Dashboard.html`
     - `LogForm.html`
     - `Reports.html`

## Step 4: Initialize the Spreadsheet

1. Go back to the `Code.gs` file
2. Add the following line at the bottom:
   ```javascript
   function manualInitialize() {
     initializeSpreadsheet();
   }
   ```
3. Click the "Save" button (disk icon)
4. From the dropdown above, select the `manualInitialize` function
5. Click the "Run" button (play icon)
6. You'll be asked to authorize the script. Follow the prompts to give it access.
7. This will create the necessary sheets in your spreadsheet

## Step 5: Deploy as a Web App

1. Click on the "Deploy" button in the top right corner
2. Select "New deployment"
3. Click the gear icon next to "Select type" and choose "Web app"
4. Fill in the following:
   - Description: "DBT Skills Tracker"
   - Execute as: "Me"
   - Who has access: "Only myself" (or "Anyone" if you want to share it)
5. Click "Deploy"
6. Copy the web app URL that appears

## Step 6: Access the Tracker

1. Open your Google Spreadsheet
2. Refresh the page
3. You should see a new menu item "DBT Skills Tracker"
4. Click on "DBT Skills Tracker" > "Open Dashboard" to start using the app

Alternatively, you can directly access the web app using the URL from Step 5.

## Optional: Set Up Weekly Email Summaries

1. From the Apps Script editor, open the `ExportFunctions.gs` file
2. Go to your spreadsheet and enter your name and email in the `UserData` sheet
3. Go back to the Apps Script editor
4. Run the `setupWeeklyEmailTrigger` function to set up automated weekly summaries

## Using the Tracker

1. **Dashboard**: View your skills practice summary and quick access to log new skills
2. **Log Form**: Record when you use a DBT distress tolerance skill
3. **Reports**: Visualize your skills practice data with charts and tables

## Troubleshooting

- If you see errors about "Spreadsheet not found," make sure you entered the correct Spreadsheet ID
- If you're having trouble with permissions, try re-running the `manualInitialize` function
- For any other issues, check the Apps Script logs by clicking on "Execution logs" in the Apps Script editor

## Support

If you need help or have questions about the DBT Skills Tracker, contact the developer or your DBT therapist for assistance.