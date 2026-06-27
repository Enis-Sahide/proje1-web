const https = require('https');

https.get('https://sos70.ru/', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    const regex = /<img[^>]+src="([^">]+)"/g;
    let match;
    console.log("Found images:");
    while ((match = regex.exec(data)) !== null) {
      console.log(match[1]);
    }
  });
}).on('error', (err) => {
  console.error("Error: " + err.message);
});
