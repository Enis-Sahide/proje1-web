import 'server-only';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

// HMR/Fast-Refresh ve production ortamında bağlantı havuzunun tekil kalmasını sağla
const globalForDb = globalThis as unknown as { __pgPool?: Pool };

function createPool(): Pool {
  const p = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 15,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    keepAlive: true,
    query_timeout: 8000,
  });
  p.on('error', (err) => {
    console.warn('[pgPool] Unexpected idle client error:', err?.message || err);
  });
  return p;
}

const pool = globalForDb.__pgPool ?? createPool();
globalForDb.__pgPool = pool;

export const db = drizzle(pool, { schema });
export type DB = typeof db;
