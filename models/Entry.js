const mongoose = require('mongoose');

const EntrySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    school: {
        type: String,
        required: true
    },
    coach: {
        type: String,
        required: true
    },
    coachEmail: {
        type: String,
        required: true,
        default: ''
    },
    robot: {
        type: String,
        required: true
    },
    entryType: {
        type: String,
        enum: ['in', 'out'],
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
});

module.exports = mongoose.model('Entry', EntrySchema);