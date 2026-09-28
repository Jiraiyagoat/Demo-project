# Student Hub v0.3 — Appwrite Courses + Assessments

Do these Appwrite console steps **before** pushing the new frontend files.

The existing `semesters` table stays exactly as it is.

## 1. Create the `courses` table

Appwrite → Databases → Student Hub → Create table

- Name: `Courses`
- Table ID: `courses`

Create these columns exactly:

| Key | Type | Required | Size / settings |
|---|---|---:|---|
| `userId` | Varchar | Yes | 64 |
| `semesterId` | Varchar | Yes | 64 |
| `legacyId` | Varchar | No | 64 |
| `code` | Varchar | Yes | 32 |
| `name` | Varchar | Yes | 120 |
| `teacher` | Varchar | No | 120 |
| `room` | Varchar | No | 80 |
| `color` | Varchar | Yes | 16 |
| `schedule` | Varchar | No | 160 |
| `grade` | Double | Yes | default 0 if Appwrite asks |
| `target` | Double | Yes | default 0 if Appwrite asks |
| `topics` | Varchar | No | size 120, **Array = ON** |

### Security

Courses → Security:

- Table permission: **All users / Users → CREATE only**
- READ: off
- UPDATE: off
- DELETE: off
- **Row level security (RLS): ON**

Do not give table-level READ/UPDATE/DELETE.

---

## 2. Create the `assessments` table

Appwrite → Databases → Student Hub → Create table

- Name: `Assessments`
- Table ID: `assessments`

Create these columns exactly:

| Key | Type | Required | Size / settings |
|---|---|---:|---|
| `userId` | Varchar | Yes | 64 |
| `semesterId` | Varchar | Yes | 64 |
| `legacyId` | Varchar | No | 64 |
| `courseId` | Varchar | Yes | 64 |
| `title` | Varchar | Yes | 200 |
| `type` | Varchar | Yes | 32 |
| `due` | Datetime | Yes | — |
| `effort` | Integer | Yes | default 0 if requested |
| `remaining` | Integer | Yes | default 0 if requested |
| `status` | Varchar | Yes | 32 |
| `weight` | Double | Yes | default 0 if requested |
| `topics` | Varchar | No | size 120, **Array = ON** |
| `sourceType` | Varchar | Yes | 32 |

### Security

Assessments → Security:

- Table permission: **All users / Users → CREATE only**
- READ: off
- UPDATE: off
- DELETE: off
- **Row level security (RLS): ON**

---

## 3. What happens on first sign-in

When the user signs in after these tables exist:

1. Appwrite loads the user's active semester.
2. Student Hub checks the user's private `courses` rows.
3. Existing sample/local courses are migrated once into Appwrite if they are not already there.
4. Existing assessments are migrated once and linked to their new cloud course IDs.
5. Today, Planner, Courses, Search, and Quick Add all use the same cloud-backed course/assessment objects.
6. Planner work blocks, Library resources, review queue, and study history are still local for this milestone.

`legacyId` exists only to make this one-time migration safe and prevent repeated sample imports.

## 4. Test checklist

After deployment:

1. Sign in with your existing account.
2. Open Appwrite → Databases → Student Hub → Courses → Rows.
   - You should see Algorithms, Statistics, Chemistry after the first sync.
3. Open Assessments → Rows.
   - You should see the sample assessments.
4. In Student Hub → Courses, click **+ Add course** and create a new course.
5. Refresh Appwrite Courses rows. The new course must appear there.
6. In Student Hub, use Quick Add to create an assessment for a course.
7. Refresh Appwrite Assessments rows. The new assessment must appear there.
8. Refresh the website or sign out/in. The cloud course/assessment data must remain.

## 5. If the sidebar says academic cloud sync is unavailable

Do not change random permissions. Check in this order:

- table IDs are exactly `courses` and `assessments`
- every column key is spelled exactly as above
- `topics` has Array enabled
- row-level security is ON for both tables
- All users / Users has CREATE at table level
- the browser console shows the first Appwrite error

A missing or wrongly typed column is the most common cause during this step.
