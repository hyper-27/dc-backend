// backend/routes/ratingRoutes.js

const express = require('express');
const router = express.Router({ mergeParams: true }); // Allows access to params from parent route
const { protect } = require('../middleware/authMiddleware');
const { createOrUpdateRating, getRatingsForDecision } = require('../controllers/ratingController');

// Routes for ratings within a specific decision
router.route('/').post(protect, createOrUpdateRating); // POST to create/update a rating
router.route('/').get(protect, getRatingsForDecision); // GET all ratings for a decision

module.exports = router;