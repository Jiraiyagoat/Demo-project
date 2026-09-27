# Student Hub Auth Update

This update adds Appwrite-backed account creation, sign-in, persistent sessions, logout, a real account menu, automatic semester loading/creation, and a client-side password-strength UI.

## Files to replace/add

Replace these existing files in the repository root:

- `index.html`
- `styles.css`
- `app.js`
- `appwrite.js`
- `sw.js`

Add this new file:

- `auth.js`

Keep your existing `manifest.json`, `sample-syllabus.txt`, README, and `backend-test.html`.

## Appwrite password policy (important)

The browser strength meter is only a user-experience check. Enforce the same rules in Appwrite so they cannot be bypassed.

In Appwrite Console open **Auth -> Security** and configure Password Strength:

- Minimum length: **12**
- Require uppercase: **On**
- Require lowercase: **On**
- Require number: **On**
- Require special character: **On**
- Password dictionary: **On**
- Personal data check: **On**
- Password history: **5** (recommended)

Save/update the Auth security settings.

## Semester permissions

For the `semesters` table keep Row Level Security enabled. Prefer an authenticated **Users** role with only **Create** permission at table level. Do not grant table-level Read, Update, or Delete. Individual rows are created with read/update/delete permissions for their owner.

## What this update stores in the cloud

- Account/session: Appwrite
- Semester row: Appwrite
- Courses, assessments, planner blocks, study demo data: still per-user browser storage for this milestone

The next migration should move Courses and Assessments to Appwrite.
