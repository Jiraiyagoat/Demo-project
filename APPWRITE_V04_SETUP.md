# Student Hub v0.4 — Tasks + Work Blocks

This update moves planner tasks and scheduled work blocks into Appwrite. Courses and assessments remain cloud-backed from v0.3. Fixed class events, Study sessions, Library resources, Inbox, and review queues remain local for now.

## 1. Before replacing website files: create two Appwrite tables

Use **Databases → Student Hub**.

### Table A — Tasks

- Name: `Tasks`
- Table ID: `tasks`

Create these columns exactly:

| Key | Type | Required | Size / default |
|---|---|---:|---|
| `userId` | Varchar | Yes | 64 |
| `semesterId` | Varchar | Yes | 64 |
| `legacyId` | Varchar | No | 64 |
| `courseId` | Varchar | Yes | 64 |
| `assessmentId` | Varchar | Yes | 64 |
| `title` | Varchar | Yes | 200 |
| `estimate` | Integer | Yes | default 0 if requested |
| `remaining` | Integer | Yes | default 0 if requested |
| `status` | Varchar | Yes | 32 |
| `position` | Integer | Yes | default 0 if requested |
| `sourceType` | Varchar | Yes | 32 |

Do **not** enable Array on any Tasks column.

### Table B — Work Blocks

- Name: `Work Blocks`
- Table ID: `work_blocks`

Create these columns exactly:

| Key | Type | Required | Size / default |
|---|---|---:|---|
| `userId` | Varchar | Yes | 64 |
| `semesterId` | Varchar | Yes | 64 |
| `legacyId` | Varchar | No | 64 |
| `courseId` | Varchar | Yes | 64 |
| `assessmentId` | Varchar | Yes | 64 |
| `taskId` | Varchar | No | 64 |
| `title` | Varchar | Yes | 200 |
| `start` | Datetime | Yes | — |
| `end` | Datetime | Yes | — |
| `status` | Varchar | Yes | 32 |
| `sourceType` | Varchar | Yes | 32 |

Do **not** enable Array on any Work Blocks column.

## 2. Security for both tables

Use the same private-row security pattern that already works for `courses` and `assessments`:

- table-level CREATE: enabled for the same user role you currently use
- table-level READ: off
- table-level UPDATE: off
- table-level DELETE: off
- Row level security (RLS): ON

Student Hub creates each row with read/update/delete permission for the logged-in user.

## 3. What happens on first login

v0.4 will:

1. load courses and assessments from Appwrite,
2. migrate any existing local `work` planner events into `work_blocks`,
3. load cloud Tasks and Work Blocks,
4. replace local work blocks with the cloud versions.

The migration uses `legacyId`, so refreshing should not duplicate existing work blocks.

## 4. New planner behavior

- **Plan work** creates a task breakdown in the `tasks` table.
- Each task is scheduled into 60-minute-or-smaller `work_blocks`.
- Dragging a cloud work block to another day updates its `start` and `end` in Appwrite.
- **Mark done** completes the task, marks its linked work blocks done, removes those future blocks from the active planner, and updates the assessment `remaining` value.
- **Auto-plan remaining** creates tasks/work blocks for assessments that do not already have planned work.

## 5. Replace these repository files

Copy from the v0.4 package and replace existing files:

- `appwrite.js`
- `app.js`
- `auth.js`
- `styles.css`
- `sw.js`
- `index.html` (included unchanged for consistency)

Keep your existing `manifest.json`, `README.md`, `backend-test.html`, and sample syllabus file.

## 6. Git commands

From the local `student-hub-demo` repository folder:

```powershell
git status
git add index.html styles.css app.js appwrite.js auth.js sw.js APPWRITE_V04_SETUP.md
git commit -m "Add cloud tasks and planner work blocks"
git pull --rebase origin main
git push
```

If `git pull --rebase` reports a conflict, stop and resolve it before pushing. Do not use force push.

## 7. Test after GitHub Pages deploys

Hard refresh with **Ctrl + Shift + R**.

Expected sidebar status:

`Academic + planner cloud synced`

Then test:

1. Open a course with an assessment that has no existing work blocks.
2. Open its **Work** tab and press **Plan**.
3. Check Appwrite → `tasks` → Rows.
4. Check Appwrite → `work_blocks` → Rows.
5. Open Planner; work blocks should appear.
6. Drag one block to another day and verify its Datetime changes in Appwrite.
7. Mark a task done in the Planner work queue and verify task status/remaining updates.

If the sidebar says academic cloud is synced but planner cloud is unavailable, open F12 → Console. The error beginning `Planner cloud sync failed:` usually identifies the exact schema or permission issue.
