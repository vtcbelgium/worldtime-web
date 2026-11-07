#!/usr/bin/env node
// Explicit invocation only. Production read-only GET checks; no browser automation and no schedule.
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {checkHttpDocument} from '../lib/smoke.mjs';
const args=process.argv.slice(2);
const json=args.includes('--json');
const confArg=args.indexOf('--config');
if(confArg>=0 && (!args[confArg+1]||args[confArg+1].startsWith('--'))) throw Error('Missing --config value');
const configPath=path.resolve(confArg>=0?args[confArg+1]:'tooling/othrys-optimize/sites/worldtime.json');
const config=JSON.parse(await readFile(configPath,'utf8'));
const origin=new URL(config.baseUrl).origin;
if(new URL(config.baseUrl).protocol!=='https:')throw Error('Only HTTPS origins are allowed.');
const pages=['/','/time/','/time/new-york/','/time/london/','/time/tokyo/','/time/sydney/','/time/dubai/','/time/mumbai/','/time/kathmandu/','/time/brussels/','/sitemap.xml','/api/time'];
const outcomes=[];
for(const pathName of pages) {
  const url=origin+pathName;
  try{
    const response=await fetch(url,{method:'GET',redirect:'manual',cache:'no-store',
      headers:{'Accept':'text/html, application/xml, application/json'},signal:AbortSignal.timeout(12000)});
    const content=await response.text();
    const issues=checkHttpDocument({url,path:pathName,body:content,status:response.status,
      contentType:response.headers.get('content-type')||''});
    outcomes.push({url,status:response.status,passed:issues.length===0,issues});
  }catch(e){outcomes.push({url,passed:false,issues:['NETWORK_OR_FETCH_ERROR'],detail:String(e.message).slice(0,200)})}
}
const result={site:origin,mode:'READ_ONLY_HTTP_SMOKE',checks:outcomes,passed:outcomes.every(x=>x.passed),
  limits:'Does not verify browser interaction, map visibility, Lighthouse or Core Web Vitals.'};
process.stdout.write(json?JSON.stringify(result,null,2)+'\n':outcomes.map(x=>(x.passed?'PASS ':'FAIL ')+x.url+' '+x.issues.join(', ')).join('\n')+'\n');
if(!result.passed)process.exitCode=2;
