// Compressed build budget. This measures transfer bytes, NOT real-user CWV or ranking.
import { readFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import path from 'node:path';
const dir=path.resolve(process.argv[2]||'dist');
const html=await readFile(path.join(dir,'index.html'),'utf8');
const scripts=[...html.matchAll(/<script\b(?=[^>]*type="module")[^>]*src="(\/assets\/[^"]+\.js)"/g)].map(m=>m[1]);
const styles=[...html.matchAll(/<link\b(?=[^>]*rel="stylesheet")[^>]*href="(\/assets\/[^"]+\.css)"/g)].map(m=>m[1]);
if(!scripts.length||!styles.length) throw new Error('No Vite entry JS/CSS assets found');
const compressed=async src=>gzipSync(await readFile(path.join(dir,src.slice(1)))).byteLength;
const js=(await Promise.all(scripts.map(compressed))).reduce((a,b)=>a+b,0);
const css=(await Promise.all(styles.map(compressed))).reduce((a,b)=>a+b,0);
const limits={initialJs:180*1024,initialCss:32*1024};
console.log('World Time compressed asset budget: entry JS '+js+' / '+limits.initialJs+' bytes, CSS '+css+' / '+limits.initialCss+' bytes');
if(js>limits.initialJs||css>limits.initialCss) throw new Error('The current build exceeds its measured compressed-entry budgets');
