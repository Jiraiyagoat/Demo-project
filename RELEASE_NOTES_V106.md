# Student Hub v1.0.6 — consistency, QA and repeatable test state

## 1. One canonical planning snapshot
Today, Planner and the Student Assistant now derive the core planning facts from the same calculation instead of maintaining separate interpretations.

Canonical values include:
- slipped study blocks and slipped minutes;
- due workload for the current week;
- planned study time for the current week;
- weekly capacity and over-capacity time;
- work that still needs calendar coverage;
- at-risk assessments.

This fixes the important trust issue where Today could report a different number of slipped blocks from the Action Center.

## 2. Cleaner Action Center hierarchy
The Action Center is now grouped into:
- **Now** — critical or immediately actionable items;
- **Needs attention** — important warnings that are not the top emergency;
- **Later** — review, Inbox, reliability and lower-priority follow-up.

Low-value duplicate warnings are reduced when a slipped-plan alert already represents the same underlying issue. The assistant remains exception-driven rather than becoming a generic notification feed.

## 3. Runtime wording cleanup
Production-facing wording no longer mentions demos/hackathons. Reliability and sync messages now describe the actual consequence: whether the student can safely rely on the affected data or another device.

## 4. Read-only QA diagnostics
`window.studentHubApp.diagnostics()` exposes a small read-only summary for regression tests. It does not mutate state. It reports the active route, entity counts, canonical planning values, assistant item keys/groups and Data Health status.

## 5. Repeatable QA state
A deterministic QA sample and reset utility are included under `tools/` in the release package. The reset utility:
- changes only the browser-local fallback workspace;
- never deletes or overwrites Appwrite records;
- shifts dates relative to the day it is run so the fixture remains useful later;
- intentionally creates exactly three slipped work blocks for consistency testing.

## 6. Cache/versioning
The service-worker cache is bumped to `student-hub-v10-6` so stale v1.0.5 assets are not reused after deployment.

## Infrastructure impact
Frontend-only release. No new Appwrite tables, columns, buckets, functions, permissions or environment variables are required.
