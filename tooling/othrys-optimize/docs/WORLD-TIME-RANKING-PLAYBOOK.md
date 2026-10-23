# WORLD TIME — Google Ranking Playbook (Operational Edition)

**Goal:** turn the ten researched SEO tactics into useful features and evidence-backed AI-agent tasks. No ranking guarantees, keyword stuffing, paid backlink schemes or bulk thin pages.

| # | Tactic | Status | Next evidence / action |
|---|---|---|---|
| 1 | Exact search intent | implemented-preview | Observe actual queries, then experiment with copy (PR_REVIEW) |
| 2 | Earn genuine backlinks | approval-gated | Shortlist educational, travel and global-team resources for owner review (OWNER_APPROVAL) |
| 3 | Make a shareable utility | implemented-preview | Validate share flow on mobile; consider a small embeddable clock only after demand (PR_REVIEW) |
| 4 | Unique city page value | implemented-live | Only expand pages after Search Console confirms demand (OWNER_APPROVAL) |
| 5 | Real localization | partly-live | Consider reviewed French/German equivalents once demand appears (OWNER_APPROVAL) |
| 6 | Speed and Core Web Vitals | implemented-preview | Measure mobile CWV; do not call bundle gzip a Lighthouse score (PR_REVIEW) |
| 7 | Search result clarity | implemented-preview | Verify Google's real snippets before changing titles (PR_REVIEW) |
| 8 | Internal navigation | implemented-preview | Add cross-repo links only when relevant and owner-approved (PR_REVIEW) |
| 9 | Accuracy and trust | implemented-live | Document source versions and official rule changes (PR_REVIEW) |
| 10 | Evidence-driven optimization | implemented-read-only | Start no scheduled monitor without explicit owner approval (AUTO_READ) |

## Agent workflow

1. Read current build audit and Windsor/Search Console metrics, if present; absent rows do not equal zero visitors.
2. Research actual search intent and the leading relevant pages in a specified country/language using current first-party sources; treat Reddit as anecdote.
3. Propose one scoped, measurable experiment with baseline, evidence URLs, acceptance checks, costs, risk, rollback and approval level.
4. Implement on a reviewable branch; run tests and browser checks. A green build does not prove SEO rank or rendering.
5. Owner approves production, outreach, new languages/pages, IndexNow and any recurring schedule. No automatic production writes.
6. Compare equivalent date ranges after search results mature; retain or revert based on qualified visits, not vanity scores.

## Ethics & portfolio reuse

- Links must be editorially earned because the clock is useful. Research relevant publisher/resource pages; prepare outreach drafts only. Never buy links, auto-DM communities, use fake traffic or exchange links at scale.
- Avoid `hreflang` between unrelated English and Dutch pages. True localized equivalents need verified translations and bidirectional annotations.
- Simple shareable city URLs are now implemented. An iframe embed is **not** implemented: the site's existing `X-Frame-Options: DENY` requires an explicit security review before embedding.
- Optional Lighthouse JSON analysis and built-asset gzip budgets are diagnostic; neither establishes real-world Core Web Vitals. Collect field LCP/INP/CLS separately.
- The current eight city pages and two Dutch clock-change guides are enough for the pilot. Do not multiply templates without unique useful content and measured search intent.
- Keep the optimizer as independent, versioned code that can later be harvested into OTHRYS. No additional background AI agents run in this pilot.

## Machine-readable worklist

`../sites/worldtime-ranking-playbook.json` is the agent's source of truth for state, evidence needed, measurement and authorization for the ten tactics.

## Primary sources

- https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- https://developers.google.com/search/docs/essentials/spam-policies
- https://developers.google.com/search/docs/appearance/site-names
- https://developers.google.com/search/docs/appearance/title-link
- https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- https://web.dev/articles/vitals
- https://github.com/GoogleChrome/lighthouse-ci
