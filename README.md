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
