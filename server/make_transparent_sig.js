const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Input JPG signature with white/gray background
const inputJpg = 'C:/Users/Lenovo/.gemini/antigravity-ide/brain/614fdade-e76f-406a-986d-2ec535680827/simple_scribble_sign_1790074375413.jpg';
const outputPng = path.join(__dirname, 'src/certificates/assets/authorized_signatory.png');

const html = `
<!DOCTYPE html>
<html>
<head>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body {
    width: 900px;
    height: 450px;
    background: transparent !important;
    overflow: hidden;
  }
  canvas { display: block; position: absolute; top: 0; left: 0; }
</style>
</head>
<body>
<canvas id="c" width="900" height="450"></canvas>
<script>
  const img = new Image();
  img.onload = () => {
    const canvas = document.getElementById('c');
    const ctx = canvas.getContext('2d');

    // Draw original
    ctx.drawImage(img, 0, 0, 900, 450);

    const imageData = ctx.getImageData(0, 0, 900, 450);
    const data = imageData.data;

    // Find the actual ink color range by sampling corners (background color)
    // Sample 5x5 corners to get background color
    let bgR = 0, bgG = 0, bgB = 0, count = 0;
    const corners = [[0,0],[890,0],[0,440],[890,440],[445,225]];
    // Actually use top-left corner which is pure background
    for (let y = 0; y < 5; y++) {
      for (let x = 0; x < 5; x++) {
        const idx = (y * 900 + x) * 4;
        bgR += data[idx]; bgG += data[idx+1]; bgB += data[idx+2];
        count++;
      }
    }
    bgR = Math.round(bgR / count);
    bgG = Math.round(bgG / count);
    bgB = Math.round(bgB / count);

    console.log('Background color detected:', bgR, bgG, bgB);

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i+1], b = data[i+2];
      // Luminance-based threshold - make light pixels transparent
      const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

      if (luminance > 210) {
        // Pure white/very light gray - fully transparent
        data[i+3] = 0;
      } else if (luminance > 160) {
        // Light area - semi transparent (gradient fade)
        const alpha = Math.round(255 * Math.pow((210 - luminance) / 50, 1.5));
        data[i+3] = Math.min(255, alpha);
      }
      // Dark ink pixels (luminance <= 160) stay fully opaque
    }

    ctx.clearRect(0, 0, 900, 450);
    ctx.putImageData(imageData, 0, 0);
    window._done = true;
  };
  img.src = 'data:image/jpeg;base64,BASE64_DATA';
</script>
</body>
</html>
`;

(async () => {
  const imgBase64 = fs.readFileSync(inputJpg).toString('base64');
  const finalHtml = html.replace('BASE64_DATA', imgBase64);

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 900, height: 450 });
  await page.setContent(finalHtml, { waitUntil: 'networkidle0' });
  await page.waitForFunction(() => window._done === true, { timeout: 15000 });

  // Screenshot with transparent background
  await page.screenshot({
    path: outputPng,
    omitBackground: true,
    clip: { x: 0, y: 0, width: 900, height: 450 }
  });

  await browser.close();
  console.log('Transparent PNG saved:', outputPng);
})();
