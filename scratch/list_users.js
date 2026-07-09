const { Client } = require('pg');

const connectionString = 'postgres://postgres:xGtUbKPNz7DpnNG45VIoSDRBMdDfmsLIYn2yY8vh0MALau0doKYoLftb6YFfVKHC@159.195.76.234:5447/postgres';

async function main() {
  const client = new Client({ connectionString });
  await client.connect();
  console.log('Connected to DB');

  const res = await client.query('SELECT id, email, full_name, created_at FROM users ORDER BY created_at DESC');
  console.log('All users sorted by date:', res.rows);

  await client.end();
}

main().catch(console.error);
