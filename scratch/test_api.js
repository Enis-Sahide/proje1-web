const http = require('http');

http.get('http://localhost:3000/api/schumann', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log("Schumann Index:", json.schumann_index);
      console.log("Translated Summary:", json.summary);
      console.log("Translated Tip:", json.tip);
    } catch (e) {
      console.error("JSON parse error:", e.message);
      console.log("Raw Response:", data);
    }
  });
}).on('error', (err) => {
  console.error("HTTP GET Error:", err.message);
});
