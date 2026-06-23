const STORAGE_KEY = "classmate.prototype.v6.mixed-games";
const OLD_STORAGE_KEYS = ["classmate.prototype.v1", "classmate.prototype.v2.fresh"];

const seed = {
  onboarded: false,
  view: "dashboard",
  dashboardMode: "time",
  dashboardSections: ["recent", "tomorrow", "due", "library", "groups"],
  user: { name: "Student", grade: "" },
  timetables: [
    {
      id: "main",
      name: "My timetable",
      active: true,
      classes: []
    }
  ],
  materials: {},
  reminders: [],
  library: [],
  groups: [],
  contacts: [],
  chats: [],
  assignments: [],
  timetableUpload: {
    status: "idle",
    error: "",
    result: null,
    fileName: ""
  },
  presentationAi: {
    topic: "",
    grade: "",
    style: "creative but school-ready",
    status: "idle",
    error: "",
    plan: null
  },
  paraphraseAi: {
    text: "",
    tone: "clear student submission",
    status: "idle",
    error: "",
    result: null
  },
  games: {
    subject: "",
    status: "setup",
    source: "",
    error: "",
    questions: [],
    current: 0,
    score: 0,
    lives: 3,
    streak: 0,
    bestStreak: 0,
    lastResult: ""
  },
  settings: {
    eveningPack: true,
    morningSummary: true,
    quietHours: "9:30 PM - 6:30 AM",
    notifications: false
  }
};

let state = load();
let draftReminder = null;

