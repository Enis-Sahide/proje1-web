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
      
      // Match lines like <div className="fixed inset-0 bg-mystic-dark -z-20" />
      // And <div className="fixed inset-0 bg-gradient-to-b from-mystic-dark/80 via-mystic-dark to-mystic-dark -z-10 pointer-events-none" />
      const regex1 = /<div className="fixed inset-0 bg-mystic-dark(\/\d+)? -z-20[^"]*"[ ]*\/>\n?/g;
      const regex2 = /<div className="fixed inset-0 bg-gradient-to-b from-mystic-dark.* -z-10[^"]*"[ ]*\/>\n?/g;
      
      let changed = false;
      if (regex1.test(content)) {
        content = content.replace(regex1, '');
        changed = true;
      }
      if (regex2.test(content)) {
        content = content.replace(regex2, '');
        changed = true;
      }
      
      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Cleaned mystic-dark div:', fullPath);
      }
    }
  }
}

findAndReplace(srcDir);
console.log('Done!');
