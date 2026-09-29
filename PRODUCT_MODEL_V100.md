# Student Hub v1.0 — Product Model

## Student-facing loop

**Capture → Understand → Plan → Do → Adapt**

1. **Capture** — syllabus PDF, quick note, link, professor announcement.
2. **Understand** — connect information to a course, deadline, topic or material.
3. **Plan** — translate remaining assessment effort into tasks and time blocks within real capacity.
4. **Do** — Today chooses attention; Study is the execution surface.
5. **Adapt** — missed/completed work changes what needs scheduling next.

## Canonical object model

`Course → Assessment/Deadline → Task → Work Block`

Supporting context:

- Topic belongs to course context and can connect assessments/resources/study sessions.
- Resource belongs to one Library and is surfaced through filtered course/topic views.
- Inbox Item is temporary capture state, not a second task system.
- Study Session records actual execution, separate from planned Work Blocks.

## Screen jobs

- **Today:** What deserves attention now?
- **Planner:** When will everything happen?
- **Courses:** What exists in each academic context?
- **Study:** Do the work.
- **Library:** Find knowledge/materials.
- **Inbox:** Process captured information.
- **Find or add:** Global search + capture.

## Product rules

- Do not flatten classes, deadlines and study blocks into one indistinguishable event type.
- Do not show task decomposition everywhere; reveal detail progressively.
- Do not expose unexplained internal scores; explain the factors behind priority.
- Do not create demo/sample cloud data for a real signed-in user.
- Do not create a second resource store inside Course or Study.
- AI output must remain reviewable before it mutates academic data.
- Automatic planning should preview changes and avoid moving fixed/manual commitments without explicit user action.
- Technical infrastructure belongs in diagnostics/demo narration, not the main student workflow.
