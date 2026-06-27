const https = require('https');

function translate(text, callback) {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=tr&dt=t&q=${encodeURIComponent(text)}`;
  https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        // Google Translate returns format: [[["Translated text", "Original text", null, null, 1]], null, "en"]
        const translatedText = json[0].map(item => item[0]).join('');
        callback(null, translatedText);
      } catch (e) {
        callback(e);
      }
    });
  }).on('error', (err) => {
    callback(err);
  });
}

const testText = "The electromagnetic environment is intense this morning, with Schumann resonance spiking to 93.";
translate(testText, (err, result) => {
  if (err) {
    console.error("Error translating:", err);
  } else {
    console.log("Original:", testText);
    console.log("Translated:", result);
  }
});
