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
    // 1) Find user
    const userRes = await client.query('SELECT id, email FROM users WHERE email = $1', [targetEmail]);
    if (userRes.rows.length === 0) {
      console.log(`User not found: ${targetEmail}`);
      return;
    }
    const userId = userRes.rows[0].id;
    console.log(`Found user: ${targetEmail} (ID: ${userId})`);

    // 2) Update user_progress passed_exams to array containing ENTRY_EXAMS
    const progressRes = await client.query(
      "UPDATE user_progress SET passed_exams = ARRAY['aura', 'duygusal_hastaliklar_50']::text[] WHERE user_id = $1 RETURNING *",
      [userId]
    );

    console.log('Update progress success:', JSON.stringify(progressRes.rows[0], null, 2));

    // 3) Also update profiles role to apprentice just in case
    const profileRes = await client.query(
      "UPDATE profiles SET role = 'apprentice' WHERE user_id = $1 RETURNING *",
      [userId]
    );

    console.log('Update profile success:', JSON.stringify(profileRes.rows[0], null, 2));
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
