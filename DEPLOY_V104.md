# Deploy Student Hub v1.0.4

This is a frontend-only update. No Appwrite schema or Function changes are required.

1. Extract this ZIP over your existing Student Hub project folder and allow replacement.
2. In PowerShell, from the project folder:

```powershell
git status
git add .
git commit -m "Add contextual study materials and reliability tools"
git pull --rebase origin main
git push origin main
```

3. Wait for GitHub Pages to deploy.
4. Open the deployed site and hard refresh once with `Ctrl + Shift + R`.
5. Follow `TEST_CHECKLIST_V104.md`.

Service-worker cache: `student-hub-v10-4`.
