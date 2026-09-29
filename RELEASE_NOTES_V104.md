# Student Hub v1.0.4 — contextual materials + reliability pass

## Smarter Study materials
- Study materials are now ranked from the **actual session context**, not only upload order.
- Matching considers course, exact topic, all deadline topics, deadline title, planner-task wording, resource title, resource description and syllabus context.
- Strong matches appear under **Recommended** with a short explanation such as `Exact topic`, `Matches deadline`, or `Linked by description`.
- Lower-confidence same-course resources are separated under **More from this course** instead of being presented as equally relevant.
- If there is no strong contextual match, Student Hub says so explicitly and shows same-course fallback material without pretending it is highly relevant.

## Library → Study connection
- Every course-linked Library item now has **Study this**.
- Starting from a resource carries its course/topic directly into Study, so the timer and material panel open in the right academic context.
- PDF/open/delete behavior is unchanged.

## Reliability and trust
- Settings now includes a **Data health** card that checks the local semester model for:
  - orphaned course/deadline/task/material/session links;
  - invalid deadline/calendar dates;
  - negative remaining estimates;
  - duplicate record IDs.
- **Run safe repair** only applies deterministic local fixes. Cloud-linked uncertain records are not silently deleted.
- **Export backup** downloads the current user-scoped Student Hub state as JSON before demos, migrations, or risky changes.
- Local-storage write failures now surface a visible warning instead of failing silently.
- Technical diagnostics now includes local data-integrity status alongside Appwrite/AI readiness.

## Infrastructure
- Service-worker cache bumped to `student-hub-v10-4`.
- No new Appwrite tables, columns, Storage settings, Function deployments, or environment variables are required.
