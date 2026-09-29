# Student Hub v0.8 — Adaptive Planner

This release is the next product layer after working AI syllabus extraction.

## What changed

No new Appwrite table or Function deployment is required.

Student Hub now turns imported deadlines into a usable study plan:

- Today shows a **Planning pulse** when upcoming work is still unscheduled.
- Planner shows deadline risk, plan coverage, and one-click planning actions.
- **Smart-plan unscheduled** breaks assessments into tasks and places cloud work blocks.
- Work blocks are placed before the deadline, avoid existing events, and respect the weekly capacity configured in Settings.
- Preferred hours are used first (weekday afternoons/evenings; weekend daytime), with a wider fallback window for urgent work.
- Projects receive a longer planning runway than ordinary assignments; exams/quiz work also starts before the due date.
- Planner now has **previous / this week / next week** navigation so future study blocks are visible.
- After an AI syllabus import, the success screen can immediately **Build study plan** for that course.
- Existing task completion still reduces assessment remaining effort and removes completed work blocks.
- A duplicated cloud update in task completion was removed.

## Existing backend requirements

Keep the v0.7.4 setup:

- `courses`
- `assessments`
- `tasks`
- `work_blocks`
- `resources`
- `inbox_items`
- `study_sessions`
- `ai_jobs`
- private `academic_files` Storage bucket
- `academic-ai` Appwrite Function using asynchronous AI jobs

There are **no new database columns** in v0.8.

## Install

Replace the frontend files from this package:

- `index.html`
- `styles.css`
- `app.js`
- `appwrite.js`
- `auth.js`
- `sw.js`

The included `functions/` folder is unchanged from the working v0.7.4 AI backend; redeployment is not necessary.

After pushing to GitHub Pages, use `Ctrl + Shift + R` once. The cache name is now:

`student-hub-demo-v8-0`

## Suggested test

1. Open Today. If imported assessments are not fully scheduled, the Planning pulse should appear.
2. Click **Build study plan**.
3. Open Planner and use week navigation to inspect generated blocks.
4. Drag a work block to another day and refresh; it should remain synced through Appwrite.
5. Mark a task done and verify the corresponding planned work disappears and remaining effort updates.
