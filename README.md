# ClassMate Prototype

ClassMate is a student-first AI planner prototype. This first build is a PWA-style app with local browser state and an AI-backed ClassQuest game endpoint.

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

Set `OPENAI_API_KEY` before running. Without it, ClassQuest will not generate questions.

## Included

- PWA manifest and service worker.
- First-run onboarding with no default contacts, groups, reminders, books, or projects.
- Timetable photo upload placeholder; extraction requires a real AI timetable endpoint.
- Dashboard with most-recent/urgent focus.
- Time/type dashboard toggle and customizable sections.
- Multiple timetable preview with optional times.
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
- Assignment Studio preview with structured PPTX/DOCX projects, section owners, project lead, comments, suggested edits, feedback modes, and export actions.
- Interactive comments, suggested edits, and project-lead reassignment counters.
- Notification settings with browser permission and test notification.
- ClassQuest arcade: type any subject, generate 10 OpenAI-backed rounds, and play different round types including quiz battle, true/false, typed answer, and best-move choices.

## Next Build Step

The next practical step is to connect these flows to a real app stack:

- Next.js or React frontend if we want component structure and routing.
- Supabase for auth, database, and realtime chat.
- OpenAI API for timetable extraction and reminder parsing.
- PPTX/DOCX generation libraries for editable exports.

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

7. For real AI game generation, set `OPENAI_API_KEY` in the PythonAnywhere web app environment or WSGI config.
8. Reload the web app from the PythonAnywhere **Web** tab.

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
