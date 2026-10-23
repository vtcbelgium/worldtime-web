import { geoEquirectangular, geoPath, geoGraticule10 } from 'd3-geo';
import { feature, mesh } from 'topojson-client';
import { clockSample, calibratedNow, nextSecondDelay } from './clock-core.js';
import landTopo from 'world-atlas/countries-110m.json';
import './style.css';

// Maps are visual; time is always calculated using real IANA time-zone IDs.
const W = 1800;
const H = 860;
const projection = geoEquirectangular().scale(W / (2 * Math.PI)).translate([W / 2, H / 2]);
const path = geoPath(projection);
const $ = (selector) => document.querySelector(selector);
const dom = {
  app: $('#app'), map: $('#worldMap'), layers: $('#worldLayers'), shell: $('#mapShell'),
  main: $('#timeMain'), seconds: $('#timeSeconds'), name: $('#cityName'), country: $('#countryName'),
  date: $('#dayDate'), zone: $('#zoneInfo'), utc: $('#utcCaption'), status: $('#clockStatus'),
  search: $('#citySearch'), searchWrap: $('#searchWrap'), results: $('#searchResults'),
  theme: $('#themeToggle'), prev: $('#prevZone'), next: $('#nextZone'), locate: $('#locate'),
  cityRow: $('#cityRow')
};

