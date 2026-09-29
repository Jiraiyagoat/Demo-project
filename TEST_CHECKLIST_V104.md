# Student Hub v1.0.4 test checklist

1. After GitHub Pages deploy, hard refresh once (`Ctrl + Shift + R`).
2. Study > select a planner task/deadline that has a matching course resource:
   - confirm **Recommended** appears;
   - confirm the reason text is sensible (`Exact topic`, `Matches deadline`, etc.);
   - open a recommended PDF/link/note and confirm the existing behavior still works.
3. Study > choose a course/context with no strong match:
   - confirm Student Hub says there is no strong contextual match;
   - confirm same-course fallback resources can still be opened.
4. Library:
   - confirm each course-linked resource has **Study this**;
   - click it and verify Study opens with the correct course/topic context;
   - verify the clicked material becomes an exact-topic/relevant suggestion when appropriate.
5. Settings > Reliability:
   - confirm Data health renders without errors;
   - click **Run consistency check / Run safe repair**;
   - confirm no valid cloud data is silently removed.
6. Settings > **Export backup**:
   - confirm a `student-hub-backup-YYYY-MM-DD.json` file downloads;
   - open it and verify it contains `exportedAt`, `app`, `formatVersion` and `state`.
7. Regression test Study:
   - focus target selection;
   - timer presets and +/-5;
   - full-screen focus;
   - Finish & save reflection;
   - Planner progress adaptation.
8. Regression test Planner:
   - week navigation;
   - My plan / Timetable / Deadlines;
   - filters, density, drag/drop, Smart Plan preview and repair preview.
9. Regression test Library:
   - add note/link/PDF;
   - open private PDF;
   - delete uploaded PDF;
   - course/topic filters and search.
10. Sign out/in or reload and confirm normal cloud sync still restores courses, deadlines, planner work, materials, Inbox and study history.
