# Student Hub v1.0 — Appwrite Setup / Upgrade

No Appwrite schema migration is required from the working v0.9.1 setup.

## Keep the existing backend

Tables:
- `semesters`
- `courses`
- `assessments`
- `tasks`
- `work_blocks`
- `resources`
- `inbox_items`
- `study_sessions`
- `ai_jobs`

Storage:
- private `academic_files` bucket

Function:
- the currently working `academic-ai` deployment with the current OpenRouter environment variables

## What changed in v1.0

Only the frontend client changed.

Most importantly, `appwrite.js` no longer auto-copies local sample data into empty cloud tables. `syncAcademicSeed`, `syncPlannerSeed`, and `syncKnowledgeSeed` now read the signed-in user's Appwrite rows and treat them as the source of truth.

That means **do not re-add the old seeding loops** when merging files.

## Deploy

Replace the frontend files in the GitHub Pages repository with the v1.0 files and push.

No Function redeployment is necessary.

After deployment, perform one hard refresh (`Ctrl + Shift + R`) because the service worker cache changed to `student-hub-v10-0`.
