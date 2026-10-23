import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { CITY_PAGES, BASE_URL } from './seo-content.mjs';
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
const urls = [BASE_URL+'/'];
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
  page = page.replace(/<h1 id="cityName">[^<]*<\/h1>/, '<h1 id="cityName">'+esc(c.name)+'</h1>');
  const schema = {
    '@context':'https://schema.org','@type':'WebPage',
    name:title,description,url,
    isPartOf:{'@type':'WebSite',name:'World Time',url:BASE_URL+'/'},
    breadcrumb:{'@type':'BreadcrumbList',itemListElement:[
      {'@type':'ListItem',position:1,name:'World Time',item:BASE_URL+'/'},
      {'@type':'ListItem',position:2,name:'Time in '+c.name,item:url}
    ]}
  };
  page = page.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/,
    '<script type="application/ld+json">'+JSON.stringify(schema)+'</script>');
  const detail = '<section class="city-seo-detail" aria-labelledby="aboutCity"><div>'+
    '<p class="section-overline">LOCAL TIME GUIDE</p><h2 id="aboutCity">What time is it in '+esc(c.name)+'?</h2>'+
    '<p>The clock above shows the current local time and date in '+esc(c.name)+', '+esc(c.country)+'. It follows the IANA time zone <strong>'+esc(c.zone)+'</strong> and adjusts automatically as official rules change.</p>'+
    '<p class="city-facts">Standard local offset: '+esc(c.offset)+'.</p>'+
    '<p>'+esc(c.detail)+'</p><p>'+esc(c.use)+'</p>'+
    '<p><a href="/">Back to the interactive world clock</a> · <a href="/wintertijd/">European clock changes</a></p></div></section>';
  page = replaceExactly(page, '    </main>',detail+'    </main>');
  await writePage('time/'+c.slug, page);
  urls.push(url);
}
const seasonal = [
  {slug:'wintertijd',label:'Wintertijd',forward:false,title:'Wintertijd: wanneer gaat de klok terug? Datum & aftellen',desc:'Wanneer begint wintertijd (winteruur) in België? Bekijk de volgende datum, de juiste kloktijd en het live aftellen tot de klok één uur teruggaat.',intro:'De wintertijd begint in België op de laatste zondag van oktober. Om 03:00 uur zomertijd gaat de klok één uur terug naar 02:00 uur wintertijd. De afteller toont de eerstvolgende omschakeling.',facts:'Wintertijd gebruikt CET (UTC+01:00). De omschakeling gebeurt om 01:00 UTC, op de laatste zondag van oktober. In 2026 is dat 25 oktober.',source:'https://robinfo.oma.be/nl/astro-info/tijd/wintertijd-zomertijd-in-2026/'},
  {slug:'zomertijd',label:'Zomertijd',forward:true,title:'Zomertijd: wanneer gaat de klok vooruit? Datum & aftellen',desc:'Wanneer begint zomertijd (zomeruur) in België? Bekijk de volgende datum, de juiste kloktijd en het live aftellen tot de klok één uur vooruitgaat.',intro:'De zomertijd begint in België op de laatste zondag van maart. Om 02:00 uur wintertijd gaat de klok één uur vooruit naar 03:00 uur zomertijd. De afteller toont de eerstvolgende omschakeling.',facts:'Zomertijd gebruikt CEST (UTC+02:00). De omschakeling gebeurt om 01:00 UTC, op de laatste zondag van maart. In 2026 was dat 29 maart.',source:'https://robinfo.oma.be/nl/astro-info/tijd/'}
];
for (const c of seasonal) {
  const url=BASE_URL+'/'+c.slug+'/';
  const other=c.forward?'wintertijd':'zomertijd';
  const isForward=c.forward;
  const page = `<!doctype html>
<html lang="nl-BE">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(c.title)} | World Time</title>
<meta name="description" content="${esc(c.desc)}">
<meta name="robots" content="index, follow, max-image-preview:large">
<link rel="canonical" href="${url}">
<meta property="og:type" content="article"><meta property="og:title" content="${esc(c.title)}">
<meta property="og:description" content="${esc(c.desc)}"><meta property="og:url" content="${url}">
<meta name="theme-color" content="#091520"><link rel="icon" href="/favicon.svg" type="image/svg+xml">
<style>
:root{color-scheme:dark;font:16px/1.65 system-ui,-apple-system,sans-serif}*{box-sizing:border-box}body{margin:0;color:#f0f5f4;background:radial-gradient(circle at 50% 12%,#153a48,#091520 62%)}header{display:flex;justify-content:space-between;max-width:1060px;margin:auto;padding:30px 24px}a{color:#b8e9d8;text-underline-offset:4px}main{max-width:870px;padding:60px 24px 100px;margin:auto}small,.eyebrow{color:#a9cdbf;letter-spacing:.15em;text-transform:uppercase}h1{font-weight:500;font-size:clamp(40px,7vw,76px);line-height:1.12;letter-spacing:-.055em;margin:18px 0 24px}h2{font-size:26px;font-weight:550}p{max-width:730px;color:#c1d0d5}.countdown{margin:34px 0;border:1px solid #3a6473;background:#112735;border-radius:18px;padding:28px}.countdown strong{display:block;font-size:clamp(28px,6vw,55px);letter-spacing:-.04em;line-height:1.3;font-variant-numeric:tabular-nums}.facts{border-left:2px solid #b8e9d8;padding-left:22px;margin:26px 0}.links{display:flex;gap:18px;flex-wrap:wrap;padding-top:20px}footer{border-top:1px solid #234454;padding:30px 24px;max-width:1060px;margin:auto;color:#aabdc7}
@media(prefers-reduced-motion:reduce){*{scroll-behavior:auto!important}}
</style>
<script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@type':'WebPage',name:c.title,url,description:c.desc,isPartOf:{'@type':'WebSite',name:'World Time',url:BASE_URL+'/'}})}</script>
</head>
<body><header><a href="/">◉ WORLD TIME</a><a href="/time/brussels/">Klok in Brussel</a></header>
<main>
<p class="eyebrow">België · Uursverandering · Juiste tijd</p>
<h1>${esc(c.title)}</h1>
<p>${esc(c.intro)}</p>
<div class="countdown"><small>Volgende omschakeling in België</small><strong id="nextDate">Datum berekenen…</strong><p id="countdown" aria-live="off">Aftellen wordt geladen…</p></div>
<h2>Gaat de klok vooruit of achteruit?</h2>
<p>In België heet ${isForward?'zomertijd ook <strong>zomeruur</strong>':'wintertijd ook <strong>winteruur</strong>'}. Beide benamingen zijn correct; zie <a href="https://www.vlaanderen.be/team-taaladvies/taaladviezen/winteruur-wintertijd" rel="noopener">Vlaanderen Taaladvies</a>.</p>
<p>${isForward?'Bij de zomertijd gaat de klok één uur vooruit: 02:00 wordt 03:00. Je verliest die nacht één uur.':'Bij de wintertijd gaat de klok één uur achteruit: 03:00 wordt 02:00. Het uur tussen 02:00 en 03:00 komt die nacht twee keer voor.'}</p>
<p class="facts">${esc(c.facts)}</p>
<h2>Hoe weet ik zeker dat mijn klok juist staat?</h2>
<p>Smartphones en computers passen de tijd meestal automatisch aan wanneer de juiste tijdzone is ingesteld. Controleer de huidige tijd voor Brussel via onze <a href="/time/brussels/">live wereldklok</a>. Een analoog horloge of manuele klok moet je mogelijk zelf verzetten.</p>
<h2>Wanneer is de volgende uursverandering?</h2>
<p>De Europese regeling voorziet de omschakeling op de laatste zondag van maart en oktober. De klok schakelt om 01:00 UTC. De datum hierboven wordt jaarlijks berekend; veranderingen in wetgeving moeten wel opnieuw worden gecontroleerd.</p>
<p>Officiële bron: <a href="${c.source}" rel="noopener">Koninklijke Sterrenwacht van België</a>.</p>
<nav class="links" aria-label="Gerelateerde pagina's"><a href="/${other}/">${isForward?'Wintertijd en klok terug':'Zomertijd en klok vooruit'}</a><a href="/">Interactieve wereldklok</a><a href="/time/london/">Tijd in Londen</a></nav>
</main><footer>WORLD TIME · een OTHRYS-hulpmiddel · <a href="/">Terug naar de wereldklok</a></footer>
<script>
(()=>{'use strict';
const forward=${JSON.stringify(isForward)};
function transition(year) {
  const month=forward?2:9;
  const d=new Date(Date.UTC(year,month+1,0,1));
  d.setUTCDate(d.getUTCDate()-d.getUTCDay());
  d.setUTCHours(1,0,0,0);
  return d;
}
function refresh() {
  const now=Date.now();
  let year=new Date(now).getUTCFullYear();
  let target=transition(year);
  if(target.getTime()<=now) target=transition(++year);
  const fmt=new Intl.DateTimeFormat('nl-BE',{timeZone:'Europe/Brussels',weekday:'long',day:'numeric',month:'long',year:'numeric'});
  document.getElementById('nextDate').textContent=fmt.format(target);
  const seconds=Math.ceil((target.getTime()-now)/1000);
  const days=Math.floor(seconds/86400), hours=Math.floor(seconds%86400/3600),minutes=Math.floor(seconds%3600/60),sec=seconds%60;
  document.getElementById('countdown').textContent=days+' dagen · '+hours+' uur · '+minutes+' minuten · '+sec+' seconden';
}
refresh();setInterval(()=>{if(!document.hidden)refresh()},1000);
})();
</script></body></html>`;
  await writePage(c.slug, page);
  urls.push(url);
}
const map='<?xml version="1.0" encoding="UTF-8"?>\n'+
'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+
urls.map(url=>'  <url><loc>'+url+'</loc></url>').join('\n')+
'\n</urlset>\n';
await writeFile(path.join(dist,'sitemap.xml'), map);
console.log('SEO page generation passed: '+urls.length+' canonical URLs, 8 city pages and 2 seasonal guides');
