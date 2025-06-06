// backend/routes/decisionRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getDecisions,
    createDecision,
    getDecisionById,
    updateDecision,
    deleteDecision,
    addRatings,       // New
    getRatings,
    addAlternative,
    updateAlternative,
    deleteAlternative,
    addCriterion,
    updateCriterion,
    deleteCriterion,
    // getDecisionOutcome, // Removed or commented out, as it's now part of calculateScores
    calculateScores, // Added this import
} = require('../controllers/decisionController');

// Decision CRUD Routes
router.route('/')
    .get(protect, getDecisions)      // Get all decisions for user
    .post(protect, createDecision);  // Create a new decision

router.route('/:id')
    .get(protect, getDecisionById)   // Get a specific decision
    .put(protect, updateDecision)    // Update a specific decision
    .delete(protect, deleteDecision); // Delete a specific decision

// New Rating Routes
router.route('/:id/ratings')
    .post(protect, addRatings) // Route to add/update ratings for a decision
    .get(protect, getRatings);

// Route for calculating scores - NEWLY ADDED
router.post('/:id/calculate-scores', protect, calculateScores);

// Alternative Routes
router.route('/:id/alternatives')
    .post(protect, addAlternative); // Add an alternative to a decision

// router.route('/:decisionId/outcome').get(protect, getDecisionOutcome); // Removed or commented out

router.route('/:decisionId/alternatives/:alternativeId')
    .put(protect, updateAlternative)   // Update a specific alternative
    .delete(protect, deleteAlternative); // Delete a specific alternative

// Criterion Routes
router.route('/:id/criteria')
    .post(protect, addCriterion);     // Add a criterion to a decision

router.route('/:decisionId/criteria/:criterionId')
    .put(protect, updateCriterion)     // Update a specific criterion
    .delete(protect, deleteCriterion);   // Delete a specific criterion

module.exports = router;