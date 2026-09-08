/**
 * src/db/check.js
 * Database health check utility for WK Community OS.
 * Verifies MySQL connectivity by executing a simple SELECT 1 query.
 */

const pool = require('./pool');

async function checkDatabase() {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.query('SELECT 1');
    return { status: 'connected', message: 'Database connection successful.' };
  } catch (error) {
    return {
      status: 'disconnected',
      message: error.message || 'Database connection failed.',
      code: error.code || 'UNKNOWN',
    };
  } finally {
    if (connection) connection.release();
  }
}

module.exports = { checkDatabase };

