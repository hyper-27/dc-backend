// backend/models/Rating.js

const mongoose = require('mongoose');

const RatingSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User', // Reference to the User model
    },
    decision: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Decision', // Reference to the Decision model
    },
    alternative: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Alternative', // Reference to the Alternative sub-document in Decision
    },
    criterion: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Criterion', // Reference to the Criterion sub-document in Decision
    },
    value: {
        type: Number,
        required: true,
        min: 0, // Assuming ratings can be 0 or positive
        max: 10, // Assuming ratings can go up to 10, adjust as needed
    },
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

// Add a unique compound index to ensure a user can only rate a specific
// alternative against a specific criterion once per decision.
RatingSchema.index({ user: 1, decision: 1, alternative: 1, criterion: 1 }, { unique: true });

module.exports = mongoose.model('Rating', RatingSchema);