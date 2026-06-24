const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

function correctTextOf(q) {
  const opts = q.options || [];
  return opts[q.correct_index] ?? null;
}

async function main() {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT q_key, question, options, correct_index
      FROM quiz_questions
      WHERE quiz_id = 'duygusal_hastaliklar_50'
      ORDER BY sort ASC
    `);
    
    console.log("Checking answers compatibility for duygusal_hastaliklar_50...");
    let mismatches = 0;
    
    res.rows.forEach((row, i) => {
      const options = row.options || [];
      const correctText = correctTextOf(row);
      
      // Let's check if the correctText is actually in the options list (which it should be)
      const foundIndex = options.indexOf(correctText);
      
      if (foundIndex === -1) {
        console.log(`❌ MISMATCH at row ${i + 1} (q_key: ${row.q_key}): correctText "${correctText}" not found in options!`);
        mismatches++;
      } else if (foundIndex !== row.correct_index) {
        console.log(`❌ INDEX MISMATCH at row ${i + 1} (q_key: ${row.q_key}): correct_index is ${row.correct_index} but found at ${foundIndex}`);
        mismatches++;
      } else {
        // Let's test checking logic
        const selectedAnswer = correctText;
        const isCorrect = selectedAnswer != null && String(selectedAnswer) === correctText;
        if (!isCorrect) {
          console.log(`❌ LOGIC ERROR at row ${i + 1} (q_key: ${row.q_key})`);
          mismatches++;
        }
      }
    });
    
    if (mismatches === 0) {
      console.log("✅ All answers in DB match their options perfectly!");
    } else {
      console.log(`⚠️ Found ${mismatches} mismatches!`);
    }
  } catch (err) {
    console.error(err);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
