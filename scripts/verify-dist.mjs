import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import path from 'node:path';
import { CITY_PAGES, BASE_URL } from './seo-content.mjs';
const dist=path.resolve('dist');
const sitemap=await readFile(path.join(dist,'sitemap.xml'),'utf8');
const routes=[{slug:'',lang:'en',city:null},...CITY_PAGES.map(c=>({slug:'time/'+c.slug,lang:'en',city:c})),{slug:'wintertijd',lang:'nl-BE',city:null},{slug:'zomertijd',lang:'nl-BE',city:null}];
const seen=new Set();
for(const route of routes){
  const html=await readFile(path.join(dist,route.slug,'index.html'),'utf8');
  const url=BASE_URL+'/'+(route.slug?route.slug+'/':'');
  const title=html.match(/<title>([^<]+)<\/title>/)?.[1];
  const canonical=html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  const description=html.match(/<meta name="description" content="([^"]+)"/)?.[1];
  assert.ok(title?.length>30, 'Missing useful title: '+route.slug);
  assert.ok(description?.length>80, 'Missing useful description: '+route.slug);
  assert.equal(canonical,url,'Canonical mismatch: '+route.slug);
  assert.ok(!seen.has(title),'Duplicate page title: '+title);
  seen.add(title);
  assert.ok(sitemap.includes('<loc>'+url+'</loc>'),'Missing sitemap URL '+url);
  assert.ok(html.includes('lang="'+route.lang+'"'),'Incorrect page language: '+route.slug);
  if(route.city){
    assert.ok(html.includes('data-seo-city="'+route.city.name+'"'),'Client starting city mismatch');
    assert.ok(html.includes(route.city.zone),'City time-zone facts missing');
    assert.ok(html.includes('class="city-seo-detail"'),'City-specific content missing');
    assert.ok(html.includes('application/ld+json'),'Structured data missing');
  }
  if(route.slug==='wintertijd'||route.slug==='zomertijd'){
    assert.ok(html.includes('id="countdown"'),'Clock-change countdown missing');
    assert.ok(html.includes('Koninklijke Sterrenwacht'),'Official Belgian source missing');
    assert.ok(!/20\\d{2}/.test(description),'Seasonal meta description must be evergreen: '+route.slug);
  }
}
assert.equal((sitemap.match(/<url>/g)||[]).length,routes.length,'Sitemap URL count mismatch');
console.log('SEO output verification passed: '+routes.length+' unique indexable HTML pages, titles, canonicals, guides and sitemap links');
