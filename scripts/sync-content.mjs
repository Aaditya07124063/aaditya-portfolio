import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
const titles = Object.fromEntries(readFileSync('portfolio/metadata-and-microcopy.md','utf8').split('\n').filter(l=>l.startsWith('| `/')).map(l=>{const p=l.split('|').map(x=>x.trim());return [p[1].replaceAll('`',''),{title:p[2],description:p[3]}]}));
const captions={resqnet:'Illustrative relay path between connected devices. No measured range or delivery reliability is implied.','trading-lab':'A conceptual research notebook, not a performance chart. Signals, execution, and reporting are separate stages.','pancreatic-ct':'Illustrative patient grouping. All slices from a patient stay in a single evaluation partition.',eeg:'Conceptual signal illustration, not a patient recording. Filtering, feature extraction, and classifier comparison describe the research pipeline.',logstonedb:'Illustrative three-node target. The current project starts with deterministic simulation.'};
for(const [file,route] of [['pages/about','/about'],['pages/contact','/contact'],['pages/writing','/writing'],['pages/404','/404'],...Object.keys(captions).map(s=>[`case-studies/${s}`,`/projects/${s}`])]){
 const source=readFileSync(`portfolio/${file}.md`,'utf8');
 const match=source.match(/<!-- public-copy:start -->([\s\S]*?)<!-- public-copy:end -->/);
 if(!match)throw new Error(`No public copy boundary in ${file}`);
 let body=match[1].trim();
 // The handoff requires primary-report confirmation before publishing CT numbers.
 if(route==='/projects/pancreatic-ct')body=body.replace(/## What the reported numbers say[\s\S]*?(?=## What the report leaves open)/,'');
 const slug=file.startsWith('case-studies')?file.split('/')[1]:null;
 const meta=titles[route]??{title:'Page not found · Aaditya Adhikari',description:'This page could not be found. Browse the projects or return to the homepage.'};
 const output=`src/pages${route}.md`;mkdirSync(output.substring(0,output.lastIndexOf('/')),{recursive:true});
 const front={layout:slug?'../../layouts/Article.astro':'../layouts/Article.astro',...meta,...(slug?{project:slug,caption:captions[slug]}:{})};
 writeFileSync(output,'---\n'+Object.entries(front).map(([k,v])=>`${k}: ${JSON.stringify(v)}`).join('\n')+'\n---\n\n'+body+'\n');
}
console.log('Synced nine bounded public-copy pages. CT numerical section withheld per publication notes.');
