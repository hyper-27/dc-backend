// models/OutcomeRule.js
const mongoose = require('mongoose');

const outcomeRuleSchema = new mongoose.Schema({
  tag: {
    type: String,
    required: true,
    unique: true, // Each tag should be unique to avoid duplicate rule sets
    trim: true
  },
  suggestions: [
    {
      type: String,
      required: true,
      trim: true
    }
  ] // Array of strings, each being a suggestion
}, {
  timestamps: true
});

const OutcomeRule = mongoose.model('OutcomeRule', outcomeRuleSchema);

module.exports = OutcomeRule;