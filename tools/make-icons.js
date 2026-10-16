#!/usr/bin/env node
/*
 * The Puma Express's icons, from one pixel drawing: the engine at
 * three-quarters, her chimney against the moon, her smoke streaming back.
 *
 *   node tools/make-icons.js
 *
 * Writes icon.svg (crisp rects), favicon-16x16.png, favicon-32x32.png,
 * apple-touch-icon.png (180, also the GitLab project's avatar) and
 * favicon.ico (16, 32, 48, each a PNG inside). No dependencies: the PNG and
 * ICO writers are below. The share card is tools/og.html, rendered in a
 * browser.
 */
"use strict";
const fs = require("fs"), path = require("path"), zlib = require("zlib");
const ROOT = path.join(__dirname, "..");

/* the drawing, 40 x 40, two characters a cell: traced from js/art/model.js
 * by iconArt() in tools/og.html and kept here as pixels, so this tool needs
 * nothing but node. Redraw it there, then paste what tools/og.html?icon
 * prints over PAL and ART. */
const PAL = {"aa":"#05070f","ab":"#7e859e","ac":"#5a6280","ad":"#aab0c0","ae":"#8090c0","af":"#0a1022","ag":"#e8ecff","ah":"#3a4a6e","ai":"#f2eed8","aj":"#c9c6b0","ak":"#111a33","al":"#0c0f17","am":"#282d3f","an":"#3d2113","ao":"#272d3f","ap":"#3f4660","aq":"#a17f3c","ar":"#ffffff","as":"#1d212f","at":"#11141d","au":"#3e4660","av":"#1b202f","aw":"#7681a9","ax":"#4f5877","ay":"#4c7471","az":"#4b7471","aA":"#679794","aB":"#4b7371","aC":"#ffdf88","aD":"#9c7b3a","aE":"#4b7370","aF":"#4b7270","aG":"#4a7270","aH":"#4a716f","aI":"#152323","aJ":"#203333","aK":"#2c4544","aL":"#3c5d5c","aM":"#4d5674","aN":"#737da4","aO":"#4d5574","aP":"#e1f6ff","aQ":"#a9bdf6","aR":"#a8bcf5","aS":"#e0f5ff","aT":"#e0f4ff","aU":"#dff4ff","aV":"#a7baf3","aW":"#ddf2ff","aX":"#a5b9f1","aY":"#dbf0ff","aZ":"#a3b7ef","a0":"#d9edff","a1":"#a1b4ec","a2":"#a0b3ea","a3":"#27385a","a4":"#ffaa50","a5":"#474f6b","a6":"#464f6b","a7":"#464e6b","a8":"#464e6a","a9":"#446866","a@":"#436766","a#":"#436765","ba":"#436665","bb":"#426665","bc":"#426664","bd":"#426564","be":"#426563","bf":"#416463","bg":"#416462","bh":"#416362","bi":"#406362","bj":"#1b2442","bk":"#283045","bl":"#272c3e","bm":"#3d455f","bn":"#3d445e","bo":"#262b3d","bp":"#3a5959","bq":"#2a4241","br":"#294141","bs":"#294140","bt":"#294040","bu":"#284040","bv":"#283f3f","bw":"#273e3e","bx":"#273d3d","by":"#263d3c","bz":"#263c3c","bA":"#253b3b","bB":"#243a3a","bC":"#243939","bD":"#202534","bE":"#202434","bF":"#202433","bG":"#1f2433","bH":"#1f2332","bI":"#162324","bJ":"#203334","bK":"#152223","bL":"#152222","bM":"#142122","bN":"#142121","bO":"#132021","bP":"#131f20","bQ":"#131e1f","bR":"#121e1e","bS":"#111d1e","bT":"#111c1d","bU":"#101b1c","bV":"#101a1b","bW":"#090f10","bX":"#f1ce7b","bY":"#0e1118","bZ":"#0e1018","b0":"#0d1017","b1":"#0d0f17","b2":"#0d0f16","b3":"#0e1718","b4":"#080f0f","b5":"#c09747","b6":"#3e605f","b7":"#3f6160","b8":"#28403f","b9":"#3d5e5e","b@":"#2d4746","b#":"#c09647","ca":"#797462","cb":"#162424","cc":"#546086","cd":"#233838","ce":"#37405c","cf":"#4f5a7e","cg":"#fbda80","ch":"#b63325","ci":"#a1a09f","cj":"#fff6d0","ck":"#3b4461","cl":"#213435","cm":"#cfa84d","cn":"#65739b","co":"#8494c4","cp":"#48506e","cq":"#7580a8","cr":"#54150e","cs":"#f69476","ct":"#d0a84e","cu":"#8c9ed0","cv":"#5e6c92","cw":"#7d231a","cx":"#ab3023","cy":"#d0a94e","cz":"#fcdb81","cA":"#63719c","cB":"#616f99","cC":"#5f6c96","cD":"#5c6992","cE":"#59668e","cF":"#5f6c93","cG":"#142021","cH":"#26324e","cI":"#8797c8","cJ":"#e04638","cK":"#2e364d","cL":"#8393c2","cM":"#333c56","cN":"#2f3750","cO":"#2a3249","cP":"#181e2c","cQ":"#0a0c14","cR":"#8495c4","cS":"#5e6c93","cT":"#5f6d93","cU":"#8595c5","cV":"#606d94","cW":"#8495c5","cX":"#5f6d94"};
const ART = [
  "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaababababababababacacacaaacaaaaaa",
  "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaadaaadababaaabababaaacaaacaaacaaaaaaaa",
  "aaaaaaaaaaaaaaaaaaaaaaaaaaaeaaaaaaaaaaaaadadababababababacabacacacaaacacacaaaaaa",
  "afaaaaaaafaaaaaaafaaaaaaafaaaaaaafaaaaadafabababafababacafacaeacafacaaacafaaaaaa",
  "aaaaaaaaagaaaaaaahaaahaaahaaahaaaaadadadababababababacacacacacacacacacaaaaaaaaaa",
  "afaaafaaafaaafahafahafahafahafaaafadadababababababacafacafacafacafacafaaafaaafaa",
  "aaafaaafahafahahahahahahahahahadadadababababacacacacacacacafacafacafaaafaaafaaaf",
  "afafafaaafahafahaiaiaiaiaiaiadadadabababafacafacafacafacafafafaaafafafaaafafafaa",
  "aaafaaafahahaiaiaiaiaiaiaiadadadababababacacacacaaafaaafaaafaaafaaafaaafaaafaaaf",
  "afafafahafahaiaiaiaiaiadadadadabababafacacafafafafafafafafafafafafafafafafafafaf",
  "afafahafahaiaiaiaiaiaiadadadababababacafafafaaafafafaaafafafaaafafafaaafafafaaaf",
  "afafafahafaiaiaiaiaiaiadadababacajahafafafafafafafafafafafafafafafafafafafafafaf",
  "afafahafahaiaiaiadadadabababacajajahahafafafafafafafafafafafafafafafafafafagafaf",
  "afafaeahahaiaiaiadadadabaiaiaiajajahakafafafakafafafakafafafakafafafakafafafakaf",
  "afakahafahaiaiaiaialalaiaiaiaiajahahahafafakafafafakafafafakafafafakafafafakafaf",
  "akafakahakahaiaialamanalaiaiajajakahakafakafakafakafakafakafakafakafakafakafakaf",
  "afakafakahahaiajalamaoalajajajahahakahalalalafakafakafakafakafakalalalalalakafak",
  "akakakakakahakalalaoapalalalalalalalalaqararalalalalalalalalalalasatauaoaualakak",
  "akakafakahakalatavawaxaxaxarayazazaAaBaBaBaCaDaEaFaFaGaGaHaHaIaIaIaJaKaLaKalafak",
  "akakakakakakalatasaMaNaOaPaPaPaQaPaPaPaRaSaTaUaVaWaXaYaZa0a1a2aKaLa3aLa4a4alakak",
  "akakakakakalavasata5a6a7a7a8a9a@a@a@a#bababbbcbdbdbebfbfbgbhbiaLaKa3aKa4a4alakak",
  "akakbjakakalbkatasblbmblbnbobpbqbrbsbtbubvbvbwbwbxbybzbAbAbBbCaKaLaIaLaKaLalbjak",
  "akbjakakakbjalatatbDbEbFbGbHbIbJbKbLbMbNbObPbQbRbSbTbUbVbWa@a#bXaKaJaKaLaKalakak",
  "bjakbjakbjakalatasbYbZb0b1b2b3b4b3b4a#b5aLaKb3b4bfaKaLaKb6b7aLaKaLaIaLaKaLalbjak",
  "akbjakbjakbjalbkavaoaoauaob8aKaLaKb9b@aLaKaKaKbqb5aKaKaLb#aKaKaLaKaIaKaLaKalakbj",
  "bjbjalalcaalalatasaoauaoaucbaLaKccbwaLaKaLaKaLcdaLaKaLaKbXcecfaKaLaKcgaKaLalalal",
  "bjalchcicjcickatatauaoauaoauckccccclaKaLcecfaKaLaKaLcmaLaKaLaKaLaoaualalalalcnco",
  "alcpcqcrcscccccccccccccccfceaLaKaLaKcgctaLaKaLbzaLaKaLaKaJaKaLaKcucvalbjalalalal",
  "bjalcrcwcrcrcxaLaKaKcyczcAcBcCcDcEcFcFcoaKaKaKcGaKaKaKaLb4aKaKaLalalbjalcvcvalbj",
  "cHbjalcIascrcJaKaLaoaucKcLcMcNcOcPbOaLaKaLaKcoalaLaKaLalalaKaLcvcoalcHbjalalcHbj",
  "bjcHbjalatcwcxauaoauaocKcQaucncRcFalaKaLaKaLalalalaLcScoalalalalalcHbjcHbjcHbjcH",
  "cHcHalalalaoalalcucTbFaoauaoalalalalalaKaLcucocSalalalalcHcHcHcHcHcHcHcHcHcHcHcH",
  "bjalcucUcVcUalcHalalalauaoaoalalcncFcFalalalalalbjcHcHcHbjcHcHcHbjcHcHcHbjcHcHcH",
  "cHcHalalalalalalalalalcucRcFalcHalalalcHcHcHcHcHcHcHcHcHcHcHcHcHcHcHcHcHcHcHcHcH",
  "cHalalalalalcncWcTcRalalalalcHcHcHcHcHcHcHcHcHcHcHcHcHcHcHcHcHcHcHcHcHcHcHcHcHcH",
  "alcucUcXcUalalalalalahcHahcHahcHahcHahcHahcHahcHahcHahcHahcHahcHahcHahcHahcHahcH",
  "cHalalalalahcHahcHahcHahcHahcHahcHahcHahcHahcHahcHahcHahcHahcHahcHahcHahcHahcHah",
  "ahcHahahahcHahahahcHahahahcHahahahcHahahahcHahahahcHahahahcHahahahcHahahahcHahah",
  "ahahcHahahahcHahahahcHahahahcHahahahcHahahahcHahahahcHahahahcHahahahcHahahahcHah",
  "ahahahahahahahahahahahahahahahahahahahahahahahahahahahahahahahahahahahahahahahah",
];

