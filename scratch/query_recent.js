const { Client } = require('pg');

const connectionString = 'postgres://postgres:xGtUbKPNz7DpnNG45VIoSDRBMdDfmsLIYn2yY8vh0MALau0doKYoLftb6YFfVKHC@159.195.76.234:5447/postgres';

async function main() {
  const client = new Client({ connectionString });
  await client.connect();

  const activityRes = await client.query(`
    SELECT 
      u.email, 
      u.full_name, 
      p.role,
      (
        SELECT s.created_at 
        FROM sessions s 
        WHERE s.user_id = u.id AND s.expires_at > NOW() AND s.revoked_at IS NULL 
        ORDER BY s.created_at DESC 
        LIMIT 1
      ) as last_session_created,
      (
        SELECT COUNT(*)::int 
        FROM sessions s 
        WHERE s.user_id = u.id AND s.expires_at > NOW() AND s.revoked_at IS NULL
      ) as active_sessions_count
    FROM users u
    LEFT JOIN profiles p ON p.user_id = u.id
    ORDER BY last_session_created DESC NULLS LAST
  `);

  console.log('\n=== EN SON AKTİF OTURUM AÇANLAR ===');
  activityRes.rows.forEach((row, index) => {
    if (row.last_session_created) {
      console.log(`${index + 1}. ${row.full_name || 'İsimsiz'} (${row.email})`);
      console.log(`   Rol: ${row.role} | En Son Oturum Başlangıcı: ${row.last_session_created} | Toplam Aktif Oturum: ${row.active_sessions_count}`);
    } else {
      console.log(`${index + 1}. ${row.full_name || 'İsimsiz'} (${row.email}) - Aktif Oturumu Yok`);
    }
  });

  await client.end();
}

main().catch(console.error);
