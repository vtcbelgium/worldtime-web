export const CITY_PAGES = [
  {
    "slug": "new-york",
    "name": "New York",
    "country": "United States",
    "zone": "America/New_York",
    "offset": "UTC−05:00 (EST) in winter and UTC−04:00 (EDT) in summer",
    "detail": "New York switches to daylight saving time on the second Sunday in March and returns to standard time on the first Sunday in November. This live clock uses America/New_York rather than a fixed offset, so it keeps pace with the change.",
    "use": "For a call from London or Europe, check New York's local date as well as the hour: the time difference varies around the weeks when the US and Europe switch their clocks."
  },
  {
    "slug": "london",
    "name": "London",
    "country": "United Kingdom",
    "zone": "Europe/London",
    "offset": "UTC+00:00 (GMT) in winter and UTC+01:00 (BST) in summer",
    "detail": "London follows Greenwich Mean Time during winter and British Summer Time in warmer months. British clocks typically change on the last Sundays of March and October.",
    "use": "London and New York do not always differ by the same number of hours because their daylight saving changes happen on different Sundays. The live clock above follows the applicable UK rules."
  },
  {
    "slug": "tokyo",
    "name": "Tokyo",
    "country": "Japan",
    "zone": "Asia/Tokyo",
    "offset": "UTC+09:00 (JST) throughout the year",
    "detail": "Tokyo uses Japan Standard Time and does not currently observe daylight saving time. The local clock is nine hours ahead of UTC year-round.",
    "use": "For international meetings, Tokyo's time stays steady while the time difference from cities such as London and New York changes when those cities observe daylight saving time."
  },
  {
    "slug": "sydney",
    "name": "Sydney",
    "country": "Australia",
    "zone": "Australia/Sydney",
    "offset": "UTC+10:00 (AEST) in standard time and UTC+11:00 (AEDT) during daylight saving",
    "detail": "Sydney observes daylight saving at the opposite time of year from Europe and much of North America. In New South Wales, clocks typically move forward on the first Sunday in October and backward on the first Sunday in April.",
    "use": "Use the live date shown above when comparing Sydney with Europe: Sydney can already be on the next calendar day."
  },
  {
    "slug": "dubai",
    "name": "Dubai",
    "country": "United Arab Emirates",
    "zone": "Asia/Dubai",
    "offset": "UTC+04:00 (GST) all year",
    "detail": "Dubai follows Gulf Standard Time throughout the year and does not currently change its clocks for daylight saving.",
    "use": "Because Dubai's clock stays fixed while many European cities change clocks twice a year, the time difference between Dubai and London or Brussels can vary by season."
  },
  {
    "slug": "mumbai",
    "name": "Mumbai",
    "country": "India",
    "zone": "Asia/Kolkata",
    "offset": "UTC+05:30 (IST) throughout the year",
    "detail": "Mumbai uses India Standard Time, the same time zone as New Delhi and Kolkata. India uses a half-hour offset and does not currently observe daylight saving time.",
    "use": "For cross-border calls, remember that a simple whole-hour offset converter would be wrong for Mumbai. The live clock above includes the extra 30 minutes."
  },
  {
    "slug": "kathmandu",
    "name": "Kathmandu",
    "country": "Nepal",
    "zone": "Asia/Kathmandu",
    "offset": "UTC+05:45 (NPT) throughout the year",
    "detail": "Nepal Time is one of the world's quarter-hour time zones. Kathmandu is five hours and 45 minutes ahead of UTC and does not currently observe daylight saving.",
    "use": "Kathmandu is 15 minutes ahead of India, not a full hour. Use the live clock above to compare exact times without rounding to an hourly zone."
  },
  {
    "slug": "brussels",
    "name": "Brussels",
    "country": "Belgium",
    "zone": "Europe/Brussels",
    "offset": "UTC+01:00 (CET) in winter and UTC+02:00 (CEST) in summer",
    "detail": "Brussels follows Central European Time in winter and Central European Summer Time in summer. Belgian clocks change on the last Sundays of March and October.",
    "use": "When Belgian clocks move back in October, the hour from 02:00 to 03:00 occurs twice. The live clock handles that repeated hour using Europe/Brussels time-zone rules."
  }
];
export const BASE_URL = 'https://worldtime.othrys.be';
