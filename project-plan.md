# SchoolQuest Prototype Improvement Plan

## Project Vision
Improve the existing SchoolQuest static prototype using HTML, CSS, JavaScript, and localStorage. Keep the same overall workflow while making the UI cleaner, adding teacher/student dashboards, and supporting class-level data with richer homework, assignments, notices, and communication.

## Development Phases
1. Implement Core Management
   - Teacher/class management, student registration, join codes, attendance, and localStorage persistence.
2. Visual Polish
   - Improve layout, cards, spacing, colors, typography, and interaction feedback.
3. Work on Gamification
   - Add XP, levels, progress tracking, completion status, and student summaries.
4. AI Assistant & Analytics (future)
   - Add modular AI building blocks and analytics placeholders for later integration.

## Current Status
- Existing prototype currently uses `index.html`, `script.js`, and `style.css` with `localStorage`.
- A previous Next.js scaffold exists in the repo, but the current focus is on improving the static prototype as requested.
- The next work is to finish the gamification and polish the AI analytics architecture.

## Task Board
| Task | Status | Notes |
|---|---|---|
| Update project plan for static prototype improvements | ✅ Completed | Shifted focus from Next.js/TiDB to frontend prototype enhancements |
| Create landing page with Teacher/Student role selection | ✅ Completed | `index.html` updated for role selection |
| Build Teacher login & class dashboard | ✅ Completed | `teacher.html` and `script.js` now support class creation and dashboard navigation |
| Build Student registration and join flow | ✅ Completed | `student.html` and `script.js` support profile creation, join codes, and class viewing |
| Improve UI and styling | ✅ Completed | Updated `style.css` for improved cards, spacing, and responsive layout |
| Add class-level Homework/Assignments/Notices | ✅ Completed | Teacher can add homework, assignments, and notices per class in localStorage |
| Add student/teacher communication section | ✅ Completed | Teacher can send messages to joined students and students can view messages |
| Add student progress/XP tracking and completion status | ✅ Completed | Students can mark homework/assignments complete and earn XP in the student dashboard |
| Add AI assistant scaffolding for students | ✅ Completed | Created `student-ai.html`, `ai.js`, and `ai-config.js` with placeholder AI flows |
| Add AI assistant scaffolding for teachers | ✅ Completed | Created `teacher-ai.html` and prompt templates for AI teaching support |
| Add AI analytics/insights architecture | ⏳ In progress | Placeholder analytics structure and UI styles are ready |

## Milestones

### 1. UI & Workflow Improvements
- [x] Create a landing page with Teacher/Student role selection.
- [x] Improve overall page design: modern cards, spacing, colors, typography.
- [x] Keep the UI simple and professional.

### 2. Teacher Dashboard Enhancements
- [x] Add Teacher access code login.
- [x] Allow teachers to create classes with unique join codes.
- [x] Add a dedicated class dashboard view.
- [x] Show students who joined each class.
- [x] Allow the teacher to send a remark/message to a student.

### 3. Student Dashboard Enhancements
- [x] Add student registration with full name and roll number.
- [x] Require profile creation before joining classes.
- [x] Verify join codes before allowing a student to join.
- [x] Show joined classes in a student dashboard.
- [x] Add content tabs for each joined class:
  - Homework
  - Assignments
  - Notices
  - Communication

### 4. Rich Content and Persistence
- [x] Store all data in `localStorage`.
- [x] Add structured homework and assignment entries with title, description, and due date.
- [x] Add notice entries with title, description, and date posted.
- [x] Add message entries with personal remarks from teacher to student.

### 5. Testing and Polish
- [x] Validate teacher/class creation and join code flow.
- [x] Validate student profile creation and class joining.
- [x] Confirm class content displays correctly for students.
- [x] Refine layout, spacing, and visual hierarchy.

## Progress Log
- 2026-06-25: Created initial migration plan document.
- 2026-06-25: Scaffolding started; project was prepared for static prototype work.
- 2026-06-26: Updated plan for current static prototype improvements.
- 2026-06-26: Began updating landing page and frontend scaffold.
- 2026-06-26: Added landing page, teacher/student pages, updated script logic and styles.
- 2026-06-26: Added teacher content forms for homework, assignments, and notices.

## Notes
- Continue using only HTML, CSS, JavaScript, and localStorage.
- Do not add Firebase or backend logic yet.
- Preserve current workflow while making the prototype feel more like a real school management platform.
- Keep the plan updated whenever a new task is added.
