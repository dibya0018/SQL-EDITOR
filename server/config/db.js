const sql = require('mssql');
require('dotenv').config({ path: require('fs').existsSync('.env') ? '.env' : 'env.txt' });

const config = {
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true',
    enableArithAbort: process.env.DB_ENABLE_ARITH_ABORT === 'true',
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  }
};

// Create a connection pool
let pool = null;

async function getConnection() {
  try {
    if (pool) {
      // Check if the pool is still connected
      try {
        await pool.request().query('SELECT 1');
        console.log('[DB] Using existing pool connection');
        return pool;
      } catch (err) {
        console.log('[DB] Pool connection lost, creating new connection');
        pool = null;
      }
    }

    pool = await new sql.ConnectionPool(config).connect();
    console.log('[DB] Successfully connected to the database');
    
    // Handle pool errors
    pool.on('error', err => {
      console.error('[DB] Pool error:', err);
      pool = null;
    });
    
    return pool;
  } catch (err) {
    console.error('[DB] Error connecting to the database:', err);
    throw err;
  }
}

module.exports = { getConnection }; 