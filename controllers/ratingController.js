// backend/controllers/ratingController.js

const asyncHandler = require('express-async-handler');
const Rating = require('../models/Rating');
const Decision = require('../models/Decision'); // To check if decision, alt, crit exist

// @desc    Create or update a rating
// @route   POST /api/decisions/:decisionId/ratings
// @access  Private
const createOrUpdateRating = asyncHandler(async (req, res) => {
    const { alternativeId, criterionId, value } = req.body;
    const { decisionId } = req.params; // Get decisionId from URL parameters

    // Basic validation
    if (!alternativeId || !criterionId || value === undefined || value === null) {
        return res.status(400).json({ message: 'Please provide alternativeId, criterionId, and a value for the rating.' });
    }

    // Validate rating value
    if (typeof value !== 'number' || value < 0 || value > 10) { // Adjust range as per your model
        return res.status(400).json({ message: 'Rating value must be a number between 0 and 10.' });
    }

    // Ensure the user is authenticated
    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'Not authorized, user ID missing.' });
    }

    // Verify decision, alternative, and criterion exist and belong to the user/decision
    const decision = await Decision.findById(decisionId);

    if (!decision) {
        return res.status(404).json({ message: 'Decision not found.' });
    }

    // Check if the authenticated user is the owner of the decision
    if (decision.user.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to rate this decision.' });
    }

    // Check if alternativeId and criterionId are valid within this decision
    const alternativeExists = decision.alternatives.some(alt => alt._id.toString() === alternativeId);
    const criterionExists = decision.criteria.some(crit => crit._id.toString() === criterionId);

    if (!alternativeExists || !criterionExists) {
        return res.status(404).json({ message: 'Alternative or criterion not found within this decision.' });
    }

    // Try to find an existing rating
    const existingRating = await Rating.findOne({
        user: req.user.id,
        decision: decisionId,
        alternative: alternativeId,
        criterion: criterionId,
    });

    if (existingRating) {
        // Update existing rating
        existingRating.value = value;
        await existingRating.save();
        res.status(200).json(existingRating);
    } else {
        // Create new rating
        const newRating = await Rating.create({
            user: req.user.id,
            decision: decisionId,
            alternative: alternativeId,
            criterion: criterionId,
            value,
        });
        res.status(201).json(newRating);
    }
});

// @desc    Get all ratings for a specific decision
// @route   GET /api/decisions/:decisionId/ratings
// @access  Private
const getRatingsForDecision = asyncHandler(async (req, res) => {
    const { decisionId } = req.params;

    // Ensure the user is authenticated
    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'Not authorized, user ID missing.' });
    }

    // Verify decision exists and belongs to the user
    const decision = await Decision.findById(decisionId);

    if (!decision) {
        return res.status(404).json({ message: 'Decision not found.' });
    }
    // Check if the authenticated user is the owner of the decision
    if (decision.user.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to view ratings for this decision.' });
    }

    const ratings = await Rating.find({
        decision: decisionId,
        user: req.user.id // Only fetch ratings made by the current user for this decision
    });

    res.status(200).json(ratings);
});


module.exports = {
    createOrUpdateRating,
    getRatingsForDecision
};