import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
const clean=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
export const SEASONAL = Object.freeze([
  { nl:'wintertijd',en:'winter-time-belgium',forward:false,source:'https://robinfo.oma.be/nl/astro-info/tijd/wintertijd-zomertijd-in-2026/',
    nlCopy:{
      title:'Wintertijd: wanneer gaat de klok terug? Datum & aftellen',
      description:'Wanneer begint wintertijd (winteruur) in België? Bekijk de volgende datum, de juiste kloktijd en het live aftellen tot de klok één uur teruggaat.',
      intro:'De wintertijd begint in België op de laatste zondag van oktober. Om 03:00 uur zomertijd gaat de klok één uur terug naar 02:00 uur wintertijd. De afteller toont de eerstvolgende omschakeling.',
      facts:'Wintertijd gebruikt CET (UTC+01:00). De omschakeling gebeurt om 01:00 UTC, op de laatste zondag van oktober.'
    },
    enCopy:{
      title:'Winter Time in Belgium: When Do Clocks Go Back? | Countdown',
      description:'When do clocks go back in Belgium? Check the next winter time change, correct local time and a live countdown to the change.',
      intro:'Belgium returns to standard time on the last Sunday in October. At 03:00 summer time, clocks go back to 02:00 standard time. The countdown shows the next change.',
      facts:'Belgium observes Central European Time (CET, UTC+01:00) in winter. The change takes place at 01:00 UTC on the last Sunday in October.'
    }},
  { nl:'zomertijd',en:'summer-time-belgium',forward:true,source:'https://robinfo.oma.be/nl/astro-info/tijd/',
    nlCopy:{
      title:'Zomertijd: wanneer gaat de klok vooruit? Datum & aftellen',
      description:'Wanneer begint zomertijd (zomeruur) in België? Bekijk de volgende datum, de juiste kloktijd en het live aftellen tot de klok één uur vooruitgaat.',
      intro:'De zomertijd begint in België op de laatste zondag van maart. Om 02:00 uur wintertijd gaat de klok één uur vooruit naar 03:00 uur zomertijd. De afteller toont de eerstvolgende omschakeling.',
      facts:'Zomertijd gebruikt CEST (UTC+02:00). De omschakeling gebeurt om 01:00 UTC, op de laatste zondag van maart.'
    },
    enCopy:{
      title:'Summer Time in Belgium: When Do Clocks Go Forward? | Countdown',
      description:'When do clocks go forward in Belgium? Check the next daylight saving change, correct local time and a live countdown.',
      intro:'Belgium enters daylight saving time on the last Sunday in March. At 02:00 standard time, clocks move forward to 03:00 summer time. The countdown shows the next change.',
      facts:'Belgium observes Central European Summer Time (CEST, UTC+02:00) in summer. The change takes place at 01:00 UTC on the last Sunday in March.'
    }}
]);
const ui = {
  en:{
    brussels:'Time in Brussels',switch:'Nederlands',eyebrow:'Belgium · Clock changes · Correct time',
    next:'Next clock change in Belgium',loading:'Calculating date…',waiting:'Loading countdown…',
    direction:'Do clocks go forward or back?',
    nextQuestion:'When is the next clock change?',
    nextBody:'Under current European rules, clocks change on the last Sundays of March and October, at 01:00 UTC. Dates are calculated annually; future legislation could change this schedule.',
    accurate:'How can I check the correct time?',
    accurateBody:'Phones and computers normally adjust automatically when the correct time zone is selected. Check our <a href="/time/brussels/">live Brussels clock</a>. You may need to adjust an analogue or manual clock yourself.',
    official:'Official source (Dutch):',officialName:'Royal Observatory of Belgium',
    links:'Related pages',main:'Interactive world clock',london:'Time in London',
    footer:'an OTHRYS utility',back:'Back to the world clock',
    winterLink:'When do clocks go back?',summerLink:'When do clocks go forward?'
  },
  nl:{
    brussels:'Klok in Brussel (Engels)',switch:'English',eyebrow:'België · Uursverandering · Juiste tijd',
    next:'Volgende omschakeling in België',loading:'Datum berekenen…',waiting:'Aftellen wordt geladen…',
    direction:'Gaat de klok vooruit of achteruit?',
    nextQuestion:'Wanneer is de volgende uursverandering?',
    nextBody:'Volgens de huidige Europese regeling verandert de klok op de laatste zondag van maart en oktober, om 01:00 UTC. De datum wordt jaarlijks berekend. Nieuwe regelgeving kan deze planning wijzigen.',
    accurate:'Hoe weet ik zeker dat mijn klok juist staat?',
    accurateBody:'Smartphones en computers passen de tijd meestal automatisch aan als de tijdzone juist staat. Controleer de tijd voor Brussel via onze <a href="/time/brussels/">wereldklok (Engels)</a>. Een analoog horloge moet je mogelijk zelf verzetten.',
    official:'Officiële bron:',officialName:'Koninklijke Sterrenwacht van België',
    links:'Gerelateerde pagina’s',main:'Interactieve wereldklok (Engels)',london:'Tijd in Londen (Engels)',
    footer:'een OTHRYS-hulpmiddel',back:'Terug naar de wereldklok (Engels)',
    winterLink:'Wintertijd en klok terug',summerLink:'Zomertijd en klok vooruit'
  }
};
function contentFor(c,lang,baseUrl) {
  const dutch=lang==='nl-BE',key=dutch?'nl':'en',x=ui[key],copy=dutch?c.nlCopy:c.enCopy;
  const slug=c[key],other=SEASONAL.find(a=>a.forward!==c.forward)[key],counterpart=c[dutch?'en':'nl'];
  const url=baseUrl+'/'+slug+'/',nextLang=dutch?'en':'nl-BE';
  const alternate='<link rel="alternate" hreflang="nl-BE" href="'+baseUrl+'/'+c.nl+'/">'+
    '<link rel="alternate" hreflang="en" href="'+baseUrl+'/'+c.en+'/">';
  const explanation=dutch
    ? (c.forward?'In België heet zomertijd ook <strong>zomeruur</strong>. Beide benamingen zijn correct.':'In België heet wintertijd ook <strong>winteruur</strong>. Beide benamingen zijn correct.')
    : (c.forward?'Summer time is also known as <strong>daylight saving time</strong>. Belgium uses the Europe/Brussels time zone.':'Winter time is <strong>standard time</strong> in Belgium. The Europe/Brussels time zone handles the switch.');
  const movement=dutch
    ? (c.forward?'De klok gaat één uur vooruit: 02:00 wordt 03:00. Die nacht duurt één uur korter.':'De klok gaat één uur terug: 03:00 wordt 02:00. Het uur tussen 02:00 en 03:00 komt tweemaal voor.')
    : (c.forward?'Clocks move one hour forward: 02:00 becomes 03:00. That local hour is skipped.':'Clocks move one hour back: 03:00 becomes 02:00. The local hour between 02:00 and 03:00 occurs twice.');
  const otherName=c.forward?x.winterLink:x.summerLink;
  const json={'@context':'https://schema.org','@type':'WebPage',name:copy.title,url,description:copy.description,isPartOf:{'@type':'WebSite',name:'World Time',url:baseUrl+'/'}};
  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${clean(copy.title)} | World Time</title>
<meta name="description" content="${clean(copy.description)}">
<meta name="robots" content="index, follow, max-image-preview:large">
<link rel="canonical" href="${url}">
${alternate}
<meta property="og:type" content="article"><meta property="og:title" content="${clean(copy.title)}">
<meta property="og:description" content="${clean(copy.description)}"><meta property="og:url" content="${url}">
<meta name="theme-color" content="#091520"><link rel="icon" href="/favicon.svg" type="image/svg+xml">
<style>
:root{color-scheme:dark;font:16px/1.65 system-ui,-apple-system,sans-serif}*{box-sizing:border-box}body{margin:0;color:#f0f5f4;background:radial-gradient(circle at 50% 12%,#153a48,#091520 62%)}header{display:flex;justify-content:space-between;max-width:1060px;margin:auto;padding:30px 24px;align-items:center;gap:16px;flex-wrap:wrap}a{color:#b8e9d8;text-underline-offset:4px}main{max-width:870px;padding:60px 24px 100px;margin:auto}small,.eyebrow{color:#a9cdbf;letter-spacing:.15em;text-transform:uppercase}h1{font-weight:500;font-size:clamp(40px,7vw,76px);line-height:1.12;letter-spacing:-.055em;margin:18px 0 24px}h2{font-size:26px;font-weight:550}p{max-width:730px;color:#c1d0d5}.countdown{margin:34px 0;border:1px solid #3a6473;background:#112735;border-radius:18px;padding:28px}.countdown strong{display:block;font-size:clamp(28px,6vw,55px);letter-spacing:-.04em;line-height:1.3;font-variant-numeric:tabular-nums}.facts{border-left:2px solid #b8e9d8;padding-left:22px;margin:26px 0}.links{display:flex;gap:18px;flex-wrap:wrap;padding-top:20px}footer{border-top:1px solid #234454;padding:30px 24px;max-width:1060px;margin:auto;color:#aabdc7}@media(prefers-reduced-motion:reduce){*{scroll-behavior:auto!important}}
</style>
<script type="application/ld+json">${JSON.stringify(json)}</script>
</head>
<body><header><a href="/">◉ WORLD TIME</a><a href="/time/brussels/">${x.brussels}</a><a href="/${counterpart}/" lang="${nextLang}" hreflang="${nextLang}">${x.switch}</a></header>
<main>
<p class="eyebrow">${x.eyebrow}</p>
<h1>${clean(copy.title)}</h1>
<p>${clean(copy.intro)}</p>
<div class="countdown"><small>${x.next}</small><strong id="nextDate">${x.loading}</strong><p id="countdown" aria-live="off">${x.waiting}</p></div>
<h2>${x.direction}</h2><p>${explanation}</p><p>${movement}</p>
<p class="facts">${clean(copy.facts)}</p>
<h2>${x.accurate}</h2><p>${x.accurateBody}</p>
<h2>${x.nextQuestion}</h2><p>${x.nextBody}</p>
<p>${x.official} <a href="${c.source}" rel="noopener">${x.officialName}</a>.</p>
<nav class="links" aria-label="${x.links}"><a href="/${other}/">${otherName}</a><a href="/">${x.main}</a><a href="/time/london/">${x.london}</a></nav>
</main><footer>WORLD TIME · ${x.footer} · <a href="/">${x.back}</a></footer>
<script>
(()=>{'use strict';
const forward=${JSON.stringify(c.forward)},locale=${JSON.stringify(dutch?'nl-BE':'en-GB')};
function transition(year){const month=forward?2:9;const d=new Date(Date.UTC(year,month+1,0,1));d.setUTCDate(d.getUTCDate()-d.getUTCDay());d.setUTCHours(1,0,0,0);return d}
function refresh(){
 const now=Date.now();let year=new Date(now).getUTCFullYear();let target=transition(year);
 if(target.getTime()<=now)target=transition(++year);
 document.getElementById('nextDate').textContent=new Intl.DateTimeFormat(locale,{timeZone:'Europe/Brussels',weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(target);
 const seconds=Math.ceil((target.getTime()-now)/1000),days=Math.floor(seconds/86400),hours=Math.floor(seconds%86400/3600),minutes=Math.floor(seconds%3600/60),sec=seconds%60;
 document.getElementById('countdown').textContent=locale==='nl-BE'
   ?days+' dagen · '+hours+' uur · '+minutes+' minuten · '+sec+' seconden'
   :days+' days · '+hours+' hours · '+minutes+' minutes · '+sec+' seconds';
}
refresh();setInterval(()=>{if(!document.hidden)refresh()},1000);
})();
</script></body></html>`;
}
export async function writeSeasonalPages({dist,baseUrl}) {
  const urls=[];
  for(const item of SEASONAL) for(const lang of ['nl-BE','en']) {
    const route=lang==='nl-BE'?item.nl:item.en;
    await mkdir(path.join(dist,route),{recursive:true});
    await writeFile(path.join(dist,route,'index.html'),contentFor(item,lang,baseUrl));
    urls.push(baseUrl+'/'+route+'/');
  }
  return urls;
}
