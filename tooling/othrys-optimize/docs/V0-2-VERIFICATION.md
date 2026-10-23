# World Time v1.2 → Optimizer v0.2 verification ledger

## Deployment facts
- GitHub PR #6 was owner-approved, merged to main with commit 347cd124ce45b1edf4bdb1880a112ffa6ca924e2.
- Vercel list_deployments reports READY target production and the same GitHub SHA.
- Build checks run all original World Time tests, generated 11-page HTML/sitemap checks, SEO auditor and compressed-entry bundle budget.
- Windsor.ai connector searchconsole account sc-domain:othrys.be reported sitemap https://worldtime.othrys.be/sitemap.xml with 11 submitted, 0 errors and 0 warnings.
- Google Search Console page-level organic impressions/clicks have not yet supplied useful data.

## Verification limitations (do not misstate as passes)
- External fetch from the agent runtime could not resolve worldtime.othrys.be. The user can access the website in their browser.
- Web-based HTTP reader also could not retrieve live pages.
- Vercel list_deployments works; Vercel detail/file and project-domain inspection returned 404 despite that list entry.
- No real Chrome mobile/desktop Lighthouse or CrUX readings were obtained.
- Therefore current source/build checks cannot prove live map rendering, on-page share action, responsive layout or server time API accessibility.

## Opt-in test plan
1. From a network-capable environment: npm run optimize:smoke.
2. Manually or through an authorized browser test worker: load home in dark/light on 375px and desktop; confirm continents draw, city search works, city link restores selected clock, and share button copies a clean URL.
3. Check city pages /time/brussels/ and /time/tokyo/ for clock, canonical, H1 and local offset.
4. Confirm /wintertijd/ and /zomertijd/ show next clock-change dates/countdowns and correct official facts.
5. Record measured mobile and desktop Lighthouse JSON, then supply it to plan.mjs via --lighthouse-json.
6. Once GSC provides page/query rows, supply aggregate data to the planner. Use matched comparison windows, not one-day rankings.
7. Keep/revert based on user benefit, regressions and evidence. No scheduled monitor until explicit owner permission.

## v0.2 boundary
This release adds an offline planner and on-demand smoke test, not an AI model that autonomously browses the internet or runs continuously. Future manager/builder wiring must preserve the user's Architect → Manager → Builder → Review → Owner model.
