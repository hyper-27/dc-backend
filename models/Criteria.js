// models/Criteria.js
const mongoose = require('mongoose');

const criteriaSchema = new mongoose.Schema({
  decisionId: {
    type: mongoose.Schema.Types.ObjectId, // Links this criterion to a specific Decision
    ref: 'Decision',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId, // Links this criterion to the User who owns the decision
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 1
  },
  weight: {
    type: Number,
    required: true,
    min: 0, // Weights should be non-negative
    max: 10 // Example: weights from 0 to 10
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Add a unique compound index to ensure a user cannot add the same criterion name
// for the same decision multiple times (optional, but good practice)
criteriaSchema.index({ decisionId: 1, name: 1, userId: 1 }, { unique: true });

const Criteria = mongoose.model('Criteria', criteriaSchema);

module.exports = Criteria;