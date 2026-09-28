# Student Hub v0.5 — Appwrite setup

This update moves Library resources, Inbox captures, and completed focus/study sessions into Appwrite.

Create the three tables below **before** deploying the v0.5 files. Use the same database you already use:

- Database ID: `student_hub`
- Existing tables stay unchanged: `semesters`, `courses`, `assessments`, `tasks`, `work_blocks`

For all three new tables:

- Row level security (RLS): **ON**
- Table permission for authenticated/all signed-in users: **CREATE only**
- Table-level READ / UPDATE / DELETE: **OFF**
- The app creates row-level READ / UPDATE / DELETE permissions for the owning user.

## 1) Resources table

Create table:

- Name: `Resources`
- Table ID: `resources`

Columns:

| Key | Type | Required | Size / setting |
|---|---|---:|---|
| `userId` | Varchar | Yes | 64 |
| `semesterId` | Varchar | Yes | 64 |
| `legacyId` | Varchar | No | 64 |
| `courseId` | Varchar | Yes | 64 |
| `topic` | Varchar | Yes | 120 |
| `type` | Varchar | Yes | 32 |
| `title` | Varchar | Yes | 200 |
| `description` | Varchar | No | 500 |
| `url` | Varchar | No | 500 |
| `sourceType` | Varchar | Yes | 32 |

Array: OFF for every column.

Notes:

- `type` currently stores values such as `Note`, `Link`, and `PDF`.
- v0.5 stores PDF metadata/references only. Actual binary file upload is intentionally deferred to Appwrite Storage in v0.6.

## 2) Inbox table

Create table:

- Name: `Inbox Items`
- Table ID: `inbox_items`

Columns:

| Key | Type | Required | Size / setting |
|---|---|---:|---|
| `userId` | Varchar | Yes | 64 |
| `semesterId` | Varchar | Yes | 64 |
| `legacyId` | Varchar | No | 64 |
| `text` | Text | Yes | — |
| `processed` | Boolean | Yes | default `false` if Appwrite asks |
| `processedAt` | Datetime | No | — |
| `sourceType` | Varchar | Yes | 32 |

Array: OFF for every column.

## 3) Study Sessions table

Create table:

- Name: `Study Sessions`
- Table ID: `study_sessions`

Columns:

| Key | Type | Required | Size / setting |
|---|---|---:|---|
| `userId` | Varchar | Yes | 64 |
| `semesterId` | Varchar | Yes | 64 |
| `legacyId` | Varchar | No | 64 |
| `courseId` | Varchar | Yes | 64 |
| `assessmentId` | Varchar | No | 64 |
| `topic` | Varchar | Yes | 120 |
| `minutes` | Integer | Yes | default `1` if Appwrite asks |
| `completedAt` | Datetime | Yes | — |
| `sourceType` | Varchar | Yes | 32 |

Array: OFF for every column.

## What happens on first v0.5 login

Student Hub will migrate existing local demo data into the three tables using `legacyId` to avoid creating the same seeded item again on later logins.

Expected initial migration is roughly:

- 6 Library resources
- 2 Inbox captures (unless you already processed them)
- any focus sessions you have already completed locally

## Test Library sync

1. Open Student Hub -> Library.
2. Click `+ Add resource`.
3. Add a Note or Link.
4. Check Appwrite -> `resources` -> Rows.
5. Refresh Student Hub. The resource should remain.

## Test Inbox sync

1. Open Inbox.
2. Capture a new item.
3. Check Appwrite -> `inbox_items` -> Rows.
4. Archive it and refresh the Appwrite row.
5. `processed` should become `true` and `processedAt` should have a timestamp.

`Organize` still routes the Inbox text through Quick Add. When the new assessment is confirmed, the Inbox row is also marked processed in Appwrite.

## Test Study Session sync

1. Open Study.
2. Start the focus timer for at least a few seconds.
3. Click `Finish & save`.
4. Check Appwrite -> `study_sessions` -> Rows.
5. A row should exist with the course/topic, recorded minutes, and completion timestamp.
6. The Study page should show it in Study history.

## Deployment

Replace these files in your existing local repository:

- `index.html`
- `styles.css`
- `app.js`
- `appwrite.js`
- `auth.js`
- `sw.js`

Add this file if you want to keep setup notes:

- `APPWRITE_V05_SETUP.md`

Then run:

```powershell
git status
git add index.html styles.css app.js appwrite.js auth.js sw.js APPWRITE_V05_SETUP.md
git commit -m "Add cloud Library Inbox and study sessions"
git pull --rebase origin main
git push
```

If `git pull --rebase` reports a conflict, stop and resolve it before pushing. Do not force-push.

After GitHub Pages redeploys, open the site and hard-refresh once with `Ctrl + Shift + R`.

The service-worker cache name in this update is `student-hub-demo-v5`.
