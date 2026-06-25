const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function main() {
  const client = await pool.connect();
  const targetEmail = 'smoke_791910523@example.com';
  
  // All entry exams and level 1 exams
  const examsToPass = [
    'aura', 
    'duygusal_hastaliklar_50', 
    'akupunktur_1', 
    'kabbalah_1', 
    'astroloji_1', 
    'human_1', 
    'numeroloji_1', 
    'rune1', 
    'yoga_1'
  ];

  try {
    // 1) Find user
    const userRes = await client.query('SELECT id, email FROM users WHERE email = $1', [targetEmail]);
    if (userRes.rows.length === 0) {
      console.log(`User not found: ${targetEmail}`);
      return;
    }
    const userId = userRes.rows[0].id;
    console.log(`Found user: ${targetEmail} (ID: ${userId})`);

    // 2) Update user_progress passed_exams to array containing ENTRY_EXAMS and LEVEL 1 EXAMS
    const progressRes = await client.query(
      "UPDATE user_progress SET passed_exams = $2::text[] WHERE user_id = $1 RETURNING *",
      [userId, examsToPass]
    );

    console.log('Update progress success passed_exams:', progressRes.rows[0].passed_exams);

    // 3) Make sure profiles role is apprentice
    const profileRes = await client.query(
      "UPDATE profiles SET role = 'apprentice' WHERE user_id = $1 RETURNING *",
      [userId]
    );

    console.log('Update profile role success:', profileRes.rows[0].role);
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
