// Optional offline evidence parsers; no Search Console credentials or live data required.
import { LEVELS } from './audit.mjs';
export function analyzeSearchConsole(rows, {origin, minImpressions=100}={}) {
  const evidence=[], clean=(Array.isArray(rows)?rows:rows?.data||[]);
  if(!clean.length) return [{code:'GSC_NO_DATA',severity:'opportunity',page:origin||'',evidence:'No rows yet (not proof of zero traffic).',recommendation:'Wait for Search Console to collect data; verify domain ownership and sitemap first.',gate:'AUTO_READ'}];
  for(const row of clean) {
    const page=String(row.page||row.url||'');
    if (origin && page && !page.startsWith(origin+'/')) continue;
    const imp=Number(row.impressions),clicks=Number(row.clicks),position=Number(row.position);
    if(!Number.isFinite(imp)||imp<minImpressions||!Number.isFinite(clicks)||!Number.isFinite(position)) continue;
    const ctr=imp>0?clicks/imp:0;
    if(position>=3 && position<=15 && ctr<0.02) {
      evidence.push({code:'GSC_CTR_OPPORTUNITY',severity:'opportunity',page,
        evidence:imp+' impressions, '+clicks+' clicks, '+(ctr*100).toFixed(1)+'% CTR, position '+position.toFixed(1),
        recommendation:'Review intent and actual SERP snippet before editing the title; compare after sufficient new data.',gate:'PR_REVIEW'});
    }
  }
  return evidence.sort((a,b)=>(LEVELS[a.severity]||2)-(LEVELS[b.severity]||2));
}
export function analyzeLighthouse(data, budgets={}) {
  const issues=[], audits=data?.audits||{}, categories=data?.categories||{};
  const numeric=(id)=>Number(audits[id]?.numericValue);
  const budget={lcp:2500,cls:0.1,tbt:200,...budgets};
  const checks=[['largest-contentful-paint','LCP',budget.lcp,'ms'],
    ['cumulative-layout-shift','CLS',budget.cls,''],
    ['total-blocking-time','TBT',budget.tbt,'ms']];
  for (const [id,label,threshold,unit] of checks) {
    if(!(id in audits) || !Number.isFinite(numeric(id))) continue;
    if (numeric(id)>threshold) issues.push({code:'LH_'+label,severity:'warning',page:data.finalUrl||'',
      evidence:label+' '+numeric(id).toFixed(label==='CLS'?3:0)+unit+' > '+threshold+unit,
      recommendation:'Profile the rendering path and fix the measured cause; rerun the test on mobile.',gate:'PR_REVIEW'});
  }
  if (!categories.performance) issues.push({code:'LH_NO_PERFORMANCE',severity:'opportunity',page:data.finalUrl||'',evidence:'No Lighthouse performance category',recommendation:'Measure with Chrome Lighthouse CI.',gate:'AUTO_READ'});
  return issues;
}
