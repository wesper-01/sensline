// Run this after any edit to index.html: node update-csp.js
// The page's security policy only allows code matching these fingerprints, so an edited page is blocked until they're refreshed.
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const file = path.join(__dirname, 'index.html');
let html = fs.readFileSync(file, 'utf8');
const hash = text => `'sha256-${crypto.createHash('sha256').update(text, 'utf8').digest('base64')}'`;
const blocks = tag => [...html.matchAll(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, 'g'))].map(m => hash(m[1]));
const policy = [
  "default-src 'none'",
  `script-src ${blocks('script').join(' ')}`,
  `style-src ${blocks('style').join(' ')}`,
  "img-src data:", // only the built-in tab icon
  "base-uri 'none'",
  "form-action 'none'",
].join('; ');
const tag = `<!-- csp:start --><meta http-equiv="Content-Security-Policy" content="${policy}"><!-- csp:end -->`;
const updated = html.replace(/<!-- csp:start -->.*<!-- csp:end -->/, () => tag);
if (updated === html && !html.includes(policy)) throw new Error('CSP markers not found');
fs.writeFileSync(file, updated);
console.log(policy);
