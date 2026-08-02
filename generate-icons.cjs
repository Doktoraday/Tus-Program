// One-off build utility: renders the app's stopwatch-mark icon as flat PNGs
// (no image deps — hand-rolled PNG encoder) for the manifest / favicon / apple-touch-icon.
// Run: node generate-icons.cjs
"use strict";
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const BG = [0xec, 0x30, 0x13]; // --color-accent
const FG = [0xf3, 0xf2, 0xf2]; // --color-bg (used as the mark color)

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const typeBuf = Buffer.from(type, "ascii");
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function renderPng(size) {
  const cx = size / 2, cy = size / 2;
  const R = size * 0.34;
  const stroke = Math.max(1, size * 0.045);
  const handLenV = R * 0.62;
  const handLenH = R * 0.4;
  const dot = size * 0.05;

  const raw = Buffer.alloc(size * (1 + size * 4));
  let o = 0;
  for (let y = 0; y < size; y++) {
    raw[o++] = 0; // filter: none
    for (let x = 0; x < size; x++) {
      const dx = x + 0.5 - cx, dy = y + 0.5 - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      let px = BG;
      if (dist <= R) {
        px = FG;
        const inVBar = Math.abs(dx) <= stroke && dy <= 0 && dy >= -handLenV;
        const inHBar = Math.abs(dy) <= stroke && dx >= 0 && dx <= handLenH;
        const inDot = dist <= dot;
        if (inVBar || inHBar || inDot) px = BG;
        // small notch at 12 o'clock (stopwatch crown)
        if (dy < -R * 0.86 && Math.abs(dx) <= stroke * 1.4) px = BG;
      } else if (dy < -R - stroke * 1.6 && dy >= -R - stroke * 3.4 && Math.abs(dx) <= stroke * 1.4) {
        px = FG; // crown stem outside the ring
      }
      raw[o++] = px[0];
      raw[o++] = px[1];
      raw[o++] = px[2];
      raw[o++] = 255;
    }
  }

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const outDir = path.join(__dirname, "icons");
fs.mkdirSync(outDir, { recursive: true });
for (const size of [512, 192, 180, 32]) {
  const buf = renderPng(size);
  fs.writeFileSync(path.join(outDir, `icon-${size}.png`), buf);
  console.log("wrote icons/icon-" + size + ".png", buf.length, "bytes");
}
