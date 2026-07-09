const { Client } = require('pg');

const connectionString = 'postgres://postgres:xGtUbKPNz7DpnNG45VIoSDRBMdDfmsLIYn2yY8vh0MALau0doKYoLftb6YFfVKHC@159.195.76.234:5447/postgres';

async function main() {
  const client = new Client({ connectionString });
  await client.connect();
  console.log('Connected to DB');

  // List all databases
  const resDbs = await client.query(`
    SELECT datname FROM pg_database WHERE datistemplate = false
  `);
  console.log('Databases:', resDbs.rows.map(r => r.datname));

  // List all schemas in the current database
  const resSchemas = await client.query(`
    SELECT schema_name FROM information_schema.schemata
  `);
  console.log('Schemas:', resSchemas.rows.map(r => r.schema_name));

  await client.end();
}

main().catch(console.error);
