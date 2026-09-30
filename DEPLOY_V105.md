# Deploy Student Hub v1.0.5

This release is frontend-only. No Appwrite schema, Storage, Function, or environment-variable changes are required.

1. Extract this ZIP directly over your existing Student Hub project folder and allow file replacement.
2. In PowerShell, from that project folder:

```powershell
git status
git add .
git commit -m "Add proactive student assistant and deadline risk guidance"
git pull --rebase origin main
git push origin main
```

3. Wait for GitHub Pages to deploy.
4. Hard refresh once with `Ctrl + Shift + R`.
5. Follow `TEST_CHECKLIST_V105.md`.

Service-worker cache: `student-hub-v10-5`.
