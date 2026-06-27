const http = require('http');

http.get('http://localhost:3000/api/schumann', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log("Status Code:", res.statusCode);
    console.log("Headers:", res.headers);
    try {
      const json = JSON.parse(data);
      console.log("JSON response successfully parsed!");
      console.log("Sample keys:", Object.keys(json));
      console.log("Schumann Index:", json.schumann_index);
      console.log("Activity Label:", json.activity_index_label);
    } catch (e) {
      console.error("JSON parse error:", e.message);
      console.log("Raw Response:", data);
    }
  });
}).on('error', (err) => {
  console.error("HTTP GET Error:", err.message);
});
