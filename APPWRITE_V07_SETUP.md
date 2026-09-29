# Student Hub v0.7 — Academic AI + private PDF access

This update adds the first real AI workflow:

1. A signed-in student uploads/keeps a private syllabus PDF in Appwrite Storage.
2. The browser invokes the `academic-ai` Appwrite Function synchronously.
3. Appwrite passes the signed-in user's JWT to the Function.
4. The Function reads the student's `resources` row and private PDF using that JWT.
5. The Function sends the PDF to Gemini using the server-side `GEMINI_API_KEY` secret.
6. Gemini returns structured course / assessment / topic data.
7. Student Hub shows a review screen. Nothing is imported until the student confirms.
8. The same Function can create 10-minute Appwrite file tokens so private PDFs open in a new tab without making the bucket public.

## Important security note

Do **not** put a Gemini key in `app.js`, `appwrite.js`, GitHub, localStorage, or this repository.

If an API key has ever been pasted into a chat, screenshot, issue, commit, or other place beyond the secret manager, rotate it before using the app beyond testing. Create the replacement key in Google AI Studio and store only the replacement in Appwrite as a Secret variable.

## A. Create the Appwrite Function

In Appwrite Console:

1. Open **Functions**.
2. Click **Create function**.
3. Create a Node.js function with:
   - Name: `Academic AI`
   - Function ID: `academic-ai`
   - Runtime: choose the newest supported Node.js runtime shown by Appwrite.
4. Under **Execute access**, allow authenticated **Users** to execute the function. Do not make the function an unauthenticated public AI endpoint.
5. Create the function.

The website code expects the exact Function ID `academic-ai`.

## B. Configure the function scope

Open:

**Functions → Academic AI → Settings → Scopes**

Enable only:

- `tokens.write`

The function uses the calling user's JWT to read their resource row and PDF, so it does not need broad database or storage admin scopes for analysis. `tokens.write` is used only to generate short-lived private PDF links.

## C. Add Gemini as a secret variable

Open:

**Functions → Academic AI → Settings → Environment variables**

Create:

- Key: `GEMINI_API_KEY`
- Value: your Gemini Developer API key
- **Secret: ON**

Optional variable:

- Key: `GEMINI_MODEL`
- Value: `gemini-flash-latest`

Do not create a `GEMINI_API_KEY` file in the repository.

Environment variable changes require a redeploy before they affect the function.

## D. Deploy the ready function archive

The v0.7 package contains:

`functions/academic-ai/code.tar.gz`

In Appwrite:

1. Open **Functions → Academic AI → Deployments**.
2. Click **Create deployment**.
3. Select **Manual**.
4. Entrypoint: `src/main.js`
5. Upload `functions/academic-ai/code.tar.gz`.
6. Enable **Activate deployment after build**.
7. Create the deployment.

The function has no npm dependencies, so no special install command is required.

If you later connect the Function to GitHub, use the repository root directory:

`functions/academic-ai`

and entrypoint:

`src/main.js`

## E. Existing Appwrite resources

Keep the v0.6 Storage setup:

- Bucket ID: `academic_files`
- File Security: ON
- Authenticated Users: CREATE only at bucket level
- Each uploaded file: private read/update/delete permission for its owner

Keep the `resources` table columns added in v0.6:

- `storageFileId` — Varchar, optional
- `fileName` — Varchar, optional
- `mimeType` — Varchar, optional
- `fileSize` — Integer, optional

No new database tables or columns are required for v0.7.

## F. Install the website update

Replace these files in the repository root:

- `index.html`
- `styles.css`
- `app.js`
- `appwrite.js`
- `auth.js`
- `sw.js`

Also add:

- `functions/academic-ai/`
- `APPWRITE_V07_SETUP.md`

Then commit and push.

## G. Test private PDF opening

After the Function deployment is active:

1. Open Student Hub → Library.
2. Click **Open PDF** on the stored MATH210 syllabus.
3. Student Hub calls the Function.
4. The Function verifies ownership and creates a file token that expires in about 10 minutes.
5. The PDF should open in a new tab without a 401 error.

If this fails, check **Functions → Academic AI → Executions** and ensure `tokens.write` is enabled.

## H. Test Gemini syllabus extraction

1. Open **Courses → Import syllabus**.
2. Select Linear Algebra.
3. Because the existing syllabus PDF is already stored, the modal should show it as ready. You do not need to upload it again.
4. Click **Analyze with Gemini**.
5. Wait for the synchronous Function execution.
6. Review the extracted course fields, assessment dates/times/weights, effort defaults, and topics.
7. Edit or uncheck anything incorrect.
8. Click **Import reviewed syllabus**.

Student Hub updates the selected course and creates only the checked assessments. It skips obvious duplicates with the same course, title, and due date.

## Expected sample result

For the supplied MATH210 sample syllabus, Gemini should find approximately:

- MATH210 — Linear Algebra
- Dr. Smith
- A104
- Monday / Wednesday 12:00–13:20
- Homework 1 — 2026-10-05 20:00 — 10%
- Quiz 1 — 2026-10-12 12:00 — 10%
- Midterm Exam — 2026-10-26 12:00 — 30%
- Project Report — 2026-11-16 18:00 — 20%
- Final Exam — 2026-12-14 10:00 — 30%
- Topics including matrices, vector spaces, determinants, eigenvalues/eigenvectors, and diagonalization

Exact wording may vary. Review is intentionally mandatory.

## Troubleshooting

### `Function not found`
The Function ID must be exactly `academic-ai` and have an active deployment.

### `The current user is not authorized to execute this function`
Add authenticated **Users** under Function execute access.

### `GEMINI_API_KEY is not configured`
Create the function secret and redeploy.

### `File token creation failed` / `tokens.write`
Enable the `tokens.write` Function scope and redeploy if Appwrite requests it.

### Gemini 4xx error
Check the Function execution response/log. Confirm the key is active and the configured Gemini model is available to that key.

### Gemini times out on large PDFs
v0.7 uses synchronous execution for simplicity. The small sample PDF should be quick. A later production version can move large-document analysis to asynchronous jobs with progress state.
