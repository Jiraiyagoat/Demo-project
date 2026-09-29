# Student Hub v1.0.1 — Today, Study and Inbox refinement

This is a frontend-only refinement on top of the v1.0 product consolidation.

## What changed

### Today / plan recovery
- Missed Student Hub-generated study blocks now count as recoverable plan issues.
- The Today card uses **Review slipped work** when the current week contains missed study blocks.
- The recovery preview shows slipped sessions before anything is deleted.
- Applying cleanup immediately builds a replacement Smart Plan preview, so recovery is a two-stage review instead of a silent reset.
- Missed-block status is limited to the current week so old historical blocks do not permanently pollute Today.

### Date language
- Student Hub now uses an explicit English (UK) UI locale for calendar dates, weekdays and times.
- Browser/OS language no longer causes Planner dates to switch to Russian or another locale.

### Study workspace
- Added a **Focus target** selector:
  - Free focus / timer only
  - Open planner tasks
  - Upcoming deadlines that do not already have planner tasks
- Free-focus sessions can choose a course context.
- Added 15 / 25 / 45 / 60 minute presets plus −5 / +5 minute controls.
- Reset returns to the selected session length instead of forcing 25 minutes.
- Finished sessions keep the user's selected duration for the next session.
- Added **Full screen focus**:
  - requests browser fullscreen where supported
  - falls back to an in-app distraction-free mode
  - hides navigation, materials, review queue and history while focusing
  - Exit button and Escape return to normal mode
- The selected task/deadline becomes the study context, so the material panel follows what the student chose.

### Inbox
- The Capture button no longer stretches to the height of the textarea.
- Capture remains visually primary but compact.

## Backend / Appwrite
No Appwrite schema, Storage, Function, or environment-variable changes are required for this update.

## Cache
The service-worker cache key was bumped to `student-hub-v10-1`.
