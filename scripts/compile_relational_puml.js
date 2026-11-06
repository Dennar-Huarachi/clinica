const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { execSync } = require('child_process');

function encode6bit(b) {
  if (b < 10) return String.fromCharCode(48 + b);
  b -= 10;
  if (b < 26) return String.fromCharCode(65 + b);
  b -= 26;
  if (b < 26) return String.fromCharCode(97 + b);
  b -= 26;
  if (b === 0) return '-';
  if (b === 1) return '_';
  return '?';
}

function append3bytes(b1, b2, b3) {
  const c1 = b1 >> 2;
  const c2 = ((b1 & 0x3) << 4) | (b2 >> 4);
  const c3 = ((b2 & 0xF) << 2) | (b3 >> 6);
  const c4 = b3 & 0x3F;
  return encode6bit(c1 & 0x3F) + encode6bit(c2 & 0x3F) + encode6bit(c3 & 0x3F) + encode6bit(c4 & 0x3F);
}

function encodePlantUML(text) {
  const deflated = zlib.deflateRawSync(Buffer.from(text, 'utf8'), { level: 9 });
  let r = '';
  for (let i = 0; i < deflated.length; i += 3) {
    if (i + 2 === deflated.length) {
      r += append3bytes(deflated[i], deflated[i + 1], 0);
    } else if (i + 1 === deflated.length) {
      r += append3bytes(deflated[i], 0, 0);
    } else {
      r += append3bytes(deflated[i], deflated[i + 1], deflated[i + 2]);
    }
  }
  return r;
}

async function main() {
  const pumlPath = path.resolve(__dirname, '../docs/diagrama_relacional.puml');
  const svgPath = path.resolve(__dirname, '../docs/diagrama_relacional.svg');
  const pngPath = path.resolve(__dirname, '../docs/diagrama_relacional.png');

  if (!fs.existsSync(pumlPath)) {
    throw new Error(`No se encontró el archivo: ${pumlPath}`);
  }

  const pumlContent = fs.readFileSync(pumlPath, 'utf8');
  console.log(`[INFO] Leyendo archivo PlantUML: ${pumlPath}`);

  // 1. Fetch SVG from PlantUML Server
  console.log('[INFO] Codificando PlantUML y solicitando renderizado vectorial a PlantUML Server...');
  const encoded = encodePlantUML(pumlContent);
  const svgUrl = `https://www.plantuml.com/plantuml/svg/${encoded}`;

  const response = await fetch(svgUrl);
  if (!response.ok) {
    throw new Error(`Error en servidor PlantUML: ${response.status} ${response.statusText}`);
  }

  let svgText = await response.text();
  console.log(`[OK] SVG vectorial recibido exitosamente (${svgText.length} bytes).`);

  // Ensure SVG has clean white background and valid attributes
  if (!svgText.includes('background-color')) {
    svgText = svgText.replace('<svg ', '<svg style="background-color: #FFFFFF;" ');
  }

  // Parse intrinsic dimensions
  const vbMatch = svgText.match(/viewBox="([^"]+)"/);
  const wMatch = svgText.match(/width="([0-9.]+)px?"/);
  const hMatch = svgText.match(/height="([0-9.]+)px?"/);

  let origWidth = 3000;
  let origHeight = 2200;

  if (vbMatch) {
    const parts = vbMatch[1].split(' ').map(Number);
    if (parts.length === 4) {
      origWidth = parts[2];
      origHeight = parts[3];
    }
  } else if (wMatch && hMatch) {
    origWidth = parseFloat(wMatch[1]);
    origHeight = parseFloat(hMatch[1]);
  }

  console.log(`[INFO] Dimensiones intrínsecas del diagrama: ${origWidth} x ${origHeight} px`);

  // Save the SVG
  fs.writeFileSync(svgPath, svgText, 'utf8');
  console.log(`[OK] Archivo SVG guardado en: ${svgPath}`);

  // 2. Ultra-HD / 300+ DPI Rasterization via Headless Chrome
  // We scale the rendering canvas by 2.5x to 3x to ensure 300+ DPI print quality
  const SCALE = 2.5;
  const renderWidth = Math.round(origWidth * SCALE);
  const renderHeight = Math.round(origHeight * SCALE);

  console.log(`[INFO] Escalando para Ultra-HD / 300+ DPI: ${renderWidth} x ${renderHeight} px`);

  const tempHtmlPath = path.resolve(__dirname, 'temp_relational_render.html');
  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Diagrama Relacional</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
      width: ${renderWidth}px;
      height: ${renderHeight}px;
      background-color: #FFFFFF;
      overflow: hidden;
    }
    svg {
      width: 100%;
      height: 100%;
      display: block;
      background-color: #FFFFFF;
    }
  </style>
</head>
<body>
  ${svgText}
</body>
</html>`;

  fs.writeFileSync(tempHtmlPath, htmlContent, 'utf8');

  const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
  const browserBin = fs.existsSync(chromePath) ? chromePath : edgePath;

  console.log(`[INFO] Renderizando PNG en Ultra Alta Definición usando: ${browserBin}`);

  try {
    const fileUrl = 'file:///' + tempHtmlPath.replace(/\\/g, '/');
    const cmd = `"${browserBin}" --headless --disable-gpu --hide-scrollbars --window-size=${renderWidth},${renderHeight} --screenshot="${pngPath}" "${fileUrl}"`;
    execSync(cmd, { stdio: 'pipe' });

    // Wait for file creation and sync
    const start = Date.now();
    while (Date.now() - start < 3000) {
      if (fs.existsSync(pngPath) && fs.statSync(pngPath).size > 10000) break;
    }

    if (fs.existsSync(pngPath)) {
      const pngSize = fs.statSync(pngPath).size;
      console.log(`[OK] Diagrama rasterizado PNG generado exitosamente:`);
      console.log(`     - Archivo: ${pngPath}`);
      console.log(`     - Dimensiones: ${renderWidth} x ${renderHeight} px (Ultra-HD / 300+ DPI)`);
      console.log(`     - Peso: ${(pngSize / (1024 * 1024)).toFixed(2)} MB (${pngSize} bytes)`);
    } else {
      console.error(`[ERROR] No se pudo encontrar el archivo PNG generado.`);
    }
  } finally {
    if (fs.existsSync(tempHtmlPath)) {
      fs.unlinkSync(tempHtmlPath);
    }
  }
}

main().catch(err => {
  console.error('[FATAL ERROR]:', err);
  process.exit(1);
});
