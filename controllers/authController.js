// backend/controllers/authController.js
const User = require('../models/User'); // Import the User model
const jwt = require('jsonwebtoken');     // Library for JSON Web Tokens

// Helper function to generate a JWT (JSON Web Token)
const generateToken = (id) => {
  // Sign the token with the user's ID, your secret key, and an expiration time
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d', // Token expires in 30 days (adjust as needed)
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public (anyone can access this to create an account)
exports.registerUser = async (req, res) => {
  const { username, password } = req.body; // Get username and password from request body

  console.log('--- Register Attempt Received ---');
  console.log('Request Body:', req.body); // Log the entire request body for registration

  try {
    // 1. Check if a user with this username already exists
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' }); // Send error if exists
    }

    // 2. Create the new user in the database
    // The password will be automatically hashed by the 'pre-save' hook in the User model
    const user = await User.create({
      username,
      password,
    });

    // 3. If user created successfully, send a success response
    if (user) {
      res.status(201).json({ // 201 Created status
        _id: user._id,
        username: user.username,
        token: generateToken(user._id), // Generate and send a token
        message: 'Registration successful!'
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }

  } catch (error) {
    console.error('Registration error:', error); // Log the error for debugging
    res.status(500).json({ message: 'Server error during registration' }); // Generic server error
  }
};

// @desc    Authenticate user & get token (Login)
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
  const { username, password } = req.body; // Get username and password from request body

  console.log('--- Login Attempt Received ---');
  console.log('Request Body:', req.body); // Log the entire request body for login

  try {
    // 1. Check if the user exists by finding them by username
    const user = await User.findOne({ username });

    // 2. If user doesn't exist OR password doesn't match
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' }); // 401 Unauthorized
    }

    // 3. If credentials are valid, send success response with user info and a token
    res.json({
      _id: user._id,
      username: user.username,
      token: generateToken(user._id), // Generate and send a token
      message: 'Login successful!'
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};