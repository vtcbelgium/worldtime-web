import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { CITY_PAGES, BASE_URL } from './seo-content.mjs';
import { writeSeasonalPages } from './seasonal-pages.mjs';
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
  page = page.replace(/<h1 class="clock-kicker" id="pageHeadline">[^<]*<\/h1>/,
    '<h1 class="clock-kicker" id="pageHeadline">CORRECT TIME IN '+esc(c.name.toUpperCase())+'</h1>');
  page = page.replace(/<div class="clock-location" id="cityName">[^<]*<\/div>/,
    '<div class="clock-location" id="cityName">'+esc(c.name)+'</div>');
  const schema = {
    '@context':'https://schema.org','@type':'WebPage',
    name:title,description,url,
    isPartOf:{'@type':'WebSite',name:'World Time',url:BASE_URL+'/'},
    breadcrumb:{'@type':'BreadcrumbList',itemListElement:[
      {'@type':'ListItem',position:1,name:'World Time',item:BASE_URL+'/'},
      {'@type':'ListItem',position:2,name:'Time in '+c.name,item:url}
    ]}
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
  const detail = '<section class="city-seo-detail" aria-labelledby="aboutCity"><div>'+
    '<p class="section-overline">LOCAL TIME GUIDE</p><h2 id="aboutCity">What time is it in '+esc(c.name)+'?</h2>'+
    '<p>The clock above shows the current local time and date in '+esc(c.name)+', '+esc(c.country)+'. It follows the IANA time zone <strong>'+esc(c.zone)+'</strong> and adjusts automatically as official rules change.</p>'+
    '<p class="city-facts">Standard local offset: '+esc(c.offset)+'.</p>'+
    '<p>'+esc(c.detail)+'</p><p>'+esc(c.use)+'</p>'+
    '<p>Compare the clock with: '+compare+'.</p>'+ 
    '<p><a href="/">Back to the interactive world clock</a>'+ (c.zone.startsWith('Europe/') ? ' · <a href="/winter-time-belgium/">European clock changes</a>' : '')+'</p></div></section>';
  page = replaceExactly(page, '    </main>',detail+'    </main>');
  await writePage('time/'+c.slug, page);
  urls.push(url);
}
urls.push(...await writeSeasonalPages({dist, baseUrl:BASE_URL}));
const map='<?xml version="1.0" encoding="UTF-8"?>\n'+
'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+
urls.map(url=>'  <url><loc>'+url+'</loc></url>').join('\n')+
'\n</urlset>\n';
await writeFile(path.join(dist,'sitemap.xml'), map);
console.log('SEO page generation passed: '+urls.length+' canonical URLs, 8 city pages and 4 localized seasonal guides');
