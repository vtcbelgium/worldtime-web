# Repeatable AI-agent research → release procedure

## Stage 0: Choose the right question
Site owner names a utility site and conversion/traffic goal. Confirm this is a genuine useful product, not a collection of SEO bait pages. Record baseline and audience.

## Stage 1: Diagnose automatically
Read build output, robots, sitemap, homepage, city/feature pages; run `node tooling/othrys-optimize/bin/audit.mjs --strict`. Include available Windsor.ai Search Console rows and externally measured Lighthouse JSON only if actually accessible.

## Stage 2: Research current demand
For each real GSC query or explicitly supplied user demand: inspect regional SERP, incumbent capabilities, user experience; compare accessibility, first-answer prominence, page speed, freshness and original utility. Use official docs before Reddit. Create a short research/evidence packet.

## Stage 3: Make three suggestions
Choose up to three from: technical bug; product-level utility difference; distribution/linkable asset. Each needs source, hypothesis, measurable success criterion, cost and regression risk. No bulk keyword pages by default.

## Stage 4: Pilot one
Draft one narrowly scoped change and tests. Keep visual identity and SEO canonical structure. Run the existing build, optimization audit and any actual browser tests available. If missing browser access, state it explicitly. Open a draft PR for review; never claim production deployment.

## Stage 5: Authority & rollout
Stop for owner approval on production release, outreach, purchases, recurring monitoring or IndexNow. Record merge revision and rollback reference. Inspect the live site after release.

## Stage 6: Compare evidence
Compare equal date windows only after GSC has data. Record indexed URLs, query impressions, clicks, CTR by rank, mobile Web Vitals and relevant referrals. Account for time, seasonality, Google's own direct-answer behavior and reporting lag. Mark results inconclusive rather than force a victory.

## Site research summary
```
Target | observed baseline | search intent | competitor gap | unique improvement |
cost | test/measurement | user benefit | risk | action gate | evidence source
```

## SEO distribution ethics
Earn links because tools help users. Build shareable, embeddable utility where appropriate. Do not purchase link schemes, claim guaranteed rankings, mass-send unsolicited outreach, fake traffic or write deceptive stories. A marketing decision requires owner approval.

## Operational modes
- **MANUAL:** run audit and export reports when the owner wants.
- **PR GATE (current):** existing Vercel deployment build runs unit tests and static checks. No additional GitHub Action minutes required.
- **MONITOR (not active):** optional scheduled Windsor data pull + comparative report. Only create with explicit owner cadence and stop rules.

The agent is a *decision-making procedure* specified in AGENT.md; v0.1 does not instantiate a hosted continuously running model.