const N = ART.length, R = 4;   /* the plate's corner radius, in cells */
const cell = (x, y) => PAL[ART[y].substr(x * 2, 2)];
if (ART.some(r => r.length !== N * 2)) throw new Error("ART is not square");

/* ---- icon.svg: one rect per run of a colour along a row ---- */
const rects = [];
for (let y = 0; y < N; y++) {
  for (let x = 0; x < N;) {
    let e = x + 1;
    while (e < N && cell(e, y) === cell(x, y)) e++;
    rects.push(`<rect x="${x}" y="${y}" width="${e - x}" height="1" fill="${cell(x, y)}"/>`);
    x = e;
  }
}
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${N} ${N}" shape-rendering="crispEdges" role="img" aria-label="The Puma Express">
<title>The Puma Express</title>
<!-- The engine under the moon. Written by tools/make-icons.js; edit the drawing there, not this file. -->
<clipPath id="p"><rect width="${N}" height="${N}" rx="${R}"/></clipPath>
<g clip-path="url(#p)">
${rects.join("\n")}
</g>
</svg>
`;
fs.writeFileSync(path.join(ROOT, "icon.svg"), svg);

/* ---- rasters. Small ones average 4x4 samples of the drawing per pixel, so
 * 16 and 32 keep the boiler's bands as colour rather than losing every
 * other row; big ones take the nearest cell, so the pixels stay pixels. ---- */
const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const cellAt = (gx, gy) => {
  const cx = Math.min(Math.max(gx, R), N - R), cy = Math.min(Math.max(gy, R), N - R);
  if (Math.hypot(gx - cx, gy - cy) > R) return null;
  return hex(cell(Math.min(N - 1, Math.floor(gx)), Math.min(N - 1, Math.floor(gy))));
};
function raster(size) {
  const px = Buffer.alloc(size * size * 4), S = size >= 2 * N ? 1 : 4;
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    let r = 0, g = 0, b = 0, a = 0;
    for (let sy = 0; sy < S; sy++) for (let sx = 0; sx < S; sx++) {
      const c = cellAt((x + (sx + 0.5) / S) / size * N, (y + (sy + 0.5) / S) / size * N);
      if (c) { r += c[0]; g += c[1]; b += c[2]; a++; }
    }
    const i = (y * size + x) * 4;
    if (a) { px[i] = r / a; px[i + 1] = g / a; px[i + 2] = b / a; px[i + 3] = 255 * a / (S * S); }
  }
  return png(size, size, px);
}

/* ---- a minimal PNG writer: RGBA, no filtering ---- */
const CRC = new Int32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c; });
const crc32 = buf => { let c = -1; for (const b of buf) c = CRC[(c ^ b) & 255] ^ (c >>> 8); return (c ^ -1) >>> 0; };
const chunk = (type, data) => {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]), crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
};
function png(w, h, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 6;
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) rgba.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4);
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("IDAT", zlib.deflateSync(raw, { level: 9 })), chunk("IEND", Buffer.alloc(0))]);
}
/* ---- ICO: a directory of PNGs ---- */
function ico(images) {
  const head = Buffer.alloc(6); head.writeUInt16LE(1, 2); head.writeUInt16LE(images.length, 4);
  let off = 6 + 16 * images.length;
  const dir = images.map(([size, data]) => {
    const e = Buffer.alloc(16);
    e[0] = size % 256; e[1] = size % 256; e.writeUInt16LE(1, 4); e.writeUInt16LE(32, 6);
    e.writeUInt32LE(data.length, 8); e.writeUInt32LE(off, 12); off += data.length;
    return e;
  });
  return Buffer.concat([head, ...dir, ...images.map(([, d]) => d)]);
}

fs.writeFileSync(path.join(ROOT, "favicon-16x16.png"), raster(16));
fs.writeFileSync(path.join(ROOT, "favicon-32x32.png"), raster(32));
fs.writeFileSync(path.join(ROOT, "apple-touch-icon.png"), raster(180));
fs.writeFileSync(path.join(ROOT, "favicon.ico"), ico([[16, raster(16)], [32, raster(32)], [48, raster(48)]]));
console.log("wrote icon.svg, favicon-16x16.png, favicon-32x32.png, apple-touch-icon.png, favicon.ico");
