# ClassMate Prototype

ClassMate is a student-first AI planner prototype. This build is a PWA-style app with fresh local browser state, a Flask backend for AI/export endpoints, and no preloaded accounts or demo data.

## Run

From this folder:

```powershell
python -m http.server 5177
```

Then open:

```text
http://127.0.0.1:5177/
```

Or run the local AI server:

```powershell
python local_ai_server.py
```

Set `OPENAI_API_KEY` before running. Without it, AI games, paraphrasing, presentation ideas, and timetable extraction will show setup-needed messages instead of mock results.

## Included

- PWA manifest and service worker.
- Fresh local workspace startup.
  - No Google Client ID is required.
  - No default accounts, contacts, groups, reminders, books, or projects are preloaded.
  - Set `CLASSMATE_DATA_DIR` in production if server-side workspace storage is re-enabled later.
- First-run onboarding with student and teacher modes.
- Timetable photo upload with OpenAI Vision extraction for full-week school, homework, activity, travel, or study blocks.
- Dashboard with most-recent/urgent focus.
- Time/type dashboard toggle and customizable sections.
- Whole-day timetable preview with optional times, full week support, and visible validation for required schedule fields.
- Active timetable switching and manual class creation.
- Subject-level material mapping.
- Editable material lists and optional suggested materials.
- Natural-language reminder entry with review-before-save.
- Clickable reminders with edit/save/delete behavior.
- Homework, test, assignment, bring, event, and project-task reminder model.
- Recurring reminder representation.
- Library section for borrowed books, renewals, and returns.
- Groups start empty, with create/join actions before contacts or chats appear.
- Confirmer approve/reject/edit-before-approve interactions, with third-confirmer tie-breaker shown.
- Group and private-chat-ready UI rules: named chat, unread counts, no read receipts, delete/report controls.
- Accepted-contact gating for private chats.
- Assignment Studio with Canva, Google Slides, PowerPoint, Word, PDF, and Notion template workspaces, section owners, project lead, comments, suggested edits, feedback modes, share briefs, and downloadable exports.
- Interactive comments, suggested edits, and project-lead reassignment counters.
- Notification settings with browser permission and test notification.
- ClassQuest arcade: type any subject, choose a timed game style, generate 10 OpenAI-backed rounds, and play different round types including quiz battle, true/false, typed answer, and best-move choices with typo-tolerant answer analysis.
- Student/teacher startup without account sign-in, so the app works immediately on the public PythonAnywhere link.
- PWA install support with refreshed app icon and service-worker caching for phone, desktop, and tablet installs.

## Next Build Step

The next practical step is to move the prototype cloud sync into a production app stack:

- Next.js or React frontend if we want component structure and routing.
- Supabase for auth, database, file storage, and realtime chat.
- OpenAI API for timetable extraction and reminder parsing.
- Server-side permissions for real shared accounts, files, groups, and classroom sync.

## PythonAnywhere

This folder includes a minimal Flask wrapper for PythonAnywhere:

- `server.py`
- `local_ai_server.py`
- `pythonanywhere_wsgi.py`
- `requirements.txt`

Recommended PythonAnywhere setup:

1. Upload or clone this `classmate` folder into your PythonAnywhere files area.
2. Open the PythonAnywhere **Web** tab.
3. Create or edit a Flask web app.
4. Set the source code directory to the uploaded `classmate` folder.
5. Edit the WSGI configuration file and use the contents of `pythonanywhere_wsgi.py`.
6. In a PythonAnywhere Bash console, install requirements:

```bash
cd ~/classmate
pip install --user -r requirements.txt
```

7. For cloud sync data persistence, set `CLASSMATE_DATA_DIR=/home/AaravG13/classmate_data` or another persistent folder.
8. For real AI game generation, set `OPENAI_API_KEY` in the PythonAnywhere web app environment or WSGI config.
9. Reload the web app from the PythonAnywhere **Web** tab.

For a permanent free link, PythonAnywhere should become the main URL. Cloudflare quick tunnels are temporary and can expire. PythonAnywhere is the permanent free deployment path for this prototype because ClassQuest needs a backend endpoint for OpenAI.

After reload:

```text
https://YOUR_USERNAME.pythonanywhere.com/
https://YOUR_USERNAME.pythonanywhere.com/health
```

`/health` should return:

```json
{"app":"ClassMate","status":"ok"}
```
