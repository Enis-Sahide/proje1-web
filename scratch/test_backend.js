async function main() {
  console.log('Fetching renozans-backend.baha.tr...');
  try {
    const res = await fetch('https://renozans-backend.baha.tr/');
    console.log('Status:', res.status);
    const body = await res.text();
    console.log('Body:', body.substring(0, 1000));
  } catch (e) {
    console.error('Error fetching backend:', e);
  }
}

main().catch(console.error);
