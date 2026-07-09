const { execSync } = require('child_process');

async function main() {
  console.log('Reading logcat...');
  try {
    const output = execSync('adb logcat -d', { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
    const lines = output.split('\n');
    console.log(`Total lines read: ${lines.length}`);
    
    // Search for keywords
    const keywords = ['lalezar', 'FCM', 'Token', 'token', 'register', 'baha', 'rezonans'];
    
    for (const line of lines) {
      const match = keywords.some(k => line.toLowerCase().includes(k.toLowerCase()));
      if (match) {
        // Exclude some common spammy logs if needed, but let's print most matching lines
        if (!line.includes('ActivityThread') && !line.includes('InputMethodService') && !line.includes('bqwu')) {
          console.log(line.trim());
        }
      }
    }
  } catch (e) {
    console.error('Error running adb logcat:', e);
  }
}

main().catch(console.error);
