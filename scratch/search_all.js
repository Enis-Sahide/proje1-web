const { Client } = require('pg');

const connectionString = 'postgres://postgres:xGtUbKPNz7DpnNG45VIoSDRBMdDfmsLIYn2yY8vh0MALau0doKYoLftb6YFfVKHC@159.195.76.234:5447/postgres';

async function main() {
  const client = new Client({ connectionString });
  await client.connect();
  console.log('Connected to DB');

  const searchTerm = 'lalezar_28@hotmail.com';
  console.log(`Searching for: ${searchTerm}`);

  const resTables = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
  `);

  for (const table of resTables.rows.map(r => r.table_name)) {
    try {
      const resCols = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = $1
      `, [table]);

      for (const col of resCols.rows.map(c => c.column_name)) {
        try {
          const searchRes = await client.query(`
            SELECT * FROM "${table}" 
            WHERE CAST("${col}" AS TEXT) ILIKE $1
          `, [`%${searchTerm}%`]);

          if (searchRes.rows.length > 0) {
            console.log(`FOUND in table "${table}" | column "${col}":`, searchRes.rows);
          }
        } catch (e) {
          // ignore column-specific errors
        }
      }
    } catch (e) {}
  }

  await client.end();
}

main().catch(console.error);
