# Student Hub v1.0.6 — end-to-end QA report

## Result
**58 / 58 automated checks passed.**

The test pass is split into:
- **26 / 26 Chromium UI/runtime checks** using the exact v1.0.6 `index.html`, `styles.css` and `app.js` with the controlled QA state;
- **32 / 32 static/integration checks** covering JavaScript syntax, JSON validity, local asset references, Appwrite configuration continuity, service-worker versioning, runtime-copy cleanup and safety of the QA reset utility.

The execution environment blocks browser navigation to local HTTP/file URLs, so the Chromium test harness injected the exact shipped HTML/CSS/JS into a browser document and supplied an in-memory Storage implementation. This verifies frontend routing, rendering, calculation consistency, responsive CSS and interactions without pretending that a live Appwrite session was exercised from the sandbox.

## Key regression checks passed
- Today renders from the QA semester.
- The canonical fixture contains exactly **3 slipped blocks**.
- Today reports the same slipped count as the canonical planning snapshot.
- Action Center reports the same slipped count as Today.
- Action Center groups render and assistant keys are unique.
- Planner, Courses, Study, Library, Inbox and Settings all render.
- Data Health reports the clean fixture correctly.
- Planner weekday labels remain English even with a Russian browser locale.
- Planner density changes the rendering class.
- Previous/next planning period logic changes the visible week.
- Tablet and mobile Today layouts have no document-level horizontal overflow.
- Tablet and mobile Study controls remain inside the viewport.
- Action Center has an accessible label and closes with Escape.
- No unexpected local JavaScript console errors were produced.

## Static/integration checks passed
- `app.js`, `appwrite.js`, `auth.js` and `sw.js` pass `node --check`.
- `manifest.json` and `QA_SAMPLE_DATA_V106.json` parse successfully.
- Every local script/stylesheet/manifest reference in `index.html` exists.
- Existing Appwrite IDs for database, tables, Storage and the Academic AI function remain present.
- The v1.0.6 canonical planning and assistant grouping helpers are present.
- Runtime copy contains no stale hackathon/demo wording.
- Service-worker cache is `student-hub-v10-6`.
- The QA reset utility has no Appwrite/cloud SDK calls and writes only the base local fallback key.

## Live-cloud boundary
v1.0.6 does not change `appwrite.js`, `auth.js`, Appwrite schema or the Academic AI function. The automated sandbox cannot authenticate into the user's Appwrite project, so live account actions are not falsely marked as automated-pass items. After deploying, the short cloud regression is: sign in, reload, verify synced courses/planner/materials return, open a private PDF, and run one syllabus AI analysis. Those are unchanged paths from v1.0.5.
