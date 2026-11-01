# RHMS Upgrade Audit

Audit date: 2026-11-01

## Verified deployment baseline

- Frontend: Vercel production deployment at `https://rural-health-management-system.vercel.app`.
- API: Render web service at `https://rural-health-management-system.onrender.com`.
- Data: MongoDB Atlas with a synthetic `RHMS-DEMO` dataset (12 patients and connected operational records).
- The Render readiness endpoint returned HTTP 200 after the final normal-start deployment.

## Critical

None confirmed from the available code and deployment evidence.

## High

1. The public deployment is behind the local working tree's live-dashboard work.
   - Evidence: dashboard controller/service and dashboard components are modified locally but are not part of the committed production branch.
   - Impact: the production UI may not yet present every live operational metric available in the local implementation.
   - Required action: review, test, commit, and deploy the existing live-data changes as a separate change set before layering additional dashboard features on them.

2. The current CORS configuration accepts one Vercel production origin only.
   - Evidence: Render responses allow `https://rural-health-management-system.vercel.app`; temporary Vercel preview domains previously produced browser CORS failures.
   - Impact: preview deployments cannot exercise authenticated API workflows.
   - Required action: retain the production allowlist and, if preview testing is required, implement a narrowly validated Vercel preview-origin policy rather than a wildcard.

## Medium

1. The dashboard service supplies useful live metrics, but not all command-center measures required by the final specification.
   - Present: appointments, waiting/in-consultation/completed queue counts, doctor schedules, pending prescriptions, critical lab results, vaccination count, low-stock batches, notifications, queue performance.
   - Missing from the verified implementation: explicit patients registered today, pending laboratory request count, vaccinations due today, pending follow-up count, urgent referral count, an end-to-end patient-flow board, last-updated value, and connection-state indicator.

2. Patient clinical profile has a data-backed timeline, but it is incomplete for the requested smart timeline.
   - Present: visits, prescriptions, lab results, vaccinations.
   - Missing: registration event, referrals, follow-up tasks, date/type filters, and source-record navigation metadata.

3. QR patient identifiers are not yet a printable, authorization-protected health-card workflow.
   - Existing patient records store a `qrCodeValue`, currently using a patient identifier URI.
   - Required: opaque lookup token, authorized scan route, expiry/revocation strategy, printable card view and PDF/print verification.

4. Follow-up tasks exist as an operational model and API, but there is no independently verified staff task centre with task history, personal dashboard, and all requested task categories.

5. Global search has a frontend command palette that calls `/operations/search`; server-side authorization scope and result coverage require API-level verification.

6. The frontend production build succeeds but emits an initial JavaScript bundle-size warning (~806 kB before gzip in the last verified build).
   - Required: measure and add route-level lazy loading for the largest page groups.

## Low

1. Some checked-in dashboard strings contain encoding artifacts (for example `Â·` and malformed ellipsis) in the local files inspected. These should be normalized before the next release.
2. The project has no verified Playwright suite or automated test command in the inspected package scripts.
3. `npm audit` reports dependency vulnerabilities. Do not use `npm audit fix --force` blindly; triage lockfile upgrades and breaking changes separately.

## Existing strengths

- JWT authentication, role middleware, validation, Helmet, CORS configuration, structured request logging, health endpoints, Mongoose models, and Socket.IO are present.
- `/health/live` and `/health/ready` exist; readiness reports MongoDB state without exposing credentials.
- The existing synthetic-data seeder is idempotent and avoids real patient data.
- The API supports RBAC-oriented operational modules, pharmacy/lab/vaccination workflows, reports, notifications, and dashboard aggregation.

## Recommended implementation order

1. Commit and test the existing local live-data dashboard work as an isolated release.
2. Add the missing command-center aggregates and visible connection/last-updated status.
3. Complete patient timeline and secure QR card workflows.
4. Expand follow-up tasks into the staff task centre and add history.
5. Verify or harden global search permissions, notifications, and export controls.
6. Add tests and route-level code splitting; then perform a separate security/dependency remediation pass.

## Audit limits

- No destructive testing was run against the deployed Atlas database.
- No real patient data was inspected or used.
- Full end-to-end browser automation, mobile-device testing, and every role workflow remain pending.
