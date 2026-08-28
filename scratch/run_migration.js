const { Client } = require('pg');

const connectionString = 'postgres://postgres:xGtUbKPNz7DpnNG45VIoSDRBMdDfmsLIYn2yY8vh0MALau0doKYoLftb6YFfVKHC@159.195.76.234:5447/postgres';

async function main() {
  const client = new Client({ connectionString });
  await client.connect();
  console.log("Connected to database!");
  
  try {
    console.log("Adding country column...");
    await client.query(`ALTER TABLE "site_visits" ADD COLUMN IF NOT EXISTS "country" text;`);
    
    console.log("Adding region column...");
    await client.query(`ALTER TABLE "site_visits" ADD COLUMN IF NOT EXISTS "region" text;`);
    
    console.log("Adding city column...");
    await client.query(`ALTER TABLE "site_visits" ADD COLUMN IF NOT EXISTS "city" text;`);
    
    console.log("Adding user_id column...");
    await client.query(`ALTER TABLE "site_visits" ADD COLUMN IF NOT EXISTS "user_id" uuid;`);
    
    console.log("Adding foreign key constraint...");
    try {
      await client.query(`
        ALTER TABLE "site_visits" 
        ADD CONSTRAINT "site_visits_user_id_users_id_fk" 
        FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL;
      `);
      console.log("Foreign key constraint added.");
    } catch (e) {
      if (e.code === '42710') {
        console.log("Foreign key constraint already exists.");
      } else {
        throw e;
      }
    }
    
    console.log("Migration successful!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await client.end();
  }
}

main();
