const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const brainDir = 'C:\\Users\\baha\\.gemini\\antigravity-ide\\brain\\af6f26ed-98dd-476b-bb35-2a1ab42ed59e';
const img1 = path.join(brainDir, 'schumann_video_visual_1789846652035.jpg');
const img2 = path.join(brainDir, 'schumann_ui_mobile_1789846762260.jpg');
const outputVideo = path.join(brainDir, 'schumann_resonance_promo.mp4');

console.log('Building Schumann promotional video with FFmpeg...');

// Escape path for ffmpeg filter
const fontPath = 'C\\:/Windows/Fonts/segoeuib.ttf';
const img1Esc = img1.replace(/\\/g, '/').replace(':', '\\:');
const img2Esc = img2.replace(/\\/g, '/').replace(':', '\\:');

// Complex filter with zoompan, crossfade and text animations
const filterComplex = `
[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,zoompan=z='min(zoom+0.0015,1.25)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=150:s=1080x1920:fps=30,trim=duration=5,setpts=PTS-STARTPTS[v1_raw];
[1:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,zoompan=z='min(zoom+0.0012,1.20)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=180:s=1080x1920:fps=30,trim=duration=6,setpts=PTS-STARTPTS[v2_raw];
[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,zoompan=z='min(zoom+0.0015,1.25)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=150:s=1080x1920:fps=30,trim=duration=5,setpts=PTS-STARTPTS[v3_raw];

[v1_raw]
drawbox=y=1350:color=black@0.65:width=iw:height=220:t=fill:enable='between(t,0.5,4.8)',
drawtext=fontfile='${fontPath}':text='BUGUN NEDEN BASIN AGRIYOR?':fontsize=52:fontcolor=white:x=(w-text_w)/2:y=1400:enable='between(t,0.5,2.6)',
drawtext=fontfile='${fontPath}':text='DUNYANIN KALP ATISI FIRLADI':fontsize=50:fontcolor=0xD4AF37:x=(w-text_w)/2:y=1400:enable='between(t,2.7,4.8)',
drawtext=fontfile='${fontPath}':text='SCHUMANN REZONANSI SIÇRAMASI':fontsize=32:fontcolor=0x00E5FF:x=(w-text_w)/2:y=1470:enable='between(t,2.7,4.8)'
[v1];

[v2_raw]
drawbox=y=200:color=black@0.65:width=iw:height=180:t=fill:enable='between(t,0.3,5.8)',
drawtext=fontfile='${fontPath}':text='CANLI IYONOSFER VERISI':fontsize=48:fontcolor=0x00E5FF:x=(w-text_w)/2:y=240:enable='between(t,0.3,3.0)',
drawtext=fontfile='${fontPath}':text='TOMSK RASATHANESI ANLIK SPEKTROGRAM':fontsize=30:fontcolor=white:x=(w-text_w)/2:y=305:enable='between(t,0.3,3.0)',
drawtext=fontfile='${fontPath}':text='7.83 Hz VE MANYETIK DALGALAR':fontsize=48:fontcolor=0xD4AF37:x=(w-text_w)/2:y=240:enable='between(t,3.1,5.8)',
drawtext=fontfile='${fontPath}':text='BEDEN SEMPTOMLARI VE ENERJI MERKEZLERI':fontsize=28:fontcolor=white:x=(w-text_w)/2:y=305:enable='between(t,3.1,5.8)'
[v2];

[v3_raw]
drawbox=y=1380:color=black@0.70:width=iw:height=240:t=fill:enable='between(t,0.2,4.8)',
drawtext=fontfile='${fontPath}':text='FREKANSINI SENKRONIZE ET':fontsize=46:fontcolor=white:x=(w-text_w)/2:y=1420:enable='between(t,0.2,2.4)',
drawtext=fontfile='${fontPath}':text='CANLI TAKIP ET':fontsize=52:fontcolor=0xD4AF37:x=(w-text_w)/2:y=1420:enable='between(t,2.5,4.8)',
drawtext=fontfile='${fontPath}':text='7layers.tr/analysis/schumann':fontsize=38:fontcolor=0x00E5FF:x=(w-text_w)/2:y=1500:enable='between(t,2.5,4.8)'
[v3];

[v1][v2][v3]concat=n=3:v=1:a=0[v_out];

anoisesrc=d=16:c=pink:r=48000:a=0.012[amb];
sine=f=216:d=16:r=48000[s1];
sine=f=432:d=16:r=48000[s2];
[s1]tremolo=f=7.83:d=0.6,volume=0.18[sub];
[s2]tremolo=f=7.83:d=0.4,volume=0.12[harmonic];
[amb][sub][harmonic]amix=inputs=3:duration=first[a_mix];
[a_mix]afade=t=in:ss=0:d=1.5,afade=t=out:st=14.5:d=1.5[a_out]
`.trim();

const cmd = [
  'ffmpeg',
  '-y',
  '-loop 1 -t 5 -i "' + img1 + '"',
  '-loop 1 -t 6 -i "' + img2 + '"',
  '-filter_complex "' + filterComplex.replace(/\r?\n/g, ' ') + '"',
  '-map "[v_out]"',
  '-map "[a_out]"',
  '-c:v libx264 -pix_fmt yuv420p -r 30 -preset fast -crf 20',
  '-c:a aac -b:a 192k',
  '-t 16',
  '"' + outputVideo + '"'
].join(' ');

console.log('Running FFmpeg rendering process...');
try {
  execSync(cmd, { stdio: 'inherit', maxBuffer: 1024 * 1024 * 50 });
  console.log('SUCCESS! Video generated at:', outputVideo);
} catch (err) {
  console.error('Error generating video:', err.message);
  process.exit(1);
}
