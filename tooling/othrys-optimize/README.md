# OTHRYS Optimization Kit — v0.2 pilot

Reusable, **independent**, zero-runtime-dependency optimization package for small utility websites. First proving ground: [World Time](https://worldtime.othrys.be/).

**Intent:** turn research and search-performance evidence into a repeatable audit → suggestion → reviewed change → measurement workflow. Not a black-hat SEO or mass-content bot. No agent, recurring task, backlink outreach, GitHub PR or production deployment is started automatically.

## Quick start

From the containing website repository after building HTML into `dist/`:

```bash
node tooling/othrys-optimize/bin/audit.mjs --config tooling/othrys-optimize/sites/worldtime.json --strict
node tooling/othrys-optimize/bin/audit.mjs --config tooling/othrys-optimize/sites/worldtime.json --report-dir .reports/seo
node --test tooling/othrys-optimize/tests/*.test.mjs
```

Generated `.reports/seo/` (when explicitly requested):
- `audit.md` — human-readable prioritized diagnosis
- `audit.json` — structured findings and source evidence
- `proposals.json` — proposed tasks with owner/reviewer authority gates; **never executed**

Optional evidence sources: `--gsc-json path/to/windsor-rows.json` and `--lighthouse-json path/to/lighthouse-report.json`. These are locally supplied, read-only snapshots. The package does not request your Google keys or Windsor credentials. A connected AI agent can fetch Search Console data through Windsor.ai and write a temporary export for this CLI, if its execution environment supports files.

**Run `--strict` for a build gate.** Errors exit 2; warnings/opportunities are surfaced but do not block. This avoids breaking deployments for noncritical suggestions.

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

1. Copy the entire `tooling/othrys-optimize` directory into another Vite/Astro/Next static-export site.
2. Add its own `sites/<name>.json` with verified HTTPS `baseUrl` and `distDir`.
3. Build actual HTML and `sitemap.xml`; test its pages (do not invent directory pages).
4. Add the read-only CLI to the existing CI/release build.
5. Give your AI manager [AGENT.md](AGENT.md) and [docs/RESEARCH-PLAYBOOK.md](docs/RESEARCH-PLAYBOOK.md).
6. Permit the manager to audit and create a **draft** pull request; require owner approval for publication, scheduled actions and outreach.

See [POLICY.md](POLICY.md) for fixed safety gates and [docs/ADOPTION.md](docs/ADOPTION.md) for the OTHRYS rollout plan.

## Philosophy

**Build in minutes, measure real traffic, optimize what works.** Code that isn't faster, more correct, more useful or better supported by evidence is not an optimization. Don't equate green technical checks with indexing or ranking. Google decides indexing and rankings.

## v0.2: observation → explainable evidence tickets (NEW)

No autonomous web browser or continuous AI model is started. The new planner is executable, read-only logic suitable for a future AI manager. To produce a human-readable prioritized task packet locally, after building:

~~~bash
npm run build
npm run optimize:plan
~~~

Outputs are written only on this explicit command to .reports/optimization/:
- audit.json / audit.md / proposals.json (v0.1 checks)
- plan.json / plan.md (v0.2 evidence triage)

The planner ranks technical errors first (P0), measured lab performance concerns next (P1), then sufficiently supported GSC keyword opportunities (P2), then research/backlink opportunities (P3). It does not publish anything. Optional source snapshots:

~~~bash
node tooling/othrys-optimize/bin/plan.mjs \
  --gsc-json path/to/consented-search-console-export.json \
  --lighthouse-json path/to/real-lighthouse-report.json \
  --out .reports/optimization
~~~

**GSC data caveat:** empty or missing rows do not mean zero visitors; no score or ranking claim is made. Windsor.ai can provide structured GSC rows to a connected ChatGPT agent, but the standalone Node package does not have access to ChatGPT's plugin credentials.

### On-demand live HTTP checks

~~~bash
npm run optimize:smoke
~~~

The smoke script checks seven representative URLs for HTTP 200, expected canonical metadata, SSR headings, a working XML sitemap and a server time JSON response. It is **read-only** and must be invoked explicitly in an environment with DNS/network access. It is not a Chrome browser: it does not verify map visibility, JavaScript interactions, accessible layout, CWV or a Lighthouse score. The script is not part of the production build because it would be unreliable against a site not yet deployed.

All optimizer logic is intentionally side-effect-free; an AI manager can read this output, investigate sources and propose a *draft PR* to the owner. Owner approval is still required for production changes, outreach or starting any recurring jobs.

Read docs/V0-2-VERIFICATION.md for the deployment baseline and missing evidence.
