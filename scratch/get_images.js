const https = require('https');

https.get('https://sos70.ru/?page_id=48', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    const regex = /<img[^>]+src="([^">]+)"/g;
    let match;
    console.log("Found images on page 48:");
    while ((match = regex.exec(data)) !== null) {
      console.log(match[1]);
    }
  });
}).on('error', (err) => {
  console.error("Error: " + err.message);
});
