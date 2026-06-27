const https = require('https');

https.get('https://services.swpc.noaa.gov/products/noaa-planetary-k-index-forecast.json', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log("Forecast items count:", json.length);
      console.log("First item:", json[0]);
      console.log("First data row:", json[1]);
      console.log("Last data row:", json[json.length - 1]);
    } catch (e) {
      console.error("Error:", e.message);
      console.log("Raw output length:", data.length);
    }
  });
}).on('error', (err) => {
  console.error("Error:", err.message);
});
