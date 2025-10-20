#!/usr/bin/env node

/**
 * Verify Database Connection - Aiven vs Local
 * This script definitively shows which database you're connected to
 */

require('dotenv').config();
const { pool, executeQuery } = require('./src/config/db');

async function verifyDatabaseConnection() {
  console.log('\n🔍 DATABASE CONNECTION VERIFICATION\n');
  console.log('=' .repeat(60));
  
  try {
    // 1. Show configuration from .env
    console.log('\n📋 Configuration from .env file:');
    console.log('-'.repeat(60));
    console.log(`Host:     ${process.env.DB_HOST}`);
    console.log(`Port:     ${process.env.DB_PORT}`);
    console.log(`Database: ${process.env.DB_NAME}`);
    console.log(`User:     ${process.env.DB_USER}`);
    console.log(`SSL:      ${process.env.DB_SSL}`);
    
    // 2. Get actual connection info from MySQL
    console.log('\n🌐 Actual Connection Information:');
    console.log('-'.repeat(60));
    
    const connection = await pool.getConnection();
    
    // Get connection details
    const [hostInfo] = await connection.query('SELECT @@hostname as hostname, @@port as port');
    const [dbInfo] = await connection.query('SELECT DATABASE() as current_db');
    const [userInfo] = await connection.query('SELECT USER() as current_user_info');
    const [versionInfo] = await connection.query('SELECT VERSION() as version');
    const [sslInfo] = await connection.query("SHOW STATUS LIKE 'Ssl_cipher'");
    
    console.log(`Connected to: ${hostInfo[0].hostname}`);
    console.log(`Port:         ${hostInfo[0].port}`);
    console.log(`Database:     ${dbInfo[0].current_db}`);
    console.log(`User:         ${userInfo[0].current_user_info}`);
    console.log(`MySQL Ver:    ${versionInfo[0].version}`);
    console.log(`SSL Status:   ${sslInfo[0].Value ? '✅ Enabled (' + sslInfo[0].Value + ')' : '❌ Not enabled'}`);
    
    // 3. Determine if it's Aiven or Local
    console.log('\n🎯 Connection Type:');
    console.log('-'.repeat(60));
    
    const isAiven = hostInfo[0].hostname.includes('aivencloud') || 
                    process.env.DB_HOST.includes('aivencloud');
    const isLocal = hostInfo[0].hostname === 'localhost' || 
                    hostInfo[0].hostname === '127.0.0.1' ||
                    process.env.DB_HOST === 'localhost';
    
    if (isAiven) {
      console.log('✅ CONNECTED TO AIVEN CLOUD DATABASE');
      console.log(`   Host: ${hostInfo[0].hostname || process.env.DB_HOST}`);
      console.log(`   This is your production cloud database!`);
    } else if (isLocal) {
      console.log('⚠️  CONNECTED TO LOCAL DATABASE');
      console.log(`   Host: ${hostInfo[0].hostname}`);
      console.log(`   This is NOT Aiven - it\'s your local MySQL!`);
    } else {
      console.log(`ℹ️  CONNECTED TO: ${hostInfo[0].hostname}`);
      console.log(`   Port: ${hostInfo[0].port}`);
    }
    
    // 4. Additional verification - check table count
    console.log('\n📊 Database Contents:');
    console.log('-'.repeat(60));
    
    const [tables] = await connection.query('SHOW TABLES');
    console.log(`Tables found: ${tables.length}`);
    
    if (tables.length > 0) {
      console.log('Table list:');
      tables.forEach(table => {
        const tableName = Object.values(table)[0];
        console.log(`  - ${tableName}`);
      });
    } else {
      console.log('⚠️  No tables found in this database!');
    }
    
    // 5. Check for stored procedures
    const [procedures] = await connection.query(
      "SHOW PROCEDURE STATUS WHERE Db = ?", 
      [process.env.DB_NAME]
    );
    console.log(`\nStored Procedures: ${procedures.length}`);
    procedures.forEach(proc => {
      console.log(`  - ${proc.Name}`);
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('\n✅ Verification Complete!\n');
    
    connection.release();
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
  } finally {
    await pool.end();
  }
}

verifyDatabaseConnection();
