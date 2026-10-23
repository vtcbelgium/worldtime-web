#!/usr/bin/env node
/**
 * OTHRYS Optimization Kit v0.1 — read-only, zero-runtime-dependency auditor.
 * No scheduled requests, production writes, keyword generation or AI keys.
 */
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { auditSnapshot, parseSitemap } from '../lib/audit.mjs';
import { analyzeSearchConsole, analyzeLighthouse } from '../lib/signals.mjs';
import { decisionFor } from '../lib/policy.mjs';

function parseArgs(argv) {
  const result={config:'tooling/othrys-optimize/sites/worldtime.json',strict:false,json:false};
  for(let i=0;i<argv.length;i++){
    const arg=argv[i];
    if(arg==='--strict'||arg==='--json') result[arg.slice(2)]=true;
    else if(['--config','--dist','--gsc-json','--lighthouse-json','--report-dir'].includes(arg)){
      if(!argv[i+1]||argv[i+1].startsWith('--')) throw Error('Missing value for '+arg);
      result[arg.slice(2)]=argv[++i];
    } else throw Error('Unknown option '+arg+' (use --config, --dist, --gsc-json, --lighthouse-json, --report-dir, --json, --strict)');
  }
  return result;
}
function actionFor(issue) {
  if(issue.code==='GSC_NO_DATA'||issue.gate==='AUTO_READ') return 'AUDIT';
  if(issue.code==='WEBSITE_SCHEMA'||issue.code==='SOCIAL_TITLE'||issue.code==='GSC_CTR_OPPORTUNITY') return 'EDIT_CONTENT';
  return 'OPEN_DRAFT_PR';
}
function markdown(result) {
  const out=[
    '# OTHRYS Optimization Audit',
    '',
    '- **Target:** '+result.site,
    '- **Snapshot:** '+result.generatedAt,
    '- **Built HTML pages:** '+result.facts.pagesChecked,
    '- **Sitemap URLs:** '+result.facts.sitemapUrls,
    '- **Errors / warnings / opportunities:** '+result.facts.errors+' / '+result.facts.warnings+' / '+result.facts.opportunities,
    '- **Mode:** static build; external metrics optional',
    '',
    '## Findings'
  ];
  if(!result.issues.length)out.push('No issues detected by the deterministic checks. This is **not** proof of high rankings or quality.');
  for(const issue of result.issues)out.push(
    '- **'+issue.severity.toUpperCase()+' · '+issue.code+'** — '+issue.page+'\n  - Evidence: '+issue.evidence+'\n  - Suggested: '+issue.recommendation+'\n  - Gate: '+issue.gate
  );
  out.push('','## Operating policy',
    'Auto-read and diagnosis are allowed. Publish, link outreach, recurring jobs, bulk pages and paid actions need owner approval. Google ordinary-page indexing is **not** available through the restricted Indexing API.',
    '','## Next evidence',
    'Check GSC page/query impressions, indexed URLs and real-user CWV before creating more city pages. Lighthouse synthetic scores are not real-user CWV.',
    '');
  return out.join('\n');
}
async function main() {
  const args=parseArgs(process.argv.slice(2));
  const config=JSON.parse(await readFile(path.resolve(args.config),'utf8'));
  const origin=new URL(config.baseUrl).origin;
  if(new URL(config.baseUrl).protocol!=='https:')throw Error('Require HTTPS canonical base URL');
  const dist=path.resolve(args.dist||config.distDir||'dist');
  const sitemap=await readFile(path.join(dist,'sitemap.xml'),'utf8');
  const robots=await readFile(path.join(dist,'robots.txt'),'utf8').catch(()=>'');
  const urls=parseSitemap(sitemap);
  if(urls.length>(config.maxPages||150))throw Error('Page cap exceeded; do not audit unbounded URLs');
  const pages=[];
  for(const url of urls) {
    const parsed=new URL(url);
    if(parsed.origin!==origin) continue;
    const pathname=decodeURIComponent(parsed.pathname).replace(/^\/+/,'');
    const htmlPath=path.resolve(dist,pathname,'index.html');
    if(!htmlPath.startsWith(dist+path.sep) && htmlPath!==path.join(dist,'index.html')) throw Error('Unsafe route: '+url);
    const html=await readFile(htmlPath,'utf8').catch(()=>'');
    if(html) pages.push({url,html});
  }
  const base=auditSnapshot({baseUrl:config.baseUrl,pages,sitemapXml:sitemap,robotsText:robots,maxHtmlBytes:config.maxHtmlBytes||750000});
  const issues=[...base.issues];
  if(args['gsc-json']) {
    const raw=JSON.parse(await readFile(path.resolve(args['gsc-json']),'utf8'));
    issues.push(...analyzeSearchConsole(raw,{origin,minImpressions:config.minImpressions||100}));
  }
  if(args['lighthouse-json']) {
    const raw=JSON.parse(await readFile(path.resolve(args['lighthouse-json']),'utf8'));
    issues.push(...analyzeLighthouse(raw,config.performanceBudget));
  }
  const proposals=issues.map((issue,i)=>{
    const action=actionFor(issue);
    return {id:'SEO-'+String(i+1).padStart(3,'0'),action,authority:decisionFor(action),
      issueCode:issue.code,site:config.baseUrl,page:issue.page,
      evidence:issue.evidence,acceptance:'Verify source claim, run tests and audit before proposing a reviewed PR.',
      status:'PROPOSED_ONLY'};
  });
  const facts={...base.facts,errors:issues.filter(x=>x.severity==='error').length,
    warnings:issues.filter(x=>x.severity==='warning').length,
    opportunities:issues.filter(x=>x.severity==='opportunity').length};
  const result={schemaVersion:1,site:config.baseUrl,generatedAt:new Date().toISOString(),facts,issues,proposals};
  if(args['report-dir']) {
    const out=path.resolve(args['report-dir']);
    await mkdir(out,{recursive:true});
    await Promise.all([
      writeFile(path.join(out,'audit.json'),JSON.stringify(result,null,2)+'\n'),
      writeFile(path.join(out,'audit.md'),markdown(result)),
      writeFile(path.join(out,'proposals.json'),JSON.stringify(proposals,null,2)+'\n')
    ]);
  }
  process.stdout.write(args.json?JSON.stringify(result,null,2)+'\n':markdown(result));
  if(args.strict && facts.errors)process.exitCode=2;
}
main().catch(error=>{console.error('[OTH RYS OPTIMIZER] '+error.message);process.exitCode=1});
