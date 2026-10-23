// Share URLs contain only public IANA zone identifiers or known city names, never GPS coordinates.
export const FEATURED_ROUTES = Object.freeze({
  'New York': 'new-york', London: 'london', Tokyo: 'tokyo', Sydney: 'sydney',
  Dubai: 'dubai', Mumbai: 'mumbai', Kathmandu: 'kathmandu', Brussels: 'brussels'
});
export function canonicalShareUrl(place, origin='https://worldtime.othrys.be', cities=[]) {
  const base = new URL(origin).origin;
  const name = typeof place?.name === 'string' ? place.name.trim() : '';
  if (name && Object.prototype.hasOwnProperty.call(FEATURED_ROUTES,name))
    return base + '/time/' + FEATURED_ROUTES[name] + '/';
  const url = new URL(base + '/');
  if (name && name.length <= 80 && cities.some(c => c.name === name))
    url.searchParams.set('city',name);
  else if (typeof place?.zone === 'string' && /^[A-Za-z0-9_+-]+(?:\/[A-Za-z0-9_+-]+)+$/.test(place.zone) && place.zone.length <= 90)
    url.searchParams.set('zone',place.zone);
  return url.toString();
}
export function findSharedCity(search, cities) {
  const query = new URLSearchParams(search || '').get('city');
  if (!query || query.length > 80 || !Array.isArray(cities)) return null;
  return cities.find(city => city.name.toLocaleLowerCase('en') === query.toLocaleLowerCase('en')) || null;
}
export function findSharedZone(search) {
  const zone = new URLSearchParams(search || '').get('zone');
  if (!zone || zone.length > 90 || !/^[A-Za-z0-9_+-]+(?:\/[A-Za-z0-9_+-]+)+$/.test(zone)) return null;
  try { new Intl.DateTimeFormat('en', { timeZone:zone }); return zone; }
  catch { return null; }
}
