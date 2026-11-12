import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { CITY_PAGES, BASE_URL, HUB_URL, HUB_NAME, timeBreadcrumbs } from './seo-content.mjs';
const dist = path.resolve('dist');
const home = await readFile(path.join(dist, 'index.html'), 'utf8');
if (!home.includes('seo-hub') || !home.includes('id="cityName"')) throw new Error('Missing home template landmarks');
const esc = (s) => String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const replaceExactly = (src, before, after) => {
  const n = src.split(before).length - 1;
  if (n !== 1) throw new Error('Expected one SEO template placeholder, got '+n+' for '+before.slice(0,70));
  return src.replace(before, after);
};
const writePage = async (route, content) => {
  const directory = path.join(dist, route);
  await mkdir(directory,{recursive:true});
  await writeFile(path.join(directory,'index.html'), content);
};
const urls = [BASE_URL+'/', HUB_URL];
for(const c of CITY_PAGES) {
  const title = 'Current Time in '+c.name+' – Correct Local Time Now | World Time';
  const description = 'Find the correct local time in '+c.name+', '+c.country+'. Live clock, '+c.zone+' time zone, daylight saving updates and UTC offset. Explore the world time map.';
  const url = BASE_URL+'/time/'+c.slug+'/';
  let page = home;
  page = replaceExactly(page, '<html lang="en">', '<html lang="en" data-seo-city="'+esc(c.name)+'">');
  page = page.replace(/<title>[^<]*<\/title>/, '<title>'+esc(title)+'</title>');
  page = page.replace(/<meta name="description" content="[^"]*" \/>/, '<meta name="description" content="'+esc(description)+'" />');
  page = page.replace(/<link rel="canonical" href="[^"]*" \/>/, '<link rel="canonical" href="'+url+'" />');
  page = page.replace(/<meta property="og:url" content="[^"]*" \/>/, '<meta property="og:url" content="'+url+'" />');
  page = page.replace(/<meta property="og:title" content="[^"]*" \/>/, '<meta property="og:title" content="'+esc(title)+'" />');
  page = page.replace(/<meta property="og:description" content="[^"]*" \/>/, '<meta property="og:description" content="'+esc(description)+'" />');
  page = page.replace(/<h1 class="clock-kicker" id="pageHeadline">[^<]*<\/h1>/,
    '<h1 class="clock-kicker" id="pageHeadline">CORRECT TIME IN '+esc(c.name.toUpperCase())+'</h1>');
  page = page.replace(/<div class="clock-location" id="cityName">[^<]*<\/div>/,
    '<div class="clock-location" id="cityName">'+esc(c.name)+'</div>');
  const schema = {
    '@context':'https://schema.org','@type':'WebPage',
    name:title,description,url,
    isPartOf:{'@type':'WebSite',name:'World Time',url:BASE_URL+'/'},
    breadcrumb:timeBreadcrumbs(c)
  };
  // Preserve WebSite/WebApplication markup; append the city's own WebPage facts.
  page = page.replace('</head>', '<script type="application/ld+json">'+JSON.stringify(schema)+'</script>\n</head>');
  const related = {
    'new-york': [['London','/time/london/']],
    london: [['New York','/time/new-york/'],['Brussels','/time/brussels/']],
    tokyo: [['Sydney','/time/sydney/']],
    sydney: [['Tokyo','/time/tokyo/']],
    dubai: [['Mumbai','/time/mumbai/']],
    mumbai: [['Dubai','/time/dubai/'],['Kathmandu','/time/kathmandu/']],
    kathmandu: [['Mumbai','/time/mumbai/']],
    brussels: [['London','/time/london/']]
  };
  const compare = (related[c.slug] || []).map(([name,path])=>'<a href="'+path+'">Time in '+esc(name)+'</a>').join(' · ');
  const detail = '<section class="city-seo-detail" id="citySeoDetail" aria-labelledby="aboutCity"><div>'+
    '<nav aria-label="Breadcrumb"><a href="/">World Time</a> / <a href="/time/">'+HUB_NAME+'</a> / Time in '+esc(c.name)+'</nav>'+
    '<p class="section-overline">LOCAL TIME GUIDE</p><h2 id="aboutCity">What time is it in '+esc(c.name)+'?</h2>'+
    '<p>The clock above shows the current local time and date in '+esc(c.name)+', '+esc(c.country)+'. It follows the IANA time zone <strong>'+esc(c.zone)+'</strong> and adjusts automatically as official rules change.</p>'+
    '<p class="city-facts">Standard local offset: '+esc(c.offset)+'.</p>'+
    '<p>'+esc(c.detail)+'</p><p>'+esc(c.use)+'</p>'+
    '<p>Compare the clock with: '+compare+'.</p>'+ 
    '<p><a href="/">Back to the interactive world clock</a></p></div></section>';
  page = replaceExactly(page, '    </main>',detail+'    </main>');
  await writePage('time/'+c.slug, page);
  urls.push(url);
}
// Crawlable index of the reviewed city clocks; facts come from the same CITY_PAGES data.
const hubTitle='World Clocks by City: Local Time and UTC Offsets | World Time';
const hubDescription='Browse live world clocks for New York, London, Tokyo, Sydney, Dubai, Mumbai, Kathmandu and Brussels, with each IANA time zone and UTC offset.';
const hubSchema={
  '@context':'https://schema.org','@type':'CollectionPage',
  name:hubTitle,description:hubDescription,url:HUB_URL,
  isPartOf:{'@type':'WebSite',name:'World Time',url:BASE_URL+'/'},
  breadcrumb:timeBreadcrumbs()
};
const hubCities=CITY_PAGES.map(c=>'<li><a href="/time/'+c.slug+'/">Time in '+esc(c.name)+'</a><br>'+esc(c.country)+' · <code>'+esc(c.zone)+'</code><br>'+esc(c.offset)+'</li>').join('\n');
const hubHtml=`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(hubTitle)}</title>
<meta name="description" content="${esc(hubDescription)}" />
<meta name="robots" content="index,follow">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<meta property="og:title" content="${esc(hubTitle)}">
<meta property="og:description" content="${esc(hubDescription)}">
<meta property="og:type" content="website">
<meta property="og:url" content="${HUB_URL}">
<link rel="canonical" href="${HUB_URL}" />
<script type="application/ld+json">${JSON.stringify(hubSchema)}</script>
<style>body{margin:0;background:#090b10;color:#f3f5f8;font:17px/1.7 system-ui,sans-serif}main{max-width:780px;margin:auto;padding:40px 24px 80px}a{color:#38bdf8}h1{line-height:1.2;font-size:clamp(2rem,5vw,3rem)}ul{list-style:none;margin:32px 0;padding:0}li{padding:14px 0;border-top:1px solid #222938}code{background:#0e121a;border-radius:6px;padding:2px 5px}nav{margin-bottom:42px}footer{border-top:1px solid #222938;padding-top:20px}</style></head><body><main>
<nav aria-label="Breadcrumb"><a href="/">World Time</a> / ${HUB_NAME}</nav>
<h1>World clocks by city</h1>
<p>Each page below shows the live local time and date for one city, using its named IANA time zone so daylight-saving changes are followed automatically.</p>
<ul>
${hubCities}
</ul>
<p>Why a named zone matters more than a fixed offset: read the <a href="/guides/time-zone-accuracy/">time zone accuracy guide</a>.</p>
<footer><a href="/">Back to the interactive world clock</a></footer></main></body></html>`;
await writePage('time', hubHtml);
// One original, crawlable editorial reference; no automatic keyword/location pages.
const guideUrl=BASE_URL+'/guides/time-zone-accuracy/';
const guideHtml=`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Time Zone Accuracy: UTC Offsets, IANA Zones and DST | World Time</title>
<meta name="description" content="Understand why UTC offsets differ from named IANA time zones, with real Brussels daylight-saving and Nepal quarter-hour examples and practical JavaScript." />
<meta name="robots" content="index,follow">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<meta property="og:title" content="Time Zone Accuracy: IANA Zones, UTC Offsets and DST | World Time">
<meta property="og:description" content="Understand time-zone accuracy with Brussels daylight-saving, India and Nepal offset examples.">
<meta property="og:type" content="article">
<meta property="og:url" content="${guideUrl}">
<link rel="canonical" href="${guideUrl}" />
<style>body{margin:0;background:#090b10;color:#f3f5f8;font:17px/1.7 system-ui,sans-serif}main{max-width:780px;margin:auto;padding:40px 24px 80px}a{color:#38bdf8}h1,h2{line-height:1.2}h1{font-size:clamp(2rem,5vw,3rem)}section{margin:32px 0}code,pre{background:#0e121a;border-radius:6px}code{padding:2px 5px}pre{padding:18px;overflow-x:auto}pre code{padding:0}nav{margin-bottom:42px}footer{border-top:1px solid #222938;padding-top:20px}</style></head><body><main>
<nav aria-label="Breadcrumb"><a href="/">World Time</a> / Time zone accuracy</nav>
<article><h1>Time zone accuracy: why UTC offsets are not enough</h1>
<p>A fixed offset such as UTC+01:00 tells you the difference from UTC at one instant. A named IANA time zone such as <code>Europe/Brussels</code> describes rules that can change by date, including daylight-saving transitions.</p>
<section><h2>One local hour, two different instants</h2>
<p>In Brussels on 25 October 2026 the local clock shows 02:30 twice. At 00:30 UTC it is 02:30 UTC+02:00. At 01:30 UTC it is 02:30 UTC+01:00. If you store only local wall time, the moment is ambiguous.</p></section>
<section><h2>Not all offsets are whole hours</h2>
<p>Mumbai uses <code>Asia/Kolkata</code> (UTC+05:30), while Kathmandu uses <code>Asia/Kathmandu</code> (UTC+05:45). The difference between these cities is fifteen minutes.</p>
<p>Try the live <a href="/time/mumbai/">Mumbai clock</a>, <a href="/time/kathmandu/">Kathmandu clock</a>, and <a href="/time/brussels/">Brussels clock</a>.</p></section>
<section><h2>Format a known UTC instant in JavaScript</h2>
<pre><code>const instant = new Date('2026-10-25T01:30:00Z');
const formatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/Brussels',
  dateStyle: 'full',
  timeStyle: 'long'
});
console.log(formatter.format(instant));</code></pre>
<p>Named time zones let the runtime select the appropriate offset for that date. Keep your runtime's time-zone data updated; future rules may change by law.</p></section>
<section><h2>How to check a world clock</h2><p>Check the city and IANA identifier, transitions near clock changes, half-hour and quarter-hour offsets, and whether the date changes when comparing continents. WorldTime uses server calibration when available and identifies when it falls back to the device clock.</p></section>
<section><h2>References</h2><p><a href="https://www.iana.org/time-zones">IANA Time Zone Database</a> · <a href="https://tc39.es/ecma402/#datetimeformat-objects">ECMA-402 Intl.DateTimeFormat</a></p></section>
</article><footer><a href="/">Back to the interactive world clock</a></footer></main></body></html>`;
await writePage('guides/time-zone-accuracy', guideHtml);
urls.push(guideUrl);
const map='<?xml version="1.0" encoding="UTF-8"?>\n'+
'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+
urls.map(url=>'  <url><loc>'+url+'</loc></url>').join('\n')+
'\n</urlset>\n';
await writeFile(path.join(dist,'sitemap.xml'), map);
console.log('SEO page generation passed: '+urls.length+' canonical URLs, 8 city pages, 1 city hub, 1 accuracy guide, no seasonal guides');
