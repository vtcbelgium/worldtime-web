# WorldTime

[![Live Site](https://img.shields.io/badge/Live_Tool-worldtime.othrys.be-0284c7?style=flat-square)](https://worldtime.othrys.be)
[![Privacy](https://img.shields.io/badge/Privacy-100%25_Client--Side-16a34a?style=flat-square)](https://worldtime.othrys.be)
[![Cookies](https://img.shields.io/badge/Cookies-0-blue?style=flat-square)](https://worldtime.othrys.be)
[![WCAG AA](https://img.shields.io/badge/Accessibility-WCAG_AA-blueviolet?style=flat-square)](https://worldtime.othrys.be)

> Fast, private, client-side DST-accurate world clock and interactive time zone converter. Runs 100% in your browser with zero server uploads, zero cookies, and zero third-party tracking.

## Features
- **100% Client-Side:** Files and confidential data never leave your device.
- **Zero Cookies & Zero Trackers:** Closed-valve privacy architecture with 0 third-party telemetry scripts.
- **Keyboard Spotlight:** Jump to any of the 20 sovereign tools anytime by pressing <kbd>⌘K</kbd> or <kbd>Ctrl+K</kbd>.
- **PWA Ready:** Works offline on laptops, MacBooks, tablets, and mobile devices.

## Direct Web Access
Use the live tool instantly without installing anything:
[https://worldtime.othrys.be](https://worldtime.othrys.be)


# World Time — an OTHRYS utility

A focused, interactive world clock with dark/light themes, draggable cartography, searchable cities, IANA daylight-saving-aware time, an optional location button, and server clock calibration.

## Development

```bash
npm install
npm run dev
npm run check
npm run build
```

Designed for `https://worldtime.othrys.be`. Vercel builds with Vite and serves `api/time.js` as a serverless clock-calibration endpoint. Without server synchronization the UI explicitly labels the time as unverified device time.

The map shows illustrative meridian grid divisions; location lookups use current [PhotoStructure tz-lookup](https://github.com/photostructure/tz-lookup) geographic approximations and system IANA rules. Time zone borders on the map are not presented as legal boundaries. The map uses Natural Earth data via world-atlas. No AI tokens or analytics are needed in the client.

## Privacy

No accounts, cookies, or third-party tracking. Only anonymous, cookieless page-view counts (stats.othrys.be, respecting Do Not Track / GPC, 90-day expiry) are recorded. Browser time zone is available without GPS; precise location is asked for only on button click. A local theme preference is retained in browser storage.

## Release verification

After any production deployment, verify the rendered page at `https://worldtime.othrys.be/`:

1. Visible world continents and meridian lines behind the central clock (not only a gradient).
2. Dark and light themes both show the map and remember user preference.
3. City search updates the map and clock; previous/next zone arrows and drag controls respond.
4. New York, Brussels, Kathmandu, and Adelaide show correct IANA and fractional offsets.
5. Server time API responds; a failed synchronization reports unverified device time rather than claiming accuracy.
6. Desktop/mobile layouts remain usable and no client console errors occur.

Map visibility correction: `src/style.css` places the SVG map above the opaque gradient while keeping the clock foreground. Confirm this visually after release.

## Performance and correctness checks (v1.1)

- The world map renders immediately; geographic time-zone lookup code is lazy-loaded when clicking/swiping into a zone or using optional GPS.
- A normally fast server calibration uses **one** API request (instead of three), with one retry for slow or failed samples. Synchronize when a hidden tab becomes visible and periodically while visible.
- The running clock renders once per displayed second, rather than five times per second.
- The server API rejects write methods, sets no-store headers and does not collect personal information.
- Run `npm run check` before merging; it includes Node's built-in unit tests with no new testing dependencies.
- Measure real production LCP/INP/CLS, network bytes and HTTP status separately; these static checks are not a substitute for live browser measurement.

## SEO architecture (October 2026)

- The immersive home page remains unchanged above the fold. Discoverable, static HTML links beneath it lead to eight editorially reviewed city clock URLs and two Dutch seasonal guides.
- `scripts/generate-seo.mjs` builds real HTML pages from the Vite output: unique canonical, title, description, schema.org WebPage/BreadcrumbList, and static local time zone facts. Client app reads `data-seo-city` to display the correct city's live clock instead of visitor local time.
- `/time/` is the crawlable hub for the city clocks, linked from the home page footer. It and every city page carry BreadcrumbList JSON-LD (World Time → World Clocks → city).
- All URLs are in the sitemap. Don't create fake, bulk, thin or duplicate pages. Add new cities only after verifying unique user value and query demand from actual Search Console impressions.
- Dutch `/wintertijd/` and `/zomertijd/` explain Belgian changes, cite the Belgian Royal Observatory, calculate the next change automatically, and link back to the clock.
- Google FAQ rich results were retired in May 2026. No unsupported FAQ or artificial rich-result markup has been added.
- Validate via `npm run check`, then `npm run build` and inspect generated `dist/time/*/index.html` and `dist/sitemap.xml`.
- Submit the sitemap in Search Console/Bing Webmaster Tools after confirming deployed URLs return HTTP 200. No invented verification tokens or indexing guarantees.

Build verification: `scripts/verify-dist.mjs` checks every generated HTML file for a unique title, complete description, correct canonical, IANA location, seasonal countdown, source citation and sitemap inclusion. All are required to pass before deployment.

## Cartography data accuracy

Map geometry comes from Natural Earth via `world-atlas`. The `@photostructure/tz-lookup` library uses compressed time-zone boundary approximations from timezone-boundary-builder. Its README explicitly warns that geographic time-zone lookup is approximate near borders; named city clocks instead use explicit known IANA identifiers. Do not market arbitrary map clicks as legally exact boundary results without upgrading and testing the geographic lookup. The displayed time within an identified IANA zone follows `Intl` rules provided by the user browser/runtime.

## Search-intent stability (October 2026)

- The visible city clock can change without rewriting `document.title`. Canonical homepage and individual static city landing-page titles remain stable for crawlers, social previews and visitors, regardless of their browser time zone.
- Belgian winter/summer guide meta descriptions are evergreen: the next date/countdown is calculated at runtime instead of leaving a soon-stale year in the search snippet.
- `scripts/validate-seo.mjs` guards against accidental reintroduction of a runtime title mutation or hard-coded seasonal year in meta descriptions.
- Google Search Console remains the source of truth for indexing/impressions/click-through; no ranking claims are made without its data.

## OTHRYS Optimization Kit — standalone pilot

The reusable, zero-dependency agent-ready optimization package lives in [tooling/othrys-optimize](tooling/othrys-optimize/README.md). It runs read-only structural audits and tests in the existing Vercel release build (`npm run build`). Use `npm run optimize:report` to produce local, machine-readable findings and owner-gated proposals without changing production. The full research, safe automation policy, and gradual multi-site rollout are documented in the package. No recurring jobs or separate hosting are enabled.

## Optimizer v0.2

Manual, read-only evidence triage: run npm run optimize:plan after a local build. Optional remote HTTP checks: npm run optimize:smoke (requires network access). Neither command is scheduled. The agent packet makes evidence, priority, owner gate and rollback expectations explicit. The ranking playbook remains unchanged until real Search Console and performance data justify an experiment.
