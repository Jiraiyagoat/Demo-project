# Student Hub v1.0.5 — production/demo audit

## Executive result
Student Hub now has a coherent closed loop rather than a collection of pages:

**Capture/import → academic model → deadline/task breakdown → calendar plan → contextual study → progress reflection → replanning → proactive guidance.**

The current build is suitable for a hackathon/product demo after the release checklist passes. It is not yet a full institutional production system because several external integrations and background services are intentionally outside this frontend-only release.

## 1. Information architecture
### Today
Purpose: answer **“What should I do now, and is my plan healthy?”**
- Next scheduled/action card provides one primary action.
- Plan status communicates overload/slippage.
- Proactive brief adds only decision-relevant warnings.
- Timeline and Coming up are supporting context, not competing dashboards.

### Planner
Purpose: answer **“When will I do the work?”**
- Deadlines remain constraints; study blocks remain movable work.
- Week/Month/Agenda support different planning horizons.
- Timetable isolates recurring classes.
- Deadline, course-load and priority lenses reduce visual mixing.
- Smart Plan previews changes before write operations.

### Courses
Purpose: answer **“What belongs to this course?”**
- Course identity, topics, assessments, materials and grades stay under one context.
- Syllabus AI extraction is review-first rather than auto-importing unchecked model output.

### Study
Purpose: answer **“What am I doing in this session?”**
- Student selects a planner task/deadline or uses free focus.
- Timer duration is adjustable and full-screen focus is available.
- Materials are ranked from the selected academic context.
- Completion records actual study time and can update remaining work.

### Library
Purpose: answer **“What learning material do I have, and what is it for?”**
- Course/topic context is preserved.
- `Study this` converts storage into an actionable learning flow.

### Inbox
Purpose: answer **“Where can I put something before I know what it is?”**
- Capture first, organize later.
- The Inbox is temporary staging, not a second task manager.

### Settings
Purpose: preferences, capacity assumptions, reliability, backup and diagnostics.

## 2. Data/model cross-examination
The canonical relationship remains:

`Course → Assessment/Deadline → Planner Task → Work Block → Study Session`

Materials and topics attach to course/deadline context. Inbox items are temporary captures. This avoids parallel task systems and allows Today, Planner and Study to refer to the same academic work.

The v1.0.4 Data Health checker remains the safety layer for orphaned references, invalid dates, negative remaining values and duplicate record IDs.

## 3. Proactive-assistance logic
The assistant is intentionally **event/condition driven**, not a generic feed.

It surfaces:
- slipped planned work;
- deadline delivery risk;
- review items that are due;
- Inbox buildup;
- data-health problems;
- partial cloud-sync readiness.

Deadline risk is explainable. It considers urgency, remaining effort, future plan coverage, slipped work, configured daily capacity and assessment weight. The UI shows human-readable reasons rather than a hidden score.

Noise controls:
- preference toggles per alert type;
- only a small subset appears on Today;
- Action Center holds the complete set;
- snooze hides an item for the rest of the day.

## 4. Major action/dead-end audit
Critical visible actions have a defined destination:
- Today → Start focus → Study.
- Today / Coming up → deadline → Smart Plan Preview.
- Plan status → repair/replan preview.
- Planner deadline → plan preview.
- Course → tabs and linked academic data.
- Library resource → open or Study this.
- Study material → resource/library context.
- Inbox capture → organize/archive.
- Action Center → Planner, Study, Inbox or Settings.
- Settings → consistency check, backup and diagnostics.

No new Action Center button is decorative; each is bound to a concrete existing flow.

## 5. Reliability/privacy
Strengths:
- authentication and password handling stay in Appwrite;
- private PDFs use Appwrite Storage;
- AI syllabus extraction is server-side and review-before-import;
- local write failures are surfaced;
- backup export exists;
- deterministic repairs do not silently delete uncertain cloud-linked records.

Release limitation:
- browser reminders in v1.0.5 are not background push notifications. They can notify only while the site is open and permission is granted.

## 6. UX efficiency
The product now follows three levels of attention:
1. **Today**: one next action + a minimal brief.
2. **Action Center**: the unresolved exceptions.
3. **Planner/Settings**: detail and control.

This prevents Planner complexity from leaking into the daily dashboard while keeping explanations available when a student needs them.

## 7. Accessibility / interaction checks
Release expectations:
- major buttons have text labels or `aria-label`;
- Action Center is keyboard-closeable with Escape;
- full-screen Study exits with Escape;
- no critical meaning is encoded only by color;
- layout has mobile fallbacks for cards/panels.

A later production pass should include full keyboard traversal, screen-reader testing, contrast verification, and reduced-motion preferences.

## 8. Performance / scale
The current frontend computes planner and risk summaries locally from the signed-in semester state. This is appropriate for normal student-semester sizes.

For institution-scale accounts or multi-year archives, move heavy aggregation/search to indexed server queries rather than loading every historical object into the browser.

## 9. Known gaps before institutional production
These are deliberate next-generation gaps, not blockers for the hackathon demo:
- no LMS/SIS integration (Canvas, Moodle, Blackboard, university portal);
- no Google/Outlook calendar two-way sync;
- no background push/email notification service;
- no collaborative/shared project planning;
- no institutional admin/teacher console;
- no full analytics/telemetry consent layer;
- no offline conflict-resolution strategy beyond current local/cloud behavior.

Do not add all of these to the hackathon build merely to increase feature count. The current product is stronger when the connected student loop stays understandable.

## 10. Release gates
Ship/demo v1.0.5 only after:
- `TEST_CHECKLIST_V105.md` passes;
- Appwrite sync diagnostics are green for the demo account;
- syllabus AI function responds successfully;
- private PDF open/delete is verified;
- Smart Plan preview/apply and recovery preview are verified;
- Action Center actions point to the correct records;
- a fresh backup export is taken before the live demo.
