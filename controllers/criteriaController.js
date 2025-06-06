// controllers/criteriaController.js
const Criteria = require('../models/Criteria');
const Decision = require('../models/Decision'); // To verify decision ownership if needed

// @desc    Create a new criterion for a specific decision
// @route   POST /api/decisions/:decisionId/criteria
// @access  Private
exports.createCriterion = async (req, res) => {
  const { name, weight } = req.body;
  const { decisionId } = req.params; // Get decisionId from URL parameters

  try {
    // Optional: Verify that the decisionId exists and belongs to the user
    const decision = await Decision.findOne({ _id: decisionId, userId: req.user._id });
    if (!decision) {
      return res.status(404).json({ message: 'Decision not found or not authorized' });
    }

    const newCriterion = await Criteria.create({
      decisionId,
      userId: req.user._id, // User ID from auth middleware
      name,
      weight
    });
    res.status(201).json(newCriterion);
  } catch (error) {
    // Handle potential duplicate key error from unique index
    if (error.code === 11000) {
      return res.status(400).json({ message: 'A criterion with this name already exists for this decision.' });
    }
    console.error('Error creating criterion:', error);
    res.status(500).json({ message: 'Server error creating criterion' });
  }
};

// @desc    Get all criteria for a specific decision
// @route   GET /api/decisions/:decisionId/criteria
// @access  Private
exports.getCriteria = async (req, res) => {
  const { decisionId } = req.params;

  try {
    // Optional: Verify that the decisionId exists and belongs to the user
    const decision = await Decision.findOne({ _id: decisionId, userId: req.user._id });
    if (!decision) {
      return res.status(404).json({ message: 'Decision not found or not authorized' });
    }

    const criteria = await Criteria.find({ decisionId, userId: req.user._id }).sort({ createdAt: 1 });
    res.json(criteria);
  } catch (error) {
    console.error('Error fetching criteria:', error);
    res.status(500).json({ message: 'Server error fetching criteria' });
  }
};

// @desc    Get a single criterion by ID
// @route   GET /api/decisions/:decisionId/criteria/:id
// @access  Private
exports.getCriterionById = async (req, res) => {
  const { decisionId, id } = req.params;

  try {
    const criterion = await Criteria.findOne({ _id: id, decisionId, userId: req.user._id });

    if (!criterion) {
      return res.status(404).json({ message: 'Criterion not found or not authorized' });
    }
    res.json(criterion);
  } catch (error) {
    console.error('Error fetching criterion by ID:', error);
    res.status(500).json({ message: 'Server error fetching criterion' });
  }
};

// @desc    Update a criterion
// @route   PUT /api/decisions/:decisionId/criteria/:id
// @access  Private
exports.updateCriterion = async (req, res) => {
  const { name, weight } = req.body;
  const { decisionId, id } = req.params;

  try {
    const criterion = await Criteria.findOne({ _id: id, decisionId, userId: req.user._id });

    if (!criterion) {
      return res.status(404).json({ message: 'Criterion not found or not authorized' });
    }

    criterion.name = name || criterion.name;
    criterion.weight = weight !== undefined ? weight : criterion.weight;

    const updatedCriterion = await criterion.save();
    res.json(updatedCriterion);

  } catch (error) {
    // Handle potential duplicate key error from unique index on update
    if (error.code === 11000) {
      return res.status(400).json({ message: 'A criterion with this name already exists for this decision.' });
    }
    console.error('Error updating criterion:', error);
    res.status(500).json({ message: 'Server error updating criterion' });
  }
};

// @desc    Delete a criterion
// @route   DELETE /api/decisions/:decisionId/criteria/:id
// @access  Private
exports.deleteCriterion = async (req, res) => {
  const { decisionId, id } = req.params;

  try {
    const result = await Criteria.deleteOne({ _id: id, decisionId, userId: req.user._id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Criterion not found or not authorized' });
    }

    res.json({ message: 'Criterion removed' });
  } catch (error) {
    console.error('Error deleting criterion:', error);
    res.status(500).json({ message: 'Server error deleting criterion' });
  }
};