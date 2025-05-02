const { google } = require('googleapis');

class GoogleSheetsService {
    constructor(credentials, spreadsheetId) {
        this.spreadsheetId = spreadsheetId;
        this.auth = new google.auth.JWT(
            credentials.client_email,
            null,
            credentials.private_key,
            ['https://www.googleapis.com/auth/spreadsheets']
        );
        this.sheets = google.sheets({ version: 'v4', auth: this.auth });
    }

    async initialize() {
        try {
            await this.auth.authorize();
            console.log('Google Sheets API connected successfully');
        } catch (error) {
            console.error('Error connecting to Google Sheets API:', error.message);
            throw error;
        }
    }

    async updateSheet(entries) {
        try {
            const header = ['Timestamp', 'Name', 'Team Number', 'School', 'Coach', 'Robot', 'Entry Type'];
            const rows = entries.map(entry => [
                new Date().toISOString(),
                entry.name,
                entry.school,
                entry.coach,
                entry.coachEmail,
                entry.robot,
                entry.entryType
            ]);

            const values = [header, ...rows];
            
            await this.sheets.spreadsheets.values.clear({
                spreadsheetId: this.spreadsheetId,
                range: 'Entries!A1:G1000',
            })
            await this.sheets.spreadsheets.values.update({
                spreadsheetId: this.spreadsheetId,
                range: 'Entries!A1',
                valueInputOption: 'RAW',
                resource: {values},
            });
            console.log('Google Sheet updated successfully');
        }
        catch (error) {
            console.error('Error updating Google Sheet:', error.message);
            throw error;
        }
    }
}

module.exports = GoogleSheetsService;