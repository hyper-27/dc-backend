// routes/outcomeRuleRoutes.js
const express = require('express');
const {
  createOutcomeRule,
  getSuggestionsByTag,
  getAllOutcomeRules,
  updateOutcomeRule,
  deleteOutcomeRule
} = require('../controllers/outcomeRuleController');
const { protect } = require('../middleware/authMiddleware'); // Import protect middleware

const router = express.Router();

// Routes for managing Outcome Rules (admin-like functions, but protected by user auth for now)
router.route('/')
  .post(protect, createOutcomeRule) // POST /api/outcome-rules
  .get(protect, getAllOutcomeRules); // GET /api/outcome-rules

router.route('/:tag')
  .put(protect, updateOutcomeRule) // PUT /api/outcome-rules/:tag
  .delete(protect, deleteOutcomeRule); // DELETE /api/outcome-rules/:tag

// Route for getting suggestions for a specific tag (the 'Future Machine' endpoint)
router.get('/:tag/suggestions', protect, getSuggestionsByTag); // GET /api/outcome-rules/:tag/suggestions


module.exports = router;