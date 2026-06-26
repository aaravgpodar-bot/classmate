# ClassMate Chat Info

Updated: 2026-06-25

## Current App

ClassMate is a global student-first AI planner for school life: timetable photo upload, whole-day scheduling, reminders, homework/deadline tracking, library returns, documents, holidays, groups, real-time-style chat concepts, AI games, AI paraphrasing, and presentation/template support.

Live app:
https://aaravg13.pythonanywhere.com/

GitHub repo:
https://github.com/aaravgpodar-bot/classmate

Latest pushed branch:
main

Deployment:
PythonAnywhere account `AaravG13`, app folder `/home/AaravG13/classmate`, WSGI file `/var/www/aaravg13_pythonanywhere_com_wsgi.py`.

## Main Decisions From This Chat

- The app should be a GLOBAL APP, not tied to one school.
- V1 should include personal planning connected to group work.
- Dashboard should prioritize most recent and urgent information.
- Students should be able to choose/customize parts of the dashboard.
- Start fresh: no default contacts, groups, books, reminders, projects, or accounts.
- Add onboarding/tutorial after sign-up or first start.
- Groups should support shared reminders, anonymous edits, weekly confirmers, duplicate merging, chat, and private contacts only after real classmates connect.
- Use a permanent free PythonAnywhere link for now.
- UI should feel like something students would use: polished, a little dark, not too bright, and easy to understand.
- Games should be real games, not one repeated quiz skin, and should generate at least 10 changing questions from any subject the student types.
- Use real OpenAI API behavior, not mock AI.
- Timetable should cover the whole day, not only school periods.
- Add school-life tabs like workbook sheets: Academics, Extra Curriculars/Sports, Competitions, Library, Documents, Holidays.
- Add library return support and reminders.
- Add a documents zone for report cards, mark sheets, certificates, worksheets, and important school files.
- Add pop-up/tutorial-style prompting for end-of-school-day homework entry.
- Add Google sign-in and remove any current/default account idea.

## Implemented Features

- Simplified first screen:
  - Headline: "School, sorted."
  - Only two main actions: Continue with Google and Try without signing in.
  - Small preview card instead of a crowded timetable/setup preview.
- First-run tutorial:
  - Explains Dashboard, Timetable, Reminders, Activities, Games/Studio, and Groups.
- Google sign-in wiring:
  - Frontend supports Google Identity Services.
  - Backend exposes `/api/config` and `/api/google-login`.
  - Login verifies Google ID tokens through Google tokeninfo.
  - `GOOGLE_CLIENT_ID` still needs to be configured on PythonAnywhere before real Google login works.
- Cloud sync:
  - Backend exposes `/api/workspace/<workspace_id>` GET/POST/DELETE.
  - Workspace data is stored in SQLite under `CLASSMATE_DATA_DIR` or local `data/`.
  - Google users sync by email workspace after sign-in.
  - Guest users sync by generated device workspace id.
  - Local browser storage remains a fast/offline copy.
- Timetable:
  - Photo upload route using OpenAI Vision endpoint.
  - Whole-day schedule blocks for school, homework, activity, sport, meal, travel, and other.
  - Supports more than 6 periods and shows full week including Saturday/Sunday.
- Materials:
  - Material titles are capitalized.
  - Students can add/delete individual materials and delete subject material groups.
- Reminders:
  - Review/edit modal.
  - Submission date/time and completion date/time fields.
  - Completed checkbox.
  - End-of-day homework check-in form.
- Activities:
  - Tabs for Academics, Extra Curriculars, Competitions, Library, Documents, Holidays.
  - Add/delete activity records.
- Library:
  - Add borrowed books with title, author, return date.
  - Mark returned and renew.
- Documents:
  - Track document title/type/date/file name locally.
  - Delete document entries.
- Holidays:
  - Add/delete holiday records.
- AI features:
  - `/api/generate-game` creates 10-question subject games using OpenAI.
  - `/api/paraphrase` rewrites student submission text using OpenAI.
  - `/api/generate-presentation` generates presentation ideas/template direction using OpenAI.
  - `/api/extract-timetable` extracts timetable data from an uploaded image.
- Games:
  - Subject prompt accepts anything the student types.
  - Includes selectable timed styles: Quest, Speed Run, Boss Battle, and Flash Cards.
  - Includes varied modes such as multiple choice, true/false, typed answer, and best move.
  - Answer analysis accepts clear typos, extra words, and close token matches.
