// Gradi public/fonts/archivo-latin.woff2 i archivo-latin-ext.woff2: Archivo (osi wdth + wght), samo znakovi potrebni za hrvatski web.
// Pokretanje: node scripts/subset-font.mjs
import { readFile, writeFile } from 'node:fs/promises';
import subsetFont from 'subset-font';

const src = [
  'node_modules/@fontsource-variable/archivo/files/archivo-latin-wdth-normal.woff2',
  'node_modules/@fontsource-variable/archivo/files/archivo-latin-ext-wdth-normal.woff2',
];

let ascii = '';
for (let c = 0x20; c <= 0x7e; c++) ascii += String.fromCharCode(c);
const extra = 'čćđšžČĆĐŠŽ–—„“”‘’…•·€²³°×±→←↑↓ ';
const text = ascii + extra;

const out = [];
for (const file of src) {
  const buf = await readFile(file);
  out.push(await subsetFont(buf, text, { targetFormat: 'woff2', preserveNameIds: [1, 2] }));
}
// latin i latin-ext su odvojene datoteke s istim osima; spremamo obje pod jasnim imenima
await writeFile('public/fonts/archivo-latin.woff2', out[0]);
await writeFile('public/fonts/archivo-latin-ext.woff2', out[1]);
console.log('latin', out[0].length, 'latin-ext', out[1].length);
