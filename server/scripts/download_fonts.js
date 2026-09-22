const https = require('https');
const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '../src/certificates/assets/fonts');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// Proper Google Fonts API URLs with User-Agent to get woff2
const fonts = [
  {
    apiUrl: 'https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap',
    name: 'GreatVibes-Regular.woff2'
  },
  {
    apiUrl: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&display=swap',
    name: 'PlayfairDisplay-Bold.woff2'
  }
];

function downloadFontFromCssApi(apiUrl, outPath) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36'
      }
    };

    https.get(apiUrl, options, (res) => {
      let css = '';
      res.on('data', d => css += d);
      res.on('end', () => {
        // Extract woff2 URL from the CSS response
        const match = css.match(/url\((https:\/\/fonts\.gstatic\.com[^)]+\.woff2)\)/);
        if (!match) {
          console.error('Could not find woff2 URL in CSS for', apiUrl);
          console.log('CSS response:', css.substring(0, 500));
          reject(new Error('No woff2 URL found'));
          return;
        }
        const woff2Url = match[1];
        console.log('Downloading:', woff2Url);

        // Download the actual woff2 file
        https.get(woff2Url, (fontRes) => {
          const file = fs.createWriteStream(outPath);
          fontRes.pipe(file);
          file.on('finish', () => {
            file.close();
            const size = fs.statSync(outPath).size;
            console.log('Saved:', path.basename(outPath), size, 'bytes');
            resolve();
          });
        }).on('error', reject);
      });
    }).on('error', reject);
  });
}

(async () => {
  for (const f of fonts) {
    const outPath = path.join(outDir, f.name);
    await downloadFontFromCssApi(f.apiUrl, outPath).catch(e => console.error('Failed:', f.name, e.message));
  }
  console.log('All fonts done!');
})();
