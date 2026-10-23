import test from 'node:test';
import assert from 'node:assert/strict';
import {planOptimization,reportMarkdown} from '../lib/planner.mjs';
const site='https://worldtime.othrys.be';
const make=opt=>planOptimization({site,at:'2026-10-24T00:00:00Z',...opt});
test('no made-up tasks with no evidence',()=>{
 const p=make({});assert.equal(p.tasks.length,0);assert.equal(p.status,'PROPOSED_ONLY');
});
test('robots blocking gets P0 before marketing recommendations',()=>{
 const p=make({audit:{issues:[
  {code:'WEBSITE_SCHEMA',severity:'opportunity',page:site+'/',recommendation:'Mark up site name.'},
  {code:'NOINDEX',severity:'error',page:site+'/',evidence:'noindex',recommendation:'Fix noindex.'}
 ]}});
 assert.equal(p.tasks[0].code,'NOINDEX');assert.equal(p.tasks[0].priority,'P0');
});
test('GSC empty rows mean observation, not zero traffic',()=>{
 const p=make({gsc:{data:[]}});assert.equal(p.tasks[0].code,'WAIT_FOR_GSC');
 assert.equal(p.tasks[0].authority,'AUTO_READ');
 assert.ok(p.tasks[0].evidence.includes('does not mean no visitors'));
});
test('qualifying GSC data yields an owner-gated experiment',()=>{
 const p=make({gsc:{data:[{page:site+'/time/tokyo/',impressions:500,clicks:2,position:9}]}});
 const task=p.tasks[0];assert.equal(task.code,'GSC_SNIPPET_RESEARCH');assert.equal(task.authority,'OWNER_APPROVAL');
});
test('too little or irrelevant GSC data does not spawn work',()=>{
 const p=make({gsc:[{page:site+'/time/tokyo/',impressions:20,clicks:0,position:9},
  {page:'https://evil.example/',impressions:1000,clicks:0,position:8}]});
 assert.equal(p.tasks.length,0);
});
test('missing field is not interpreted as zero',()=>{
 const p=make({gsc:[{page:site+'/',clicks:0,position:10}]});assert.equal(p.tasks.length,0);
});
test('Lighthouse lab LCP over budget is flagged correctly',()=>{
 const p=make({lighthouse:{finalUrl:site+'/',audits:{
  'largest-contentful-paint':{numericValue:3800},'cumulative-layout-shift':{numericValue:0.02}}}});
 assert.equal(p.tasks[0].code,'LAB_LCP');assert.equal(p.tasks[0].priority,'P1');
 assert.ok(p.sources.lighthouse.includes('real-user CWV not implied'));
});
test('high-performing lab results do not generate an improvement ticket',()=>{
 const p=make({lighthouse:{audits:{'largest-contentful-paint':{numericValue:1200}}}});
 assert.equal(p.tasks.length,0);
});
test('ranking playbook research tasks cannot grant outreach',()=>{
 const p=make({playbook:{tactics:[{id:'RANK-02',state:'approval-gated',name:'Backlinks',next:'Research, do not email.'}]}});
 assert.equal(p.tasks[0].action,'AUDIT');assert.equal(p.tasks[0].authority,'AUTO_READ');
});
test('the same audit issue is deduplicated',()=>{
 const issue={code:'CANONICAL_MISSING',severity:'error',page:site+'/'};
 assert.equal(make({audit:{issues:[issue,issue]}}).tasks.length,1);
});
test('unsafe origin is rejected',()=>assert.throws(()=>planOptimization({site:'http://sample.test'}),/HTTPS/));
test('planner never grants deploy, recurring jobs or external outreach',()=>{
 const p=make({gsc:{data:[]}});assert.equal(p.safety.productionWrites,false);
 assert.equal(p.safety.recurringJobs,false);assert.equal(p.safety.outboundOutreach,false);
});
test('markdown output contains an explicit proposal status',()=>{
 const text=reportMarkdown(make({gsc:{data:[]}}));
 assert.ok(text.includes('PROPOSED_ONLY'));assert.ok(text.includes('AUTO_READ'));
});
