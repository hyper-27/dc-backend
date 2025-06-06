// server.js

// 1. Load environment variables first
require('dotenv').config();

// 2. Import necessary modules
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// 3. Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000; // Use port from .env or default to 5000

// 4. Middleware
app.use(express.json()); // Body parser for JSON requests
app.use(cors({
  origin: process.env.FRONTEND_URL, // Your Vercel frontend URL from .env
  credentials: true,
}));

// 5. MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB Atlas connected successfully!'))
  .catch(err => console.error('MongoDB connection error:', err));

  const authRoutes = require('./routes/authRoutes');
  const decisionRoutes = require('./routes/decisionRoutes');
  const criteriaRoutes = require('./routes/criteriaRoutes');
  const optionRoutes = require('./routes/optionRoutes');
  const outcomeRuleRoutes = require('./routes/outcomeRuleRoutes');
  const ratingRoutes = require('./routes/ratingRoutes');

// 6. Basic Route (for testing if server is running)
app.get('/', (req, res) => {
  res.send('Decision Compass Backend API is running!');
});

app.use('/api/auth', authRoutes);
app.use('/api/decisions', decisionRoutes); 
// Mount criteria routes under decision routes
decisionRoutes.use('/:decisionId/criteria', criteriaRoutes);
decisionRoutes.use('/:decisionId/options', optionRoutes);
decisionRoutes.use('/:decisionId/ratings', ratingRoutes);
app.use('/api/outcome-rules', outcomeRuleRoutes);

// 7. Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Frontend URL expected: ${process.env.FRONTEND_URL}`); // For verification
});