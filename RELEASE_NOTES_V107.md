# Student Hub v1.0.7 - final consistency patch + cloud QA reset

## What changed

### 1. One weekly planning total everywhere
A new canonical `getWeekPlanningSummary()` calculation now owns weekly planned minutes, due workload, weekly capacity, over-capacity and capacity-left values.

Today, Planner statistics and Plan Health now use the same weekly basis. Planner filters can still narrow the visible view, but orphan/manual work is no longer silently omitted from visible planned-time totals. This fixes the 1-hour mismatch seen between Today, Planner and the Plan Health banner.

### 2. Reliability catches more broken planner links
Data Health now distinguishes:
- local adaptive blocks whose missing assessment link is safe to repair automatically; and
- cloud/manual blocks with a missing assessment link that require review.

This avoids reporting a workspace as healthy when stale cloud/manual planner blocks are still present.

### 3. Course Grades view restored
Course detail pages again include a **Grades** tab. It shows the real course-level current grade and target already stored in the course model, plus assessment weights/status/dates.

Student Hub does **not** invent per-assessment marks. Until a real grade source is connected, the Grades tab is deliberately transparent about that limitation.

### 4. Real Appwrite QA reset tool
`tools/CLOUD_QA_RESET_V107.html` provides an explicit, destructive QA workflow for the currently signed-in user's active semester.

It:
- inspects current cloud row counts;
- downloads a JSON metadata backup first;
- deletes current-semester QA/application rows in dependency order;
- optionally deletes linked files from `academic_files`;
- offers **clean only** mode for importing your own real academic data, or seeds a realistic 4-course Appwrite workspace with deadlines, tasks, planner blocks, Library content, Inbox captures and study history;
- shifts dates relative to the day the tool is run;
- leaves the Appwrite account and semester row intact.

The seeded data intentionally contains one slipped adaptive study block so recovery/Action Center behavior can be tested with real cloud rows.

### 5. Included PDF test inputs
The package now includes:
- `tools/test-data/student-hub-sample-syllabus.pdf`
- `tools/test-data/student-hub-sample-notes.pdf`

Use the syllabus PDF after the cloud reset to exercise the real Storage + Academic AI path.

### 6. Cache version
The service worker cache is now `student-hub-v10-7`.

## Infrastructure impact
No Appwrite schema, table, bucket, Function, permission or environment-variable change is required.
