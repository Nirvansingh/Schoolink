# SchoolQuest Static Prototype

This repository contains a frontend school management prototype built with HTML, CSS, JavaScript, and localStorage.

The development is organized in phases:
- Core management: teacher/student workflows, class creation, attendance, and persistence.
- Visual polish: layout improvements, responsive cards, toasts, and clearer content structure.
- Gamification: XP, levels, homework/assignment progress, and student progress summaries.
- AI/analytics: modular AI scaffolding and future insights integration.

## Current status
- The project now uses a landing page (`index.html`) with separate `teacher.html` and `student.html` dashboards.
- Teacher and student data are managed inside the browser using `localStorage`.
- The shared script file (`script.js`) handles class creation, student profile registration, join codes, and tabbed student class views.

## Work in progress
- Teacher page supports class creation, join code generation, and messaging students.
- Student page supports profile creation, join code class enrollment, and viewing content tabs.
- Next tasks include adding structured homework, assignment, notice, and communication item creation.

## Start locally
Open `index.html` in your browser or host the directory with a static server.

## Notes
- Do not add Firebase or backend logic yet.
- Keep all functionality based on localStorage for now.
- Use `project-plan.md` to track the current prototype improvement work.

## Firebase setup (recommended)
You chose Firebase instead of TiDB. The project now includes helper files and a migration script to move data from browser `localStorage` into Firestore.

1) Create a Firebase project
- Open https://console.firebase.google.com and create a new project (Spark tier is free for development).

2) Add a Web app
- In the project Overview, click "Add app" → Web. Register a nickname and copy the Firebase config.
- Set the config in environment variables (Next.js uses `NEXT_PUBLIC_` prefix) or paste the values into `firebase/firebase-client.js`.

3) Enable Firestore
- In the Console, go to Firestore Database and create a database in your preferred region. Start in Test mode for now (remember to tighten rules before production).

4) Install SDKs
```bash
npm install firebase firebase-admin dotenv
```

5) Client & admin helpers
- `firebase/firebase-client.js` (added) — initialize Firestore for the web using your web app config.
- `firebase/firebase-admin.js` (added) — initialize admin SDK for Node (used by the migration script). Requires a service account JSON.

6) Export localStorage (browser)
- Open your app in the browser, open DevTools → Console and run:
```js
copy(JSON.stringify(localStorage))
```
- Paste the copied JSON into a file named `local_export.json` in the project root.

7) Migrate localStorage → Firestore (optional)
- Download a Service Account JSON from Firebase Console (Project Settings → Service accounts → Generate new private key). Save it as `serviceAccountKey.json` in project root.
- Run the migration script:
```bash
node scripts/migrate-local-to-firestore.js local_export.json
```

8) Integrate Firestore in front-end
- Replace localStorage read/write in `script.js` with Firestore CRUD using `firebase/firebase-client.js`. Collections to use: `classes`, `students`, `enrollments`, `homeworks`, `assignments`, `notices`, `messages`.

9) Test
- Run the app and verify reads/writes appear in Firestore.

Notes
- Keep a backup of your `local_export.json` until migration is verified.
- Tighten Firestore rules before deploying publicly.

If you'd like to try a different server or database instead, I can suggest alternatives and help set one up.

