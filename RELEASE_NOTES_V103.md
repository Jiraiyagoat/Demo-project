# Student Hub v1.0.3 — Study → Planner feedback loop

## Study completion check-in
- `Finish & save` now records the real focus time and, when a planner task or deadline is attached, opens a short post-session check-in.
- Students can choose **Finished**, **Made progress**, or **Needs more time**.
- Progress minutes are editable before saving instead of blindly assuming every timer minute equals completed work.
- `Needs more time` can add extra minutes to the remaining estimate when the task was harder than expected.
- Free-focus sessions still save normally without forcing a planning decision.

## Adaptive planning
- Completing a planner task updates its remaining minutes/status and the parent deadline.
- Completing a deadline marks its open planner tasks complete when they exist.
- Future study blocks for completed work are retired automatically.
- When remaining effort shrinks, excess future **auto-generated** study blocks are removed or shortened while manual calendar work is left untouched.
- Deadline-level progress is distributed across the deadline's open planner tasks in task order so Today, Planner, task breakdown and workload metrics stay consistent.

## Study UX
- Study now explains that finishing a task-attached session will update Planner after the check-in.
- The reflection modal shows session time, target, estimated work before, and projected work after before anything is saved.

## Infrastructure
- Service-worker cache bumped to `student-hub-v10-3`.
- No new Appwrite tables, columns, Storage changes, Function changes, or environment variables are required.
