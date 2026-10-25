# World Time — language integrity policy

Last reviewed: 25 October 2026.

World Time's pages are **not** automatically translated by the browser. URLs have a fixed language for Google and for users.

| URL family | Language | Search intent |
|---|---|---|
| `/`, `/time/*/` | `en` | English world clock / city times |
| `/winter-time-belgium/`, `/summer-time-belgium/` | `en` | English Belgian clock-change help |
| `/wintertijd/`, `/zomertijd/` | `nl-BE` | Dutch Belgian seasonal queries |

The English homepage and eight city pages must link to the English clock-change guides. Dutch seasonal pages must link to Dutch seasonal pages in their nav. Links from Dutch guides to English-only city clocks must identify the English language in the link text. Every seasonal guide has a visible switch to its genuine equivalent translation.

For each English/Dutch seasonal pair, both variants carry the same reciprocal `hreflang="en"` and `hreflang="nl-BE"` link set, including self, and **self-referencing canonical**. Do not add `hreflang` between the English city pages and Dutch seasonal pages; they are different content rather than translations.

Every site page is built and checked as HTML; all thirteen are enumerated in the sitemap. Generated paths are indexable and include a meaningful title, description and primary heading.

Tests:
- `npm.cmd run build`: static language, 13 canonical routes, internal links, alternate links, metadata, sitemap and SEO audit.
- `npm.cmd run preview -- --host 127.0.0.1 --port 4173`, then `npm.cmd run test:locales:browser`: real Chromium checks for all 13 pages in desktop/mobile viewports plus bidirectional language navigation.
- Browser tests are opt-in on developer machines with Playwright installed; avoid adding headless Chrome to production dependencies.

No French or Dutch city variants have been manufactured. Any new language must be editorially reviewed and offer substantial translated value. The next task is not more language expansion; wait for actual Search Console demand.

Google reference: https://developers.google.com/search/docs/specialty/international/localized-versions