- Assignment Studio:
  - AI presentation/template generator.
  - Submissions paraphraser.
  - Project and template workspaces for Canva, Google Slides, PowerPoint PPTX, Word DOCX, PDF, and Notion.
  - Share brief copy action.
  - Download action for PPTX/DOCX when export libraries are installed, with an HTML fallback for phones/desktops.
- Groups:
  - Empty by default.
  - Create/join flows.
  - Tutorial alert.
  - Group reminders/chat/contact concepts are represented without default contacts.
- Mobile:
  - Bottom navigation now includes all tabs in a horizontal scroll area.
  - Settings, Studio, Groups, and Games are reachable on mobile.

## Testing Notes

Recent local checks:

- Canonical files only: `index.html`, `app.js`, `styles.css`, `manifest.json`, `service-worker.js`, `server.py`, `local_ai_server.py`.
- Professor cleanup removed version-suffix file sprawl from the repo.
- `node --check app.js` passed.
- `node --check service-worker.js` passed.
- `python -m py_compile server.py local_ai_server.py pythonanywhere_wsgi.py` passed.
- `python -m json.tool manifest.json` passed.
- Flask `/api/export-assignment` produced real `.pptx` and `.docx` files after installing `requirements.txt` locally.
- Flask `/api/workspace` saved, loaded, and deleted test workspace data.
- Browser-created workspace row appeared in local SQLite with a saved library book.
- Desktop fresh-start check:
  - Canonical JS/CSS loaded on a fresh local port to avoid old service-worker cache.
  - "School, sorted." visible.
  - New logo rendered.
  - No console errors.
  - Tutorial appeared.
  - Library Add book flow jumped from dashboard to Library and focused the form.
  - Timetable Add block highlighted missing title/time fields.
  - Timetable block save worked.
  - Studio template creation worked.
  - Studio export showed a visible downloaded-file notice.
  - Games displayed all four timed styles.
- Mobile shell check at phone width:
  - No horizontal document overflow.
  - All tabs visible/reachable in scrollable bottom nav.
  - Visible button text did not clip.
  - No console errors.

Earlier live checks:

- Live app previously served older assets; verify after every PythonAnywhere deploy.
- Live tutorial, activities, timetable, reminders, and library flows worked.
- Live `/health` returned ok.
- Live `/api/config` returned an empty Google client ID until configured.
- Live `/api/paraphrase` returned a real OpenAI response.

## Known Setup Items

- V23 final remake:
  - Uses `classmate.prototype.v23.final-remake` as the only active local storage key.
  - Removes older `classmate.*` localStorage keys on load, including the previous Google/global prototype state and v22 remake state.
  - Starts with no signed-in account, no default contacts, and no saved demo workspace.
  - First screen is simplified around Student with Google, Teacher with Google, and Guest workspace.
  - Sidebar navigation is grouped into Today, School, Create, and App.
  - PWA files use canonical assets: `app.js`, `styles.css`, `manifest.json`, and `service-worker.js`.
- Google login is wired but not fully active until `GOOGLE_CLIENT_ID` is added to PythonAnywhere.
- The OpenAI API key was pasted in chat earlier and should be rotated later for safety. Do not store or repeat the key in project docs.
- The app now has prototype cloud sync using Flask + SQLite. Supabase is still the production-grade next step for auth/database/files/realtime.
- Set `CLASSMATE_DATA_DIR` on PythonAnywhere to a persistent folder before relying on cloud sync there.
- PythonAnywhere deployment should upload/pull canonical files only. Do not recreate old version-suffix assets.
- Old service-worker state in a browser may request old cached files during local testing. The current canonical HTML registers `service-worker.js`.
- GitHub collaborator invitations were previously sent for `ashishefe` and `keshavatearth`; acceptance status may need checking in GitHub.
- `The_Fork_the_Witch_and_the_Worm_Book_4_5.pdf` is present locally but unrelated and intentionally untracked.

## Good Next Steps

- Move prototype SQLite cloud sync to Supabase after Google OAuth is configured.
- Add real server-side permissions for shared groups/classrooms/files.
- Add proper file storage for documents instead of local file-name tracking.
- Install `python-pptx` and `python-docx` from `requirements.txt` on PythonAnywhere for real export downloads.
- Add production notification scheduling for morning/evening reminders.
- Rotate the OpenAI key and move all secrets into PythonAnywhere environment/config only.
