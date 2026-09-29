# Student Hub v0.9.1 — Quick verification

1. Open **Planner** and hard-refresh once (`Ctrl + Shift + R`).
2. In the second segmented control choose **Classes**.
   - Week should show only recurring course meetings.
   - Select Linear Algebra (or another course) in the left filter and confirm only that timetable remains.
   - Switch Month / Agenda and confirm class-only views continue to work.
3. Return to **Plan**.
4. Toggle Density:
   - Compact = repeated study sessions grouped, less metadata, tighter cards.
   - Detailed = individual study sessions, more spacing, course/room metadata.
5. If Plan Health says the week is over capacity:
   - Click **Review overload**.
   - If the overload is manual/legacy, the modal should list those blocks and explain that they will not be auto-deleted.
   - If future Smart Plan blocks are repairable, the button says **Review repair** and Apply repair removes only those adaptive blocks.
6. Confirm previous/next week arrows still work.

No Appwrite changes are needed for this patch.
