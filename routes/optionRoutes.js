// routes/optionRoutes.js
const express = require('express');
const {
  createOption,
  getOptions,
  getOptionById,
  updateOption,
  deleteOption
} = require('../controllers/optionController');
const { protect } = require('../middleware/authMiddleware'); // Import protect middleware

// We use { mergeParams: true } for nesting
const router = express.Router({ mergeParams: true });

// All routes here will use the 'protect' middleware
router.route('/')
  .post(protect, createOption) // POST /api/decisions/:decisionId/options
  .get(protect, getOptions);   // GET /api/decisions/:decisionId/options

router.route('/:id') // :id refers to the option's ID
  .get(protect, getOptionById)    // GET /api/decisions/:decisionId/options/:id
  .put(protect, updateOption)     // PUT /api/decisions/:decisionId/options/:id
  .delete(protect, deleteOption); // DELETE /api/decisions/:decisionId/options/:id

module.exports = router;