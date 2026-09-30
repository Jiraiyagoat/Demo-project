# Student Hub v1.0.7 - final regression checklist

## Canonical weekly totals
- [ ] Today `planned this week` equals Planner `Planned study` on the current week with All courses / All types.
- [ ] `over capacity = max(0, planned - weekly capacity)` everywhere.
- [ ] Plan Health shows the same over-capacity amount.
- [ ] Action Center slipped count matches Today/diagnostics.

## Planner / reliability
- [ ] Previous/next week still works.
- [ ] Timetable mode still shows recurring classes only.
- [ ] Course and assessment filters still work.
- [ ] Detailed/compact density still changes information density.
- [ ] Settings -> Data Health does not call orphan cloud/manual planner blocks healthy.
- [ ] Repair preview never silently deletes cloud/manual blocks.

## Courses
- [ ] Course cards load.
- [ ] Course Overview / Work / Topics / Materials still work.
- [ ] Grades tab is visible.
- [ ] Grade tab shows real course grade/target and assessment weights/status only.

## Study / Library / Inbox
- [ ] Study focus target can select a real planner task or free timer.
- [ ] Timer length controls and full-screen focus work.
- [ ] Finish & save creates study history.
- [ ] Library filters and Study this actions work.
- [ ] PDF open/delete still work for uploaded resources.
- [ ] Inbox Capture and Process flows work.

## Real cloud reset
- [ ] `tools/CLOUD_QA_RESET_V107.html` detects the signed-in user.
- [ ] Inspect returns counts for the active semester.
- [ ] Backup downloads before destructive reset.
- [ ] Reset requires the exact word `RESET`.
- [ ] Clean-only mode leaves the active semester data tables empty.
- [ ] Seed mode produces 4 courses and 9 assessments in Appwrite.
- [ ] Reloading Student Hub pulls seeded data from cloud.
- [ ] Uploading the included syllabus PDF successfully exercises Storage + Academic AI.

## Persistence
- [ ] Hard refresh keeps the cloud state.
- [ ] Sign out and sign back in; cloud state returns.
- [ ] No unexpected browser console errors during the path above.
