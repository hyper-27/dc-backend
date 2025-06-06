// controllers/outcomeRuleController.js
const OutcomeRule = require('../models/OutcomeRule');

// @desc    Create a new outcome rule set (e.g., for a specific tag)
// @route   POST /api/outcome-rules
// @access  Private (or eventually admin-only)
exports.createOutcomeRule = async (req, res) => {
  const { tag, suggestions } = req.body;

  try {
    const existingRule = await OutcomeRule.findOne({ tag });
    if (existingRule) {
      return res.status(400).json({ message: 'An outcome rule with this tag already exists. Consider updating it.' });
    }

    const newRule = await OutcomeRule.create({ tag, suggestions });
    res.status(201).json(newRule);
  } catch (error) {
    console.error('Error creating outcome rule:', error);
    res.status(500).json({ message: 'Server error creating outcome rule' });
  }
};

// @desc    Get suggestions based on a tag
// @route   GET /api/outcome-rules/:tag/suggestions
// @access  Private
exports.getSuggestionsByTag = async (req, res) => {
  const { tag } = req.params; // Get tag from URL parameter

  try {
    const rule = await OutcomeRule.findOne({ tag: tag });

    if (!rule) {
      return res.status(404).json({ message: 'No suggestions found for this tag.' });
    }

    res.json({
      tag: rule.tag,
      suggestions: rule.suggestions
    });
  } catch (error) {
    console.error('Error fetching suggestions by tag:', error);
    res.status(500).json({ message: 'Server error fetching suggestions.' });
  }
};

// @desc    Get all outcome rules (for management/overview)
// @route   GET /api/outcome-rules
// @access  Private
exports.getAllOutcomeRules = async (req, res) => {
  try {
    const rules = await OutcomeRule.find({});
    res.json(rules);
  } catch (error) {
    console.error('Error fetching all outcome rules:', error);
    res.status(500).json({ message: 'Server error fetching outcome rules.' });
  }
};

// @desc    Update an outcome rule
// @route   PUT /api/outcome-rules/:tag
// @access  Private
exports.updateOutcomeRule = async (req, res) => {
  const { tag } = req.params;
  const { suggestions } = req.body;

  try {
    const rule = await OutcomeRule.findOneAndUpdate(
      { tag: tag },
      { $set: { suggestions: suggestions } },
      { new: true, runValidators: true } // Return the updated document, run schema validators
    );

    if (!rule) {
      return res.status(404).json({ message: 'Outcome rule not found.' });
    }

    res.json(rule);
  } catch (error) {
    console.error('Error updating outcome rule:', error);
    res.status(500).json({ message: 'Server error updating outcome rule.' });
  }
};

// @desc    Delete an outcome rule
// @route   DELETE /api/outcome-rules/:tag
// @access  Private
exports.deleteOutcomeRule = async (req, res) => {
  const { tag } = req.params;

  try {
    const result = await OutcomeRule.deleteOne({ tag: tag });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Outcome rule not found.' });
    }

    res.json({ message: 'Outcome rule removed.' });
  } catch (error) {
    console.error('Error deleting outcome rule:', error);
    res.status(500).json({ message: 'Server error deleting outcome rule.' });
  }
};