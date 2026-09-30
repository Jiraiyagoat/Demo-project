# Student Hub v1.0.6 — post-deploy checklist

## Canonical consistency
- Today and Action Center show the same slipped-block count.
- Planner recovery uses the same slipped work set.
- Weekly due work, planned study and capacity look internally consistent.

## Action Center
- Items are grouped under Now / Needs attention / Later when applicable.
- A condition is not repeated as two low-value alerts.
- Snooze still hides an item for the rest of the day.
- Direct actions still open the correct Planner, Study, Inbox or Settings flow.

## Core regression
- Sign in and reload.
- Planner previous/next week, views, filters, density and drag/drop work.
- Courses and syllabus AI import work.
- Study target selection, timer presets, full-screen focus and Finish & save work.
- Library private PDF open/delete and Study this work.
- Inbox capture/process/archive work.
- Settings Data Health and backup export work.
- Sign out/in and verify cloud-backed data returns.

## QA fixture (optional)
- Open `tools/QA_RESET_V106.html` on the same origin.
- Reset the local QA sample.
- In local/fallback mode, confirm Today and Action Center both show exactly 3 slipped blocks.
