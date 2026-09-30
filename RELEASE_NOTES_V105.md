# Student Hub v1.0.5 — proactive assistant + risk communication

## Student Assistant / Action Center
- Added a compact **Action Center** in the top bar.
- It only surfaces items that can change the student's next decision:
  - slipped study blocks;
  - deadlines with meaningful delivery risk;
  - due review items;
  - unprocessed Inbox captures;
  - data-consistency warnings;
  - partial cloud-sync readiness.
- Each item has one direct action such as **Review plan**, **Review slipped work**, **Open Study**, **Process Inbox**, or **Check diagnostics**.
- Items can be **snoozed for the rest of the day** instead of permanently dismissed.
- Today now includes a small **Proactive brief** showing the three most important current items without turning the dashboard into a notification feed.

## Explainable deadline risk
- Deadline risk now uses the real planning context rather than only a due-date threshold.
- Signals include:
  - time until the deadline;
  - remaining effort;
  - future planned coverage;
  - slipped work already in the past;
  - approximate daily effort required versus the student's configured daily limit;
  - major assessment weight.
- Student Hub communicates the reason in plain language (for example, `Due within 2 days` or `2h 30m still has no calendar coverage`) instead of exposing an arbitrary numeric score.
- Planner's **At-risk deadlines** statistic now uses the same risk model as the Action Center.

## Optional browser reminders
- Settings now includes **Student assistant** preferences.
- Students can independently enable/disable deadline-risk, slipped-plan, review, Inbox, and reliability reminders.
- Optional browser reminders can be enabled with browser permission.
- These are intentionally limited to reminders **while Student Hub is open**; this release does not claim background push delivery.

## Production/demo readiness
- Added `PRODUCTION_AUDIT_V105.md` with the end-to-end product audit, remaining limitations, and release gates.
- Added `DEMO_FLOW_V105.md` with a concise demo path that demonstrates the complete academic loop.
- Added `TEST_CHECKLIST_V105.md` covering the new assistant plus all critical regressions.
- JavaScript syntax validation and a headless DOM smoke test were run on the v1.0.5 build.

## Infrastructure
- Frontend-only update.
- No new Appwrite tables, columns, Storage buckets, Functions, or environment variables.
- Service-worker cache bumped to `student-hub-v10-5`.
