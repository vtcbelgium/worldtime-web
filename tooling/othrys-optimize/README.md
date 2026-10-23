# OTHRYS Optimization Kit — v0.1 pilot

Reusable, **independent**, zero-runtime-dependency optimization package for small utility websites. First proving ground: [World Time](https://worldtime.othrys.be/).

**Intent:** turn research and search-performance evidence into a repeatable audit → suggestion → reviewed change → measurement workflow. Not a black-hat SEO or mass-content bot. No agent, recurring task, backlink outreach, GitHub PR or production deployment is started automatically.

## Quick start

From the containing website repository after building HTML into \`dist/\`:

\`\`\`bash
node tooling/othrys-optimize/bin/audit.mjs --config tooling/othrys-optimize/sites/worldtime.json --strict
node tooling/othrys-optimize/bin/audit.mjs --config tooling/othrys-optimize/sites/worldtime.json --report-dir .reports/seo
node --test tooling/othrys-optimize/tests/*.test.mjs
\`\`\`

Generated \`.reports/seo/\` (when explicitly requested):
- \`audit.md\` — human-readable prioritized diagnosis
- \`audit.json\` — structured findings and source evidence
- \`proposals.json\` — proposed tasks with owner/reviewer authority gates; **never executed**

Optional evidence sources: \`--gsc-json path/to/windsor-rows.json\` and \`--lighthouse-json path/to/lighthouse-report.json\`. These are locally supplied, read-only snapshots. The package does not request your Google keys or Windsor credentials. A connected AI agent can fetch Search Console data through Windsor.ai and write a temporary export for this CLI, if its execution environment supports files.

**Run \`--strict\` for a build gate.** Errors exit 2; warnings/opportunities are surfaced but do not block. This avoids breaking deployments for noncritical suggestions.

## What is automated today

- Check all static, sitemap-listed HTML URLs for valid title, description, H1, canonical, language, robots/noindex, JSON-LD syntax, unique titles, internal links, and sitemap/robots consistency.
- Recommend homepage WebSite site-name markup when absent, without inventing reviews, ratings or snippets.
- Optionally interpret real Search Console page/query data and supplied Lighthouse JSON reports, with evidence thresholds.
- Produce a proposal packet with each change's evidence, recommended acceptance criteria and authority classification.
- Run the deterministic kit inside World Time's existing Vercel build, not an additional timed GitHub workflow.

## What is NOT automated yet

- Real-user Web Vitals instrumentation or Chrome Lighthouse execution (this accepts a Lighthouse JSON report but does not fabricate one).
- Google URL Inspection API authentication and indexing checks.
- Automatic Windsor queries from within standalone Node (ChatGPT's connected Windsor tool does that with account permission).
- IndexNow submission, outreach, domain ownership, paid services, automatic deployment, autonomous AI browsing, content generation or scheduled monitoring.
- A separate universal OTHRYS service. Prove on World Time before extraction to its own repo/service.

## Portable adoption

1. Copy the entire \`tooling/othrys-optimize\` directory into another Vite/Astro/Next static-export site.
2. Add its own \`sites/<name>.json\` with verified HTTPS \`baseUrl\` and \`distDir\`.
3. Build actual HTML and \`sitemap.xml\`; test its pages (do not invent directory pages).
4. Add the read-only CLI to the existing CI/release build.
5. Give your AI manager [AGENT.md](AGENT.md) and [docs/RESEARCH-PLAYBOOK.md](docs/RESEARCH-PLAYBOOK.md).
6. Permit the manager to audit and create a **draft** pull request; require owner approval for publication, scheduled actions and outreach.

See [POLICY.md](POLICY.md) for fixed safety gates and [docs/ADOPTION.md](docs/ADOPTION.md) for the OTHRYS rollout plan.

## Philosophy

**Build in minutes, measure real traffic, optimize what works.** Code that isn't faster, more correct, more useful or better supported by evidence is not an optimization. Don't equate green technical checks with indexing or ranking. Google decides indexing and rankings.
