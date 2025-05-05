const express = require('express');
const cors = require('cors');
const { getConnection } = require('./config/db');
const tablesRouter = require('./routes/tables');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Debug route
app.get('/debug', (req, res) => {
  res.json({
    message: 'Debug endpoint working',
    time: new Date().toISOString(),
    routes: {
      tables: '/api/tables/:tableName',
      health: '/health'
    }
  });
});

// Routes
app.use('/api/tables', tablesRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[SERVER] Error details:', {
    message: err.message,
    stack: err.stack,
    originalError: err.originalError
  });

  // Ensure we always send JSON responses
  res.status(500).json({ 
    error: 'Something went wrong!',
    details: {
      message: err.message,
      code: err.code,
      state: err.state
    }
  });
});

// Start server
app.listen(port, async () => {
  try {
    await getConnection();
    console.log(`Server is running on port ${port}`);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}); 