const mysql = require('mysql2/promise');
require('dotenv').config();

// Create connection pool for better performance and connection management
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'hotel_management',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
});

// Test database connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
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