# SEO 2026 — evidence and quality playbook (SyntraPXL)
 
Applies to the existing OTHRYS Optimization Kit v0.2. This is an **advisory, non-executable** skill reference, not a new scheduler, model, crawler or publication pipeline.

## Source provenance

Course basis: SyntraPXL, Massimo De Nittis, *SEO in 2026*, 12 slides (provided privately by owner; do not redistribute). Preserve the course's four stages: **Audit → Research → On-page → Off-page**. Secondary verification: Google Search Central sources below. Course recommendations and external corrections are deliberately separated.

## 1. AUDIT — evidence first (slides 3, 7, 11)

- Run the existing build audit and planner; confirm canonical hostname, sitemap URLs, indexability, noindex, headings, language, internal links, responsive rendering and actual output HTML.
- Treat Lighthouse JSON as **lab** data and Search Console/Core Web Vitals as separate observational sources. Lab LCP/TBT is not field LCP/INP. Avoid ranking claims based on Lighthouse scores alone.
- A missing or empty Search Console export is **UNKNOWN**, never 'zero traffic', 'not indexed' or 'ranking loss'. Attach collection date, page, metric scope and observed source.
- A valid sitemap, schema or passing build does **not** guarantee Google indexing, rich results or rankings.
- For a URL with a JavaScript-only tool, verify the answer-bearing content is readable without interaction and important links have actual href attributes.

## 2. RESEARCH — validate intent, not vanity metrics (slides 4, 5, 6, 8)

- Prefer real GSC queries/impressions and Google Trends locality/seasonality to invented volume or a third-party authority number.
- Match keyword to user task and compare real competing pages. Avoid speculative keyword variants without distinct utility.
- The course recommends 2,000+ words for complex queries; **Google does not require a word count**. Use the shortest complete explanation that helps users.
- E-E-A-T describes experience, expertise, authoritativeness and trustworthiness; it is **not** a single numeric Google ranking signal.
- Backlinks: assess topical fit, editorial context, referral value and evidence of authentic use. DA 60+ and 'nofollow counts hardly at all' are **not Google rules**. Do not treat third-party DA/DR as Google's PageRank.
- Google AI Overviews/AI Mode do not require GEO-specific markup. Prefer accurate visible answers, crawlability and attributable first-party data. Record AI citations only if actually observed.
- Translate/localize only with verified useful variants and valid canonical/hreflang strategy; don't create doorway city/language pages.

## 3. ON-PAGE — one valuable change at a time (slides 3, 4, 11)

Suggested proposal fields:
- `site`, `page`, `observedAt`, `sourceType` (`build-audit`, `GSC`, `Lighthouse-lab`, `field-CWV`, `manual-browser`, `external-reference`)
- `observation` (literal observed fact, not interpretation), `unknowns`, `hypothesis`, `minimalChange`
- `successMetric`, `acceptanceTest`, `regressionRisks`, `rollback`, `authorization`
- `status=PROPOSED_ONLY` until independently verified.

Prioritize index-blocking technical errors first; then correctness/accessibility/performance; then demand-supported content. Updating a date or padding text to seem fresh is not a useful change.

## 4. OFF-PAGE — legitimate recognition (slides 5, 9, 10, 11)

- Best options: linkable original tools or datasets, selective relevant resource submissions, honest technical case studies, and occasional editorial outreach **only after explicit owner approval**.
- Prohibited: paid link schemes, PBNs, mass directory submission, comment spam, forced reciprocal links across OTHRYS properties, misleading guest posts and synthetic engagement.
- Use `rel=sponsored` for paid/sponsored links when applicable; `nofollow`/`ugc` express other link contexts. Do not manipulate link attributes to 'sculpt' PageRank.
- Local SEO/Google Business Profile is relevant only to a genuine eligible local business, not to every globally accessible utility.

## 5. Pilot procedure — WorldTime

1. Produce the built site locally, then run the **existing** `audit.mjs` and `plan.mjs` as documented in the kit README. Keep JSON reports out of public git if they contain private analytics.
2. Attach dated audit receipt. If supplying GSC or Lighthouse JSON, identify the specific source, interval and whether numbers are synthetic lab vs field measurements.
3. Choose **one** evidence-supported issue. Do not promote speculative P3 opportunities into code.
4. Prepare a draft PR or recommendation with an acceptance test and rollback; **no merge or outreach without owner approval**.
5. Verify repeatability using `node --test tooling/othrys-optimize/tests/*.test.mjs` and the site's existing build/test commands. A PR without a run receipt is *unverified*, not passed.
6. After the WorldTime cycle has evidence and an owner-reviewed outcome, adapt the same kit to UnixTime; do not duplicate the engine.

## Current reality (26 October 2026)

The kit already implements an evidence triage planner with optional provided GSC/Lighthouse data. The OTHRYS owner page is a **registry/status view**, not an executable orchestrator. No scheduled jobs or automated outreach are enabled by this document. A previous WorldTime read-only audit exists, but it does **not** establish current rankings or field CWV.

## Primary external references

- Google SEO Starter Guide: https://developers.google.com/search/docs/fundamentals/seo-starter-guide
- Creating helpful, reliable, people-first content: https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- Spam policies: https://developers.google.com/search/docs/essentials/spam-policies
- Google AI features: https://developers.google.com/search/docs/appearance/ai-features
- Link best practices: https://developers.google.com/search/docs/crawling-indexing/links-crawlable
- Google ranking systems: https://developers.google.com/search/docs/appearance/ranking-systems-guide
