const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function findAndReplace(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      findAndReplace(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Regex to match the unsplash div
      const regex = /<div className="[^"]*bg-\[url\('https:\/\/images\.unsplash\.com\/[^"]*'\)][^>]*\/>\n?/g;
      
      if (regex.test(content)) {
        content = content.replace(regex, '');
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Cleaned:', fullPath);
      }
    }
  }
}

findAndReplace(srcDir);
console.log('Done!');
