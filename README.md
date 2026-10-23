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

No accounts, tracking, or cookies. Browser time zone is available without GPS; precise location is asked for only on button click. A local theme preference is retained in browser storage.

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
