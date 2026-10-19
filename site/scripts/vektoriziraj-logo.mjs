// Jednokratno: ../prototip/logo.jpg → public/logo.svg (potrace), obrezano na sadržaj.
import potrace from 'potrace';
import { writeFile } from 'node:fs/promises';

potrace.trace('../prototip/logo.jpg', { threshold: 128, turdSize: 4, optTolerance: 0.3 }, async (err, svg) => {
  if (err) throw err;
  const d = [...svg.matchAll(/ d="([^"]+)"/g)].map((m) => m[1]).join(' ');
  // sadržaj logotipa u izvorniku je otprilike x 112–560, y 155–392
  const out = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="108 150 458 246" role="img" aria-label="Podovi GJP"><path d="${d}" fill="currentColor" fill-rule="evenodd"/></svg>\n`;
  await writeFile('public/logo.svg', out);
  console.log('logo.svg', out.length, 'B');
});
