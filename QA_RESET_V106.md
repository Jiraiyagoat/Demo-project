# Student Hub v1.0.6 — repeatable QA state

The release package includes `tools/QA_RESET_V106.html` and `tools/QA_SAMPLE_DATA_V106.json`.

## Purpose
Use the reset page when you want a predictable browser-local workspace for UI/regression testing. It creates a compact semester containing courses, assessments, planner events, a resource, an Inbox capture and a review item. It intentionally creates **three slipped study blocks** so Today and Action Center consistency is easy to verify.

## Safety
The utility only writes the legacy/local fallback key `studentHubDemo.v1`. It has no Appwrite SDK calls and does not delete or overwrite signed-in cloud data. Authenticated Student Hub workspaces use user-scoped state plus Appwrite, so this tool is intentionally isolated from normal production records.

## Date behavior
Dates are shifted relative to the day you press **Reset local QA sample**. This prevents the fixture from becoming useless as calendar time advances.

## Use
Serve the project normally, open `tools/QA_RESET_V106.html`, press **Reset local QA sample**, then reload Student Hub in local/fallback mode. Press **Clear local fallback** to remove the QA fixture and let Student Hub recreate its normal local seed.
