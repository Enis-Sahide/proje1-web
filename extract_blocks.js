const fs = require('fs');

function extractGates(filePath) {
  const text = fs.readFileSync(filePath, 'utf8');
  // Regular expression to match "Kapı 1: Name" or "1. Kapı: Name"
  const gateRegex = /(?:Kap[ıi]?\s*(\d{1,2}):|(\d{1,2})\.\s*Kap[ıi]?:)\s*([^\n]+)/gi;
  
  const gates = {};
  let match;
  let matches = [];
  
  while ((match = gateRegex.exec(text)) !== null) {
    const gateNum = parseInt(match[1] || match[2]);
    if (gateNum >= 1 && gateNum <= 64) {
      matches.push({ num: gateNum, index: match.index, name: match[3].trim() });
    }
  }

  for (let i = 0; i < matches.length; i++) {
    const startIdx = matches[i].index;
    const endIdx = i < matches.length - 1 ? matches[i+1].index : text.length;
    const gateText = text.substring(startIdx, endIdx).trim();
    const gateNum = matches[i].num;
    
    // Some kapıs are mentioned multiple times (e.g. in channels). We only want the main section, which is usually the longest.
    if (!gates[gateNum] || gateText.length > gates[gateNum].length) {
      gates[gateNum] = gateText;
    }
  }
  return gates;
}

const karenGates = extractGates('c:/projeler/proje1-web/karen_curry.txt');
const chetanGates = extractGates('c:/projeler/proje1-web/chetan_parkyn.txt');

const result = {};
for (let i = 1; i <= 10; i++) {
  result[i] = {
    karen: karenGates[i] || 'Not found',
    chetan: chetanGates[i] || 'Not found'
  };
}

fs.writeFileSync('c:/projeler/proje1-web/raw_gates_1_10.json', JSON.stringify(result, null, 2));
console.log('Done extracting 1-10.');
