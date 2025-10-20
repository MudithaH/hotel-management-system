/**
 * Database Connection Test Script
 * Run this to verify your Aiven database connection
 */

require('dotenv').config();
const { testConnection, pool } = require('./src/config/db');

const runTest = async () => {
  console.log('=================================================');
  console.log('  Aiven Database Connection Test');
  console.log('=================================================\n');

  // Test basic connection
  const isConnected = await testConnection();
  
  if (isConnected) {
    console.log('\n✓ SUCCESS: Database connection is working!\n');
    
    // Try a simple query
    try {
      console.log('Testing query execution...');
      const [rows] = await pool.query('SELECT 1 + 1 AS result');
      console.log('✓ Query test passed:', rows);
      
      // Show database info
      const [dbInfo] = await pool.query('SELECT DATABASE() as db, VERSION() as version');
      console.log('\nDatabase Information:');
      console.log('  Database:', dbInfo[0].db);
      console.log('  MySQL Version:', dbInfo[0].version);
      
      // Show tables
      const [tables] = await pool.query('SHOW TABLES');
      console.log('\nTables in database:');
      if (tables.length > 0) {
        tables.forEach(table => {
          console.log('  -', Object.values(table)[0]);
        });
      } else {
        console.log('  (No tables found - database might need initialization)');
      }
      
    } catch (error) {
      console.error('\n✗ Query execution failed:', error.message);
    }
    
    await pool.end();
    console.log('\n=================================================');
    console.log('  Connection test completed successfully!');
    console.log('=================================================\n');
    process.exit(0);
    
  } else {
    console.log('\n✗ FAILED: Could not connect to database');
    console.log('\nPlease check:');
    console.log('  1. Your .env file has correct credentials');
    console.log('  2. Your Aiven service is running');
    console.log('  3. Your IP is whitelisted (if filtering is enabled)');
    console.log('  4. You have downloaded the CA certificate to backend/certs/ca.pem');
    console.log('\nSee AIVEN_CONNECTION_GUIDE.md for detailed troubleshooting.\n');
    
    await pool.end();
    process.exit(1);
  }
};

runTest().catch(error => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
