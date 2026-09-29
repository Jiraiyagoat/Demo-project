# Student Hub v1.0.2 — Planner containment + Study material matching

## Planner
- Hardened the week grid so study/deadline cards cannot expand past their day column.
- Long titles and URLs now wrap inside the card instead of pushing across neighboring days.
- Day columns clip accidental visual overflow while keeping drag/drop behavior unchanged.

## Study
- "For this session" still prioritizes exact topic matches.
- If an exact resource-topic match is unavailable, Student Hub now falls back to the closest materials from the same course instead of leaving the panel empty.
- Syllabus/course-level resources remain available as a low-priority fallback.

## Infrastructure
- Service-worker cache bumped to `student-hub-v10-2` so GitHub Pages clients receive the updated CSS/JS.
- No Appwrite schema, Function, Storage, or environment-variable changes are required.
