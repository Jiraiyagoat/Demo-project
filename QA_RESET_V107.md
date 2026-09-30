# Student Hub v1.0.7 - QA reset options

Two reset paths are included.

## A. Local fallback fixture
Open `tools/QA_RESET_V107.html`.

This only changes the browser-local fallback key `studentHubDemo.v1`. It does not call Appwrite and is useful for fast visual/regression checks without touching a signed-in account. Dates shift relative to the day you run it.

## B. Real Appwrite fixture
Open `tools/CLOUD_QA_RESET_V107.html` while signed in to Student Hub in the same browser.

This is intentionally destructive to the signed-in user's active semester rows. It downloads a JSON metadata backup, requires the exact confirmation word `RESET`, cleans the active semester data, and seeds realistic cloud records. See `CLOUD_QA_RESET_V107.md` before using it.
