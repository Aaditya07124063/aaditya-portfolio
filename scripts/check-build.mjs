import {readFileSync,existsSync,readdirSync} from 'node:fs';
import {join} from 'node:path';
import assert from 'node:assert/strict';
const pages=[];
function walk(dir){for(const item of readdirSync(dir,{withFileTypes:true})){const path=join(dir,item.name);if(item.isDirectory())walk(path);else if(path.endsWith('.html'))pages.push(path)}}walk('dist');
assert.equal(pages.length,11,'Expected eleven built pages');
for(const file of pages){
 const html=readFileSync(file,'utf8');
 assert.equal((html.match(/<h1(?:\s|>)/g)||[]).length,1,`${file}: one h1`);
 assert(!/Claim boundaries|Asset and publication notes|public-copy:start|Editorial plan/.test(html),`${file}: editorial notes leaked`);
 for(const [,url] of html.matchAll(/(?:href|src)="(\/[^"#?]*)/g)){
  const target=decodeURIComponent(url);const relative=`dist${target}`;
  assert(existsSync(relative)&&(target==='/'||!relative.endsWith('.html'))||existsSync(`${relative}/index.html`),`${file}: missing asset/link ${target}`);
 }
}
const ct=readFileSync('dist/projects/pancreatic-ct/index.html','utf8');
assert(!/99\.91|79\.05|98\.60/.test(ct),'CT report-derived results must remain withheld');
for(const family of ['Gaengu','Coconat','GoogleSansFlex'])assert(existsSync(`dist/fonts/${family}.woff2`),`Missing ${family}`);
console.log(`Passed: ${pages.length} pages, headings, internal links and assets, public-copy boundaries, fonts, and CT publication rule.`);
