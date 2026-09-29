# Student Hub v0.9 — Test Checklist

## 1. Navigation
- Open Planner.
- Use the left and right arrows around the date range.
- Press the date range itself to return to the current period.
- Confirm Week, Month, and Agenda all render.

## 2. Planner lenses
- Plan: shows study blocks/classes with deadlines kept compact.
- Deadlines: shows the 3-day / 7-day / 14-day runway.
- Courses: shows per-course load cards.
- Impact: shows the academic-impact heuristic and its components.

## 3. Filters
- Select one course and confirm other courses disappear.
- Test Homework, Quizzes, Projects, and Exams.
- Toggle Classes, Study work, and Deadlines.
- Toggle Compact / Comfortable density.

## 4. Clutter reduction
- When an assessment has several study sessions on the same day, it should appear as one grouped card.
- Click the grouped card to expand the individual sessions.
- Expanded individual work blocks remain draggable.

## 5. Smart Plan Preview
- Press Preview smart plan.
- Confirm the preview states that nothing has been saved yet.
- Inspect the proposed dates/times.
- Press Cancel: Appwrite should remain unchanged.
- Open it again and press Apply plan: new work_blocks should then appear in Appwrite.

## 6. Plan Health / repair
- If old v0.8 adaptive blocks are over capacity, before their planning window, after a due date, or beyond remaining effort, Planner should show a Plan Health warning.
- Press Review repair.
- Confirm only future auto-generated blocks are listed.
- Apply repair.
- Fixed classes and manual events must remain untouched.
- Run Preview smart plan again to rebuild a clean plan.

## 7. Month view
- Workload bars should show how loaded each date is.
- Deadlines should appear as small course-colored items rather than full cards.
- Clicking a date should jump to that week's Week view.

## 8. Focus-history adaptation
- Start Focus from an assessment, finish and save sessions.
- Future Smart Plan previews should use the median of relevant recorded session lengths (bounded to 25–60 minutes) when matching history exists.

## 9. Final cache check
After GitHub Pages updates, use Ctrl + Shift + R once.
The service-worker cache name is student-hub-demo-v9-0.
