/**
 * Server Entry Point
 * Starts the Express server and handles database connection
 */

const app = require('./app');
const { testConnection } = require('./config/db');

// Get port from environment or default to 5000
const PORT = process.env.PORT || 5000;

// Start server function
const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error('❌ Cannot start server: Database connection failed');
      process.exit(1);
    }

    // Start Express server
    const server = app.listen(PORT, () => {
      console.log(`📡 Server running on port ${PORT}`);
    });

    return server;

  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Start the server
startServer();


module.exports = { startServer };