import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import path from 'node:path';
import { CITY_PAGES, BASE_URL } from './seo-content.mjs';
import { SEASONAL } from './seasonal-pages.mjs';

const dist=path.resolve('dist');
const sitemap=await readFile(path.join(dist,'sitemap.xml'),'utf8');
const routes=[
  {slug:'',lang:'en',city:null,seasonal:null},
  ...CITY_PAGES.map(c=>({slug:'time/'+c.slug,lang:'en',city:c,seasonal:null})),
  ...SEASONAL.flatMap(c=>[
    {slug:c.nl,lang:'nl-BE',city:null,seasonal:c},
    {slug:c.en,lang:'en',city:null,seasonal:c}
  ])
];
const uniqueTitles=new Set(),known=new Set(routes.map(x=>'/'+(x.slug?x.slug+'/':'')));
const seasonalCount={en:0,'nl-BE':0};
for(const route of routes){
  const html=await readFile(path.join(dist,route.slug,'index.html'),'utf8');
  const url=BASE_URL+'/'+(route.slug?route.slug+'/':'');
  const title=html.match(/<title>([^<]+)<\/title>/)?.[1];
  const canonical=html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  const description=html.match(/<meta name="description" content="([^"]+)"/)?.[1];
  assert.ok(title?.length>30,'Missing title: '+route.slug);
  assert.ok(description?.length>80,'Missing description: '+route.slug);
  assert.equal(canonical,url,'Incorrect canonical: '+route.slug);
  assert.ok(!uniqueTitles.has(title),'Duplicate title: '+title);uniqueTitles.add(title);
  assert.ok(sitemap.includes('<loc>'+url+'</loc>'),'Missing sitemap URL: '+url);
  assert.match(html,new RegExp('<html lang="'+route.lang+'"'),'Incorrect page language: '+route.slug);
  assert.equal((html.match(/<h1\b/g)||[]).length,1,'Incorrect H1 count: '+route.slug);
  if(route.city){
    assert.ok(html.includes('data-seo-city="'+route.city.name+'"'),'Incorrect client city: '+route.slug);
    assert.ok(html.includes('CORRECT TIME IN '+route.city.name.toUpperCase()),'City H1: '+route.slug);
    assert.ok(html.includes('id="cityName">'+route.city.name+'</div>'),'City label: '+route.slug);
    assert.ok(html.includes(route.city.zone),'Missing IANA zone: '+route.slug);
    assert.ok(html.includes('class="city-seo-detail"'),'City details missing: '+route.slug);
    assert.ok(html.includes('application/ld+json'),'Missing JSON-LD: '+route.slug);
  }
  if(route.slug===''){
    assert.ok(html.includes('WORLD CLOCK · CORRECT TIME NOW'),'Homepage intent heading missing');
    assert.ok(html.includes('id="shareTime"'),'Share button missing');
  }
  if(!route.seasonal){
    // English UI must never drop readers straight into Dutch-language pages.
    assert.ok(html.includes('href="/winter-time-belgium/"'),'English winter guide link missing: '+route.slug);
    assert.ok(html.includes('href="/summer-time-belgium/"'),'English summer guide link missing: '+route.slug);
    assert.ok(!html.includes('href="/wintertijd/"'),'English page links directly to Dutch winter guide: '+route.slug);
    assert.ok(!html.includes('href="/zomertijd/"'),'English page links directly to Dutch summer guide: '+route.slug);
    assert.ok(!html.includes('Wintertijd: wanneer'),'Dutch UI copy on English route: '+route.slug);
  } else {
    seasonalCount[route.lang]++;
    const c=route.seasonal;
    assert.ok(html.includes('id="countdown"'),'Countdown missing: '+route.slug);
    assert.ok(html.includes(c.source),'Official source missing: '+route.slug);
    assert.ok(!/20\d{2}/.test(description),'Seasonal snippet not evergreen: '+route.slug);
    for(const [locale,slug] of [['en',c.en],['nl-BE',c.nl]]){
      const required='<link rel="alternate" hreflang="'+locale+'" href="'+BASE_URL+'/'+slug+'/">';
      assert.ok(html.includes(required),'Broken hreflang reciprocity: '+route.slug+' '+locale);
    }
    const counterpart=route.lang==='en'?c.nl:c.en;
    assert.ok(html.includes('href="/'+counterpart+'/"'),'Visible language switch missing: '+route.slug);
    assert.ok(html.includes('href="/'+(c.forward?(route.lang==='en'?'winter-time-belgium':'wintertijd'):(route.lang==='en'?'summer-time-belgium':'zomertijd'))+'/">'),'Related same-language clock change missing: '+route.slug);
    if(route.lang==='en'){
      assert.ok(html.includes('Next clock change in Belgium'),'English countdown label missing: '+route.slug);
      assert.ok(html.includes('How can I check the correct time?'),'English supporting content missing: '+route.slug);
      assert.ok(!html.includes('Gaat de klok vooruit of achteruit?'),'Dutch headings on English guide: '+route.slug);
    } else {
      assert.ok(html.includes('Volgende omschakeling in België'),'Dutch countdown label missing: '+route.slug);
      assert.ok(html.includes('Hoe weet ik zeker dat mijn klok juist staat?'),'Dutch supporting content missing: '+route.slug);
      assert.ok(!html.includes('Do clocks go forward or back?'),'English headings on Dutch guide: '+route.slug);
    }
  }
  // All root-relative navigational links must reach a generated URL (ignore static assets).
  for(const match of html.matchAll(/<a\b[^>]*href="(\/[^"]+)"/g)){
    assert.ok(known.has(match[1]),'Broken internal link on '+route.slug+': '+match[1]);
  }
}
assert.equal(seasonalCount.en,2,'Expected two English guides');
assert.equal(seasonalCount['nl-BE'],2,'Expected two Dutch guides');
assert.equal((sitemap.match(/<url>/g)||[]).length,routes.length,'Sitemap route count');
assert.equal(routes.length,13,'Expected exactly 13 well-scoped pages');
console.log('Locale/SEO output verified: '+routes.length+' pages (9 English clocks, 2 English clock-change guides, 2 Dutch clock-change guides), correct metadata, links and reciprocal hreflang.');
