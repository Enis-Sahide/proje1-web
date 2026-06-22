import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

// Standalone (Next.js dışı) drizzle-kit komutları için .env.local'i yükle.
config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL .env.local içinde tanımlı değil');
}

export default defineConfig({
  schema: './src/db/schema/index.ts',
  out: './src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  verbose: true,
  strict: true,
});
