// routes/authRoutes.js
const express = require('express');
// Import the controller functions
const { registerUser, loginUser } = require('../controllers/authController');

const router = express.Router(); // Create a new Express Router instance

// Define routes: POST request to /register will call registerUser function
router.post('/register', registerUser);
// Define routes: POST request to /login will call loginUser function
router.post('/login', loginUser);

module.exports = router; // Export the router to be used in server.js