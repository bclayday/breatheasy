import { readFileSync, writeFileSync } from 'fs';

const qrB64 = readFileSync('/Users/brucetaylor/Projects/breatheasy/marketing/qr-code.png').toString('base64');
const dataUrl = `data:image/png;base64,${qrB64}`;

const template = readFileSync('/Users/brucetaylor/Projects/breatheasy/marketing/gen-business-card.mjs', 'utf8');
const updated = template.replace('src="qr-code.png"', `src="${dataUrl}"`);
writeFileSync('/Users/brucetaylor/Projects/breatheasy/marketing/gen-business-card-final.mjs', updated);
console.log('QR embedded, saved to gen-business-card-final.mjs');
