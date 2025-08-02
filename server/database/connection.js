"use server";
const { neon } = require('@neondatabase/serverless');
const { config } = require('../config/index.js');

if (!config.database.url) {
  throw new Error('DATABASE_URL is not set');
}

const sql = neon(config.database.url);

const testConnection = async () => {
  try {
    await sql`SELECT 1`;
    console.log('✅ Database connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

const exportedModule = { sql, testConnection };
console.log('Exporting from connection.js:', exportedModule);
module.exports = exportedModule; 