function load() {
  try {
    OLD_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
    return { ...seed, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") };
  } catch {
    return structuredClone(seed);
  }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function setState(patch) {
  state = { ...state, ...patch };
  save();
  render();
}

function show(view) {
  setState({ view });
}

function titleCase(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
}

function normalizeMaterials(items) {
  return [...new Set(items.map(titleCase).filter(Boolean))];
}

function periodNumber(period) {
  const match = String(period || "").match(/\d+/);
  return match ? Number(match[0]) : 999;
}

function appRoot() {
  return document.querySelector("#app");
}

function render() {
  appRoot().innerHTML = state.onboarded ? shell() : onboarding();
  bind();
}

function onboarding() {
  return `
    <main class="hero">
      <section class="hero-copy">
        <div class="brand"><div class="logo">CM</div><div><h1>ClassMate</h1><p>Your school day, remembered.</p></div></div>
        <h1>Plan school without the panic.</h1>
        <p>Timetable, reminders, library returns, groups, and AI games in one bright student dashboard.</p>
        <div class="actions">
          <button class="btn primary" data-action="finish-onboarding">Start fresh</button>
          <button class="btn" data-action="choose-timetable-photo">Upload timetable photo</button>
        </div>
      </section>
      <section class="hero-card">
        <div class="panel">
          <h3>Photo-first setup</h3>
          <div class="setup-steps">
            <div><strong>Upload timetable</strong><br><span class="muted">AI extraction after backend setup.</span></div>
            <div><strong>Review first</strong><br><span class="muted">Nothing activates until confirmed.</span></div>
            <div><strong>Map materials</strong><br><span class="muted">Pack lists stay subject-based.</span></div>
            <div><strong>Open dashboard</strong><br><span class="muted">Personal, groups, and library together.</span></div>
          </div>
        </div>
        <div class="panel">
          <h3>Your timetable preview</h3>
          ${timetablePreview()}
        </div>
      </section>
    </main>
  `;
}

function shell() {
  const tabs = [
    ["dashboard", "Dashboard", dashboardBadge()],
    ["timetable", "Timetable", ""],
    ["reminders", "Reminders", state.reminders.length],
    ["library", "Library", state.library.length],
    ["games", "Games", ""],
    ["groups", "Groups", state.groups.reduce((sum, g) => sum + g.unread, 0)],
    ["studio", "Studio", ""],
    ["settings", "Settings", ""]
  ];
  return `
    <div class="shell">
      <aside class="sidebar">
        <div class="brand"><div class="logo">CM</div><div><h1>ClassMate</h1><p>Student-first planner</p></div></div>
        <nav class="nav">${tabs.map(tabButton).join("")}</nav>
      </aside>
      <main class="main">
        ${viewContent()}
      </main>
      <nav class="bottom-nav">${tabs.slice(0, 5).map(tabButton).join("")}</nav>
    </div>
    ${draftReminder ? reminderModal() : ""}
  `;
}

function tabButton([id, label, badge]) {
  return `<button class="${state.view === id ? "active" : ""}" data-view="${id}"><span>${label}</span>${badge ? `<span class="badge">${badge}</span>` : ""}</button>`;
}

function dashboardBadge() {
  return state.groups.reduce((sum, g) => sum + g.pending, 0);
}

function viewContent() {
  const views = {
    dashboard,
    timetable,
    reminders,
    library,
    groups,
    studio,
    games,
    settings
  };
  return (views[state.view] || dashboard)();
}

function header(title, subtitle, buttons = "") {
  return `
    <div class="topbar">
      <div><h2>${title}</h2><p>${subtitle}</p></div>
      <div class="actions">${buttons}</div>
    </div>
  `;
}

function dashboard() {
  const sections = {
    recent: recentPanel(),
    tomorrow: tomorrowPanel(),
    due: duePanel(),
    library: libraryPanel(true),
    groups: groupsPanel(true)
  };
  return `
    ${header("Dashboard", "Most recent and most urgent first, with personal planning kept separate from group updates.", `
      <div class="segmented">
        <button class="${state.dashboardMode === "time" ? "active" : ""}" data-mode="time">Time</button>
        <button class="${state.dashboardMode === "type" ? "active" : ""}" data-mode="type">Type</button>
      </div>
      <button class="btn" data-action="customize">Customize</button>
      <button class="btn primary" data-action="new-reminder">Add reminder</button>
    `)}
    <section class="grid">
      ${state.dashboardSections.map((key) => sections[key]).join("")}
    </section>
  `;
}

function recentPanel() {
  const recent = [
    ...state.reminders.map((item) => ({ title: item.title, meta: `${item.type} &middot; ${item.due}`, chip: item.type })),
    ...state.library.map((item) => ({ title: item.title, meta: `Library return &middot; ${item.due}`, chip: item.status })),
    ...state.groups.flatMap((group) => (group.pendingEdits || []).map((edit) => ({ title: edit.title, meta: `${group.name} &middot; ${edit.status}`, chip: "Group" })))
  ].slice(0, 3);
  return `<div class="panel span-8"><h3>Most Recent</h3><div class="stack">
    ${recent.map((item) => `<div class="item"><div class="row"><strong>${item.title}</strong><span class="chip">${item.chip}</span></div><span class="muted">${item.meta}</span></div>`).join("") || `<div class="empty"><strong>Nothing here yet.</strong><br>Add a timetable, reminder, library book, or group when you are ready.</div>`}
  </div></div>`;
}

function tomorrowPanel() {
  const active = state.timetables.find((t) => t.active) || state.timetables[0];
  const tomorrow = active.classes.filter((c) => ["Mon", "Tue"].includes(c.day)).slice(0, 4);
  const pack = [...new Set(tomorrow.flatMap((c) => state.materials[c.subject] || []))];
  return `<div class="panel span-4"><h3>Tomorrow</h3><div class="stack">
    ${tomorrow.map((c) => `<div class="item"><strong>${c.subject}</strong><span class="muted">Period ${c.period}${c.time ? ` at ${c.time}` : ""}</span></div>`).join("") || `<div class="empty">Add classes to see tomorrow's schedule and pack list.</div>`}
    ${pack.length ? `<div><strong>Pack</strong><div class="chips">${pack.map((p) => `<span class="chip">${p}</span>`).join("")}</div></div>` : ""}
  </div></div>`;
}

function duePanel() {
  return `<div class="panel span-4"><h3>Due Soon</h3><div class="stack">
    ${state.reminders.slice(0, 4).map((r) => `<button class="item item-button" data-action="edit-reminder" data-id="${r.id}"><div class="row"><strong>${r.title}</strong><span class="chip blue">${r.type}</span></div><span class="muted">${r.subject} &middot; ${r.due}${r.recurring ? " &middot; recurring" : ""}</span></button>`).join("") || `<div class="empty">No homework, tests, assignments, or events yet.</div>`}
  </div></div>`;
}

function libraryPanel(compact = false) {
  return `<div class="panel ${compact ? "span-4" : "span-12"}"><div class="row"><h3>Library</h3><button class="btn" data-action="add-book">Add book</button></div><div class="stack">
    ${state.library.map((b) => `<div class="item"><div class="row"><strong>${b.title}</strong><span class="chip ${b.status === "Due soon" ? "coral" : "green"}">${b.status}</span></div><span class="muted">${b.author || "Unknown author"} &middot; Return ${b.due}</span><div class="actions"><button class="btn" data-action="return-book" data-id="${b.id}">Mark returned</button><button class="btn" data-action="renew-book" data-id="${b.id}">Renew</button></div></div>`).join("") || `<div class="empty">No borrowed books.</div>`}
  </div></div>`;
}

function groupsPanel(compact = false) {
  return `<div class="panel ${compact ? "span-8" : "span-12"}"><div class="row"><h3>Group Updates</h3><button class="btn primary" data-view="groups">Open groups</button></div><div class="stack">
    ${state.groups.map((g) => `<div class="item"><div class="row"><strong>${g.name}</strong><span class="chip gold">${g.pending} pending</span></div><span class="muted">Code ${g.code} &middot; ${g.members} members &middot; confirmers: ${g.confirmers.join(", ")}</span></div>`).join("") || `<div class="empty">No groups yet. Join by code or create one when your classmates are ready.</div>`}
  </div></div>`;
}

function timetable() {
  const upload = state.timetableUpload || seed.timetableUpload;
  const materialEntries = Object.entries(state.materials).sort(([a], [b]) => a.localeCompare(b));
  return `
    ${header("Timetable", "Multiple timetables, optional exact times, colors if the student wants them.", `
      <button class="btn" data-action="choose-timetable-photo">Upload photo</button>
    `)}
    <section class="grid">
      <div class="panel span-12">
        <h3>Add Class</h3>
        <div class="form class-form">
          <div class="field"><label>Subject</label><input id="classSubject" placeholder="Math, Science, History"></div>
          <div class="field"><label>Day</label><select id="classDay">${["Mon", "Tue", "Wed", "Thu", "Fri"].map((day) => `<option>${day}</option>`).join("")}</select></div>
          <div class="field"><label>Period</label><input id="classPeriod" type="number" min="1" max="12" value="1"></div>
          <div class="field"><label>Time</label><input id="classTime" placeholder="8:00"></div>
          <button class="btn primary" data-action="save-class-inline">Add class</button>
        </div>
      </div>
      <div class="panel span-12">
        <div class="row"><h3>Photo Upload</h3><span class="chip green">OpenAI Vision</span></div>
        <input class="file-input" id="timetablePhotoInput" type="file" accept="image/*">
        <div class="actions">
          <button class="btn primary" data-action="choose-timetable-photo">Choose timetable image</button>
          ${upload.result ? `<button class="btn" data-action="apply-timetable-photo">Apply extracted timetable</button>` : ""}
        </div>
        ${renderTimetableUpload(upload)}
      </div>
      <div class="panel span-12">
        <div class="row"><h3>Active timetable</h3><div class="chips">${state.timetables.map((t) => `<button class="chip chip-button ${t.active ? "green" : ""}" data-action="activate-timetable" data-id="${t.id}">${t.name}</button>`).join("")}</div></div>
        ${timetablePreview()}
      </div>
      <div class="panel span-12">
        <div class="row"><h3>Subject Materials</h3><button class="btn" data-action="suggest-materials">Suggest materials</button></div>
        <div class="grid">${materialEntries.map(([subject, items]) => `<div class="item span-4"><div class="row"><strong>${titleCase(subject)}</strong><button class="btn warn compact-btn" data-action="delete-subject-materials" data-id="${subject}">Delete</button></div><div class="chips">${normalizeMaterials(items).map((item) => `<button class="chip chip-button removable" data-action="delete-material" data-id="${subject}:${item}">${item} x</button>`).join("") || `<span class="muted">No materials saved.</span>`}</div><div class="material-add"><input id="mat-${encodeURIComponent(subject)}" placeholder="Add material"><button class="btn compact-btn" data-action="add-material" data-id="${subject}">Add</button></div></div>`).join("") || `<div class="empty span-12">No subjects yet. Add classes or upload a timetable photo to start mapping materials.</div>`}</div>
      </div>
    </section>
  `;
}

function renderTimetableUpload(upload) {
  if (upload.status === "loading") {
    return `<div class="game-card"><h3>Reading timetable photo...</h3><p class="muted">ClassMate is asking AI to extract days, periods, subjects, and visible times.</p><div class="game-meter"><span style="width:64%"></span></div></div>`;
  }
  if (upload.status === "error") {
    return `<div class="game-card"><h3>Could not read timetable</h3><p class="muted">${upload.error}</p></div>`;
  }
  if (!upload.result) {
    return `<div class="empty">Upload a timetable photo and review it before ClassMate applies anything.</div>`;
  }
  const grouped = ["Mon", "Tue", "Wed", "Thu", "Fri"].map((day) => ({
    day,
    classes: upload.result.classes.filter((item) => item.day === day)
  }));
  return `<div class="presentation-plan">
    <div class="item"><strong>${upload.result.name || "Extracted timetable"}</strong><span class="muted">${upload.fileName || "Photo upload"} - review before applying.</span></div>
    <div class="timetable extracted">${grouped.map((group) => `<div class="day"><h4>${group.day}</h4>${group.classes.map((item) => `<div class="period" style="border-color:${item.color || "#3157d5"}"><strong>${item.subject}</strong><br><span class="muted">P${item.period}${item.time ? ` &middot; ${item.time}` : ""}</span></div>`).join("") || `<span class="muted">No classes read</span>`}</div>`).join("")}</div>
    ${(upload.result.notes || []).length ? `<div class="item"><strong>AI notes</strong><span class="muted">${upload.result.notes.join(" - ")}</span></div>` : ""}
  </div>`;
}

function timetablePreview() {
  const active = state.timetables.find((t) => t.active) || state.timetables[0];
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  return `<div class="timetable">${days.map((day) => `<div class="day"><h4>${day}</h4>${active.classes.filter((c) => c.day === day).sort((a, b) => periodNumber(a.period) - periodNumber(b.period)).map((c) => `<div class="period" style="border-color:${c.color || "#3157d5"}"><strong>${titleCase(c.subject)}</strong><br><span class="muted">P${c.period}${c.time ? ` &middot; ${c.time}` : ""}</span></div>`).join("") || `<span class="muted">No classes</span>`}</div>`).join("")}</div>`;
}

function reminders() {
  return `
    ${header("Reminders", "Natural language or form entry, always reviewed before save.", `<button class="btn primary" data-action="new-reminder">Add reminder</button>`)}
    <section class="grid">
      <div class="panel span-6">
        <h3>Quick Add</h3>
        <div class="form">
          <div class="field"><label>What do you need to remember?</label><textarea id="nlReminder">science diagram due Friday, include labels and color</textarea></div>
          <button class="btn primary" data-action="parse-reminder">Parse and review</button>
        </div>
      </div>
      <div class="panel span-6">
        <h3>Saved</h3>
        <div class="stack">${state.reminders.map((r) => `<button class="item item-button" data-action="edit-reminder" data-id="${r.id}"><div class="row"><strong>${r.title}</strong><span class="chip blue">${r.type}</span></div><span class="muted">${r.subject} &middot; ${r.due}${r.recurring ? " &middot; recurring" : ""}</span></button>`).join("") || `<div class="empty">No saved reminders yet.</div>`}</div>
      </div>
    </section>
  `;
}

function library() {
  return `
    ${header("Library", "Borrowed books get their own lifecycle and still feed dashboard reminders.", `<button class="btn primary" data-action="add-book">Add borrowed book</button>`)}
    <section class="grid">${libraryPanel(false)}</section>
  `;
}

function groups() {
  return `
    ${header("Groups", "Invite links and one active group code, with no public search.", `
      <button class="btn" data-action="group-tutorial">Show tutorial</button>
      <button class="btn" data-action="create-group">Create group</button>
      <button class="btn primary" data-action="join-group">Join by code</button>
    `)}
    <section class="grid">
      ${state.groups.map((g) => `<div class="panel span-6">
        <div class="row"><h3>${g.name}</h3><span class="chip">${g.code}</span></div>
        <p class="muted">${g.members} members &middot; current confirmers: ${g.confirmers.join(" and ")} &middot; tie-breaker: ${g.thirdConfirmer}</p>
        <div class="stack">
          <div class="item"><div class="row"><strong>Shared reminders</strong><span class="chip gold">${g.pending} pending</span></div><span class="muted">Anonymous edits, visible confirmers, auto-activate timers, duplicate merging.</span></div>
          <div class="item"><div class="row"><strong>Chat</strong><span class="chip blue">${g.unread} unread</span></div><span class="muted">Named text chat, no read receipts, delete/report/moderation controls.</span></div>
          ${(g.pendingEdits || []).map((edit) => `<div class="item"><div class="row"><strong>${edit.title}</strong><span class="chip coral">${edit.status}</span></div><span class="muted">${edit.detail} Due ${edit.due}. Approved: ${edit.approvals.length || 0}; rejected: ${edit.rejects.length || 0}.</span><div class="actions"><button class="btn primary" data-action="approve-edit" data-id="${g.id}:${edit.id}">Approve</button><button class="btn" data-action="edit-pending" data-id="${g.id}:${edit.id}">Edit then approve</button><button class="btn warn" data-action="reject-edit" data-id="${g.id}:${edit.id}">Reject</button></div></div>`).join("")}
        </div>
      </div>`).join("") || `<div class="panel span-12"><div class="empty"><strong>No groups yet.</strong><br>Create a group or join one with a code. Contacts and private chats appear only after real classmates connect.</div></div>`}
      <div class="panel span-12">
        <h3>Recent Chat</h3>
        <div class="stack">${state.chats.map((m) => `<div class="item"><div class="row"><strong>${m.who}</strong><span class="muted">${m.scope}</span></div><span>${m.text}</span><div class="actions"><button class="btn">Delete own</button><button class="btn warn">Report</button></div></div>`).join("") || `<div class="empty">No messages yet.</div>`}</div>
      </div>
      <div class="panel span-12">
        <h3>Private Chats</h3>
        <div class="grid">${state.contacts.map((c) => `<div class="item span-4"><div class="row"><strong>${c.name}</strong><span class="chip ${c.status === "Accepted" ? "green" : "gold"}">${c.status}</span></div><span class="muted">${c.chat}</span><button class="btn ${c.status === "Accepted" ? "primary" : ""}" data-action="${c.status === "Accepted" ? "open-private" : "accept-contact"}" data-id="${c.id}">${c.status === "Accepted" ? "Open private chat" : "Accept contact"}</button></div>`).join("") || `<div class="empty span-12">No contacts yet. Private chat unlocks after both students accept contact status.</div>`}</div>
      </div>
    </section>
  `;
}

function studio() {
  const ai = state.presentationAi;
  const paraphrase = state.paraphraseAi || seed.paraphraseAi;
  return `
    ${header("Assignment Studio", "Structured shared slides and docs with comments, suggested edits, owners, and exports.", `<button class="btn primary" data-action="new-project">New project</button>`)}
    <section class="grid">
      <div class="panel span-12">
        <div class="row"><h3>Submissions Paraphraser</h3><span class="chip green">OpenAI</span></div>
        <div class="form submission-form">
          <div class="field"><label>Paste your draft</label><textarea id="paraphraseText" placeholder="Paste a paragraph, answer, speech, or submission draft">${paraphrase.text}</textarea></div>
          <div class="field"><label>Tone</label><input id="paraphraseTone" value="${paraphrase.tone}" placeholder="clear, formal, simpler, confident"></div>
          <button class="btn primary" data-action="paraphrase-submission">Paraphrase</button>
        </div>
        ${renderParaphrase(paraphrase)}
      </div>
      <div class="panel span-12">
        <div class="row"><h3>AI Presentation + Template Generator</h3><span class="chip green">OpenAI</span></div>
        <div class="form studio-ai-form">
          <div class="field"><label>Topic</label><input id="aiPresentationTopic" value="${ai.topic}" placeholder="Photosynthesis, World War II, fractions, climate change"></div>
          <div class="field"><label>Class level</label><input id="aiPresentationGrade" value="${ai.grade}" placeholder="Grade 7, high school, beginner"></div>
          <div class="field"><label>Style</label><input id="aiPresentationStyle" value="${ai.style}" placeholder="fun debate, clean science fair, dramatic story"></div>
          <button class="btn primary" data-action="generate-presentation">Generate ideas</button>
        </div>
        ${renderPresentationPlan(ai)}
      </div>
      ${state.assignments.map((a) => `<div class="panel span-6">
        <div class="row"><h3>${a.title}</h3><span class="chip ${a.kind === "PPTX" ? "blue" : "green"}">${a.kind}</span></div>
        <p class="muted">Project Lead: ${a.lead} &middot; Feedback mode: ${a.feedback}</p>
        <div class="stack">${a.sections.map((s) => `<div class="item"><div class="row"><strong>${s.name}</strong><span class="chip">${s.status}</span></div><span class="muted">Owner: ${s.owner} &middot; ${s.comments} comments &middot; ${s.suggestions} suggested edits</span><div class="actions"><button class="btn" data-action="add-comment" data-id="${a.id}:${s.name}">Comment</button><button class="btn" data-action="suggest-edit" data-id="${a.id}:${s.name}">Suggest edit</button><button class="btn" data-action="reassign-section" data-id="${a.id}:${s.name}">Project Lead reassign</button></div></div>`).join("")}</div>
        <div class="actions"><button class="btn" data-action="ai-split" data-id="${a.id}">AI task split</button><button class="btn" data-action="review-assignment" data-id="${a.id}">Review</button><button class="btn primary" data-action="export-assignment" data-id="${a.id}">Export ${a.kind}</button></div>
      </div>`).join("") || `<div class="panel span-12"><div class="empty"><strong>No projects yet.</strong><br>Create a presentation or document workspace when you get an assignment.</div></div>`}
    </section>
  `;
}

function renderParaphrase(paraphrase) {
  if (paraphrase.status === "loading") {
    return `<div class="game-card"><h3>Rewriting carefully...</h3><p class="muted">ClassMate is keeping your meaning while making the submission clearer.</p><div class="game-meter"><span style="width:70%"></span></div></div>`;
  }
  if (paraphrase.status === "error") {
    return `<div class="game-card"><h3>AI setup needed</h3><p class="muted">${paraphrase.error}</p></div>`;
  }
  if (!paraphrase.result) {
    return `<div class="empty">Use this for submissions, short answers, speeches, and assignment paragraphs.</div>`;
  }
  return `<div class="presentation-plan">
    <div class="item"><div class="row"><strong>${paraphrase.result.titleSuggestion || "Paraphrased draft"}</strong><span class="chip blue">Submission</span></div><span>${paraphrase.result.paraphrased}</span></div>
    ${(paraphrase.result.improvements || []).length ? `<div class="item"><strong>What changed</strong><div class="chips">${paraphrase.result.improvements.map((item) => `<span class="chip">${item}</span>`).join("")}</div></div>` : ""}
  </div>`;
}

function renderPresentationPlan(ai) {
  if (ai.status === "loading") {
    return `<div class="game-card"><h3>Building your deck idea...</h3><p class="muted">ClassMate is asking AI for creative slide ideas and a template.</p><div class="game-meter"><span style="width:68%"></span></div></div>`;
  }
  if (ai.status === "error") {
    return `<div class="game-card"><h3>AI setup needed</h3><p class="muted">${ai.error || "Set OPENAI_API_KEY on the server, then restart ClassMate."}</p></div>`;
  }
  if (!ai.plan) {
    return `<div class="empty">Type a topic to get a presentation structure, creative ways to include things, and a template direction.</div>`;
  }
  const plan = ai.plan;
  const template = plan.template || {};
  return `<div class="presentation-plan">
    <div class="item">
      <div class="row"><strong>${plan.title}</strong><span class="chip blue">${template.name || "Template"}</span></div>
      <span class="muted">${plan.hook}</span>
      <div class="chips">${(template.colors || []).map((color) => `<span class="chip">${color}</span>`).join("")}</div>
      <span class="muted">${template.fontPair || ""} ${template.visualStyle ? `&middot; ${template.visualStyle}` : ""}</span>
    </div>
    <div class="slide-list">
      ${(plan.slides || []).map((slide, index) => `<div class="item">
        <div class="row"><strong>${index + 1}. ${slide.title}</strong><span class="chip gold">Slide</span></div>
        <span>${slide.purpose}</span>
        <span class="muted"><strong>Creative include:</strong> ${slide.creativeIdea}</span>
        <span class="muted"><strong>Speaker note:</strong> ${slide.speakerNote}</span>
      </div>`).join("")}
    </div>
    ${(plan.extras || []).length ? `<div class="item"><strong>Extra presentation moves</strong><div class="chips">${plan.extras.map((item) => `<span class="chip">${item}</span>`).join("")}</div></div>` : ""}
    ${(plan.docxOutline || []).length ? `<div class="item"><strong>DOCX outline</strong><span class="muted">${plan.docxOutline.join(" - ")}</span></div>` : ""}
  </div>`;
}

function games() {
  const game = state.games;
  const question = game.questions[game.current];
  const progress = game.questions.length ? Math.round((game.current / game.questions.length) * 100) : 0;
  const isFinished = game.status === "finished" || !question;
  return `
    ${header("Games", "Type any subject and ClassMate builds a 10-question game for it.", `
      <button class="btn" data-action="reset-game">Reset game</button>
    `)}
    <section class="grid">
      <div class="panel span-4">
        <h3>ClassQuest Setup</h3>
        <div class="form">
          <div class="field"><label>Subject</label><input id="gameSubject" value="${game.subject}" placeholder="Type anything: algebra, space, grammar, WW2"></div>
          <button class="btn primary" data-action="start-game">Generate 10-question game</button>
        </div>
      </div>
      <div class="panel span-8">
        ${game.status === "setup" ? `<div class="empty"><strong>Ready for a real round?</strong><br>Type a subject, hit generate, and answer 10 changing questions. You get 3 lives, streak bonuses, and a final score.</div>` : ""}
        ${game.status === "loading" ? `<div class="game-card"><h3>Building your quest...</h3><p class="muted">ClassMate is asking AI for 10 fresh questions about ${game.subject}.</p><div class="game-meter"><span style="width:72%"></span></div></div>` : ""}
        ${game.status === "playing" && question ? `
          <div class="row"><h3>${game.subject} ClassQuest</h3><span class="chip gold">Round ${game.current + 1}/10</span></div>
          <div class="game-meter"><span style="width:${progress}%"></span></div>
          <div class="game-hud">
            <span class="chip green">Score ${game.score}</span>
            <span class="chip coral">Lives ${"I".repeat(game.lives)}</span>
            <span class="chip blue">Streak ${game.streak}</span>
            <span class="chip green">OpenAI</span>
            <span class="chip">${question.type}</span>
          </div>
          ${renderGameRound(question)}
          ${game.lastResult ? `<div class="item"><strong>${game.lastResult}</strong></div>` : ""}
        ` : ""}
        ${game.status === "error" ? `<div class="game-card"><h3>AI setup needed</h3><p class="muted">${game.error || "Set OPENAI_API_KEY on the server, then restart ClassMate."}</p><button class="btn primary" data-action="reset-game">Back to setup</button></div>` : ""}
        ${isFinished && game.status !== "setup" && game.status !== "error" ? `
          <div class="game-card">
            <h3>Game Complete</h3>
            <p class="muted">Subject: ${game.subject}</p>
            <div class="game-hud">
              <span class="chip green">Score ${game.score}</span>
              <span class="chip blue">Best streak ${game.bestStreak}</span>
              <span class="chip gold">${game.lives > 0 ? "Cleared" : "Out of lives"}</span>
            </div>
            <div class="actions">
              <button class="btn primary" data-action="start-game">Play again</button>
              <button class="btn" data-action="reset-game">Change subject</button>
            </div>
          </div>
        ` : ""}
      </div>
    </section>
  `;
}

function scrambleWord(word) {
  return word.split("").sort(() => Math.random() - 0.5).join("");
}

function renderGameRound(question) {
  const mode = question.mode || "multiple_choice";
  if (mode === "type_answer") {
    return `<div class="game-card game-card-typed">
      <span class="game-mode">Type Answer</span>
      <strong>${question.q}</strong>
      <div class="field"><label>Your answer</label><input id="typedGameAnswer" placeholder="Type your answer"></div>
      <button class="btn primary" data-action="submit-typed-answer">Lock answer</button>
    </div>`;
  }
  if (mode === "true_false") {
    return `<div class="game-card game-card-binary">
      <span class="game-mode">True or False</span>
      <strong>${question.q}</strong>
      <div class="game-options binary">
        <button class="btn true-btn" data-action="answer-game" data-id="True">True</button>
        <button class="btn false-btn" data-action="answer-game" data-id="False">False</button>
      </div>
    </div>`;
  }
  if (mode === "best_move") {
    return `<div class="game-card game-card-move">
      <span class="game-mode">Best Move</span>
      <strong>${question.q}</strong>
      <div class="game-options">
        ${(question.options || []).map((option) => `<button class="btn move-btn" data-action="answer-game" data-id="${option}">${option}</button>`).join("")}
      </div>
    </div>`;
  }
  return `<div class="game-card">
    <span class="game-mode">Quiz Battle</span>
    <strong>${question.q}</strong>
    <div class="game-options">
      ${(question.options || []).map((option) => `<button class="btn" data-action="answer-game" data-id="${option}">${option}</button>`).join("")}
    </div>
  </div>`;
}

function normalizeSubject(value) {
  return (value || "General Knowledge").trim().replace(/\s+/g, " ").slice(0, 40) || "General Knowledge";
}

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

async function generateGameWithAi(subject) {
  const response = await fetch("/api/generate-game", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subject })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Real AI is not available.");
  if (!Array.isArray(data.questions) || data.questions.length < 10) throw new Error("OpenAI returned too few questions.");
  return {
    subject: normalizeSubject(data.subject || subject),
      source: "openai",
      questions: data.questions.slice(0, 10).map((question, index) => ({
        id: question.id || `ai-${Date.now()}-${index}`,
        mode: question.mode || "multiple_choice",
        type: question.type || "AI Round",
        q: question.q,
        answer: question.answer,
        options: shuffle(question.options || [])
      }))
  };
}

async function generatePresentationWithAi(topic, grade, style) {
  const response = await fetch("/api/generate-presentation", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic, grade, style })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Real AI is not available.");
  if (!data.plan || !Array.isArray(data.plan.slides)) throw new Error("OpenAI returned an incomplete presentation plan.");
  return data.plan;
}

async function paraphraseWithAi(text, tone) {
  const response = await fetch("/api/paraphrase", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, tone })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Real AI is not available.");
  if (!data.result || !data.result.paraphrased) throw new Error("OpenAI returned an incomplete paraphrase.");
  return data.result;
}

async function extractTimetableWithAi(image) {
  const response = await fetch("/api/extract-timetable", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Real AI is not available.");
  if (!data.timetable || !Array.isArray(data.timetable.classes)) throw new Error("OpenAI returned an incomplete timetable.");
  return data.timetable;
}

function resolveGameAnswer(rawAnswer) {
  const game = state.games;
  const question = game.questions[game.current];
  if (!question) return;
  const submitted = String(rawAnswer || "").trim();
  const expected = String(question.answer || "").trim();
  const correct = submitted.toLowerCase() === expected.toLowerCase();
  const nextStreak = correct ? game.streak + 1 : 0;
  const bonus = correct && nextStreak >= 3 ? 5 : 0;
  const score = Math.max(0, game.score + (correct ? 10 + bonus : -3));
  const lives = correct ? game.lives : game.lives - 1;
  const current = game.current + 1;
  const finished = lives <= 0 || current >= game.questions.length;
  state.games = {
    ...game,
    score,
    lives,
    current,
    streak: nextStreak,
    bestStreak: Math.max(game.bestStreak, nextStreak),
    status: finished ? "finished" : "playing",
    lastResult: correct ? `Correct. ${nextStreak >= 3 ? "Streak bonus unlocked." : "Keep going."}` : `Not quite. Correct answer: ${question.answer}.`
  };
}

function settings() {
  return `
    ${header("Settings", "Dashboard preferences, reminder defaults, and browser notification test.", `<button class="btn warn" data-action="reset">Reset prototype</button>`)}
    <section class="grid">
      <div class="panel span-6">
        <h3>Dashboard Sections</h3>
        <div class="form">${["recent", "tomorrow", "due", "library", "groups"].map((s) => `<label class="row item"><span>${s[0].toUpperCase() + s.slice(1)}</span><input type="checkbox" data-section="${s}" ${state.dashboardSections.includes(s) ? "checked" : ""}></label>`).join("")}</div>
      </div>
      <div class="panel span-6">
        <h3>Notifications</h3>
        <div class="stack">
          <div class="item"><div class="row"><strong>Evening pack reminder</strong><span class="chip green">${state.settings.eveningPack ? "On" : "Off"}</span></div></div>
          <div class="item"><div class="row"><strong>Morning summary</strong><span class="chip green">${state.settings.morningSummary ? "On" : "Off"}</span></div></div>
          <div class="item"><strong>Quiet hours</strong><span class="muted">${state.settings.quietHours}</span></div>
          <button class="btn primary" data-action="test-notification">Send test notification</button>
        </div>
      </div>
    </section>
  `;
}

function reminderModal() {
  return `<div class="modal-backdrop"><div class="modal">
    <div class="row"><h3>Review Reminder</h3><button class="btn ghost" data-action="close-modal">Close</button></div>
    <div class="form">
      <div class="field"><label>Title</label><input id="draftTitle" value="${draftReminder.title}"></div>
      <div class="field"><label>Type</label><select id="draftType">${["Homework", "Test", "Assignment", "Bring", "Event", "Project Task"].map((t) => `<option ${draftReminder.type === t ? "selected" : ""}>${t}</option>`).join("")}</select></div>
      <div class="field"><label>Subject</label><input id="draftSubject" value="${draftReminder.subject}"></div>
      <div class="field"><label>Due</label><input id="draftDue" value="${draftReminder.due}"></div>
      <label class="row item"><span>Recurring</span><input id="draftRecurring" type="checkbox" ${draftReminder.recurring ? "checked" : ""}></label>
      <div class="actions">
        <button class="btn primary" data-action="save-reminder">${state.reminders.some((item) => item.id === draftReminder.id) ? "Save changes" : "Save after review"}</button>
        ${state.reminders.some((item) => item.id === draftReminder.id) ? `<button class="btn warn" data-action="delete-reminder" data-id="${draftReminder.id}">Delete reminder</button>` : ""}
      </div>
    </div>
  </div></div>`;
}

function parseReminder(text) {
  const lower = text.toLowerCase();
  const type = lower.includes("bring") ? "Bring" : lower.includes("test") ? "Test" : lower.includes("project") ? "Project Task" : lower.includes("presentation") ? "Assignment" : "Homework";
  const subjects = Object.keys(state.materials);
  const subject = subjects.find((s) => lower.includes(s.toLowerCase())) || "General";
  const due = lower.includes("tomorrow") ? "Tomorrow" : lower.includes("friday") ? "Friday" : lower.includes("monday") ? "Monday" : "Soon";
  const title = text.split(" due ")[0].replace(/^bring /i, "").trim() || "New reminder";
  return { id: `r${Date.now()}`, type, subject, title: title[0].toUpperCase() + title.slice(1), due, status: "review", recurring: lower.includes("every") };
}

function bind() {
  document.querySelectorAll("[data-view]").forEach((el) => el.addEventListener("click", () => show(el.dataset.view)));
  document.querySelectorAll("[data-mode]").forEach((el) => el.addEventListener("click", () => setState({ dashboardMode: el.dataset.mode })));
  document.querySelectorAll("[data-section]").forEach((el) => el.addEventListener("change", () => {
    const next = el.checked ? [...state.dashboardSections, el.dataset.section] : state.dashboardSections.filter((s) => s !== el.dataset.section);
    setState({ dashboardSections: next.length ? next : ["recent"] });
  }));
  document.querySelectorAll("[data-action]").forEach((el) => el.addEventListener("click", () => handle(el.dataset.action, el.dataset.id)));
  document.querySelector("#timetablePhotoInput")?.addEventListener("change", handleTimetablePhoto);
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Could not read that image."));
    reader.readAsDataURL(file);
  });
}

async function handleTimetablePhoto(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  state.timetableUpload = { status: "loading", error: "", result: null, fileName: file.name };
  save();
  render();
  try {
    const image = await readFileAsDataUrl(file);
    const result = await extractTimetableWithAi(image);
    state.timetableUpload = { status: "ready", error: "", result, fileName: file.name };
  } catch (error) {
    state.timetableUpload = { status: "error", error: error.message || "Real AI timetable extraction failed.", result: null, fileName: file.name };
  }
  save();
  render();
}

async function handle(action, id) {
  if (action === "finish-onboarding") setState({ onboarded: true, view: "dashboard" });
  if (action === "choose-timetable-photo") document.querySelector("#timetablePhotoInput")?.click();
  if (action === "apply-timetable-photo") {
    const result = state.timetableUpload?.result;
    if (!result) return;
    const nextId = `photo-${Date.now()}`;
    state.timetables = state.timetables.map((item) => ({ ...item, active: false }));
    state.timetables = [{ id: nextId, name: result.name || "Photo timetable", active: true, classes: result.classes }, ...state.timetables];
    const nextMaterials = { ...state.materials };
    Object.entries(result.materials || {}).forEach(([subject, items]) => {
      nextMaterials[titleCase(subject)] = normalizeMaterials([...(nextMaterials[titleCase(subject)] || []), ...(items || [])]);
    });
    state.materials = nextMaterials;
    state.timetableUpload = { status: "idle", error: "", result: null, fileName: "" };
    save();
    render();
  }
  if (action === "activate-timetable") {
    state.timetables = state.timetables.map((t) => ({ ...t, active: t.id === id }));
    save();
    render();
  }
  if (action === "add-class") {
    show("timetable");
  }
  if (action === "save-class-inline") {
    const active = state.timetables.find((t) => t.active) || state.timetables[0];
    const cleanSubject = titleCase(document.querySelector("#classSubject")?.value || "");
    if (!cleanSubject) return;
    const day = document.querySelector("#classDay")?.value || "Mon";
    const period = document.querySelector("#classPeriod")?.value || "1";
    const time = document.querySelector("#classTime")?.value || "";
    active.classes.push({ day, period, subject: cleanSubject, time, color: "#3157d5" });
    active.classes.sort((a, b) => a.day.localeCompare(b.day) || periodNumber(a.period) - periodNumber(b.period));
    state.materials[cleanSubject] = state.materials[cleanSubject] || ["Notebook"];
    save();
    render();
  }
  if (action === "suggest-materials") {
    state.materials.Library = normalizeMaterials(state.materials.Library || ["library card", "borrowed book"]);
    state.materials.Geography = normalizeMaterials(state.materials.Geography || ["atlas", "notebook"]);
    save();
    render();
  }
  if (action === "add-material") {
    const input = document.getElementById(`mat-${encodeURIComponent(id)}`);
    const next = titleCase(input?.value || "");
    if (!next) return;
    state.materials[id] = normalizeMaterials([...(state.materials[id] || []), next]);
    save();
    render();
  }
  if (action === "delete-material") {
    const [subject, material] = id.split(":");
    state.materials[subject] = normalizeMaterials((state.materials[subject] || []).filter((item) => titleCase(item) !== titleCase(material)));
    if (!state.materials[subject].length) delete state.materials[subject];
    save();
    render();
  }
  if (action === "delete-subject-materials") {
    delete state.materials[id];
    save();
    render();
  }
  if (action === "new-reminder") {
    draftReminder = parseReminder("math worksheet due tomorrow");
    render();
  }
  if (action === "edit-reminder") {
    draftReminder = structuredClone(state.reminders.find((reminder) => reminder.id === id));
    render();
  }
  if (action === "parse-reminder") {
    draftReminder = parseReminder(document.querySelector("#nlReminder")?.value || "");
    render();
  }
  if (action === "close-modal") {
    draftReminder = null;
    render();
  }
  if (action === "save-reminder") {
    const reminder = {
      id: draftReminder.id,
      title: document.querySelector("#draftTitle").value,
      type: document.querySelector("#draftType").value,
      subject: document.querySelector("#draftSubject").value,
      due: document.querySelector("#draftDue").value,
      recurring: document.querySelector("#draftRecurring").checked,
      status: "saved"
    };
    state.reminders = state.reminders.some((item) => item.id === reminder.id)
      ? state.reminders.map((item) => item.id === reminder.id ? reminder : item)
      : [reminder, ...state.reminders];
    draftReminder = null;
    save();
    render();
  }
  if (action === "delete-reminder") {
    state.reminders = state.reminders.filter((reminder) => reminder.id !== id);
    draftReminder = null;
    save();
    render();
  }
  if (action === "add-book") {
    const title = prompt("Book title", "New library book");
    if (title) {
      state.library = [{ id: `b${Date.now()}`, title, author: "", due: "In 7 days", status: "Borrowed" }, ...state.library];
      save();
      render();
    }
  }
  if (action === "return-book") {
    state.library = state.library.filter((b) => b.id !== id);
    save();
    render();
  }
  if (action === "renew-book") {
    state.library = state.library.map((b) => b.id === id ? { ...b, due: "Renewed for 7 days", status: "Borrowed" } : b);
    save();
    render();
  }
  if (action === "create-group") {
    const name = prompt("Group name", "My class group");
    if (name) {
      const code = name.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 5) || "GROUP";
      state.groups = [{
        id: `g${Date.now()}`,
        name,
        code,
        members: 1,
        confirmers: ["You", "Waiting for member"],
        thirdConfirmer: "Chosen when enough members join",
        pending: 0,
        unread: 0,
        tutorialDone: false,
        pendingEdits: []
      }, ...state.groups];
      save();
      render();
    }
  }
  if (action === "new-project") {
    const title = prompt("Project title", "New assignment");
    if (title) {
      const kind = (prompt("Type PPTX or DOCX", "PPTX") || "PPTX").toUpperCase() === "DOCX" ? "DOCX" : "PPTX";
      state.assignments = [{
        id: `a${Date.now()}`,
        title,
        kind,
        lead: "You",
        feedback: "Balanced",
        sections: [
          { name: kind === "PPTX" ? "Slide 1" : "Introduction", owner: "You", status: "To do", comments: 0, suggestions: 0 }
        ]
      }, ...state.assignments];
      save();
      render();
    }
  }
  if (action === "generate-presentation") {
    const topic = (document.querySelector("#aiPresentationTopic")?.value || "").trim() || "Untitled presentation";
    const grade = (document.querySelector("#aiPresentationGrade")?.value || "").trim() || "student";
    const style = (document.querySelector("#aiPresentationStyle")?.value || "").trim() || "creative but school-ready";
    state.presentationAi = { topic, grade, style, status: "loading", error: "", plan: null };
    save();
    render();
    try {
      const plan = await generatePresentationWithAi(topic, grade, style);
      state.presentationAi = { topic, grade, style, status: "ready", error: "", plan };
    } catch (error) {
      state.presentationAi = { topic, grade, style, status: "error", error: error.message || "Real AI is unavailable.", plan: null };
    }
    save();
    render();
  }
  if (action === "paraphrase-submission") {
    const text = (document.querySelector("#paraphraseText")?.value || "").trim();
    const tone = (document.querySelector("#paraphraseTone")?.value || "").trim() || "clear student submission";
    if (!text) {
      state.paraphraseAi = { text, tone, status: "error", error: "Paste text before paraphrasing.", result: null };
      save();
      render();
      return;
    }
    state.paraphraseAi = { text, tone, status: "loading", error: "", result: null };
    save();
    render();
    try {
      const result = await paraphraseWithAi(text, tone);
      state.paraphraseAi = { text, tone, status: "ready", error: "", result };
    } catch (error) {
      state.paraphraseAi = { text, tone, status: "error", error: error.message || "Real AI is unavailable.", result: null };
    }
    save();
    render();
  }
  if (["approve-edit", "edit-pending", "reject-edit"].includes(action)) {
    const [groupId, editId] = id.split(":");
    state.groups = state.groups.map((group) => {
      if (group.id !== groupId) return group;
      const pendingEdits = (group.pendingEdits || []).map((edit) => {
        if (edit.id !== editId) return edit;
        if (action === "reject-edit") return { ...edit, status: "Rejected", rejects: [...edit.rejects, state.user.name] };
        const title = action === "edit-pending" ? prompt("Clean up title before approving", edit.title) || edit.title : edit.title;
        return { ...edit, title, status: "Approved", approvals: [...edit.approvals, state.user.name] };
      });
      return { ...group, pendingEdits, pending: pendingEdits.filter((edit) => !["Approved", "Rejected"].includes(edit.status)).length };
    });
    save();
    render();
  }
  if (action === "accept-contact") {
    state.contacts = state.contacts.map((contact) => contact.id === id ? { ...contact, status: "Accepted", chat: "Private chat is now available." } : contact);
    save();
    render();
  }
  if (action === "open-private") alert("Private chat opens only for accepted contacts. Messages are named, text-only, and have no read receipts.");
  if (["add-comment", "suggest-edit", "reassign-section"].includes(action)) {
    const [assignmentId, sectionName] = id.split(":");
    state.assignments = state.assignments.map((assignment) => {
      if (assignment.id !== assignmentId) return assignment;
      return {
        ...assignment,
        sections: assignment.sections.map((section) => {
          if (section.name !== sectionName) return section;
          if (action === "add-comment") return { ...section, comments: section.comments + 1 };
          if (action === "suggest-edit") return { ...section, suggestions: section.suggestions + 1 };
          return { ...section, owner: prompt("Reassign to", section.owner) || section.owner };
        })
      };
    });
    save();
    render();
  }
  if (action === "ai-split") alert("Real AI task splitting needs an assignment AI endpoint before this can run.");
  if (action === "review-assignment") alert("Real AI review needs an assignment AI endpoint before this can run.");
  if (action === "export-assignment") alert("Prototype export placeholder. Real build will generate editable PPTX or DOCX files from structured sections.");
  if (action === "start-game") {
    const subject = normalizeSubject(document.querySelector("#gameSubject")?.value || state.games.subject);
    state.games = { ...state.games, subject, status: "loading", lastResult: "Generating with AI..." };
    save();
    render();
    try {
      const generated = await generateGameWithAi(subject);
      state.games = {
        subject: generated.subject,
        status: "playing",
        source: generated.source,
        questions: generated.questions,
        current: 0,
        score: 0,
        lives: 3,
        streak: 0,
        bestStreak: 0,
        lastResult: "OpenAI generated this quest."
      };
    } catch (error) {
      state.games = {
        ...structuredClone(seed.games),
        subject,
        status: "error",
        error: error.message || "Real AI is unavailable."
      };
    }
    save();
    render();
  }
  if (action === "answer-game") {
    resolveGameAnswer(id);
    save();
    render();
  }
  if (action === "submit-typed-answer") {
    resolveGameAnswer(document.querySelector("#typedGameAnswer")?.value || "");
    save();
    render();
  }
  if (action === "reset-game") {
    state.games = structuredClone(seed.games);
    save();
    render();
  }
  if (action === "group-tutorial") alert("Group tutorial: shared reminders are anonymous to classmates, two weekly confirmers review changes, pending reminders stay visible, and urgent edits auto-activate after the timer unless rejected.");
  if (action === "join-group") alert("Join by invite link or one active group code. No public group search.");
  if (action === "customize") show("settings");
  if (action === "test-notification") testNotification();
  if (action === "reset") {
    localStorage.removeItem(STORAGE_KEY);
    state = structuredClone(seed);
    draftReminder = null;
    render();
  }
}

async function testNotification() {
  if (!("Notification" in window)) {
    alert("This browser does not support notifications.");
    return;
  }
  const permission = Notification.permission === "granted" ? "granted" : await Notification.requestPermission();
  if (permission === "granted") {
    new Notification("ClassMate test", { body: "Tomorrow: Math, Science Lab, and Art. Pack your materials." });
  } else {
    alert("Notification permission was not granted.");
  }
}

render();
