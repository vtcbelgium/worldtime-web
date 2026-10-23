#!/usr/bin/env node
// Manual evidence triage. The agent does not call any external service or perform writes other than optional reports.
import { readFile,mkdir,writeFile } from 'node:fs/promises';
import path from 'node:path';
import { planOptimization, reportMarkdown } from '../lib/planner.mjs';
const defaults={audit:'.reports/optimization/audit.json',
  config:'tooling/othrys-optimize/sites/worldtime.json',
  playbook:'tooling/othrys-optimize/sites/worldtime-ranking-playbook.json'};
function parse(argv){
 const r={...defaults};
 for(let i=0;i<argv.length;i++){
  const k=argv[i];
  if(k==='--json')r.json=true;
  else if(['--audit','--config','--playbook','--gsc-json','--lighthouse-json','--out'].includes(k)){
    if(!argv[i+1]||argv[i+1].startsWith('--'))throw Error('Missing value for '+k);
    r[k.slice(2)]=argv[++i];
  } else throw Error('Unknown option '+k);
 }
 return r;
}
async function readJson(filename,optional=false) {
 if(!filename)return null;
 try{return JSON.parse(await readFile(path.resolve(filename),'utf8'))}
 catch(e){if(optional&&e.code==='ENOENT')return null;throw e}
}
async function main(){
 const args=parse(process.argv.slice(2));
 const [config,audit,playbook,gsc,lighthouse]=await Promise.all([
   readJson(args.config),readJson(args.audit),readJson(args.playbook,true),
   readJson(args['gsc-json']),readJson(args['lighthouse-json'])
 ]);
 if(audit.site&&new URL(audit.site).origin!==new URL(config.baseUrl).origin)
   throw Error('Audit/site mismatch: refusing cross-site synthesis.');
 const result=planOptimization({site:config.baseUrl,audit,playbook,gsc,lighthouse,
   at:new Date().toISOString(),minImpressions:config.minImpressions||100});
 if(args.out){
   const directory=path.resolve(args.out);await mkdir(directory,{recursive:true});
   await Promise.all([
     writeFile(path.join(directory,'plan.json'),JSON.stringify(result,null,2)+'\n'),
     writeFile(path.join(directory,'plan.md'),reportMarkdown(result))
   ]);
 }
 process.stdout.write(args.json?JSON.stringify(result,null,2)+'\n':reportMarkdown(result));
}
main().catch(e=>{console.error('[OTHRYS PLAN] '+e.message);process.exitCode=1});
