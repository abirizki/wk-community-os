import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CRC32 table & calculation
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  }
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(12 + len);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const typeAndData = chunk.subarray(4, 8 + len);
  const crc = crc32(typeAndData);
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

function createPng(width, height, isMaskable = false) {
  const magic = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8 bits per channel
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const ihdrChunk = makeChunk('IHDR', ihdr);

  const rowBytes = 1 + width * 4;
  const rawData = Buffer.alloc(rowBytes * height);

  const cx = width / 2;
  const cy = height / 2;
  const rOuter = width * 0.44;
  const rInner = width * 0.38;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowBytes;
    rawData[rowOffset] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (isMaskable) {
        if (dist < rInner) {
          rawData[pxOffset] = 255;
          rawData[pxOffset + 1] = 255;
          rawData[pxOffset + 2] = 255;
          rawData[pxOffset + 3] = 255;
        } else {
          rawData[pxOffset] = 27;  // #1b4332
          rawData[pxOffset + 1] = 67;
          rawData[pxOffset + 2] = 50;
          rawData[pxOffset + 3] = 255;
        }
      } else {
        if (dist <= rOuter) {
          if (dist > rOuter - 6) {
            rawData[pxOffset] = 233; // #e9c46a
            rawData[pxOffset + 1] = 196;
            rawData[pxOffset + 2] = 106;
            rawData[pxOffset + 3] = 255;
          } else if (dist <= rInner) {
            rawData[pxOffset] = 248;
            rawData[pxOffset + 1] = 251;
            rawData[pxOffset + 2] = 249;
            rawData[pxOffset + 3] = 255;
          } else {
            rawData[pxOffset] = 27;
            rawData[pxOffset + 1] = 67;
            rawData[pxOffset + 2] = 50;
            rawData[pxOffset + 3] = 255;
          }
        } else {
          rawData[pxOffset] = 0;
          rawData[pxOffset + 1] = 0;
          rawData[pxOffset + 2] = 0;
          rawData[pxOffset + 3] = 0;
        }
      }
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([magic, ihdrChunk, idatChunk, iendChunk]);
}

const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="primaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1b4332" />
      <stop offset="50%" stop-color="#2d6a4f" />
      <stop offset="100%" stop-color="#081c15" />
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f4a261" />
      <stop offset="100%" stop-color="#e76f51" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#081c15" flood-opacity="0.35"/>
    </filter>
  </defs>

  <rect width="512" height="512" rx="110" fill="url(#primaryGrad)"/>
  <rect x="20" y="20" width="472" height="472" rx="96" fill="none" stroke="#52b788" stroke-width="4" stroke-opacity="0.3"/>

  <g filter="url(#shadow)" transform="translate(106, 96)">
    <path d="M150 20 L270 70 V190 C270 270 150 330 150 330 C150 330 30 270 30 190 V70 Z" 
          fill="#f8fbf9" stroke="#52b788" stroke-width="6" stroke-linejoin="round"/>
          
    <path d="M150 70 L195 100 V230 C195 250 150 280 150 280 C150 280 105 250 105 230 V100 Z" 
          fill="#1b4332" />

    <path d="M150 48 L155 62 H170 L158 71 L162 85 L150 76 L138 85 L142 71 L130 62 H145 Z" 
          fill="url(#goldGrad)" stroke="#f4a261" stroke-width="1.5"/>

    <path d="M115 130 C90 145 70 175 75 210 C88 215 105 205 115 190 Z" fill="#40916c"/>
    <path d="M185 130 C210 145 230 175 225 210 C212 215 195 205 185 190 Z" fill="#74c69d"/>
  </g>

  <text x="256" y="455" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
        font-size="34" font-weight="800" fill="#f8fbf9" letter-spacing="3">BUMI WARGA</text>
  <text x="256" y="482" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
        font-size="16" font-weight="600" fill="#95d5b2" letter-spacing="4">COMMUNITY OS</text>
</svg>`;

const targetDirs = [
  path.resolve(__dirname, '../frontend/public/icons'),
  path.resolve(__dirname, '../public/icons')
];

for (const dir of targetDirs) {
  fs.mkdirSync(dir, { recursive: true });
}

console.log('Generating PWA icons...');
const png192 = createPng(192, 192, false);
const png512 = createPng(512, 512, false);
const pngMaskable512 = createPng(512, 512, true);

for (const dir of targetDirs) {
  fs.writeFileSync(path.join(dir, 'icon.svg'), svgIcon);
  fs.writeFileSync(path.join(dir, 'icon-192x192.png'), png192);
  fs.writeFileSync(path.join(dir, 'icon-512x512.png'), png512);
  fs.writeFileSync(path.join(dir, 'icon-maskable-512x512.png'), pngMaskable512);
  console.log(`Saved icons to ${dir}`);
}

console.log('All PWA icons successfully generated!');

