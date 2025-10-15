const app = require('./app')
const { testConnection } = require('./config/db')

const PORT = process.env.PORT || 5000

(async () => {
  try {
    await testConnection();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
})();