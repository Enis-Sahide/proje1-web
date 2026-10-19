import { config } from 'dotenv';
config({ path: '.env.local' });
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  console.log('Migrating blog categories...');
  await pool.query("UPDATE blog_posts SET category = 'Astroloji' WHERE category = 'Farkındalık & Astroloji'");
  await pool.query("UPDATE blog_posts SET category = 'Ruhsal Gelişim' WHERE category = 'Farkındalık & Şifa'");
  await pool.query("UPDATE blog_posts SET category = 'Ezoterik' WHERE category = 'Kadim Bilgelik'");
  
  const res = await pool.query("SELECT category, count(id) as count FROM blog_posts GROUP BY category ORDER BY count(id) DESC");
  console.log('Consolidated Categories in DB:');
  console.table(res.rows);
  await pool.end();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
