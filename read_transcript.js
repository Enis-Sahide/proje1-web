const fs = require('fs');

const data = fs.readFileSync('C:\\Users\\baha\\.gemini\\antigravity-ide\\brain\\810f7647-f503-4d47-b6a4-e0566d440bc1\\.system_generated\\logs\\transcript.jsonl', 'utf8');
const lines = data.split('\n');

for (const line of lines) {
  if (!line.trim()) continue;
  try {
    const obj = JSON.parse(line);
    if (obj.step_index === 281) {
      console.log("Found browser subagent step!");
      fs.writeFileSync('subagent_run.txt', obj.content);
      console.log("Wrote subagent log to subagent_run.txt");
    }
  } catch (e) {
  }
}
