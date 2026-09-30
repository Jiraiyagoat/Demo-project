# Student Hub v1.0.5 test checklist

## A. New assistant layer
1. Hard refresh after deployment (`Ctrl + Shift + R`).
2. Confirm the top bar shows the new Action Center icon; if there are active issues, it should show a badge count.
3. Open Action Center and verify every visible item has:
   - a clear title;
   - a plain-language reason;
   - one relevant action;
   - a small `×` that snoozes it for the rest of the day.
4. Snooze one item. Confirm it disappears from Action Center and the badge count decreases.
5. Reload the page on the same day. Confirm the snoozed item stays quiet.
6. Today: if there are active academic issues, confirm the compact **Proactive brief** appears and shows no more than three items.

## B. Deadline-risk communication
7. Use or create a deadline due within 1–4 days with remaining work and insufficient calendar coverage.
8. Confirm:
   - Action Center describes why it is risky;
   - Today > Coming up shows a risk explanation when applicable;
   - Planner's **At-risk deadlines** count is consistent with the same deadline.
9. Add enough future study coverage or reduce remaining work; refresh/re-render and confirm the risk state becomes less severe or disappears.

## C. Assistant preferences
10. Settings > Student assistant:
    - toggle deadline-risk reminders off and confirm those items disappear;
    - toggle them back on;
    - repeat for Inbox or review reminders.
11. Optional browser reminders:
    - enable them only if you want to test browser permission;
    - confirm the permission prompt is handled correctly;
    - confirm the UI states that reminders only work while Student Hub is open.

## D. Direct-action regression
12. Action Center > **Review plan** opens Smart Plan Preview for the correct deadline.
13. **Review slipped work** opens Plan Recovery Preview when eligible.
14. **Open Study** navigates to Study.
15. **Process Inbox** navigates to Inbox.
16. **Check diagnostics / Open reliability** navigates to Settings.

## E. Core product regression
17. Today:
    - Next action / next scheduled item;
    - plan status;
    - Today timeline;
    - Coming up.
18. Planner:
    - previous/next week;
    - Week / Month / Agenda;
    - My plan / Timetable / Deadlines / Course load / Priorities;
    - course/type/layer filters;
    - density;
    - drag/drop;
    - Smart Plan preview/apply;
    - Plan Recovery preview.
19. Courses:
    - open course;
    - course tabs;
    - add course;
    - syllabus upload → AI analysis → review → import.
20. Study:
    - task/deadline/free-focus target;
    - course context;
    - timer presets and +/-5;
    - full-screen focus;
    - contextual materials;
    - Finish & save reflection.
21. Library:
    - add note/link/PDF;
    - open private PDF;
    - delete uploaded PDF;
    - Study this;
    - search and course/topic filters.
22. Inbox:
    - capture;
    - organize into an academic item;
    - archive.
23. Settings:
    - availability;
    - Data health;
    - Export backup;
    - technical diagnostics.
24. Sign out/in or reload and verify cloud-backed courses, deadlines, planner work, materials, Inbox, and study history return normally.
