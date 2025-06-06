// models/Option.js
const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
  criterionId: {
    type: mongoose.Schema.Types.ObjectId, // Link to the specific Criterion
    ref: 'Criteria',
    required: true
  },
  value: {
    type: Number,
    required: true,
    min: 0, // Example: score from 0 to 10
    max: 10
  }
}, {
  _id: false // Don't create an _id for subdocuments (scores)
});

const optionSchema = new mongoose.Schema({
  decisionId: {
    type: mongoose.Schema.Types.ObjectId, // Links this option to a specific Decision
    ref: 'Decision',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId, // Links this option to the User who owns the decision
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 1
  },
  description: {
    type: String,
    trim: true,
    default: '' // Optional description for the option
  },
  scores: [scoreSchema] // Array of scores for each criterion
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Add a unique compound index to ensure a user cannot add the same option name
// for the same decision multiple times
optionSchema.index({ decisionId: 1, name: 1, userId: 1 }, { unique: true });


const Option = mongoose.model('Option', optionSchema);

module.exports = Option;