const mongoose = require('mongoose');

// Schema for Alternatives
const alternativeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        maxlength: 100
    },
    description: {
        type: String,
        trim: true,
        maxlength: 500
    },
    score: { // <--- ADDED THIS FIELD for numerical scoring
        type: Number,
        default: 0
    }
}, {
    timestamps: true // Adds createdAt and updatedAt
});

// Schema for Criteria
const criterionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        maxlength: 100
    },
    description: {
        type: String,
        trim: true,
        maxlength: 500
    },
    weight: { // Importance of this criterion (e.g., 1-5, or a percentage)
        type: Number,
        default: 1,
        min: 0
    }
}, {
    timestamps: true // Adds createdAt and updatedAt
});


// Main Decision Schema
const decisionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 200
    },
    description: {
        type: String,
        trim: true,
        maxlength: 1000
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    alternatives: [alternativeSchema], // Array of alternative sub-documents
    criteria: [criterionSchema],     // Array of criterion sub-documents
}, {
    timestamps: true // Adds createdAt and updatedAt
});

const Decision = mongoose.model('Decision', decisionSchema);

module.exports = Decision;