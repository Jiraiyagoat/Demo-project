# Student Hub v0.7.1 — OpenRouter setup

This update replaces Gemini syllabus extraction with OpenRouter while keeping the existing Appwrite Function ID `academic-ai` and the existing Student Hub frontend contract.

## 1. Function variables

In Appwrite -> Functions -> Academic AI -> Variables:

Create:

- `OPENROUTER_API_KEY` = your OpenRouter API key, Secret ON
- `OPENROUTER_MODEL` = `qwen/qwen3.8-27b:free`, Secret OFF (optional; this is already the code default)

You may delete the old `GEMINI_API_KEY` and `GEMINI_MODEL` variables after OpenRouter is working.

Do not put the OpenRouter key in GitHub or browser code.

## 2. Appwrite permissions

Keep:

- Execute access: authenticated Users
- Function scope: `tokens.write`

No new database or Storage tables are required.

## 3. Deploy Function

Deploy `academic-ai-openrouter-code.tar.gz` manually to the existing `academic-ai` Function and activate it.

Entrypoint remains:

`src/main.js`

## 4. Health test

Execute the Function manually with:

POST `/`

Body:

```json
{"action":"health"}
```

Expected response includes:

```json
{
  "ok": true,
  "provider": "openrouter",
  "openRouterConfigured": true,
  "model": "qwen/qwen3.8-27b:free",
  "pdfParser": "pdf-text"
}
```

## 5. Frontend update

Replace `index.html`, `app.js`, `styles.css`, and `sw.js` from this package. The UI now says `Analyze with AI` instead of `Analyze with Gemini`.

Then push to GitHub Pages and hard-refresh once.

## 6. Test

1. Confirm Library -> Open PDF still works.
2. Courses -> Import syllabus.
3. Choose the existing MATH210 syllabus.
4. Click Analyze with AI.
5. Review extracted course fields, assessments, and topics before importing.

The Function uses OpenRouter's free `pdf-text` PDF parser and the free Qwen3.8 27B endpoint by default.
