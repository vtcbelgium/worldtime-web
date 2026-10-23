# OTHRYS Optimization Policy — enforceable owner gates

`lib/policy.mjs` maps the action taxonomy to an authorization gate. The tool is deliberately read-only. The AI agent must follow the *stricter* of this policy and permissions of the connected account.

| Action | Gate |
|---|---|
| Research, website read, deterministic SEO audit, Windsor data read | AUTO_READ |
| Tests, draft feature branch and PR | PR_REVIEW |
| Production deployment, merge, site rewrite, new city page, external paid tool | OWNER_APPROVAL |
| Recurring or timed jobs; notifications; external outreach; IndexNow notifications | OWNER_APPROVAL |
| Link buying, cloaking, keyword stuffing, fake engagement, mass thin pages, false review schema | PROHIBITED |
| Ordinary clock pages through Google's restricted Indexing API | PROHIBITED |
| Unknown action | OWNER_APPROVAL |

Safeguards:
- No token or credential in issues, output artifacts, code, client HTML or AI prompts.
- Never automatically create new Google properties or modify DNS.
- Avoid intrusive cookies and tracking. Use aggregated GSC/field data under existing permissions.
- Do not generate thousands of template pages without real original value.
- Never fabricate a `lastmod` date or refresh publication dates to look new.
- Performance budgets must be based on tests, not guessed rankings.
- No timed tasks automatically activated; previously paused work remains paused unless owner explicitly authorizes a cadence.
- Changes affecting OTHRYS main repos are forbidden in the pilot. Extract only after independent validation.
