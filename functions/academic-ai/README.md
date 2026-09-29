# Student Hub Academic AI Function

Function ID: `academic-ai`

Entrypoint: `src/main.js`

This function has no npm dependencies. It uses the Node runtime's built-in `fetch` and Appwrite's execution headers.

Required function variable:
- `GEMINI_API_KEY` (Secret)

Optional:
- `GEMINI_MODEL` (defaults to `gemini-flash-latest`)

Required function scope:
- `tokens.write` (only for short-lived private PDF view links)

The syllabus analysis path reads the user's resource row and PDF with the caller's Appwrite JWT, so it respects the user's existing row/file permissions.
