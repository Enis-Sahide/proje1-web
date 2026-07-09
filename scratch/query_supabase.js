const supabaseUrl = 'https://mbqjklupfoqbcfxusigs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1icWprbHVwZm9xYmNmeHVzaWdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1NjAwODUsImV4cCI6MjA5NDEzNjA4NX0.Cui6UeIXESWXTfZex040sHg59SIa5vy6p3GaLdy7RPg';

async function main() {
  const res = await fetch(`${supabaseUrl}/rest/v1/profiles?select=*`, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  });
  const data = await res.json();
  console.log('Total profiles:', data.length);
  for (const p of data) {
    console.log(`ID: ${p.id} | Name: ${p.full_name} | Role: ${p.role}`);
  }
}

main().catch(console.error);
