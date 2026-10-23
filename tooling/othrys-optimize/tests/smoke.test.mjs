import test from 'node:test';
import assert from 'node:assert/strict';
import {checkHttpDocument} from '../lib/smoke.mjs';
const site='https://worldtime.othrys.be';
const page=(path,body)=>({url:site+path,path,body,status:200,contentType:'text/html'});
test('valid home page passes structural response checks',()=>{
 const p=page('/','<!doctype html><html><head><link rel="canonical" href="'+site+'/"></head><body><h1>WORLD CLOCK · CORRECT TIME NOW</h1><button id="shareTime">Share</button></body></html>');
 assert.deepEqual(checkHttpDocument(p),[]);
});
test('invalid redirect or other status cannot pass',()=>{
 const p=page('/','<html><h1>Hello</h1></html>');p.status=302;
 assert.ok(checkHttpDocument(p).includes('HTTP_NOT_200'));
});
test('canonical mismatches fail',()=>{
 const p=page('/time/tokyo/','<html><head><link rel="canonical" href="'+site+'/"></head><body><h1>CORRECT TIME IN TOKYO</h1></body></html>');
 assert.ok(checkHttpDocument(p).includes('CANONICAL_MISMATCH'));
});
test('clock API checks source and numeric timestamp',()=>{
 assert.deepEqual(checkHttpDocument({url:site+'/api/time',path:'/api/time',body:JSON.stringify({unixMs:1792780000000,source:'server'}),status:200}),[]);
 assert.ok(checkHttpDocument({url:site+'/api/time',path:'/api/time',body:'invalid',status:200}).includes('BAD_SERVER_TIMESTAMP'));
});
test('sitemap requires valid XML URL listings',()=>{
 assert.deepEqual(checkHttpDocument({url:site+'/sitemap.xml',path:'/sitemap.xml',body:'<urlset><url><loc>https://worldtime.othrys.be/</loc></url></urlset>',status:200}),[]);
});
