# Student Hub Academic AI Function — OpenRouter edition

Function ID: `academic-ai`

Entrypoint: `src/main.js`

No npm dependencies are required. The function uses Node's built-in `fetch`.

## Required variable

- `OPENROUTER_API_KEY` — Secret

## Optional variable

- `OPENROUTER_MODEL` — defaults to `qwen/qwen3.8-27b:free`

## Required Appwrite function scope

- `tokens.write` — used only to create short-lived private PDF view links

## PDF processing

The function sends a private Appwrite PDF to OpenRouter as a base64 PDF input and explicitly uses the `pdf-text` parser. That parser is text-only and free; scanned/image-only PDFs would need an OCR path later.

The syllabus extraction request asks OpenRouter for schema-constrained JSON and keeps the existing Student Hub review-before-import workflow.


## v0.7.2 free-router hotfix

Default model: `openrouter/free`

This uses OpenRouter's free-model router so a request can be assigned to a compatible
free model instead of depending on one busy upstream free endpoint. The function keeps
the free `pdf-text` parser and JSON-schema output.

Recommended Appwrite variable:
`OPENROUTER_MODEL=openrouter/free`

429 responses now return a useful message and preserve provider detail for debugging.


## v0.7.4 asynchronous syllabus analysis

Syllabus analysis now runs as an asynchronous Appwrite Function execution to avoid
Appwrite's 30-second hard limit for synchronous executions.

The browser creates a private row in `ai_jobs`, starts `analyzeSyllabusAsync`, and polls
that row until the Function stores the completed structured result.

Required `ai_jobs` columns are documented in `APPWRITE_V074_SETUP.md`.
