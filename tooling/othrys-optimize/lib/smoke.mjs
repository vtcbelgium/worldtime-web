// Side-effect-free production HTTP smoke response validation, separate from live fetch.
const canonical = html=>html.match(/<link\b(?=[^>]*rel=["']canonical["'])[^>]*href=["']([^"']+)["']/i)?.[1]||'';
export function checkHttpDocument({path,body,status,url,contentType=''}) {
  const issues=[];
  const assert=(cond,code)=>{if(!cond)issues.push(code)};
  assert(status===200,'HTTP_NOT_200');
  if(path==='/sitemap.xml') {
    assert(/<urlset\b/i.test(body),'NOT_XML_SITEMAP');
    assert(/<loc>https:\/\//i.test(body),'NO_SITEMAP_URLS');
    return issues;
  }
  if(path==='/api/time') {
    let data;
    try{data=JSON.parse(body)}catch{}
    assert(data?.source==='server','BAD_SERVER_SOURCE');
    assert(Number.isFinite(data?.unixMs)&&data.unixMs>0,'BAD_SERVER_TIMESTAMP');
    return issues;
  }
  assert(/text\/html/i.test(contentType)||/<!doctype html/i.test(body),'NOT_HTML');
  assert(canonical(body)===url,'CANONICAL_MISMATCH');
  assert(/<h1\b/i.test(body),'MISSING_H1');
  if(path==='/'){
    assert(body.includes('WORLD CLOCK · CORRECT TIME NOW'),'WRONG_HOME_H1');
    assert(body.includes('id="shareTime"'),'MISSING_SHARE_CONTROL');
  }
  if(path==='/time/brussels/')assert(body.includes('CORRECT TIME IN BRUSSELS'),'WRONG_CITY_HEADING');
  if(path==='/time/tokyo/')assert(body.includes('CORRECT TIME IN TOKYO'),'WRONG_CITY_HEADING');
  return issues;
}
