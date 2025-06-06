// backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Library for password hashing

// Define the schema for a User
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,      // Username is mandatory
    unique: true,        // Each username must be unique
    trim: true,          // Remove whitespace from ends
    minlength: 3         // Minimum length for username
  },
  password: {
    type: String,
    required: true,      // Password is mandatory
    minlength: 6         // Minimum length for password
  }
}, {
  timestamps: true       // Mongoose automatically adds 'createdAt' and 'updatedAt' fields
});

// Middleware to hash the password before saving a new user (or updating password)
userSchema.pre('save', async function(next) {
  // Only hash if the password has been modified (e.g., on creation or explicit password change)
  if (!this.isModified('password')) {
    return next(); // If password hasn't changed, move to the next middleware
  }
  // Generate a salt (random string) to add to the password before hashing
  const salt = await bcrypt.genSalt(10); // 10 is a good default "cost factor"
  // Hash the password using the generated salt
  this.password = await bcrypt.hash(this.password, salt);
  next(); // Move to the next middleware or save operation
});

// Method to compare an entered plain-text password with the stored hashed password
userSchema.methods.matchPassword = async function(enteredPassword) {
  console.log('--- Inside matchPassword ---'); // DEBUG LOG
  console.log('Entered Password (plain):', enteredPassword); // DEBUG LOG
  console.log('Stored Hashed Password:', this.password); // DEBUG LOG
  try {
    const isMatch = await bcrypt.compare(enteredPassword, this.password);
    console.log('Passwords match result (from bcrypt.compare):', isMatch); // DEBUG LOG
    return isMatch;
  } catch (error) {
    console.error('Bcrypt comparison error:', error); // DEBUG LOG
    return false;
  }
};

// Create the Mongoose Model from the schema
const User = mongoose.model('User', userSchema);

module.exports = User; // Export the User model for use in other files