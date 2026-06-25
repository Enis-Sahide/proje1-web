const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function main() {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT u.id, u.email, p.role, pr.passed_exams
      FROM users u
      LEFT JOIN profiles p ON p.user_id = u.id
      LEFT JOIN user_progress pr ON pr.user_id = u.id
      ORDER BY u.created_at DESC
      LIMIT 10
    `);
    
    console.log("Last 10 users in DB:");
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
