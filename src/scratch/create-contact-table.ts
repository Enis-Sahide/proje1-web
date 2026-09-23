import { config } from 'dotenv';
config({ path: '.env.local' });

import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  console.log('Creating contact_messages table if not exists...');
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "contact_messages" (
        "id" text PRIMARY KEY,
        "name" text NOT NULL,
        "email" text NOT NULL,
        "subject_category" text DEFAULT 'Genel Danışma' NOT NULL,
        "order_code" text,
        "message" text NOT NULL,
        "status" text DEFAULT 'unread' NOT NULL,
        "admin_reply" text,
        "replied_at" timestamp,
        "created_at" timestamp DEFAULT now() NOT NULL
      );
      CREATE INDEX IF NOT EXISTS "idx_contact_messages_status" ON "contact_messages" ("status");
      CREATE INDEX IF NOT EXISTS "idx_contact_messages_created_at" ON "contact_messages" ("created_at" DESC);
    `);
    console.log('Successfully ensured contact_messages table exists in PostgreSQL!');
  } catch (err) {
    console.error('Error creating table:', err);
  } finally {
    await pool.end();
  }
}

main();
