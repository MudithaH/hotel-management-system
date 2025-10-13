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
      console.log('🚀 Hotel Management System API Server Started');
      console.log(`📡 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📝 API Documentation available at: http://localhost:${PORT}/api/health`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    });

    // Graceful shutdown handling
    const gracefulShutdown = (signal) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      
      server.close((err) => {
        if (err) {
          console.error('Error during server shutdown:', err);
          process.exit(1);
        }
        
        console.log('✅ Server closed successfully');
        process.exit(0);
      });

      // Force shutdown after 30 seconds
      setTimeout(() => {
        console.error('⚠️  Forceful shutdown after timeout');
        process.exit(1);
      }, 3000);
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    return server;

  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Start the server
if (require.main === module) {
  startServer();
}

module.exports = { startServer };