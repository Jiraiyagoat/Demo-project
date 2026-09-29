# Student Hub v0.9 — Planner UX Redesign

This update does **not** require new Appwrite tables or columns. It uses the existing `courses`, `assessments`, `tasks`, `work_blocks`, `study_sessions`, `resources`, and `inbox_items` setup.

## What changed

- Week / Month / Agenda planner views.
- Plan / Deadlines / Courses lenses.
- Previous / next period navigation and jump-to-today.
- Course and assessment-type filters.
- Layer toggles for classes, study work, and deadlines.
- Compact/comfortable density switch.
- Multi-session work blocks collapse into one assessment card until expanded.
- Deadline runway and course-load view.
- Unscheduled shelf with Academic Impact score.
- Smart Plan Preview: no Appwrite writes until the user applies the proposed plan.
- Plan Health + safe repair for future auto-generated blocks that are too early, after deadlines, duplicated beyond remaining effort, or over weekly capacity.
- Session length adapts to recorded focus-session history when available.
- Local-date handling was corrected so planning behaves properly outside UTC.
- Service-worker cache bumped to `student-hub-demo-v9-0`.

## Files to replace

Replace these files in the root of your GitHub Pages repository:

- `index.html`
- `styles.css`
- `app.js`
- `appwrite.js`
- `auth.js`
- `sw.js`
- `manifest.json`

You do **not** need to redeploy the `academic-ai` Appwrite Function for this planner update.

## First test

1. Open Planner.
2. Use the left/right arrows around the date label.
3. Switch Week → Month → Agenda.
4. Switch Plan → Deadlines → Courses.
5. Try a course or assessment-type filter.
6. Press **Preview smart plan**. Confirm that the modal says nothing is saved until Apply.
7. If Plan Health reports old invalid adaptive blocks, press **Review repair**, inspect the list, then Apply repair. This only removes future auto-generated work blocks.
8. Run Preview smart plan again and Apply the clean proposal.

After GitHub Pages deploys, use `Ctrl + Shift + R` once.
