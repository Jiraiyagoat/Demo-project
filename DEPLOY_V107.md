# Deploy Student Hub v1.0.7

This is a frontend-only patch. No Appwrite schema or Academic AI Function change is required.

1. Commit/back up your current local project.
2. Extract this package into the existing Student Hub project root and replace matching files.
3. Commit and push to GitHub Pages.
4. After Pages updates, hard refresh once (`Ctrl + Shift + R`) so `student-hub-v10-7` replaces the older service-worker cache.
5. Verify the current week with **All courses / All assessment types**: Today planned time, Planner planned time and Plan Health over-capacity must agree.
6. Open a course and verify the **Grades** tab appears and uses the existing course grade/target without fabricating assessment marks.
7. For a clean live-cloud regression, open `tools/CLOUD_QA_RESET_V107.html` while signed in and follow `CLOUD_QA_RESET_V107.md`.

The `tools/` folder is QA tooling and is not linked from the normal Student Hub UI.
