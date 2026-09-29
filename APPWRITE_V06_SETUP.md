# Student Hub v0.6 — Appwrite Storage + private PDF uploads

This update adds real private PDF storage to the existing Student Hub v0.5 app. It does **not** expose any server or Gemini secret in the browser. Gemini extraction is intentionally the next milestone; this version stores a syllabus securely and makes it AI-ready.

## 1. Create the Appwrite Storage bucket

In Appwrite Console:

1. Open **Storage**.
2. Click **Create bucket**.
3. Name: `Academic Files`
4. Bucket ID: `academic_files`
5. Set the maximum file size to **20 MB**.
6. Allowed file extension: `pdf`
7. Turn **File security** ON.
8. Under bucket permissions, give authenticated **Users** only **CREATE** permission. Do not give bucket-level READ / UPDATE / DELETE.

The web client gives each uploaded file private read/update/delete permissions for the signed-in owner. File security must be enabled for those file permissions to take effect.

## 2. Add optional file metadata columns to `resources`

Go to **Databases → Student Hub → Resources → Columns** and add:

| Key | Type | Required | Size |
|---|---|---:|---:|
| `storageFileId` | Varchar | No | 64 |
| `fileName` | Varchar | No | 255 |
| `mimeType` | Varchar | No | 120 |
| `fileSize` | Integer | No | — |

Array must be OFF for all four.

Do not delete or recreate the Resources table. Existing rows remain valid because these columns are optional.

## 3. Replace the web files

Copy these v0.6 files over the existing files in your local repository:

- `index.html`
- `styles.css`
- `app.js`
- `appwrite.js`
- `auth.js`
- `sw.js`
- `APPWRITE_V06_SETUP.md`

The existing project ID and Frankfurt endpoint are preserved. `academic_files` is the bucket ID used by the code.

## 4. Push

```powershell
git status
git add index.html styles.css app.js appwrite.js auth.js sw.js APPWRITE_V06_SETUP.md
git commit -m "Add private PDF storage and syllabus uploads"
git pull --rebase origin main
git push
```

If rebase reports a conflict, stop and resolve it before pushing. Do not force-push.

## 5. Refresh

After GitHub Pages deploys, open Student Hub and use `Ctrl + Shift + R` once. The service-worker cache is now `student-hub-demo-v6`.

## 6. Test Library PDF upload

1. Open **Library → + Add resource**.
2. Set Type to **PDF**.
3. Choose a course.
4. Choose a real PDF under 20 MB.
5. Add it.
6. Verify the file appears in **Appwrite → Storage → Academic Files**.
7. Verify the Library metadata appears in **Databases → Resources** with `storageFileId`, `fileName`, `mimeType`, and `fileSize`.
8. Click **Open PDF** in Student Hub.
9. Optionally test **Delete**. It should remove both the Storage file and the Resources row.

## 7. Test syllabus storage

1. Open **Courses → Import syllabus**.
2. Select the target course.
3. Choose a PDF.
4. Click **Upload syllabus PDF**.
5. The file should appear in Storage and a Library resource with topic `Syllabus` should be created.
6. **Analyze with Gemini** becomes enabled, but in v0.6 it only confirms that the file is AI-ready. No PDF is sent to Gemini yet.

## Security notes

- Project ID and endpoint may be present in frontend code.
- No Appwrite API key is used in the browser.
- No Gemini key is used in the browser.
- Files are private per user through Appwrite file permissions.
- The bucket should have CREATE at bucket level and private access at file level.
- The next version should call Gemini from an Appwrite Function, not from browser JavaScript.
