const fs = require('fs');
const path = require('path');

const fontDir = path.join(__dirname, '../src/certificates/assets/fonts');
const cssPath = path.join(__dirname, '../src/certificates/templates/certificateTemplate.css');

// Read all fonts as base64
const ebReg = fs.readFileSync(path.join(fontDir, 'EBGaramond-Regular.woff2')).toString('base64');
const ebBold = fs.readFileSync(path.join(fontDir, 'EBGaramond-Bold.woff2')).toString('base64');
const greatVibes = fs.readFileSync(path.join(fontDir, 'GreatVibes-Regular.woff2')).toString('base64');
const playfairBold = fs.readFileSync(path.join(fontDir, 'PlayfairDisplay-Bold.woff2')).toString('base64');

const fontFaceBlock = `/* ===== LOCAL EMBEDDED FONTS (no internet needed) ===== */
@font-face {
  font-family: 'EB Garamond';
  font-style: normal;
  font-weight: 400 700;
  src: url('data:font/woff2;base64,${ebReg}') format('woff2');
}
@font-face {
  font-family: 'EB Garamond';
  font-style: normal;
  font-weight: 800 900;
  src: url('data:font/woff2;base64,${ebBold}') format('woff2');
}
@font-face {
  font-family: 'Great Vibes';
  font-style: normal;
  font-weight: 400;
  src: url('data:font/woff2;base64,${greatVibes}') format('woff2');
}
@font-face {
  font-family: 'Playfair Display';
  font-style: normal;
  font-weight: 700 800;
  src: url('data:font/woff2;base64,${playfairBold}') format('woff2');
}

`;

let css = fs.readFileSync(cssPath, 'utf8');

// Remove any existing embedded font block
css = css.replace(/\/\* ===== LOCAL EMBEDDED FONTS[\s\S]*?@font-face \{[^}]*\}\n\n/, '');
// Remove all embedded font blocks
while (css.includes('LOCAL EMBEDDED FONTS')) {
  css = css.replace(/\/\* ===== LOCAL EMBEDDED FONTS[\s\S]*?\}\n\n/, '');
}

// Prepend fresh block
css = fontFaceBlock + css;
fs.writeFileSync(cssPath, css);
console.log('Font-face block embedded! CSS size:', css.length, 'bytes');
