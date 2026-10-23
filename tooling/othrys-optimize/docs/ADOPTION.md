# Rollout: one site → reusable kit → OTHRYS service

**Phase A — World Time pilot (current):** check code/SEO deterministically in normal Vercel builds. Generate optional offline reports and proposals. Keep production controlled by the owner. No standalone central orchestrator.

**Phase B — independent utilities:** copy versioned \`tooling/othrys-optimize\` folder into UnixTime and the next two small sites. Supply independent config, run tests, compare the false-positive rate and performance cost. Fix checks that fail real sites without good reason.

**Phase C — standardized package:** after three successful site audits, extract into a dedicated source repository and pinned semver package. Version its CLI/output schema and let each site update separately. No shared hosting or account credentials required.

**Phase D — OTHRYS Optimizer agent:** only after reliable tests, attach the evidence reader to the manager via the existing OTHRYS pipeline. Architect chooses a small ticket, manager plans, builder opens a PR, reviews and owner approves. Keep external provider usage free-first. Each action has a checkpoint.

**Phase E — observation:** optional owner-authorized scheduled snapshots. Monitor indexed/11, impressions, clicks, top queries, real-user CWV, references, stability. Send updates only on material change. Remember prior timed tasks were paused; no background monitoring is enabled by this package.

## Success criteria to graduate from pilot
- Zero unreviewed production writes.
- Build passes after static code/site metadata changes.
- Findings are accurate against 11 World Time URLs, with evidence for each.
- Demonstrated usefulness on at least three independent utility sites, without inventing traffic.
- No recurring usage/cost without explicit approval.

## Explicitly not in v0.1
An authenticated Google Search Console URL Inspection client, real Lighthouse runner, cross-repo orchestration, active autonomous agent and IndexNow integration. Those remain follow-on tickets because setup and permission cannot be inferred or faked.
