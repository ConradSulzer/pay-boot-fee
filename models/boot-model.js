const mongoose = require('mongoose');

const bootSchema = new mongoose.Schema({
    bootId: {
        type: String,
        required: true,
        unique: true
    },
    unlock: {
        type: String,
        required: true,
        set: v => v === '' ? 'None' : v
    },
    plate: {
        type: String,
        required: true,
        set: v => v === '' ? 'None' : v
    },
    make: {
        type: String,
        required: true,
        set: v => v === '' ? 'None' : v
    },
    model: {
        type: String,
        required: true,
        set: v => v === '' ? 'None' : v
    },
    reason: {
        type: String,
        required: true,
        set: v => v === '' ? 'None' : v
    },
    location: {
        type: String,
        required: true,
        set: v => v === '' ? 'None' : v
    },
    agent: {
        type: String,
        required: true,
        set: v => v === '' ? 'None' : v
    },
    paid: {
        type: Boolean,
        required: true,
        set: v => v === '' ? false : v
    },
    deployed: {
        type: Boolean,
        required: true,
        set: v => v === '' ? false : v
    },
    time: {
        type: Date,
        required: true,
        set: v => v === '' ? Date.now() : v
    },
    flagged: {
        type: Boolean,
        required: true,
        set: v => v === '' ? false : v
    },
    status: {
        type: String,
        required: true,
        set: v => v === '' ? 'None' : v
    },
    notes: {
        type: Array,
        required: true,
        set: v => v === '' ? [] : v
    }
});


const Boot = mongoose.model('Boot', bootSchema);

module.exports = Boot;