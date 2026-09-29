# Deploy Student Hub v1.0.1

This package is frontend-only.

1. Extract the ZIP somewhere temporary.
2. Copy these files into your existing Student Hub repository and replace matching files:
   - `index.html`
   - `styles.css`
   - `app.js`
   - `appwrite.js`
   - `auth.js`
   - `sw.js`
   - `manifest.json`
3. Do **not** delete unrelated backend/function/setup files already in your repository.
4. In PowerShell, from the existing repository:

```powershell
git status
git diff --stat
git add index.html styles.css app.js appwrite.js auth.js sw.js manifest.json
git commit -m "Refine Today recovery Study focus and Inbox UX"
git push
```

5. Wait for GitHub Pages to update.
6. Hard refresh once with `Ctrl + Shift + R`.

No Appwrite table, bucket, function, or environment-variable changes are required.
