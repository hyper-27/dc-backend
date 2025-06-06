// controllers/optionController.js
const Option = require('../models/Option');
const Decision = require('../models/Decision'); // To verify decision ownership

// @desc    Create a new option for a specific decision
// @route   POST /api/decisions/:decisionId/options
// @access  Private
exports.createOption = async (req, res) => {
  const { name, description, scores } = req.body; // Scores will be an array [{criterionId, value}]
  const { decisionId } = req.params;

  try {
    // Verify that the decisionId exists and belongs to the user
    const decision = await Decision.findOne({ _id: decisionId, userId: req.user._id });
    if (!decision) {
      return res.status(404).json({ message: 'Decision not found or not authorized' });
    }

    const newOption = await Option.create({
      decisionId,
      userId: req.user._id,
      name,
      description,
      scores: scores || [] // Initialize with provided scores or empty array
    });
    res.status(201).json(newOption);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'An option with this name already exists for this decision.' });
    }
    console.error('Error creating option:', error);
    res.status(500).json({ message: 'Server error creating option' });
  }
};

// @desc    Get all options for a specific decision
// @route   GET /api/decisions/:decisionId/options
// @access  Private
exports.getOptions = async (req, res) => {
  const { decisionId } = req.params;

  try {
    // Verify that the decisionId exists and belongs to the user
    const decision = await Decision.findOne({ _id: decisionId, userId: req.user._id });
    if (!decision) {
      return res.status(404).json({ message: 'Decision not found or not authorized' });
    }

    const options = await Option.find({ decisionId, userId: req.user._id }).sort({ createdAt: 1 });
    res.json(options);
  } catch (error) {
    console.error('Error fetching options:', error);
    res.status(500).json({ message: 'Server error fetching options' });
  }
};

// @desc    Get a single option by ID
// @route   GET /api/decisions/:decisionId/options/:id
// @access  Private
exports.getOptionById = async (req, res) => {
  const { decisionId, id } = req.params;

  try {
    const option = await Option.findOne({ _id: id, decisionId, userId: req.user._id });

    if (!option) {
      return res.status(404).json({ message: 'Option not found or not authorized' });
    }
    res.json(option);
  } catch (error) {
    console.error('Error fetching option by ID:', error);
    res.status(500).json({ message: 'Server error fetching option' });
  }
};

// @desc    Update an option
// @route   PUT /api/decisions/:decisionId/options/:id
// @access  Private
exports.updateOption = async (req, res) => {
  const { name, description, scores } = req.body; // Scores can also be updated here
  const { decisionId, id } = req.params;

  try {
    const option = await Option.findOne({ _id: id, decisionId, userId: req.user._id });

    if (!option) {
      return res.status(404).json({ message: 'Option not found or not authorized' });
    }

    option.name = name || option.name;
    option.description = description !== undefined ? description : option.description;
    option.scores = scores || option.scores; // Update scores array

    const updatedOption = await option.save();
    res.json(updatedOption);

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'An option with this name already exists for this decision.' });
    }
    console.error('Error updating option:', error);
    res.status(500).json({ message: 'Server error updating option' });
  }
};

// @desc    Delete an option
// @route   DELETE /api/decisions/:decisionId/options/:id
// @access  Private
exports.deleteOption = async (req, res) => {
  const { decisionId, id } = req.params;

  try {
    const result = await Option.deleteOne({ _id: id, decisionId, userId: req.user._id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Option not found or not authorized' });
    }

    res.json({ message: 'Option removed' });
  } catch (error) {
    console.error('Error deleting option:', error);
    res.status(500).json({ message: 'Server error deleting option' });
  }
};
