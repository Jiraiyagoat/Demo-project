# Student Hub — first working demo

A zero-cost, static browser prototype of the Student Hub concept. It is designed to be deployable directly to GitHub Pages and intentionally requires **no backend, no API key, and no paid service**.

## What works

- Today screen with next event, a derived “best next action,” due-soon list and workload capacity
- Planner with fixed events, deadlines and separate work blocks
- Drag work/study blocks across days
- Manual/automatic scheduling of assessment work
- Course pages with work, topics, resources and grades
- Study focus timer, simple review queue and contextual practice questions
- Library search
- Universal Inbox
- Natural-language Quick Add with a local rules parser
- Paste-syllabus demo parser that detects dated assessments
- Global semester search (`Ctrl/Cmd + K`)
- Light/dark theme
- Browser persistence with `localStorage`
- Basic offline caching through a service worker
- Responsive/mobile layout

## Why it is static

This demo proves the product loop before introducing infrastructure:

`capture → connect → plan → act → learn`

The production version can replace localStorage with authentication + a database while keeping the same domain model and UI flows.

## Run locally

Because the service worker requires HTTP, use any simple local server:

```bash
python -m http.server 8080
```

Then open `http://localhost:8080`.

You can also double-click `index.html`; almost everything works that way, except service-worker/offline behavior.

## Deploy to GitHub Pages

1. Create a GitHub repository, for example `student-hub-demo`.
2. Put these files at the repository root.
3. Commit and push.
4. In **Settings → Pages**, choose **Deploy from a branch**.
5. Select your default branch and `/ (root)`.
6. Save. GitHub Pages will publish the static demo.

No build command is required.

## Best demo sequence

1. Open **Today** and explain the connected-semester concept.
2. Click **Plan work** on the recommended assessment.
3. Open **Planner** and drag a work block to another day.
4. Open **Courses → Import syllabus**, detect and import the sample assessments.
5. Press `Q`, enter `Chem lab report Friday 6pm, probably 2 hours`, click **Understand**, then **Add to semester**.
6. Open **Study**, start a focus session, and show contextual practice.
7. Press `Ctrl/Cmd + K` and search `probability`.

## Production upgrades

A sensible next architecture is:

- Frontend: Next.js + TypeScript
- Backend/auth/database/files: Appwrite Education or Azure student resources, or another managed backend
- Hosting: GitHub Pages for this static prototype; app hosting later when server-side features are added
- AI: add only after core academic objects and provenance are stable

The GitHub Student Developer Pack can support later stages with GitHub Pro/Codespaces, GitHub Pages, Appwrite Education, Azure student credits, domains, and other current pack offers. Always check the live Pack page because offers can change.
