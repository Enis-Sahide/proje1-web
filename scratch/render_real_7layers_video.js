const { execSync } = require('child_process');
const path = require('path');

const brainDir = 'C:\\Users\\baha\\.gemini\\antigravity-ide\\brain\\af6f26ed-98dd-476b-bb35-2a1ab42ed59e';
const s1 = path.join(brainDir, 'real_scene1.png').replace(/\\/g, '/');
const s2 = path.join(brainDir, 'real_scene2.png').replace(/\\/g, '/');
const s3 = path.join(brainDir, 'real_scene3.png').replace(/\\/g, '/');
const outputVideo = path.join(brainDir, 'schumann_7layers_official_promo.mp4').replace(/\\/g, '/');

console.log('Rendering 7Layers Official Schumann Promo Video...');

// Scene 1: 5.5s (165 frames @ 30fps) - Gentle center zoom
// Scene 2: 7.0s (210 frames @ 30fps) - Zoom in on the real Tomsk spectrogram graph
// Scene 3: 5.5s (165 frames @ 30fps) - Gentle zoom on the guidance cards and CTA
const filterComplex = `
[0:v]scale=1080:1920,zoompan=z='min(zoom+0.0008,1.15)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=165:s=1080x1920:fps=30,trim=duration=5.5,setpts=PTS-STARTPTS[v1];
[1:v]scale=1080:1920,zoompan=z='min(zoom+0.0010,1.22)':x='iw/2-(iw/zoom/2)':y='ih/4-(ih/zoom/4)':d=210:s=1080x1920:fps=30,trim=duration=7.0,setpts=PTS-STARTPTS[v2];
[2:v]scale=1080:1920,zoompan=z='min(zoom+0.0008,1.15)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=165:s=1080x1920:fps=30,trim=duration=5.5,setpts=PTS-STARTPTS[v3];

[v1][v2][v3]concat=n=3:v=1:a=0[v_concat];

anoisesrc=d=18:c=pink:r=48000:a=0.015[amb];
sine=f=216:d=18:r=48000[s1];
sine=f=432:d=18:r=48000[s2];
[s1]tremolo=f=7.83:d=0.55,volume=0.16[sub];
[s2]tremolo=f=7.83:d=0.35,volume=0.10[harm];
[amb][sub][harm]amix=inputs=3:duration=first[a_mix];
[a_mix]afade=t=in:ss=0:d=1.5,afade=t=out:st=16.5:d=1.5[a_out]
`.trim().replace(/\r?\n/g, ' ');

const cmd = [
  'ffmpeg',
  '-y',
  `-loop 1 -t 5.5 -i "${s1}"`,
  `-loop 1 -t 7.0 -i "${s2}"`,
  `-loop 1 -t 5.5 -i "${s3}"`,
  `-filter_complex "${filterComplex}"`,
  '-map "[v_concat]"',
  '-map "[a_out]"',
  '-c:v libx264 -pix_fmt yuv420p -r 30 -preset medium -crf 19',
  '-c:a aac -b:a 192k',
  '-t 18',
  `"${outputVideo}"`
].join(' ');

try {
  execSync(cmd, { stdio: 'inherit' });
  console.log('SUCCESS! Real 7Layers Official Video created at:', outputVideo);
} catch (e) {
  console.error('Rendering error:', e.message);
  process.exit(1);
}
