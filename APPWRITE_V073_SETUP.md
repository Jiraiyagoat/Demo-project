# Student Hub v0.7.3 — AI review polish and cleanup

This package keeps the working OpenRouter `openrouter/free` Academic AI route and improves the syllabus review experience.

## What changed

- Wider desktop syllabus-review workspace
- Responsive assessment cards instead of a cramped table
- Sticky import action area
- Clear AI loading state
- In-modal import success summary with a View course button
- Case-insensitive topic deduplication
- Stronger duplicate-assessment detection using normalized titles and nearby due dates
- Course topic rendering also removes case-only duplicates
- Service-worker cache bumped to `student-hub-demo-v7-3`

## Appwrite function

No new Appwrite tables or columns are required. Keep the existing `academic-ai` Function settings:

- Entrypoint: `src/main.js`
- Execute access: Users
- Scope: `tokens.write`
- `OPENROUTER_API_KEY`: secret
- `OPENROUTER_MODEL`: `openrouter/free`
- Function timeout: 60 seconds (120 seconds is fine if free-route latency is high)

The included `academic-ai-v072-free-router.tar.gz` is the same free-router Function revision that is already working. You do not need to redeploy it if your current AI extraction works.

## Frontend deployment

Replace the frontend files in your repository and push them. After GitHub Pages deploys, use Ctrl+Shift+R once.
