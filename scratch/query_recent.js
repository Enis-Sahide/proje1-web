const { Client } = require('pg');

const connectionString = 'postgres://postgres:xGtUbKPNz7DpnNG45VIoSDRBMdDfmsLIYn2yY8vh0MALau0doKYoLftb6YFfVKHC@159.195.76.234:5447/postgres';

async function main() {
  const client = new Client({ connectionString });
  await client.connect();

  const userRes = await client.query(`
    SELECT u.id, u.email, u.full_name, p.role, u.created_at, u.updated_at
    FROM users u
    LEFT JOIN profiles p ON p.user_id = u.id
    WHERE u.email = 'testuser12345@gmail.com'
  `);

  console.log('=== TEST USER DETAILS ===');
  console.log(JSON.stringify(userRes.rows, null, 2));

  if (userRes.rows.length > 0) {
    const userId = userRes.rows[0].id;
    const sessionsRes = await client.query(`
      SELECT id, expires_at, revoked_at, user_agent, created_at
      FROM sessions
      WHERE user_id = $1
      ORDER BY created_at DESC
    `, [userId]);
    console.log('\n=== TEST USER SESSIONS ===');
    console.log(JSON.stringify(sessionsRes.rows, null, 2));
  }

  await client.end();
}

main().catch(console.error);
