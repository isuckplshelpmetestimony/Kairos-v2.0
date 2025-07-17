import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export const testConnection = async () => {
  try {
    await sql`SELECT 1`;
    console.log('✅ Database connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

export default sql; 