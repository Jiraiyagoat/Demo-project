# Student Hub v0.7.4 — asynchronous Academic AI jobs

This release fixes the error:

`Synchronous function execution timed out. Use asynchronous execution instead, or ensure the execution duration doesn't exceed 30 seconds.`

Appwrite has a hard 30-second limit for synchronous Function executions. Increasing the
Function timeout does not remove that client-facing synchronous limit. v0.7.4 moves
syllabus analysis to a background execution and stores the result in a private Appwrite row.

## 1. Create a new table

Database: `student_hub`

Create a table:

- Name: `AI Jobs`
- Table ID: `ai_jobs`

Create these columns:

| Key | Type | Size | Required | Array |
| --- | --- | ---: | --- | --- |
| `userId` | varchar | 64 | yes | no |
| `semesterId` | varchar | 64 | yes | no |
| `resourceId` | varchar | 64 | yes | no |
| `status` | varchar | 32 | yes | no |
| `result` | longtext | — | no | no |
| `error` | longtext | — | no | no |

No index is required for this demo.

## 2. Security

Open `AI Jobs -> Security`.

- Enable Row level security (RLS).
- Add the authenticated-user role (`Users`, or the equivalent authenticated-users role in your console).
- Give that role CREATE permission only at table level.
- Do not give table-level READ / UPDATE / DELETE.

The frontend creates every job row with private row permissions for the signed-in user:
READ, UPDATE, and DELETE.

## 3. Academic AI Function

Keep:

- Function ID: `academic-ai`
- Entrypoint: `src/main.js`
- Execute access: Users
- Scope: `tokens.write`
- `OPENROUTER_API_KEY`: Secret
- `OPENROUTER_MODEL`: `openrouter/free`

Set the Function timeout to **120 seconds**. The browser is no longer waiting synchronously,
so the Function may safely run beyond 30 seconds.

Deploy the included `academic-ai-v074-async-jobs.tar.gz` manually and activate it.

## 4. Frontend

Replace the repository files from this ZIP and push them to GitHub Pages.

After deployment, use `Ctrl + Shift + R` once. The cache name is now
`student-hub-demo-v7-4`.

## What happens now

1. Student Hub creates a private `ai_jobs` row.
2. Student Hub starts `academic-ai` with `async: true`.
3. The Function analyzes the private syllabus.
4. The Function writes the result into the private job row.
5. Student Hub polls the row and opens the normal review UI when the result is ready.
6. The completed job row is deleted after the result is read.

This keeps the review-before-import workflow while avoiding the 30-second synchronous limit.
