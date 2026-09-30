# Deploy Student Hub v1.0.6

This is a frontend-only update. No Appwrite schema or Function change is required.

1. Back up/commit the current working project.
2. Extract the v1.0.6 package into the existing Student Hub project root and allow the runtime files to replace the older versions.
3. Commit and push the changed files to GitHub.
4. After GitHub Pages updates, use a hard refresh (`Ctrl + Shift + R`) once so the new `student-hub-v10-6` service-worker cache takes over.
5. Verify Today and Action Center show the same slipped-block count, then perform the short live-cloud regression described in `E2E_QA_V106.md`.

The `tools/` folder is optional QA tooling and is not linked from the Student Hub interface.
