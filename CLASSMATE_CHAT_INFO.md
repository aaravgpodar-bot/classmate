# ClassMate Chat Info

Updated: 2026-06-24

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
  - Includes varied modes such as multiple choice, true/false, typed answer, and best move.
- Assignment Studio:
  - AI presentation/template generator.
  - Submissions paraphraser.
  - Project creation for PPTX/DOCX-style workspaces.
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

- `node --check app.v19.js` passed.
- `python -m py_compile server.py classmate_server_v19.py local_ai_server.py` passed.
- Desktop fresh-start check:
  - v19 JS/CSS loaded.
  - "School, sorted." visible.
  - Old crowded first-screen text removed.
  - No console errors.
  - Tutorial appeared.
  - Activities, Timetable, Reminders, and Library add flows worked.
- Mobile fresh-start check at 390px:
  - No horizontal document overflow.
  - Only the two intended start buttons are visible.
  - Old crowded text removed.
  - No console errors.
- Mobile in-app nav check:
  - All tabs visible/reachable in scrollable bottom nav.
  - Settings opened successfully.
  - No console errors.

Earlier live checks:

- Live app served v19 assets.
- Live tutorial, activities, timetable, reminders, and library flows worked.
- Live `/health` returned ok.
- Live `/api/config` returned an empty Google client ID until configured.
- Live `/api/paraphrase` returned a real OpenAI response.

## Known Setup Items

- V22 remake:
  - Uses `classmate.prototype.v22.clean-remake` as the only active local storage key.
  - Removes older `classmate.*` localStorage keys on load, including the previous Google/global prototype state.
  - Starts with no signed-in account, no default contacts, and no saved demo workspace.
  - First screen is simplified around Student with Google, Teacher with Google, and Guest workspace.
  - Sidebar navigation is grouped into Today, School, Create, and App.
  - PWA files now use v22 assets: `app.v22.js`, `styles.v22.css`, `manifest.v22.json`, and `service-worker.v22.js`.
- Google login is wired but not fully active until `GOOGLE_CLIENT_ID` is added to PythonAnywhere.
- The OpenAI API key was pasted in chat earlier and should be rotated later for safety. Do not store or repeat the key in project docs.
- The app is currently a localStorage/prototype-style frontend with Flask AI endpoints, not a full production database app yet.
- PythonAnywhere file editor previously appended to existing files, so versioned files like `app.v19.js`, `styles.v19.css`, and `index.v19.html` are safer for deployment.
- Old service-worker state in a browser may request old v13 files during local testing. The current v19 HTML does not register the service worker.
- GitHub collaborator invitations were previously sent for `ashishefe` and `keshavatearth`; acceptance status may need checking in GitHub.
- `The_Fork_the_Witch_and_the_Worm_Book_4_5.pdf` is present locally but unrelated and intentionally untracked.

## Good Next Steps

- Add a real database/auth layer after Google OAuth is configured.
- Add real persistent user accounts and cloud sync.
- Add proper file storage for documents instead of local file-name tracking.
- Add downloadable PPTX/DOCX export generation.
- Add production notification scheduling for morning/evening reminders.
- Add a settings page field for school-day end time and reminder times.
- Rotate the OpenAI key and move all secrets into PythonAnywhere environment/config only.
