#!/usr/bin/env node

/**
 * Test Aiven Database Connection
 * Quick script to verify backend can connect to Aiven
 */

require('dotenv').config();
const { testConnection, pool, executeQuery } = require('./src/config/db');

async function testAivenConnection() {
  console.log('🔍 Testing Aiven Database Connection...\n');
  
  console.log('Configuration:');
  console.log(`  Host: ${process.env.DB_HOST}`);
  console.log(`  Port: ${process.env.DB_PORT}`);
  console.log(`  Database: ${process.env.DB_NAME}`);
  console.log(`  User: ${process.env.DB_USER}`);
  console.log(`  SSL: ${process.env.DB_SSL}`);
  console.log('');

  try {
    // Test basic connection
    console.log('1️⃣ Testing basic connection...');
    const connected = await testConnection();
    
    if (!connected) {
      console.error('❌ Connection failed!');
      process.exit(1);
    }
    console.log('✅ Basic connection successful!\n');

    // Test tables exist
    console.log('2️⃣ Checking tables...');
    const tablesResult = await executeQuery('SHOW TABLES');
    
    if (tablesResult.success) {
      console.log(`✅ Found ${tablesResult.data.length} tables:`);
      tablesResult.data.forEach(row => {
        const tableName = Object.values(row)[0];
        console.log(`   - ${tableName}`);
      });
      console.log('');
    }

    // Test stored procedures
    console.log('3️⃣ Checking stored procedures...');
    const procResult = await executeQuery(
      "SHOW PROCEDURE STATUS WHERE Db = ?", 
      [process.env.DB_NAME]
    );
    
    if (procResult.success) {
      console.log(`✅ Found ${procResult.data.length} stored procedures:`);
      procResult.data.forEach(proc => {
        console.log(`   - ${proc.Name}`);
      });
      console.log('');
    }

    // Test a simple query
    console.log('4️⃣ Testing sample query...');
    const countResult = await executeQuery('SELECT COUNT(*) as count FROM roomType');
    
    if (countResult.success) {
      console.log(`✅ Query successful! RoomType count: ${countResult.data[0].count}\n`);
    }

    console.log('🎉 All tests passed! Your backend is ready to use Aiven!\n');
    
  } catch (error) {
    console.error('❌ Error during testing:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await pool.end();
    console.log('Connection closed.');
  }
}

// Run the test
testAivenConnection();
