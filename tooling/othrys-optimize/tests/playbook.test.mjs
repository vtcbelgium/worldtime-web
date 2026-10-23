import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { decisionFor } from '../lib/policy.mjs';
const playbook=JSON.parse(readFileSync(new URL('../sites/worldtime-ranking-playbook.json',import.meta.url),'utf8'));
test('covers ten unique tactics',()=>{assert.equal(playbook.tactics.length,10);assert.equal(new Set(playbook.tactics.map(t=>t.id)).size,10)});
test('each tactic includes measurement, next action and gate',()=>{for(const t of playbook.tactics){assert.ok(t.name&&t.deliverable&&t.measurement&&t.next);assert.ok(['AUTO_READ','PR_REVIEW','OWNER_APPROVAL'].includes(t.authority))}});
test('agent cannot auto publish, outreach or schedule jobs',()=>{assert.equal(playbook.rules.automaticPublishing,false);assert.equal(playbook.rules.automaticOutreach,false);assert.equal(playbook.rules.automaticScheduling,false);assert.equal(decisionFor('BUY_BACKLINKS'),'PROHIBITED')});
