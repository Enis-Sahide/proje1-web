const https = require('https');

https.get('https://resonanceone.app/api/now', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log(JSON.stringify(json, null, 2));
    } catch (e) {
      console.log("Error parsing JSON:", e.message);
      console.log("Raw response:", data);
    }
  });
}).on('error', (err) => {
  console.error("Error: " + err.message);
});
