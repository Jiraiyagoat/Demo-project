# Deploy v1.0.2

Replace the same seven frontend files in the existing GitHub Pages repository:

- index.html
- styles.css
- app.js
- appwrite.js
- auth.js
- sw.js
- manifest.json

Then run:

```powershell
git status
git diff --stat
git add index.html styles.css app.js appwrite.js auth.js sw.js manifest.json
git commit -m "Fix planner card containment and improve study material suggestions"
git push
```

No Appwrite changes are required.
