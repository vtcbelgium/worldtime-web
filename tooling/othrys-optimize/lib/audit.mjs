// Dependency-free, read-only SEO analysis. No ranking or indexing guarantees.
export const LEVELS = Object.freeze({error: 0, warning: 1, opportunity: 2});
export function parseSitemap(xml) {
  if (!xml || !/<urlset\b/i.test(xml)) return [];
  return [...xml.matchAll(/<loc\b[^>]*>([\s\S]*?)<\/loc>/gi)]
    .map(match => match[1].trim().replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>'));
}
export function extractPage(html) {
  const match = (re) => html.match(re)?.[1]?.trim() || '';
  const metas = {};
  for (const tag of html.match(/<meta\b[^>]*>/gi) || []) {
    const attr = key => tag.match(new RegExp('\\b'+key+'\\s*=\\s*["\\x27]([^"\\x27]*)["\\x27]','i'))?.[1] || '';
    if (attr('name')) metas[attr('name').toLowerCase()] = attr('content');
    if (attr('property')) metas[attr('property').toLowerCase()] = attr('content');
  }
  const scripts = [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map(x => x[1]);
  const schemas = [], invalidSchema = [];
  for (const script of scripts) {
    try { schemas.push(JSON.parse(script)); } catch { invalidSchema.push(script.slice(0,120)); }
  }
  const anchors = [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>/gi)].map(x => x[1]);
  return {
    title: match(/<title\b[^>]*>([\s\S]*?)<\/title>/i).replace(/\s+/g,' '),
    description: metas.description || '',
    robots: metas.robots || '',
    canonical: match(/<link\b(?=[^>]*rel=["']canonical["'])[^>]*href=["']([^"']+)["']/i),
    lang: match(/<html\b[^>]*lang=["']([^"']+)["']/i),
    h1Count: (html.match(/<h1\b/gi)||[]).length,
    anchors, schemas, invalidSchema, ogTitle: metas['og:title'] || '',
    favicon: /<link\b(?=[^>]*rel=["'](?:icon|shortcut icon)["'])/i.test(html),
    htmlBytes: Buffer.byteLength(html, 'utf8'),
    meta: metas
  };
}
const f = (code, severity, url, evidence, recommendation, gate='PR_REVIEW') =>
  ({code, severity, page:url, evidence, recommendation, gate});
function schemaTypes(schema) {
  if (!schema || typeof schema!=='object') return [];
  if (Array.isArray(schema)) return schema.flatMap(schemaTypes);
  const types = [schema['@type']].flat().filter(Boolean);
  if (Array.isArray(schema['@graph'])) types.push(...schema['@graph'].flatMap(schemaTypes));
  return types;
}
export function auditSnapshot({baseUrl, pages, sitemapXml, robotsText='', maxHtmlBytes=750000}) {
  const origin = new URL(baseUrl).origin;
  const submitted = parseSitemap(sitemapXml);
  const issues = [], facts = {pagesChecked:pages.length, sitemapUrls:submitted.length, origin};
  const add = (...a) => issues.push(f(...a));
  const seenCanonicals=new Set(), titles=new Map(), descriptions=new Map();
  const submittedSet=new Set();
  for (const url of submitted) {
    let parsed;
    try { parsed = new URL(url); } catch { add('SITEMAP_INVALID_URL','error',url,'Not a valid absolute URL','Correct the sitemap URL.');continue; }
    if (parsed.origin!==origin) add('SITEMAP_FOREIGN_DOMAIN','error',url,parsed.origin,'Separate foreign-origin URLs from this sitemap.');
    if (submittedSet.has(url)) add('SITEMAP_DUPLICATE','warning',url,'Duplicate <loc>','Remove duplicate sitemap entries.');
    submittedSet.add(url);
  }
  if (!submitted.length) add('SITEMAP_EMPTY','error',baseUrl,'No <loc> entries','Generate a valid XML sitemap.');
  if (!robotsText.includes('Sitemap:') || !robotsText.includes(origin))
    add('ROBOTS_SITEMAP','warning',origin+'/robots.txt','No matching Sitemap directive','Reference the canonical sitemap in robots.txt.');
  const allKnown=new Set(pages.map(p=>p.url));
  for (const page of pages) {
    const x=extractPage(page.html);
    const url=page.url;
    if (!submittedSet.has(url)) add('PAGE_NOT_IN_SITEMAP','warning',url,'Page not included','Include canonical, indexable pages in the sitemap.');
    if (!x.title) add('TITLE_MISSING','error',url,'No <title>','Add a concise, descriptive title.');
    if (!x.description) add('DESCRIPTION_MISSING','warning',url,'No meta description','Summarize the page for users, not keyword repetition.');
    if (/\bnoindex\b/i.test(x.robots)) add('NOINDEX','error',url,x.robots,'Remove noindex if this URL should rank.');
    if (!x.canonical) add('CANONICAL_MISSING','error',url,'No canonical link','Set an absolute self-referencing canonical URL.');
    else if (x.canonical!==url) add('CANONICAL_MISMATCH','error',url,x.canonical,'Use the intended canonical in the sitemap and page.');
    if (x.lang==='') add('LANG_MISSING','warning',url,'No html lang','Add the page language for accessibility.');
    if (x.h1Count!==1) add('H1_COUNT','warning',url,'Found '+x.h1Count+' H1 elements','Use one clear primary page heading.');
    if (x.invalidSchema.length) add('JSONLD_INVALID','error',url,x.invalidSchema[0],'Repair invalid JSON-LD syntax.');
    if (!x.ogTitle) add('SOCIAL_TITLE','opportunity',url,'No og:title','Add distinct social-sharing metadata.');
    if (!x.favicon) add('FAVICON_MISSING','opportunity',url,'Missing icon','Provide a recognizable favicon.');
    if (x.htmlBytes>maxHtmlBytes) add('HTML_LARGE','warning',url,x.htmlBytes+' bytes','Reduce page HTML and unused inline payloads.');
    const allSchemas=x.schemas.flatMap(schemaTypes);
    if (url===origin+'/' && !allSchemas.includes('WebSite'))
      add('WEBSITE_SCHEMA','opportunity',url,allSchemas.join(', ')||'None','Consider accurate WebSite schema for site identity; it does not guarantee rankings.');
    if (x.canonical) seenCanonicals.add(x.canonical);
    if (x.title) {
      if (titles.has(x.title)) add('TITLE_DUPLICATE','warning',url,'Matches '+titles.get(x.title),'Write page-specific intent and title.');
      else titles.set(x.title,url);
    }
    if (x.description) {
      if (descriptions.has(x.description)) add('DESCRIPTION_DUPLICATE','warning',url,'Matches '+descriptions.get(x.description),'Explain the distinct value of this page.');
      else descriptions.set(x.description,url);
    }
    for (const href of x.anchors) {
      if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) continue;
      let target;
      try { target=new URL(href,url); } catch { continue; }
      if (target.origin!==origin) continue;
      const normalized=target.origin+target.pathname;
      if (!allKnown.has(normalized) && !/\.[a-z\d]{2,5}$/i.test(target.pathname))
        add('INTERNAL_LINK_UNKNOWN','warning',url,normalized,'Ensure internal destination exists and is crawlable.');
    }
  }
  for (const url of submittedSet) {
    if (!allKnown.has(url) && url.startsWith(origin+'/'))
      add('SITEMAP_FILE_MISSING','error',url,'No built HTML file','Build each sitemap URL as a real HTML page.');
  }
  issues.sort((a,b)=>(LEVELS[a.severity]??9)-(LEVELS[b.severity]??9) || a.code.localeCompare(b.code));
  facts.errors=issues.filter(x=>x.severity==='error').length;
  facts.warnings=issues.filter(x=>x.severity==='warning').length;
  facts.opportunities=issues.filter(x=>x.severity==='opportunity').length;
  return {facts,issues};
}
