# Optimization Research Book — 23 October 2026

## Purpose
Turn research into a repeatable operational advantage. Search engines reward helpful and trustworthy content, not arbitrary "SEO scores." OTHRYS should automate evidence collection and quality control, not gaming Google.

## Research hierarchy
1. **Primary:** Google Search Central/Search Console, web.dev/Chrome, IANA, official local authority (e.g. Belgian Royal Observatory for DST), actual GSC and Lighthouse observations.
2. **Implementation:** established GitHub projects (Lighthouse CI, Playwright, open-source performance and SEO checkers). Verify licenses, update history and ongoing maintenance.
3. **Discoveries:** real top-ranking sites and actual SERP intent for the target country/language. Search-result positions vary by geography and device.
4. **Anecdotes:** Reddit and community feedback—valuable for user pain, not proof that tactic X causes rank Y.

## Ranked levers for small utilities

| Hypothesis | Evidence needed | Pilot approach | Risk |
|---|---|---|---|
| Fix crawlability, title/canonical/index/noindex | audit, GSC URL Inspection | deterministic gate on built pages | low |
| Improve usability and measured LCP/INP/CLS | Chrome trace, CrUX, Lighthouse | benchmark mobile first, fix measured issues | low |
| Answer long-tail intents with original functionality | GSC query/page impressions, site reviews | small editorially distinct city/season pages | medium |
| Add accurate WebSite schema for site name | Google site-name docs and page content | markup matching brand; validate JSON-LD | low |
| Useful shareable embed/link | actual user requests, referral traffic | build smallest reusable clock | medium |
| Earn genuine mentions/backlinks | relevant publishers choosing to cite | manual, useful outreach only | medium |
| Multilingual landing pages | verified demand, professional translation | genuine language-specific content + hreflang | medium |
| IndexNow (Bing) | verified key/owner consent | optional post-deploy submission; never auto-buy | low |
| AI search visibility | GSC/other search datasets | same real utility + readable facts, no magic llms.txt | low |

## Guardrails
- **Do not do:** paid backlink packages, fake CTR/bot traffic, keyword stuffing, cloaking, doorway or scaled thin-content pages, fabricated authorship, inflated schema, Google general Indexing API for ordinary pages.
- **Don't fake data:** Google accepts a submitted sitemap as discovery hint only; do not say 11 discovered equals 11 indexed. Empty GSC rows can mean reporting lag.
- **No bulk automation by default:** the only always-on activity in this pilot is Vercel's normal build gate when developers deploy. No hourly/daily bot scheduled.
- **Avoid "ranking promises":** no guaranteed first position or fixed SEO score.

## World Time pilot baseline (23 October 2026)
- New independent utility: \`https://worldtime.othrys.be/\`.
- 11 sitemap URLs submitted to Search Console. Windsor returned 11 submitted, zero errors and zero warnings. Google live inspection showed homepage eligible to index, not yet proven indexed.
- No usable organic query/page rows yet.
- Technical elements: Vite, pre-rendered city-specific HTML, two Belgian seasonal guides, IANA time zone aware clock, optional geolocation, no third-party analytics scripts.
- Next high-value evidence: indexation after Google catches up, mobile LCP/INP/CLS, repeat visits, genuine referral links, and actual long-tail search performance.

## Sources (verified 2026-10-23)
- Google people-first content: https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- Google spam policies: https://developers.google.com/search/docs/essentials/spam-policies
- Structured data policies: https://developers.google.com/search/docs/appearance/structured-data/sd-policies
- Site name structured data: https://developers.google.com/search/docs/appearance/site-names
- Sitemaps: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- Google's restricted Indexing API: https://developers.google.com/search/apis/indexing-api/v3/using-api
- Lighthouse CI: https://github.com/GoogleChrome/lighthouse-ci
- IndexNow: https://www.indexnow.org/documentation
- Google Core Web Vitals: https://web.dev/articles/vitals
- Reddit anecdotes are *not* adopted as ranking rules.

## Experiment ledger template
- Date, site, baseline data window, source and screenshots.
- Hypothesis, target metric, test plan, risk and owner authorization.
- Branch/PR and acceptance criteria, visual QA receipt.
- Post-release observation window and alternate explanations.
- Verdict: KEEP / REVERT / NEED_MORE_DATA. No compounding changes without evidence.
