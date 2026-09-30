# Student Hub v1.0.7 - clean real Appwrite QA data

Yes: you can test Student Hub against real Appwrite rows instead of the local fallback fixture.

## Recommended flow

1. Deploy v1.0.7 and sign in to Student Hub normally.
2. In the same browser, open:
   `.../Demo-project/tools/CLOUD_QA_RESET_V107.html`
3. Press **Inspect current cloud data** and confirm the account/semester shown are the ones you want to reset.
4. Press **Download JSON backup** if you want an extra manual copy. The destructive reset also downloads one automatically before deletion.
5. Choose a reset mode:
   - **Clean + seed realistic QA data** for a repeatable full-product regression using real Appwrite rows.
   - **Clean only - import my own real data** if you want an empty semester and will import your actual syllabi/files/deadlines through Student Hub.
6. Decide whether to enable **Also delete linked files**. Leave it off if you want to keep uploaded PDFs in Appwrite Storage. Turn it on for a truly clean semester workspace.
7. Type `RESET` and run the reset.
8. Reload Student Hub.

## What gets replaced
Only rows belonging to the active semester that the signed-in user can access:
- courses
- assessments
- tasks
- work blocks
- resources
- Inbox items
- study sessions
- AI job rows, when present

The Appwrite account and semester row are preserved.

## Clean-only mode
Use this when you specifically want to test with your own real academic information. After cleanup, reload Student Hub and add/import courses and syllabi through the normal UI. This is the cleanest way to verify that the application works without relying on any old demo/test rows.

## What the QA seed contains
- 4 courses with recurring schedules
- 9 assessments across assignments, quizzes, exams and a project
- planner task breakdowns
- future cloud work blocks
- one intentionally slipped adaptive block for recovery testing
- Library notes and external links
- Inbox captures
- historical study sessions

All dates are generated relative to the day you run the reset.

## PDF / Academic AI test
After reset, use `tools/test-data/student-hub-sample-syllabus.pdf` through **Courses -> Import syllabus**. That gives you a real end-to-end test of Appwrite Storage, the Academic AI Function, editable extraction review and import.

## Important backup limitation
The JSON backup stores database metadata and file IDs, not the raw bytes of PDFs in Appwrite Storage. If you enable file deletion, download any irreplaceable PDFs first.
