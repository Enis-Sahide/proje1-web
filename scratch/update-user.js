const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function main() {
  const client = await pool.connect();
  const targetEmail = 'test_1591526473@example.com';
  try {
    // 1) Find the user
    const userRes = await client.query('SELECT id, email FROM users WHERE email = $1', [targetEmail]);
    if (userRes.rows.length === 0) {
      console.log(`User not found: ${targetEmail}`);
      return;
    }
    const userId = userRes.rows[0].id;
    console.log(`Found user: ${targetEmail} (ID: ${userId})`);

    // 2) Update role in profiles table
    const updateRes = await client.query(
      'UPDATE profiles SET role = $1 WHERE user_id = $2 RETURNING *',
      ['apprentice', userId]
    );

    if (updateRes.rows.length > 0) {
      console.log('Update successful! Profile details:');
      console.log(JSON.stringify(updateRes.rows[0], null, 2));
    } else {
      console.log('Update failed, no profile row found for user id.');
    }
  } catch (err) {
    console.error('Error during update:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
