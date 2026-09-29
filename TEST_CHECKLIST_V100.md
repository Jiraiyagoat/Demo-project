# Student Hub v1.0 — Test Checklist

Run this after replacing the GitHub Pages files.

## 1. Existing account safety
- Sign in with the current test account.
- Confirm existing courses, assessments, resources, tasks and work blocks still load.
- Confirm no new sample/demo rows appear in Appwrite just because the page was opened.
- Refresh once and confirm cloud data remains stable.

## 2. New-account onboarding
Use a genuinely new test account if practical.
- The account should start with **zero** courses/assessments/tasks/resources rather than Algorithms/Statistics/Chemistry demo data.
- The Semester Setup modal should open automatically.
- Step 1: change weekly capacity and preferred weekday study window.
- Step 2: add the first course; after saving, onboarding should resume at syllabus setup.
- Step 3: import the sample syllabus with Academic AI; review/edit before confirming.
- Continue to Step 4 and preview the first Smart Plan.
- Finish setup and land on Today.

## 3. Today
- If a class or study block starts within four hours, it should become the primary “Next scheduled” card.
- Otherwise the next meaningful assessment should become “Next action”.
- Confirm Plan Status shows workload/capacity and only one clear repair/preview action.
- Confirm Today's timeline separates classes from planned study.
- Confirm Coming Up shows only the nearest deadlines.

## 4. Planner information architecture
- Week / Month / Agenda all switch correctly.
- My plan / Timetable / Deadlines switch correctly.
- Course load / Priorities switch correctly.
- Timetable should show recurring classes only.
- Priorities should explain *why* work matters and should not show raw “Impact 80” style scores.
- Compact vs Detailed should visibly change study-block detail/grouping.
- Previous/next period arrows and Jump to today should work.
- Drag a future study block, refresh, and verify the new time persists.
- If plan health has repairable auto-generated blocks, Review repair should still appear.

## 5. Course → Library unification
- Open a course → Materials. It should show the same resources as Library filtered to that course.
- Open a course → Topics and click a topic card. Library should open filtered to that course/topic.
- Add a material from the course. It should also appear in Library.
- The Grades tab should no longer appear as an unfinished/decorative surface.

## 6. Study
- Start a focus session from Today or a deadline.
- Study should show the selected course/assessment, timer and relevant materials without duplicating planner controls.
- Finish and save the session; Study history should update.

## 7. Find or add
- Press `Ctrl/Cmd + K`.
- Search for a course, deadline and resource; each should navigate to the correct context.
- Type a schedulable capture such as `chem lab report Friday 6pm, 2 hours`; it should open Quick Add.
- Type an unscheduled note such as `ask professor about office hours`; it should be captured to Inbox rather than forced into an assessment.

## 8. Inbox
- Capture a note.
- Process it into a deadline if appropriate.
- Archive another item.
- Confirm the Inbox badge reflects only unprocessed items.

## 9. Settings / capacity
- Change weekly hours, daily maximum and study windows.
- Disable weekend planning and preview Smart Plan; new generated sessions should avoid weekends.
- Technical diagnostics should be collapsed by default and still show Appwrite/Academic AI readiness when opened.

## 10. AI syllabus regression
- Upload the existing sample syllabus PDF.
- Analyze with AI.
- Review screen should remain editable and uncluttered.
- Import it again: likely duplicate assessments should be skipped rather than duplicated.
- Existing course topics should not create case-only duplicates such as `Vector Spaces` and `Vector spaces`.
