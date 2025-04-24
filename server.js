const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
require('dotenv').config();

const connectDB = require('./config/db');
const Entry = require('./models/Entry');
connectDB();

const fs = require('fs');
const GoogleSheetsService = require('./services/gsheet/sheet_service');
const sheetsService = new GoogleSheetsService(JSON.parse(fs.readFileSync(path.join(__dirname, 'config', 'Credentials.json'))), process.env.SPREADSHEET_ID);
sheetsService.initialize()

const teams = JSON.parse(fs.readFileSync(path.join(__dirname, 'config', 'FLL.json')));
const robots = JSON.parse(fs.readFileSync(path.join(__dirname, 'config', 'Robot.json')));

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended: false}));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({mongoUrl: process.env.MONGODB}),
    cookie: {maxAge: 86400000}
}));
app.use(flash());

app.use((req, res, next) => {
    res.locals.flash = req.flash();
    next();
});

app.get('/', (req, res) => {
    let errormsg;
    if (req.flash('error')) {
        errormsg = req.flash('error');
    }
    else {
        errormsg = null;
    }
    res.render('home', {updated: false, message: errormsg});
});

app.post('/home', (req, res) => {
    const {name, teamNumber, barcode, entryType} = req.body;
    const team = teams.find(t => t["Team Number"] === String(teamNumber));
    const robot = robots.find(r => r["Barcode"] === String(barcode));

    if (!team) {
        req.flash('error', 'Team not found');
        return res.redirect('/');
    }
    if (!robot) {
        req.flash('error', 'Robot not found');
        return res.redirect('/');
    }

    const newEntry = new Entry({
        name,
        teamNumber: parseInt(teamNumber),
        school: team["School"],
        coach: team["Coach"],
        robot: robot["Robot Name"],
        entryType
    });
    newEntry.save()
        .then(() => {
            req.flash('success', 'Entry created successfully');
            res.redirect('/');
        })
        .catch(err => {
            req.flash('error', 'Error creating entry');
            res.redirect('/');
        });
});

app.post('/api/update-sheet', async (req, res) => {
    try {
      const entries = await Entry.find().sort({ createdAt: -1 });
      await sheetsService.updateSheet(entries);
      
      req.app.locals.updated = true;
      
      // Return success response
      res.json({ success: true, message: 'Sheet updated successfully' });
    } catch (error) {
      console.error('Error updating sheet:', error);
      res.status(500).json({ success: false, message: 'Failed to update sheet' });
    }
  });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));