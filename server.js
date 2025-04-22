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

app.get('/', (req, res) => {
    res.render('home');
});

app.post('/home', (req, res) => {
    const {name, teamNumber, robotNumber, entryType} = req.body;

    const newEntry = new Entry({
        name,
        teamNumber,
        school,
        coach,
        robotNumber,
        entryType
    });
    newEntry.save()
        .then(() => {
            req.flash('success', 'Entry created successfully');
            res.redirect('/home');
        })
        .catch(err => {
            req.flash('error', 'Error creating entry');
            res.redirect('/home');
        });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));