const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// SSL Configuration for Aiven
let sslConfig = false;
if (process.env.DB_SSL === 'true') {
  const caPath = path.join(__dirname, '../../certs/ca.pem');
  
  // Check if CA certificate exists
  if (fs.existsSync(caPath)) {
    console.log('Using CA certificate for SSL connection');
    sslConfig = {
      ca: fs.readFileSync(caPath),
      rejectUnauthorized: true
    };
  } else {
    console.warn('CA certificate not found, using rejectUnauthorized: false');
    sslConfig = {
      rejectUnauthorized: false
    };
  }
}

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'hotel_management',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true,
  charset: 'utf8mb4',
  connectTimeout: 30000, // 30 seconds timeout
  ssl: process.env.DB_SSL === 'true' ? {
    rejectUnauthorized: false  // Set to false for Aiven with self-signed certs
  } : false
});

const testConnection = async () => {
  try {
    console.log('Testing database connection...');
    console.log(`Host: ${process.env.DB_HOST}`);
    console.log(`Port: ${process.env.DB_PORT}`);
    console.log(`Database: ${process.env.DB_NAME}`);
    console.log(`User: ${process.env.DB_USER}`);
    console.log(`SSL: ${process.env.DB_SSL}`);
    
    const connection = await pool.getConnection();
    console.log('✓ Successfully connected to database');
    
    await connection.execute("SET sql_mode = REPLACE(@@sql_mode, 'ONLY_FULL_GROUP_BY', '')");
    console.log('✓ SQL mode configured');
    
    connection.release();
    return true;
  } catch (error) {
    console.error('✗ Database connection failed:', error.message);
    console.error('Error code:', error.code);
    console.error('Error errno:', error.errno);
    
    // Provide helpful error messages
    if (error.code === 'ECONNREFUSED') {
      console.error('→ Connection refused. Check if the host and port are correct.');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('→ Access denied. Check your username and password.');
    } else if (error.code === 'ENOTFOUND') {
      console.error('→ Host not found. Check your DB_HOST setting.');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('→ Connection timeout. Check your firewall or network settings.');
    } else if (error.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE') {
      console.error('→ SSL certificate verification failed. Download the CA certificate from Aiven.');
    }
    
    return false;
  }
};

// Generic query executor with error handling
const executeQuery = async (query, params = []) => {
  try {
    const [rows] = await pool.execute(query, params);
    return { success: true, data: rows };
  } catch (error) {
    console.error('Database query error:', error);
    return { success: false, error: error.message };
  }
};

// Get single record
const findOne = async (query, params = []) => {
  const result = await executeQuery(query, params);
  if (result.success && result.data.length > 0) {
    return { success: true, data: result.data[0] };
  }
  return { success: false, data: null };
};

// Get multiple records
const findMany = async (query, params = []) => {
  return await executeQuery(query, params);
};

// Insert record
const insertRecord = async (query, params = []) => {
  try {
    const [result] = await pool.execute(query, params);
    return { success: true, insertId: result.insertId, affectedRows: result.affectedRows };
  } catch (error) {
    console.error('Insert error:', error);
    return { success: false, error: error.message };
  }
};

// Update record
const updateRecord = async (query, params = []) => {
  try {
    const [result] = await pool.execute(query, params);
    return { success: true, affectedRows: result.affectedRows };
  } catch (error) {
    console.error('Update error:', error);
    return { success: false, error: error.message };
  }
};

// Delete record
const deleteRecord = async (query, params = []) => {
  try {
    const [result] = await pool.execute(query, params);
    return { success: true, affectedRows: result.affectedRows };
  } catch (error) {
    console.error('Delete error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  pool,
  testConnection,
  executeQuery,
  findOne,
  findMany,
  insertRecord,
  updateRecord,
  deleteRecord
};