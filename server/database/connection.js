const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

const testConnection = async () => {
  try {
    const result = await sql`SELECT NOW()`;
    console.log('✅ Database connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
};

module.exports = { sql, testConnection };
