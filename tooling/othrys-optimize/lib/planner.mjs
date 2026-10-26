// OTHRYS Optimizer v0.2: rank evidence, never execute an action.
import { decisionFor } from './policy.mjs';
const ranks={P0:0,P1:1,P2:2,P3:3};
const asRows=data=>Array.isArray(data)?data:Array.isArray(data?.data)?data.data:[];
const numeric=x=>x===null||x===undefined||x===''?NaN:Number(x);
function safePage(value,origin) {
  try{const u=new URL(value);return u.protocol==='https:'&&u.origin===origin?u.origin+u.pathname:null}
  catch{return null}
}
const candidate=(code,priority,page,source,evidence,action,hypothesis,metric,authority)=>
  ({code,priority,page,source,evidence,action,authority:authority||decisionFor(action),
    hypothesis,successMetric:metric,status:'PROPOSED_ONLY'});
export function planOptimization({site,audit={},gsc=null,lighthouse=null,playbook=null,at=new Date().toISOString(),minImpressions=100,limit=12}) {
  const url=new URL(site);
  if(url.protocol!=='https:')throw Error('A canonical HTTPS origin is required.');
  if(!Number.isInteger(limit)||limit<1||limit>50)throw Error('Invalid task limit.');
  const origin=url.origin,entries=[],sources={audit:'not supplied',gsc:'not supplied',lighthouse:'not supplied'};
  if(Array.isArray(audit.issues)) {
    sources.audit=audit.issues.length+' issues';
    for(const e of audit.issues){
      const wait=e.code==='GSC_NO_DATA';
      const priority=wait?'P3':e.severity==='error'?'P0':e.severity==='warning'?'P1':'P2';
      entries.push(candidate(e.code||'AUDIT_FINDING',priority,safePage(e.page,origin)||origin+'/',
        'build-audit',String(e.evidence||'Observed issue'),wait?'OBSERVE':'OPEN_DRAFT_PR',
        String(e.recommendation||'Investigate and verify the finding.'),
        wait?'Wait for real query impressions.':'Issue resolved with passing build and browser regression checks.',
        wait?'AUTO_READ':undefined));
    }
  }
  if(gsc!==null){
    const rows=asRows(gsc);sources.gsc=rows.length+' rows';
    for(const row of rows){
      const page=safePage(row.page||row.url,origin);
      const impressions=numeric(row.impressions),clicks=numeric(row.clicks),pos=numeric(row.position);
      if(!page||!Number.isFinite(impressions)||!Number.isFinite(clicks)||!Number.isFinite(pos)||
        impressions<minImpressions||impressions<=0||clicks<0||clicks>impressions||pos<1)continue;
      if(pos>=4&&pos<=15&&clicks/impressions<.02){
        entries.push(candidate('GSC_SNIPPET_RESEARCH','P2',page,'search-console',
          impressions+' impressions, '+clicks+' clicks, avg position '+pos.toFixed(1),
          'EDIT_CONTENT','Research intent and actual search result before proposing a change.',
          'Comparable query-level CTR and clicks at a similar average position.'));
      }
    }
    if(!rows.length)entries.push(candidate('WAIT_FOR_GSC','P3',origin+'/','search-console',
      'No search-performance rows; this does not mean no visitors.','OBSERVE',
      'Do not change headings based on nonexistent metrics.','First observed nonbranded impressions.','AUTO_READ'));
  }
  if(lighthouse!==null){
    // Never attribute a Lighthouse measurement of another origin to this site.
    const measuredPage=safePage(lighthouse.finalUrl,origin);
    const scores=measuredPage?lighthouse.audits||{}:{};
    const checks=[['LCP','largest-contentful-paint',2500,'ms'],['CLS','cumulative-layout-shift',.1,''],['TBT','total-blocking-time',200,'ms']];
    sources.lighthouse=measuredPage?'provided synthetic lab evidence for '+measuredPage+'; real-user CWV not implied':'unusable: missing or cross-origin finalUrl; no lab tasks created';
    for(const [label,key,budget,unit] of checks){
      const n=numeric(scores[key]?.numericValue);
      if(Number.isFinite(n)&&n>budget){
        entries.push(candidate('LAB_'+label,'P1',safePage(lighthouse.finalUrl,origin)||origin+'/',
          'lighthouse-lab',label+' '+n.toFixed(label==='CLS'?3:0)+unit+' > '+budget+unit,
          'OPEN_DRAFT_PR','Profile measured cause without sacrificing correctness.',
          'Repeatable lab improvement; collect field CWV separately.'));
      }
    }
  }
  if(Array.isArray(playbook?.tactics)){
    for(const t of playbook.tactics.filter(x=>['research-only','approval-gated'].includes(x.state))){
      entries.push(candidate(t.id+'_RESEARCH','P3',origin+'/','ranking-playbook',
        'No verified growth metric yet for '+t.name,'AUDIT',String(t.next||'Validate demand first.'),
        String(t.measurement||'Relevant user demand.'),'AUTO_READ'));
    }
  }
  const seen=new Set();
  const all=entries.sort((a,b)=>ranks[a.priority]-ranks[b.priority]||a.source.localeCompare(b.source)||a.code.localeCompare(b.code))
    .filter(x=>{const k=x.code+'|'+x.page;if(seen.has(k))return false;seen.add(k);return true});
  const tasks=all.slice(0,limit).map((t,i)=>({id:'OPT-'+String(i+1).padStart(3,'0'),...t}));
  return {schemaVersion:2,site:origin,generatedAt:at,status:'PROPOSED_ONLY',sources,
    summary:{candidates:all.length,shown:tasks.length,p0:all.filter(x=>x.priority==='P0').length,p1:all.filter(x=>x.priority==='P1').length},
    tasks,safety:{productionWrites:false,recurringJobs:false,outboundOutreach:false}};
}
export function reportMarkdown(r){
  const lines=['# OTHRYS Optimizer v0.2','',
    'Site: '+r.site,'Status: '+r.status,
    'Evidence: '+JSON.stringify(r.sources),
    'Total candidates: '+r.summary.candidates,''];
  if(!r.tasks.length)lines.push('No reliable optimization candidate yet. Gather more evidence.');
  for(const t of r.tasks)lines.push('## '+t.id+' | '+t.priority+' | '+t.code,'',
    '- Evidence ('+t.source+'): '+t.evidence,
    '- Page: '+t.page,
    '- Hypothesis: '+t.hypothesis,
    '- Metric: '+t.successMetric,
    '- Action: '+t.action+'; Gate: '+t.authority,'');
  lines.push('No changes, emails, paid actions or scheduled jobs were performed.','');
  return lines.join('\n');
}
