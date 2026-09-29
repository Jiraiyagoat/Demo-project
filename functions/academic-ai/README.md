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
