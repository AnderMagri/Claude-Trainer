// Builds a standalone copy of the course in dist/ for any static host (Vercel, Netlify, GitHub Pages).
// index.html is written as an Artifact page (no <html>/<head>); this wraps it in a full document.
// Run: node scripts/build.mjs
import { readFileSync, writeFileSync, mkdirSync, cpSync } from 'node:fs';

const page = readFileSync('index.html', 'utf8');
const shell = [
  '<!doctype html>',
  '<html lang="en">',
  '<head>',
  '<meta charset="utf-8">',
  '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">',
  '<style>:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;font:14px system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style>',
  '</head>',
  '<body>',
  page,
  '</body>',
  '</html>',
  ''
].join('\n');

mkdirSync('dist', { recursive: true });
writeFileSync('dist/index.html', shell);
cpSync('js', 'dist/js', { recursive: true, force: true });
cpSync('content', 'dist/content', { recursive: true, force: true });
console.log('Built dist/ — open dist/index.html or deploy the dist folder.');
