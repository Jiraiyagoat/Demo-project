# Student Hub v1.0 — Product Consolidation

This release turns the existing feature set into one clearer student workflow:

**Capture → Understand → Plan → Do → Adapt**

## Major changes

- **Today is now the command center.** It prioritizes the next scheduled class/study block or the most relevant upcoming assessment, shows a concise plan-health signal, today's timeline, and only the nearest deadlines.
- **Planner controls now have a clearer hierarchy:** View (Week / Month / Agenda), Show (My plan / Timetable / Deadlines), and Insights (Course load / Priorities).
- **Planner defaults are calmer.** Compact mode groups study work by assessment and exposes task detail progressively instead of making every task compete for attention.
- **Priority is explained rather than scored.** Students see reasons such as urgency, remaining effort, grade weight, planning coverage, and review gaps instead of unexplained “Impact 80” numbers.
- **Courses now act as academic context, not a duplicate planner.** The unfinished Grades tab is removed; Materials is explicitly a filtered view of the same Library.
- **Topics connect directly to Library.** Opening a topic from a course takes the student to the same resource system filtered to that course/topic.
- **Study is execution-only.** The screen centers on the chosen focus session, timer, relevant materials, and recorded study history.
- **Library is one source of truth.** Course pages and Study use filtered views of the same material records.
- **Inbox is explicitly temporary staging.** Captures are meant to be processed into deadlines/materials or archived.
- **Search + Quick Add are unified as “Find or add”.** Existing semester objects can be searched from one command box; new information can be captured from that same box. Non-schedulable text goes to Inbox instead of being forced into a fake deadline.
- **Semester onboarding is now a four-step flow:** realistic capacity → course context → syllabus import → initial plan preview.
- **Study capacity is personal.** Weekly capacity, daily maximum, weekday/weekend windows, and weekend availability feed Smart Plan.
- **Canonicalization is stronger.** Topic spelling/case aliases are normalized, assessments are deduplicated in the client view, and new imports continue to reject likely duplicates.
- **New accounts no longer receive demo seed data.** Signed-in cloud data is now the source of truth. The previous auto-seeding behavior that could copy sample courses/tasks/resources into a fresh Appwrite account has been removed.
- **Cross-user local-state leakage is prevented.** A new signed-in user receives a clean local workspace rather than inheriting the generic demo localStorage state.
- **Backend jargon is quieter.** Everyday UI uses “Synced”, “Library”, “Course”, etc.; Appwrite details remain available under Technical diagnostics.

## Backend impact

No new Appwrite tables, columns, Storage buckets, or Function deployment are required for v1.0.

The existing working backend remains:

- `semesters`
- `courses`
- `assessments`
- `tasks`
- `work_blocks`
- `resources`
- `inbox_items`
- `study_sessions`
- `ai_jobs`
- private `academic_files` bucket
- working `academic-ai` Function / OpenRouter flow

`appwrite.js` changed only in frontend client behavior: the old `sync*Seed` helpers now read cloud rows instead of copying local demo seed data into Appwrite.

## Upgrade

Replace these frontend files on GitHub Pages:

- `index.html`
- `styles.css`
- `app.js`
- `appwrite.js`
- `auth.js`
- `sw.js`
- `manifest.json`

Then hard-refresh once (`Ctrl + Shift + R`). The service-worker cache is now `student-hub-v10-0`.

The Academic AI Function does **not** need to be redeployed for this release.
