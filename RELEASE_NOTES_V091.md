# Student Hub v0.9.1 — Planner follow-up

This patch addresses the first live v0.9 planner test.

## Changed
- Added a dedicated **Classes** planner lens.
  - Shows only the recurring course timetable.
  - Uses each course's saved schedule, room, instructor, and course color.
  - Works in Week, Month, and Agenda views.
  - Course filters still work, so one course or all courses can be viewed.
- Density now changes the actual information layout.
  - **Compact** groups repeated study sessions and hides secondary metadata.
  - **Detailed** expands study sessions individually and shows course/room metadata.
- Plan Health no longer hides behind "Manual load only".
  - Overloaded plans always get a visible **Review overload** / **Review repair** button.
  - When the overload is manual/legacy work, the review explains why Student Hub will not silently delete it.
  - Auto-repair continues to touch only future Smart Plan blocks.
- Service-worker cache bumped to `student-hub-demo-v9-1`.

No Appwrite schema or function deployment changes are required.