const CITIES = [
  ['Brussels','Belgium','Europe/Brussels',50.85,4.35],
  ['London','United Kingdom','Europe/London',51.51,-.13],
  ['New York','United States','America/New_York',40.71,-74.01],
  ['Tokyo','Japan','Asia/Tokyo',35.68,139.69],
  ['Los Angeles','United States','America/Los_Angeles',34.05,-118.24],
  ['Sydney','Australia','Australia/Sydney',-33.87,151.21],
  ['Dubai','United Arab Emirates','Asia/Dubai',25.2,55.27],
  ['Paris','France','Europe/Paris',48.86,2.35],
  ['Amsterdam','Netherlands','Europe/Amsterdam',52.37,4.9],
  ['Berlin','Germany','Europe/Berlin',52.52,13.4],
  ['Rome','Italy','Europe/Rome',41.9,12.5],
  ['Madrid','Spain','Europe/Madrid',40.42,-3.7],
  ['Lisbon','Portugal','Europe/Lisbon',38.72,-9.14],
  ['Zurich','Switzerland','Europe/Zurich',47.38,8.54],
  ['Stockholm','Sweden','Europe/Stockholm',59.33,18.06],
  ['Oslo','Norway','Europe/Oslo',59.91,10.75],
  ['Copenhagen','Denmark','Europe/Copenhagen',55.68,12.57],
  ['Helsinki','Finland','Europe/Helsinki',60.17,24.94],
  ['Athens','Greece','Europe/Athens',37.98,23.73],
  ['Istanbul','Turkey','Europe/Istanbul',41.01,28.98],
  ['Moscow','Russia','Europe/Moscow',55.75,37.62],
  ['Kyiv','Ukraine','Europe/Kyiv',50.45,30.52],
  ['Warsaw','Poland','Europe/Warsaw',52.23,21.01],
  ['Vienna','Austria','Europe/Vienna',48.21,16.37],
  ['Prague','Czechia','Europe/Prague',50.08,14.44],
  ['Reykjavik','Iceland','Atlantic/Reykjavik',64.15,-21.94],
  ['Dublin','Ireland','Europe/Dublin',53.35,-6.26],
  ['Toronto','Canada','America/Toronto',43.65,-79.38],
  ['Vancouver','Canada','America/Vancouver',49.28,-123.12],
  ['Chicago','United States','America/Chicago',41.88,-87.63],
  ['San Francisco','United States','America/Los_Angeles',37.77,-122.42],
  ['Mexico City','Mexico','America/Mexico_City',19.43,-99.13],
  ['São Paulo','Brazil','America/Sao_Paulo',-23.55,-46.63],
  ['Buenos Aires','Argentina','America/Argentina/Buenos_Aires',-34.6,-58.38],
  ['Lima','Peru','America/Lima',-12.05,-77.04],
  ['Bogotá','Colombia','America/Bogota',4.71,-74.07],
  ['Santiago','Chile','America/Santiago',-33.45,-70.67],
  ['Cairo','Egypt','Africa/Cairo',30.04,31.24],
  ['Cape Town','South Africa','Africa/Johannesburg',-33.92,18.42],
  ['Johannesburg','South Africa','Africa/Johannesburg',-26.2,28.04],
  ['Lagos','Nigeria','Africa/Lagos',6.52,3.38],
  ['Nairobi','Kenya','Africa/Nairobi',-1.29,36.82],
  ['Riyadh','Saudi Arabia','Asia/Riyadh',24.71,46.68],
  ['Tehran','Iran','Asia/Tehran',35.69,51.39],
  ['Karachi','Pakistan','Asia/Karachi',24.86,67.01],
  ['Mumbai','India','Asia/Kolkata',19.08,72.88],
  ['New Delhi','India','Asia/Kolkata',28.61,77.21],
  ['Kolkata','India','Asia/Kolkata',22.57,88.36],
  ['Kathmandu','Nepal','Asia/Kathmandu',27.72,85.32],
  ['Dhaka','Bangladesh','Asia/Dhaka',23.81,90.41],
  ['Bangkok','Thailand','Asia/Bangkok',13.76,100.5],
  ['Singapore','Singapore','Asia/Singapore',1.35,103.82],
  ['Kuala Lumpur','Malaysia','Asia/Kuala_Lumpur',3.14,101.69],
  ['Jakarta','Indonesia','Asia/Jakarta',-6.21,106.85],
  ['Manila','Philippines','Asia/Manila',14.6,120.98],
  ['Hong Kong','Hong Kong','Asia/Hong_Kong',22.32,114.17],
  ['Shanghai','China','Asia/Shanghai',31.23,121.47],
  ['Beijing','China','Asia/Shanghai',39.9,116.41],
  ['Seoul','South Korea','Asia/Seoul',37.57,126.98],
  ['Taipei','Taiwan','Asia/Taipei',25.03,121.57],
  ['Auckland','New Zealand','Pacific/Auckland',-36.85,174.76],
  ['Honolulu','United States','Pacific/Honolulu',21.31,-157.86],
  ['Adelaide','Australia','Australia/Adelaide',-34.93,138.6],
  ['Darwin','Australia','Australia/Darwin',-12.46,130.84],
  ['Perth','Australia','Australia/Perth',-31.95,115.86],
  ['Brisbane','Australia','Australia/Brisbane',-27.47,153.03],
  ['Wellington','New Zealand','Pacific/Auckland',-41.29,174.78],
  ['Suva','Fiji','Pacific/Fiji',-18.14,178.44]
].map(([name,country,zone,lat,lon]) => ({name,country,zone,lat,lon}));
const POPULAR = ['New York','London','Dubai','Tokyo','Sydney'];
const byName = (name) => CITIES.find(c => c.name === name);
const normalizeLon = lon => ((lon + 180) % 360 + 360) % 360 - 180;
const clamp = (v,min,max) => Math.min(max, Math.max(min,v));
const fmtCache = new Map();
function formatter(timeZone, opts) {
  const k = timeZone + JSON.stringify(opts);
  if (!fmtCache.has(k)) fmtCache.set(k, new Intl.DateTimeFormat('en-GB', {...opts,timeZone}));
  return fmtCache.get(k);
}
function parts(date, zone) {
  try {
    const obj = Object.fromEntries(formatter(zone,{hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(date).filter(p=>p.type!=='literal').map(p=>[p.type,p.value]));
    return obj;
  } catch { return {hour:'--', minute:'--', second:'--'}; }
}
function dateLine(date,zone) {
  try {return formatter(zone,{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(date)}
  catch{return 'Current date unavailable'}
}
function getOffset(date, zone) {
  try {
    const label = formatter(zone,{timeZoneName:'longOffset'}).formatToParts(date).find(p=>p.type==='timeZoneName')?.value || 'GMT';
    return label==='GMT' ? '+00:00' : label.replace('GMT','');
  } catch {return '+00:00'}
}
function shortZone(date,zone) {
  try {return formatter(zone,{timeZoneName:'short'}).formatToParts(date).find(p=>p.type==='timeZoneName')?.value || zone}
  catch{return zone}
}
function fallbackPlace(zone) {
  const best = CITIES.find(c=>c.zone===zone);
  if (best) return best;
  const name = zone.split('/').at(-1).replaceAll('_',' ');
  return {name,country:zone.split('/')[0].replaceAll('_',' '),zone,lat:22,lon:0};
}
function getInitialPlace() {
  let zone = 'Etc/UTC';
  try { zone = Intl.DateTimeFormat().resolvedOptions().timeZone || zone } catch {}
  if(zone==='UTC')zone='Etc/UTC';
  return fallbackPlace(zone);
}
let selected = getInitialPlace();
let centerLon = normalizeLon(selected.lon);
let serverClock = null;
let clockVerified = false;
let dragging = null;
let raf = 0;
let mapMover = null;
let markerEls = [];
let ticker;
let lookupModulePromise = null;
let coordinateRequestId = 0;
let syncPromise = null;

function nowMs() {
  return calibratedNow(serverClock, performance.now(), Date.now());
}
function clockUpdate() {
  const date = new Date(nowMs());
  const p = parts(date, selected.zone);
  dom.main.textContent = `${p.hour}:${p.minute}`;
  dom.seconds.textContent = `:${p.second}`;
  dom.date.textContent = dateLine(date, selected.zone);
  dom.zone.textContent = `${shortZone(date, selected.zone)} · UTC${getOffset(date, selected.zone)}`;
  dom.utc.textContent = `UTC ${getOffset(date, selected.zone)}`;
  document.querySelectorAll('[data-strip-zone]').forEach(el => {
    const time = parts(date, el.dataset.stripZone);
    el.textContent = `${time.hour}:${time.minute}`;
  });
}
// Update only when displayed seconds change, not five times every second.
function startClock() {
  clearTimeout(ticker);
  if (document.hidden) return;
  clockUpdate();
  ticker = setTimeout(startClock, nextSecondDelay(nowMs()));
}
function synchronize() {
  if (syncPromise) return syncPromise;
  syncPromise = (async () => {
    let best = null;
    // One server request for normal connections; retry a slow or failed sample once.
    for (let attempt = 0; attempt < 2; attempt++) {
      const begin = performance.now();
      try {
        const response = await fetch('/api/time', {
          cache: 'no-store',
          signal: AbortSignal.timeout(3500)
        });
        if (!response.ok) throw new Error('Server time unavailable');
        const data = await response.json();
        const end = performance.now();
        const sample = clockSample(data.unixMs, begin, end);
        if (sample && (!best || sample.rtt < best.rtt)) best = sample;
        if (best && best.rtt < 350) break;
      } catch {
        // Device time is an explicitly labeled fallback.
      }
    }
    serverClock = best;
    clockVerified = Boolean(best);
    dom.status.textContent = best ? 'Server time calibrated' : 'Device time · not verified';
    dom.status.parentElement.classList.toggle('synced', Boolean(best));
    startClock();
  })().finally(() => { syncPromise = null; });
  return syncPromise;
}

const NS='http://www.w3.org/2000/svg';
function svgEl(tag, attributes={}) {
  const el=document.createElementNS(NS,tag);
  for(const [key,value] of Object.entries(attributes))el.setAttribute(key,String(value));
  return el;
}
function mapOffset() {return W/2-((centerLon+180)/360)*W}
function drawMap() {
  const layer=svgEl('g',{id:'mapMover',class:'map-motion'});
  const land=feature(landTopo,landTopo.objects.land);
  const borders=mesh(landTopo,landTopo.objects.countries,(a,b)=>a!==b);
  const landPath=path(land);
  const borderPath=path(borders);
  const gratPath=path(geoGraticule10());
  for (let copy=-1;copy<=1;copy++) {
    const world=svgEl('g',{transform:`translate(${copy*W} 0)`});
    const grad=svgEl('g',{class:'time-band-lines'});
    for(let lon=-180;lon<=180;lon+=15) {
      const x=((lon+180)/360)*W;
      grad.append(svgEl('line',{x1:x,y1:0,x2:x,y2:H,class:lon===0?'meridian primary':'meridian'}));
    }
    world.append(grad);
    world.append(svgEl('path',{d:gratPath,class:'graticule'}));
    world.append(svgEl('path',{d:landPath,class:'landmass'}));
    world.append(svgEl('path',{d:borderPath,class:'country-borders'}));
    const marker=svgEl('g',{class:'city-marker'});
    marker.append(svgEl('circle',{r:24,class:'marker-halo'}));
    marker.append(svgEl('circle',{r:9,class:'marker-ring'}));
    marker.append(svgEl('circle',{r:3.5,class:'marker-center'}));
    world.append(marker);
    markerEls.push(marker);
    layer.append(world);
  }
  dom.layers.append(layer);
  mapMover=layer;
  updateMap(false);
}
function updateMap(animate=true) {
  if(!mapMover)return;
  mapMover.classList.toggle('dragging',!animate);
  mapMover.style.transform=`translate3d(${mapOffset()}px,0,0)`;
  const [x,y]=projection([selected.lon,selected.lat]);
  markerEls.forEach(marker=>marker.setAttribute('transform',`translate(${x} ${y})`));
}
async function regionAt(lat, lon) {
  try {
    if (!lookupModulePromise) {
      // Load geographic lookups only when someone actually uses the map.
      lookupModulePromise = import('@photostructure/tz-lookup')
        .then(mod => mod.default)
        .catch(error => { lookupModulePromise = null; throw error; });
    }
    const lookup = await lookupModulePromise;
    const zone = lookup(lat, lon);
    if (zone) return zone;
    // Uninhabited oceans have no geographical civil time zone.
    const hours = clamp(Math.round(lon / 15), -12, 12);
    return hours === 0 ? 'Etc/UTC' : `Etc/GMT${hours > 0 ? '-' : '+'}${Math.abs(hours)}`;
  } catch {
    // Never pretend to know an exact location's civil time if lookup failed.
    return null;
  }
}

function findPlaceForZone(zone,lat,lon) {
  const near=CITIES.filter(c=>c.zone===zone).sort((a,b)=>Math.hypot(a.lat-lat,(a.lon-lon)*Math.cos(lat*Math.PI/180))-Math.hypot(b.lat-lat,(b.lon-lon)*Math.cos(lat*Math.PI/180)))[0];
  if(near && Math.abs(near.lat-lat)<5 && Math.abs(normalizeLon(near.lon-lon))<7) return near;
  const friendly = zone.startsWith('Etc/') ? `UTC ${getOffset(new Date(nowMs()),zone)}` : zone.split('/').at(-1).replaceAll('_',' ');
  const region = zone.startsWith('Etc/') ? 'International waters' : zone.split('/')[0].replaceAll('_',' ');
  return {name:friendly,country:region,zone,lat,lon};
}
function choose(place,opts={}) {
  coordinateRequestId++;
  selected=place;
  if(!Number.isFinite(selected.lon)) selected.lon=0;
  centerLon=normalizeLon(selected.lon);
  dom.name.textContent=selected.name;
  dom.country.textContent=selected.country;
  document.title=`Correct Time in ${selected.name} — World Time`;
  updateMap(!opts.instant);
  clockUpdate();
  document.querySelectorAll('.city-quick').forEach(el=>el.classList.toggle('current',el.dataset.city===selected.name));
  if(opts.closeSearch!==false)closeSearch();
}
async function chooseCoordinate(lat,lon,opts={}) {
  const requestId = ++coordinateRequestId;
  lat=clamp(lat,-85,85);
  lon=normalizeLon(lon);
  const zone=await regionAt(lat,lon);
  if (requestId !== coordinateRequestId) return;
  if (!zone) {
    dom.status.textContent = 'Map unavailable · try city search';
    setTimeout(() => {
      dom.status.textContent = clockVerified ? 'Server time calibrated' : 'Device time · not verified';
    }, 3500);
    return;
  }
  choose(findPlaceForZone(zone,lat,lon),opts);
}
function svgPoint(evt) {
  const pt=dom.map.createSVGPoint();pt.x=evt.clientX;pt.y=evt.clientY;
  const matrix=dom.map.getScreenCTM();
  return matrix?pt.matrixTransform(matrix.inverse()):null;
}
function mapPointerDown(e) {
  if(e.button!==0 && e.pointerType==='mouse') return;
  const p=svgPoint(e);
  if(!p)return;
  dragging={startClientX:e.clientX,startX:p.x,initialLon:centerLon,initialY:p.y,moved:false};
  dom.map.setPointerCapture(e.pointerId);
  dom.map.classList.add('is-dragging');
}
function mapPointerMove(e) {
  if(!dragging)return;
  const p=svgPoint(e); if(!p)return;
  const dx=p.x-dragging.startX;
  if(Math.abs(e.clientX-dragging.startClientX)>6)dragging.moved=true;
  if(!dragging.moved)return;
  centerLon=normalizeLon(dragging.initialLon-dx/W*360);
  if(!raf)raf=requestAnimationFrame(()=>{raf=0;updateMap(false)});
}
function mapPointerUp(e) {
  if(!dragging)return;
  const d=dragging;dragging=null;
  dom.map.classList.remove('is-dragging');
  if (d.moved) {updateMap(false);return}
  const p=svgPoint(e);if(!p)return;
  const x=((p.x-mapOffset())%W+W)%W;
  const coords=projection.invert([x,p.y]);
  if(!coords || !Number.isFinite(coords[1]))return;
  chooseCoordinate(coords[1],coords[0]);
}
function shiftZone(dir) {
  const lon=normalizeLon(centerLon+dir*15);
  // Selecting a zone is based on the correct geographic position.
  chooseCoordinate(selected.lat,lon);
}
function closeSearch() {
  dom.searchWrap.classList.remove('open');
  dom.search.setAttribute('aria-expanded','false');
  dom.results.hidden=true;
  dom.results.replaceChildren();
}
function searchCities(q) {
  const text=q.toLocaleLowerCase().trim();
  if(!text)return [];
  return CITIES.filter(c=>`${c.name} ${c.country} ${c.zone}`.toLowerCase().includes(text)).sort((a,b)=>
    (a.name.toLowerCase().startsWith(text)?0:1)-(b.name.toLowerCase().startsWith(text)?0:1) || a.name.localeCompare(b.name)
  ).slice(0,7);
}
function openSearch() {
  const cities=searchCities(dom.search.value);
  dom.results.replaceChildren();
  if (!cities.length) {closeSearch();return}
  cities.forEach((city,idx)=>{
    const button=document.createElement('button');
    button.type='button';button.className='result-item';button.setAttribute('role','option');
    button.id=`search-option-${idx}`;
    const place=document.createElement('span');place.textContent=city.name;
    const detail=document.createElement('small');detail.textContent=city.country;
    button.append(place,detail);
    button.addEventListener('pointerdown',e=>e.preventDefault());
    button.addEventListener('click',()=>{choose(city);dom.search.value='';dom.search.blur()});
    dom.results.append(button);
  });
  dom.results.hidden=false;
  dom.searchWrap.classList.add('open');
  dom.search.setAttribute('aria-expanded','true');
}
function renderPopular() {
  POPULAR.forEach(name=>{
    const city=byName(name);
    const button=document.createElement('button');button.type='button';
    button.className='city-quick';button.dataset.city=name;
    button.setAttribute('aria-label',`Show current time in ${name}`);
    const cityLabel=document.createElement('span');cityLabel.className='quick-name';cityLabel.textContent=name;
    const time=document.createElement('strong');time.className='quick-time';time.dataset.stripZone=city.zone;time.textContent='--:--';
    button.append(cityLabel,time);
    button.addEventListener('click',()=>choose(city));
    dom.cityRow.append(button);
  });
}
function setTheme(theme) {
  const light=theme==='light';
  dom.app.dataset.theme=light?'light':'dark';
  document.documentElement.style.colorScheme=light?'light':'dark';
  dom.theme.checked=light;
  document.querySelector('meta[name="theme-color"]').content=light?'#f7f9f7':'#091520';
  try{localStorage.setItem('worldtime-theme',light?'light':'dark')}catch{}
}
function initTheme() {
  let theme='dark';try{theme=localStorage.getItem('worldtime-theme')||'dark'}catch{}
  setTheme(theme);
  dom.theme.addEventListener('change',()=>setTheme(dom.theme.checked?'light':'dark'));
}
function bindEvents() {
  dom.map.addEventListener('pointerdown',mapPointerDown);
  dom.map.addEventListener('pointermove',mapPointerMove);
  dom.map.addEventListener('pointerup',mapPointerUp);
  dom.map.addEventListener('pointercancel',()=>{dragging=null;dom.map.classList.remove('is-dragging');updateMap(false)});
  dom.map.addEventListener('keydown',e=>{
    if(e.key==='ArrowRight'){e.preventDefault();shiftZone(1)}
    else if(e.key==='ArrowLeft'){e.preventDefault();shiftZone(-1)}
    else if(e.key==='Home'){e.preventDefault();choose(getInitialPlace())}
  });
  dom.prev.addEventListener('click',()=>shiftZone(-1));
  dom.next.addEventListener('click',()=>shiftZone(1));
  dom.search.addEventListener('input',openSearch);
  dom.search.addEventListener('focus',openSearch);
  dom.search.addEventListener('keydown',e=>{
    if(e.key==='Escape'){closeSearch();dom.search.blur()}
    if(e.key==='Enter'){
      const first=searchCities(dom.search.value)[0];
      if(first){e.preventDefault();choose(first);dom.search.value='';dom.search.blur()}
    }
    if(e.key==='ArrowDown' && !dom.results.hidden){e.preventDefault();dom.results.querySelector('button')?.focus()}
  });
  dom.results.addEventListener('keydown',e=>{
    if(e.key==='Escape'){closeSearch();dom.search.focus()}
    const buttons=Array.from(dom.results.querySelectorAll('button'));
    const idx=buttons.indexOf(document.activeElement);
    if(e.key==='ArrowDown'){e.preventDefault();buttons[Math.min(idx+1,buttons.length-1)]?.focus()}
    if(e.key==='ArrowUp'){e.preventDefault();idx===0?dom.search.focus():buttons[Math.max(idx-1,0)]?.focus()}
  });
  document.addEventListener('pointerdown',e=>{if(!dom.searchWrap.contains(e.target))closeSearch()});
  dom.locate.addEventListener('click',()=>{
    if(!navigator.geolocation){dom.status.textContent='Location not available';return}
    dom.locate.disabled=true;
    navigator.geolocation.getCurrentPosition(pos=>{
      chooseCoordinate(pos.coords.latitude,pos.coords.longitude);
      dom.locate.disabled=false;
    },()=>{
      dom.locate.disabled=false;
      dom.status.textContent='Location unavailable · showing selected time';
      setTimeout(()=>{dom.status.textContent=clockVerified?'Time synchronized':'Device time · not verified'},3500);
    },{enableHighAccuracy:false,maximumAge:600000,timeout:9000});
  });
  document.addEventListener('visibilitychange',()=>{
    if (document.hidden) clearTimeout(ticker);
    else { startClock(); synchronize(); }
  });
}

function boot() {
  initTheme();
  renderPopular();
  drawMap();
  bindEvents();
  choose(selected,{instant:true});
  document.querySelector('#footerYear').textContent=new Date().getFullYear();
  startClock();
  synchronize();
  setInterval(()=>{if(!document.hidden)synchronize()},15*60*1000);
}
boot();
