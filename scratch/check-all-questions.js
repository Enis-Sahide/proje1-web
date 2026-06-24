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
      SELECT q_key, question, options, correct_index, explanation, sort
      FROM quiz_questions
      WHERE quiz_id = 'duygusal_hastaliklar_50'
      ORDER BY sort ASC
    `);
    
    console.log(`Total questions: ${res.rows.length}`);
    for (const row of res.rows) {
      if (!row.options || row.options.length === 0) {
        console.log(`❌ Question ${row.q_key} (sort: ${row.sort}) has no options!`);
      } else if (row.correct_index === null || row.correct_index === undefined || row.correct_index < 0 || row.correct_index >= row.options.length) {
        console.log(`❌ Question ${row.q_key} (sort: ${row.sort}) has invalid correct_index: ${row.correct_index}`);
      } else {
        const correctText = row.options[row.correct_index];
        if (!correctText) {
          console.log(`❌ Question ${row.q_key} (sort: ${row.sort}) has null correct option at index ${row.correct_index}`);
        }
      }
      // Check if question text is cut off or suspicious
      if (row.question.includes('hariç') && !row.question.includes('bırakıldığı')) {
        console.log(`⚠️ Question ${row.q_key} (sort: ${row.sort}) question text is cut off: "${row.question}"`);
      }
    }
    console.log("Check complete.");
  } catch (err) {
    console.error(err);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
