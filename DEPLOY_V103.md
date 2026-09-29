# Deploy Student Hub v1.0.3

No Appwrite schema or Function changes are needed.

1. Extract the v1.0.3 ZIP over your existing local Student Hub repository and allow replacement of matching files.
2. In PowerShell from the repository folder:

```powershell
git status
git add .
git commit -m "Add adaptive study progress feedback loop"
git pull --rebase origin main
git push origin main
```

3. Wait for GitHub Pages to update.
4. Open the deployed site and press `Ctrl + Shift + R` once because the service-worker cache changed to `student-hub-v10-3`.
5. Run `TEST_CHECKLIST_V103.md`, especially the three Study outcomes: Finished, Made progress, and Needs more time.
