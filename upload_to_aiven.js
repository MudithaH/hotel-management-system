#!/usr/bin/env node

/**
 * Upload Database to Aiven
 * This script uploads the SQL schema and stored procedures to Aiven MySQL
 */

const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

// AIVEN CONNECTION DETAILS
// Replace these with your actual Aiven connection details
const AIVEN_CONFIG = {
  host: 'skynest-database-databaseproject-616.b.aivencloud.com',
  port: 21937,
  user: 'avnadmin',
  password: 'AVNS_9ZKGn8oXGKK1XBypXSh',
  database: 'defaultdb',
  ssl: {
    rejectUnauthorized: true // Set to false if you're having SSL issues
  },
  multipleStatements: true // Required for running multiple SQL statements
};

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m'
};

async function uploadDatabase() {
  let connection;
  
  try {
    console.log(`${colors.yellow}================================${colors.reset}`);
    console.log(`${colors.yellow}Aiven Database Upload Script${colors.reset}`);
    console.log(`${colors.yellow}================================${colors.reset}\n`);

    // Connect to Aiven
    console.log(`${colors.yellow}Connecting to Aiven...${colors.reset}`);
    connection = await mysql.createConnection(AIVEN_CONFIG);
    console.log(`${colors.green}✓ Connected successfully${colors.reset}\n`);

    // Read schema.sql
    console.log(`${colors.yellow}Reading schema.sql...${colors.reset}`);
    const schemaPath = path.join(__dirname, 'backend', 'schema.sql');
    const schemaSQL = await fs.readFile(schemaPath, 'utf8');
    
    // Execute schema
    console.log(`${colors.yellow}Uploading schema...${colors.reset}`);
    await connection.query(schemaSQL);
    console.log(`${colors.green}✓ Schema uploaded successfully${colors.reset}\n`);

    // Read complete_database_setup.sql
    console.log(`${colors.yellow}Reading stored procedures...${colors.reset}`);
    const proceduresPath = path.join(__dirname, 'backend', 'complete_database_setup.sql');
    const proceduresSQL = await fs.readFile(proceduresPath, 'utf8');
    
    // Execute stored procedures
    console.log(`${colors.yellow}Uploading stored procedures...${colors.reset}`);
    await connection.query(proceduresSQL);
    console.log(`${colors.green}✓ Stored procedures uploaded successfully${colors.reset}\n`);

    console.log(`${colors.green}================================${colors.reset}`);
    console.log(`${colors.green}Database upload completed!${colors.reset}`);
    console.log(`${colors.green}================================${colors.reset}`);

  } catch (error) {
    console.error(`${colors.red}Error:${colors.reset}`, error.message);
    console.error(error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the upload
uploadDatabase();
