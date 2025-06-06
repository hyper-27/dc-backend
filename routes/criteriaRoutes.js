// routes/criteriaRoutes.js
const express = require('express');
const {
  createCriterion,
  getCriteria,
  getCriterionById,
  updateCriterion,
  deleteCriterion
} = require('../controllers/criteriaController');
const { protect } = require('../middleware/authMiddleware'); // Import protect middleware

// We use { mergeParams: true } because we're nesting these routes under /decisions/:decisionId
// This allows us to access req.params.decisionId from the parent router.
const router = express.Router({ mergeParams: true });

// All routes here will use the 'protect' middleware
router.route('/')
  .post(protect, createCriterion) // POST /api/decisions/:decisionId/criteria
  .get(protect, getCriteria);     // GET /api/decisions/:decisionId/criteria

router.route('/:id') // :id refers to the criterion's ID
  .get(protect, getCriterionById)    // GET /api/decisions/:decisionId/criteria/:id
  .put(protect, updateCriterion)     // PUT /api/decisions/:decisionId/criteria/:id
  .delete(protect, deleteCriterion); // DELETE /api/decisions/:decisionId/criteria/:id

module.exports = router;