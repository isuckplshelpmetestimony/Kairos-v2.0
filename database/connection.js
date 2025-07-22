const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

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

module.exports = { sql, testConnection }; 