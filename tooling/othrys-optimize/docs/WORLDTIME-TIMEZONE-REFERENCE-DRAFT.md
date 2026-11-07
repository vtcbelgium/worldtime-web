# WorldTime — accurate time-zone handling (reference draft)

**Status:** draft linkable resource, not a published SEO page. Review against the live site and primary time-zone references before publication.

## Why a fixed UTC offset is not a timezone

UTC+01:00 is a *fixed offset*. `Europe/Brussels` is an IANA time-zone identifier: its offset can vary with historical and current daylight-saving rules. Using `UTC+01:00` as a permanent stand-in for Brussels would show the wrong local time during Belgian summer time.

WorldTime uses IANA identifiers for its eight pre-rendered city clocks. As of the verified October 2026 build, examples include `America/New_York`, `Europe/London`, `Asia/Tokyo`, `Australia/Sydney`, `Asia/Dubai`, `Asia/Kolkata`, `Asia/Kathmandu`, and `Europe/Brussels`.

## Three real edge cases

1. **Half-hour offset:** `Asia/Kolkata` uses UTC+05:30 at present. Do not round to a whole hour.
2. **Quarter-hour offset:** `Asia/Kathmandu` uses UTC+05:45 at present. It's 15 minutes ahead of India.
3. **Repeated local hour:** In Brussels on **25 October 2026**, 02:30 occurs twice as the clock changes from daylight-saving time to standard time. The two UTC instants are 00:30Z and 01:30Z. They represent different instants despite the same displayed local clock time.

These examples describe the rule set in contemporary time-zone databases; future laws can change. Verify future conversions against an updated platform timezone database.

## JavaScript example: one instant, two cities

```js
const instant = new Date('2026-10-25T01:30:00Z');

for (const timeZone of ['Europe/Brussels', 'Asia/Kathmandu']) {
  const text = new Intl.DateTimeFormat('en-GB', {
    timeZone, dateStyle: 'full', timeStyle: 'long'
  }).format(instant);
  console.log(timeZone, text);
}
```

`Intl.DateTimeFormat` applies the configured named zone when formatting one UTC instant. The code uses the runtime's own time-zone data, rather than a hard-coded offset. Don't confuse formatted local wall time with an unambiguous timestamp: save UTC instants or an explicit zone/offset when ambiguity matters.

## How to evaluate a world clock

- Confirm that the displayed city and IANA time zone match.
- Test transitions near the relevant local DST change.
- Include fractional offsets such as India and Nepal.
- Verify the source of clock calibration and show a sensible device-clock fallback if network time is unavailable.
- Validate the date as well as the hour when comparing remote cities.

WorldTime's existing tests cover IANA city metadata, Brussels 2026 fallback, fractional offsets and clock calibration. The site is a convenient utility, **not** an official time standard or a guarantee that an operating system has the latest political timezone changes.

## Explore

- [WorldTime clock](https://worldtime.othrys.be/)
- [Brussels](https://worldtime.othrys.be/time/brussels/)
- [Mumbai](https://worldtime.othrys.be/time/mumbai/)
- [Kathmandu](https://worldtime.othrys.be/time/kathmandu/)

## Primary references

- [IANA time-zone database](https://www.iana.org/time-zones)
- [ECMA-402 Intl.DateTimeFormat](https://tc39.es/ecma402/#datetimeformat-objects)
- [MDN: Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat)

## Publication gate

Do not add a public route, sitemap entry, or outbound outreach yet. First verify the examples against the built site and execute the tests. Only publish if this adds distinct visitor value, is fact-checked and owner-approved. This is not a keyword-stuffed location-page template.
