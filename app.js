// ═══════════════════════════════════════════
// DATA STORE
// ═══════════════════════════════════════════
const DB = {
  // Pre-seeded users for demo
  users: [
    { id: 1, role: 'student', scholar: '0201CS211234', email: 'test@stu.manit.in',
      password: 'student123', fname: 'Himanshu', lname: 'Jangid',
      dept: 'CSE', sem: '4th Semester' },
    { id: 2, role: 'faculty', empid: 'FAC2024001', email: 'faculty@manit.in',
      password: 'faculty123', fname: 'Dr. Pankaj', lname: 'Sharma',
      dept: 'CSE', designation: 'Associate Professor' }
  ],
  faculty: [
    { id: 1, name: 'Dr. Pankaj Sharma', dept: 'CSE', subject: 'Data Structures', code: 'CS301', color: '#1c3fa8' },
    { id: 2, name: 'Prof. Sunita Gupta', dept: 'CSE', subject: 'Operating Systems', code: 'CS302', color: '#7c3aed' },
    { id: 3, name: 'Dr. Amit Pathak', dept: 'CSE', subject: 'DBMS', code: 'CS303', color: '#059669' },
    { id: 4, name: 'Prof. Neha Tiwari', dept: 'CSE', subject: 'Computer Networks', code: 'CS304', color: '#dc2626' },
    { id: 5, name: 'Dr. Rakesh Kumar', dept: 'CSE', subject: 'Theory of Computation', code: 'CS305', color: '#d97706' },
    { id: 6, name: 'Prof. Priya Singh', dept: 'CSE', subject: 'Software Engineering', code: 'CS306', color: '#0891b2' },
  ],
  questions: [
    'How well does the faculty explain concepts clearly?',
    'Is the faculty punctual and regular for classes?',
    'Does the faculty encourage student participation?',
    'How accessible is the faculty outside class hours?',
    'How effective are the teaching methods used?',
    'How would you rate the course content coverage?',
    'Does the faculty provide helpful feedback on assignments?',
    'Overall satisfaction with the faculty?',
  ],
  feedbacks: [
    { id: 1, studentId: 1, facultyId: 3, facultyName: 'Dr. Amit Pathak', subject: 'DBMS',
      semester: '4th Semester', ratings: [4,5,4,3,5,4,4,4], comment: 'Very detailed explanations.',
      date: '2025-01-10', status: 'Submitted' },
    { id: 2, studentId: 1, facultyId: 6, facultyName: 'Prof. Priya Singh', subject: 'Software Engineering',
      semester: '4th Semester', ratings: [5,5,5,4,5,5,5,5], comment: 'Best faculty!',
      date: '2025-01-08', status: 'Submitted' },
  ],
  facResults: [
    { facultyId: 1, avgRating: 4.3, totalResponses: 47, ratingDist: [2,3,8,18,16],
      comments: ['Great at explaining concepts!','Very approachable faculty','Could improve pacing'] },
    { facultyId: 2, avgRating: 3.8, totalResponses: 39, ratingDist: [1,5,14,13,6],
      comments: ['Good knowledge but needs patience','Excellent command over subject'] },
    { facultyId: 3, avgRating: 4.7, totalResponses: 52, ratingDist: [0,1,4,12,35],
      comments: ['The best DBMS teacher!','Makes complex topics simple'] },
  ],
  schedule: [
    { period: 'Mid-Semester Feedback', start: '2025-01-01', end: '2025-01-20', status: 'active' },
    { period: 'End-Semester Feedback', start: '2025-04-01', end: '2025-04-20', status: 'upcoming' },
  ]
};

let currentUser = null;
let currentStep = 1;
let selectedFacultyId = null;
let ratings = {};
let currentRole = 'student';

// ═══════════════════════════════════════════
// AUTH FUNCTIONS
// ═══════════════════════════════════════════
function switchRole(role, btn) {
  currentRole = role;
  document.querySelectorAll('.role-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');

  const isStudent = role === 'student';

  // Update Sign In labels
  document.getElementById('signin-title').textContent = isStudent ? 'Student Sign In' : 'Faculty Sign In';
  document.getElementById('signin-desc').textContent = isStudent
    ? 'Log in with your scholar number and password'
    : 'Log in with your Employee ID and password';
  document.getElementById('signin-id-label').textContent = isStudent ? 'Scholar Number' : 'Employee ID';
  document.getElementById('signin-id').placeholder = isStudent ? 'e.g. 0201CS211234' : 'e.g. FAC2024001';
  document.getElementById('signup-title').textContent = isStudent ? 'Create Account' : 'Faculty Registration';

  // Toggle signup fields
  document.getElementById('su-scholar-group').style.display = isStudent ? 'block' : 'none';
  document.getElementById('su-dept-group').style.display = isStudent ? 'block' : 'none';
  document.getElementById('su-sem-group').style.display = isStudent ? 'block' : 'none';
  document.getElementById('su-empid-group').style.display = isStudent ? 'none' : 'block';

  // Faculty can't sign up from student tab
  document.getElementById('tab-signup').style.display = role === 'faculty' ? 'none' : '';
}

function switchTab(tab) {
  const signin = document.getElementById('form-signin');
  const signup = document.getElementById('form-signup');
  const ts = document.getElementById('tab-signin');
  const tsu = document.getElementById('tab-signup');

  if (tab === 'signin') {
    signin.style.display = 'block';
    signup.style.display = 'none';
    ts.classList.add('active');
    tsu.classList.remove('active');
  } else {
    signin.style.display = 'none';
    signup.style.display = 'block';
    ts.classList.remove('active');
    tsu.classList.add('active');
  }
}

function handleSignIn() {
  const id = document.getElementById('signin-id').value.trim();
  const pwd = document.getElementById('signin-pwd').value.trim();

  let valid = true;
  if (!id) { showError('err-signin-id', 'signin-id'); valid = false; }
  else hideError('err-signin-id', 'signin-id');
  if (!pwd) { showError('err-signin-pwd', 'signin-pwd'); valid = false; }
  else hideError('err-signin-pwd', 'signin-pwd');
  if (!valid) return;

  // Find user
  let user = null;
  if (currentRole === 'student') {
    user = DB.users.find(u => u.role === 'student' && (u.scholar === id || u.email === id) && u.password === pwd);
  } else {
    user = DB.users.find(u => u.role === 'faculty' && (u.empid === id || u.email === id) && u.password === pwd);
  }

  if (!user) {
    showToast('Invalid credentials. Try: student→0201CS211234/student123, faculty→FAC2024001/faculty123', 'error');
    return;
  }

  currentUser = user;
  loadDashboard();
}

function handleSignUp() {
  const fname = document.getElementById('su-fname').value.trim();
  const lname = document.getElementById('su-lname').value.trim();
  const email = document.getElementById('su-email').value.trim();
  const pwd = document.getElementById('su-pwd').value.trim();
  const cpwd = document.getElementById('su-cpwd').value.trim();
  const scholar = document.getElementById('su-scholar').value.trim();
  const dept = document.getElementById('su-dept').value;
  const sem = document.getElementById('su-sem').value;

  let valid = true;
  if (!fname) { showError('err-su-fname'); valid = false; } else hideError('err-su-fname');
  if (!lname) { showError('err-su-lname'); valid = false; } else hideError('err-su-lname');
  if (!scholar && currentRole === 'student') { showError('err-su-scholar'); valid = false; } else hideError('err-su-scholar');
  if (!dept && currentRole === 'student') { showError('err-su-dept'); valid = false; } else hideError('err-su-dept');
  if (!sem && currentRole === 'student') { showError('err-su-sem'); valid = false; } else hideError('err-su-sem');
  if (!email || !email.includes('@')) { showError('err-su-email'); valid = false; } else hideError('err-su-email');
  if (!pwd || pwd.length < 6) { showError('err-su-pwd'); valid = false; } else hideError('err-su-pwd');
  if (pwd !== cpwd) { showError('err-su-cpwd'); valid = false; } else hideError('err-su-cpwd');
  if (!valid) return;

  const newUser = {
    id: DB.users.length + 1,
    role: 'student',
    scholar, email, password: pwd, fname, lname, dept, sem
  };
  DB.users.push(newUser);
  currentUser = newUser;
  showToast('Account created successfully! Welcome!', 'success');
  setTimeout(loadDashboard, 600);
}

function handleLogout() {
  currentUser = null;
  showScreen('screen-auth');
  switchTab('signin');
  document.getElementById('signin-id').value = '';
  document.getElementById('signin-pwd').value = '';
}

// ═══════════════════════════════════════════
// DASHBOARD LOADING
// ═══════════════════════════════════════════
function loadDashboard() {
  showScreen('screen-dashboard');

  const u = currentUser;
  const isStudent = u.role === 'student';

  // Sidebar user info
  document.getElementById('sidebarName').textContent = `${u.fname} ${u.lname}`;
  document.getElementById('sidebarRole').textContent = isStudent
    ? `Student • ${u.dept} ${u.sem}` : `Faculty • ${u.dept}`;
  document.getElementById('sidebarAvatar').textContent = `${u.fname[0]}${u.lname[0]}`;
  document.getElementById('sidebarAvatar').className = `user-avatar ${isStudent ? 'avatar-student' : 'avatar-faculty'}`;

  // Topbar
  document.getElementById('topbarName').textContent = u.fname;
  document.getElementById('topbarSem').textContent = isStudent ? `📚 ${u.sem}` : `📚 ${u.dept}`;

  // Show correct nav
  document.getElementById('nav-student').style.display = isStudent ? 'block' : 'none';
  document.getElementById('nav-faculty').style.display = isStudent ? 'none' : 'block';

  // Home content
  document.getElementById('home-student').style.display = isStudent ? 'block' : 'none';
  document.getElementById('home-faculty').style.display = isStudent ? 'none' : 'block';

  if (isStudent) loadStudentHome();
  else loadFacultyHome();

  loadHistory();
  loadFacultySelectGrid();
  loadSchedule();
  loadProfile();
  if (!isStudent) { loadResults(); loadDeptResults(); }
  showPage('page-home');
}

function loadStudentHome() {
  // Faculty pending feed
  const pending = DB.faculty.slice(0, 3);
  const feedEl = document.getElementById('facultyFeedList');
  feedEl.innerHTML = pending.map(f => {
    const submitted = DB.feedbacks.find(fb => fb.facultyId === f.id && fb.studentId === currentUser.id);
    return `<div class="faculty-feed-item" onclick="goToSubmitFor(${f.id})">
      <div class="fac-avatar" style="background:${f.color}">${f.name.split(' ').map(w=>w[0]).slice(0,2).join('')}</div>
      <div class="fac-info">
        <div class="fac-name">${f.name}</div>
        <div class="fac-dept">${f.subject} — ${f.code}</div>
      </div>
      <div class="fac-rating">
        ${submitted
          ? `<span class="badge badge-success">✓ Done</span>`
          : `<span class="badge badge-warn">Pending</span>`}
      </div>
    </div>`;
  }).join('');

  // Activity
  const actEl = document.getElementById('activityList');
  const acts = [
    { text: '<strong>Feedback submitted</strong> for Prof. Priya Singh', time: '2 days ago' },
    { text: '<strong>Feedback submitted</strong> for Dr. Amit Pathak', time: '4 days ago' },
    { text: '<strong>Account created</strong> successfully', time: '1 week ago' },
  ];
  actEl.innerHTML = acts.map(a => `<div class="activity-item">
    <div class="activity-dot"></div>
    <div>
      <div class="activity-text">${a.text}</div>
      <div class="activity-time">${a.time}</div>
    </div>
  </div>`).join('');
}

function loadFacultyHome() {
  // Performance chart
  const subjects = ['DS', 'Algo', 'OS'];
  const scores = [4.3, 3.9, 4.6];
  const perfEl = document.getElementById('perf-chart');
  perfEl.innerHTML = subjects.map((s,i) => `
    <div style="margin-bottom:18px">
      <div style="display:flex;justify-content:space-between;font-size:0.85rem;color:var(--text-mid);margin-bottom:6px">
        <span><strong>${s}</strong></span><span class="font-mono">${scores[i]}/5.0</span>
      </div>
      <div class="mini-bar"><div class="mini-bar-fill" style="width:${scores[i]/5*100}%"></div></div>
      <div style="display:flex;gap:2px;margin-top:4px">${starsHTML(scores[i])}</div>
    </div>
  `).join('');

  const comments = ['Excellent teaching methodology!','Very patient with students','Could add more real-world examples'];
  const cmtEl = document.getElementById('recentComments');
  cmtEl.innerHTML = comments.map(c => `
    <div style="padding:12px;background:var(--surface2);border-radius:8px;margin-bottom:10px;font-size:0.85rem;color:var(--text-mid);border-left:3px solid var(--royal)">
      "${c}"
    </div>
  `).join('');
}

// ═══════════════════════════════════════════
// FEEDBACK WIZARD
// ═══════════════════════════════════════════
function loadFacultySelectGrid() {
  const grid = document.getElementById('facultySelectGrid');
  grid.innerHTML = DB.faculty.map(f => {
    const done = DB.feedbacks.find(fb => fb.facultyId === f.id && fb.studentId === (currentUser?.id||1));
    return `<div class="faculty-card ${done ? 'opacity-50' : ''}" id="fcard-${f.id}" onclick="selectFaculty(${f.id})">
      <div class="fac-avatar" style="background:${f.color}">${f.name.split(' ').map(w=>w[0]).slice(0,2).join('')}</div>
      <div class="faculty-card-info">
        <h3>${f.name}</h3>
        <p>${f.dept}</p>
        <span class="sub-code">${f.code} — ${f.subject}</span>
        ${done ? '<br><span class="badge badge-success" style="margin-top:6px">✓ Submitted</span>' : ''}
      </div>
    </div>`;
  }).join('');
}

function goToSubmitFor(facultyId) {
  showPage('page-submit');
  selectedFacultyId = facultyId;
  document.querySelectorAll('.faculty-card').forEach(c => c.classList.remove('selected'));
  const card = document.getElementById(`fcard-${facultyId}`);
  if (card) card.classList.add('selected');
  goToStep(1);
}

function selectFaculty(id) {
  selectedFacultyId = id;
  document.querySelectorAll('.faculty-card').forEach(c => c.classList.remove('selected'));
  document.getElementById(`fcard-${id}`).classList.add('selected');
}

function goToStep(step) {
  if (step === 2) {
    if (!selectedFacultyId) { showToast('Please select a faculty member first.', 'error'); return; }
    // Build rating questions
    const qList = document.getElementById('questionsList');
    qList.innerHTML = DB.questions.map((q, i) => `
      <div class="question-item">
        <div class="question-text">Q${i+1}. ${q}</div>
        <div class="rating-row">
          ${[1,2,3,4,5].map(v => `<button class="rating-btn ${ratings[i]===v?'selected':''}"
            onclick="setRating(${i},${v},this)">${v}</button>`).join('')}
        </div>
        <div class="rating-labels">
          <span class="rating-label">Poor</span>
          <span class="rating-label">Excellent</span>
        </div>
      </div>
    `).join('');
  }

  if (step === 3) {
    // Validate all rated
    const missing = DB.questions.findIndex((_, i) => !ratings[i]);
    if (missing !== -1) { showToast('Please rate all questions before continuing.', 'error'); return; }
    if (!document.getElementById('consentCheck').checked) {
      showToast('Please accept the consent statement.', 'error'); return;
    }
    buildSummary();
  }

  currentStep = step;
  document.querySelectorAll('.feedback-step').forEach((s, i) => {
    s.classList.toggle('active', i === step - 1);
  });
  // Update wizard indicators
  [1,2,3].forEach(i => {
    const ws = document.getElementById(`ws-${i}`);
    ws.classList.remove('active','done');
    if (i < step) ws.classList.add('done');
    else if (i === step) ws.classList.add('active');
  });
}

function setRating(qIdx, val, btn) {
  ratings[qIdx] = val;
  const parent = btn.closest('.question-item');
  parent.querySelectorAll('.rating-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
}

function toggleConsent() {
  const cb = document.getElementById('consentCheck');
  cb.checked = !cb.checked;
}

function buildSummary() {
  const fac = DB.faculty.find(f => f.id === selectedFacultyId);
  const avg = (Object.values(ratings).reduce((a,b)=>a+b,0) / DB.questions.length).toFixed(1);
  const comment = document.getElementById('feedbackComment').value;

  document.getElementById('feedbackSummary').innerHTML = `
    <h3>Feedback Summary</h3>
    <div class="summary-faculty">
      <div class="fac-avatar" style="background:${fac.color}">${fac.name.split(' ').map(w=>w[0]).slice(0,2).join('')}</div>
      <div>
        <div class="fac-name">${fac.name}</div>
        <div class="fac-dept">${fac.subject} — ${fac.code}</div>
      </div>
      <div style="margin-left:auto;text-align:right">
        <div class="big-rating-num">${avg}</div>
        <div style="display:flex;gap:2px;justify-content:flex-end">${starsHTML(parseFloat(avg))}</div>
      </div>
    </div>
    <div class="summary-ratings">
      ${DB.questions.map((q, i) => `
        <div class="summary-rating-row">
          <div class="q-short">${q.substring(0,40)}...</div>
          <div class="progress-bar-wrap"><div class="progress-bar-fill" style="width:${ratings[i]/5*100}%"></div></div>
          <div class="q-val">${ratings[i]}/5</div>
        </div>
      `).join('')}
    </div>
    ${comment ? `<div style="margin-top:16px;padding:12px;background:var(--surface2);border-radius:8px;font-size:0.85rem;color:var(--text-mid)">
      <strong>Comment:</strong> ${comment}
    </div>` : ''}
  `;
}

function submitFeedback() {
  const fac = DB.faculty.find(f => f.id === selectedFacultyId);
  const newFeedback = {
    id: DB.feedbacks.length + 1,
    studentId: currentUser.id,
    facultyId: selectedFacultyId,
    facultyName: fac.name,
    subject: fac.subject,
    semester: currentUser.sem,
    ratings: Object.values(ratings),
    comment: document.getElementById('feedbackComment').value,
    date: new Date().toISOString().split('T')[0],
    status: 'Submitted'
  };
  DB.feedbacks.push(newFeedback);

  // Update pending badge
  const pending = DB.faculty.filter(f =>
    !DB.feedbacks.find(fb => fb.facultyId === f.id && fb.studentId === currentUser.id)
  ).length;
  document.getElementById('pendingBadge').textContent = pending;

  // Show success step
  document.querySelectorAll('.feedback-step').forEach(s => s.classList.remove('active'));
  document.getElementById('step-success').classList.add('active');
  loadStudentHome();
  loadHistory();
  showToast('Feedback submitted successfully!', 'success');
}

function resetFeedback() {
  ratings = {};
  selectedFacultyId = null;
  document.getElementById('feedbackComment').value = '';
  document.getElementById('consentCheck').checked = false;
  document.querySelectorAll('.faculty-card').forEach(c => c.classList.remove('selected'));
  loadFacultySelectGrid();
  goToStep(1);
  document.querySelectorAll('.feedback-step').forEach((s, i) => {
    s.classList.toggle('active', i === 0);
  });
  currentStep = 1;
  [1,2,3].forEach(i => {
    const ws = document.getElementById(`ws-${i}`);
    ws.classList.remove('active','done');
    if (i === 1) ws.classList.add('active');
  });
}

// ═══════════════════════════════════════════
// HISTORY
// ═══════════════════════════════════════════
function loadHistory() {
  const tbody = document.getElementById('historyBody');
  const userFeedbacks = DB.feedbacks.filter(fb => fb.studentId === (currentUser?.id||1));
  if (!userFeedbacks.length) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:30px;color:var(--text-light)">No feedback submitted yet.</td></tr>`;
    return;
  }
  tbody.innerHTML = userFeedbacks.map((fb, i) => {
    const avg = (fb.ratings.reduce((a,b)=>a+b,0)/fb.ratings.length).toFixed(1);
    return `<tr>
      <td class="font-mono">#${i+1}</td>
      <td><strong style="color:var(--navy)">${fb.facultyName}</strong></td>
      <td>${fb.subject}</td>
      <td>${fb.semester}</td>
      <td><div style="display:flex;align-items:center;gap:6px">${starsHTML(parseFloat(avg))}<span class="font-mono">${avg}</span></div></td>
      <td>${fb.date}</td>
      <td><span class="badge badge-success">${fb.status}</span></td>
    </tr>`;
  }).join('');
}

// ═══════════════════════════════════════════
// SCHEDULE
// ═══════════════════════════════════════════
function loadSchedule() {
  document.getElementById('scheduleContent').innerHTML = DB.schedule.map(s => `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:18px;background:var(--surface2);border-radius:var(--radius);margin-bottom:12px;border:1px solid var(--border)">
      <div>
        <div style="font-weight:600;color:var(--navy);margin-bottom:4px">${s.period}</div>
        <div style="font-size:0.82rem;color:var(--text-light)">${s.start} to ${s.end}</div>
      </div>
      <span class="badge ${s.status==='active'?'badge-success':'badge-info'}">${s.status==='active'?'🟢 Active':'⏳ Upcoming'}</span>
    </div>
  `).join('');
}

// ═══════════════════════════════════════════
// FACULTY RESULTS
// ═══════════════════════════════════════════
function loadResults() {
  const grid = document.getElementById('resultsGrid');
  grid.innerHTML = DB.facResults.map(r => {
    const fac = DB.faculty.find(f => f.id === r.facultyId);
    return `<div class="result-card" onclick="showDetail(${r.facultyId})">
      <div class="rc-header">
        <div class="fac-avatar" style="background:${fac.color};border-radius:12px">${fac.name.split(' ').map(w=>w[0]).slice(0,2).join('')}</div>
        <div>
          <h3>${fac.name}</h3>
          <div class="rc-dept">${fac.dept}</div>
          <span class="rc-subject">${fac.code} — ${fac.subject}</span>
        </div>
      </div>
      <div class="big-rating">
        <div class="big-rating-num">${r.avgRating}</div>
        <div class="big-rating-stars">
          <div style="display:flex;gap:2px">${starsHTML(r.avgRating)}</div>
          <div class="rating-out-of">out of 5.0</div>
        </div>
      </div>
      <div class="mini-bar"><div class="mini-bar-fill" style="width:${r.avgRating/5*100}%"></div></div>
      <div class="responses-count">📬 ${r.totalResponses} responses</div>
    </div>`;
  }).join('');
}

function showDetail(facultyId) {
  const r = DB.facResults.find(fr => fr.facultyId === facultyId);
  const fac = DB.faculty.find(f => f.id === facultyId);
  const card = document.getElementById('detailCard');
  const total = r.ratingDist.reduce((a,b)=>a+b,0);

  card.style.display = 'block';
  document.getElementById('detailContent').innerHTML = `
    <div class="card-header">
      <div>
        <div class="card-title">Detailed Report — ${fac.name}</div>
        <div class="card-subtitle">${fac.subject} | ${r.totalResponses} responses</div>
      </div>
    </div>
    <div class="chart-section">
      <div style="font-size:0.78rem;color:var(--text-light);text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;font-weight:600">Rating Distribution</div>
      ${r.ratingDist.map((count, i) => {
        const pct = total > 0 ? Math.round(count/total*100) : 0;
        return `<div class="chart-row">
          <label>${5-i}★</label>
          <div class="chart-bar"><div class="chart-bar-fill" style="width:${pct}%">${pct>10?pct+'%':''}</div></div>
          <div class="chart-count">${count}</div>
        </div>`;
      }).reverse().map((h,i,a) => a[a.length-1-i]).join('')}
    </div>
    <div style="margin-top:20px">
      <div style="font-size:0.78rem;color:var(--text-light);text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;font-weight:600">Sample Comments</div>
      ${r.comments.map(c => `<div style="padding:12px;background:var(--surface2);border-radius:8px;margin-bottom:8px;font-size:0.85rem;color:var(--text-mid);border-left:3px solid var(--royal)">"${c}"</div>`).join('')}
    </div>
  `;
  card.scrollIntoView({ behavior: 'smooth' });
}

// ═══════════════════════════════════════════
// DEPT RESULTS
// ═══════════════════════════════════════════
function loadDeptResults() {
  document.getElementById('deptResultsContent').innerHTML = `
    <table class="history-table">
      <thead>
        <tr><th>Rank</th><th>Faculty Name</th><th>Subject</th><th>Avg Rating</th><th>Responses</th><th>Action</th></tr>
      </thead>
      <tbody>
        ${DB.facResults.sort((a,b)=>b.avgRating-a.avgRating).map((r,i) => {
          const fac = DB.faculty.find(f=>f.id===r.facultyId);
          return `<tr>
            <td><strong>${i===0?'🥇':i===1?'🥈':i===2?'🥉':'#'+(i+1)}</strong></td>
            <td><strong style="color:var(--navy)">${fac.name}</strong></td>
            <td>${fac.subject}</td>
            <td>
              <div style="display:flex;align-items:center;gap:6px">
                ${starsHTML(r.avgRating)}
                <span class="font-mono">${r.avgRating}</span>
              </div>
            </td>
            <td>${r.totalResponses}</td>
            <td><button class="btn btn-primary btn-sm" onclick="showPage('page-results');showDetail(${r.facultyId})">View Details</button></td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>
  `;
}

// ═══════════════════════════════════════════
// PROFILE
// ═══════════════════════════════════════════
function loadProfile() {
  const u = currentUser;
  if (!u) return;
  const isStudent = u.role === 'student';

  document.getElementById('profileName').textContent = `${u.fname} ${u.lname}`;
  document.getElementById('profileEmail').textContent = u.email;
  document.getElementById('profileAvatar').textContent = `${u.fname[0]}${u.lname[0]}`;
  document.getElementById('profileDept').textContent = u.dept;
  if (isStudent) document.getElementById('profileSem').textContent = u.sem;

  const fields = isStudent
    ? [
        {label:'First Name', id:'p-fname', val:u.fname, type:'text'},
        {label:'Last Name', id:'p-lname', val:u.lname, type:'text'},
        {label:'Scholar Number', id:'p-scholar', val:u.scholar, type:'text'},
        {label:'College Email', id:'p-email', val:u.email, type:'email'},
        {label:'Department', id:'p-dept', val:u.dept, type:'text'},
        {label:'Semester', id:'p-sem', val:u.sem, type:'text'},
      ]
    : [
        {label:'First Name', id:'p-fname', val:u.fname, type:'text'},
        {label:'Last Name', id:'p-lname', val:u.lname, type:'text'},
        {label:'Employee ID', id:'p-empid', val:u.empid, type:'text'},
        {label:'College Email', id:'p-email', val:u.email, type:'email'},
        {label:'Department', id:'p-dept', val:u.dept, type:'text'},
        {label:'Designation', id:'p-desig', val:u.designation||'', type:'text'},
      ];

  document.getElementById('profileFormGrid').innerHTML = fields.map(f => `
    <div class="form-group">
      <label>${f.label}</label>
      <input type="${f.type}" id="${f.id}" value="${f.val||''}">
    </div>
  `).join('') + `<div></div><div class="flex-end" style="grid-column:1/-1">
    <button class="btn btn-primary btn-sm" onclick="saveProfile()">Save Changes</button>
  </div>`;
}

function saveProfile() {
  currentUser.fname = document.getElementById('p-fname').value;
  currentUser.lname = document.getElementById('p-lname').value;
  showToast('Profile updated successfully!', 'success');
  loadDashboard();
}

function updatePassword() {
  const cur = document.getElementById('cur-pwd').value;
  const np = document.getElementById('new-pwd').value;
  const cp = document.getElementById('new-cpwd').value;
  if (!cur) { showToast('Enter current password.', 'error'); return; }
  if (cur !== currentUser.password) { showToast('Current password is incorrect.', 'error'); return; }
  if (np.length < 6) { showToast('New password must be at least 6 characters.', 'error'); return; }
  if (np !== cp) { showToast('Passwords do not match.', 'error'); return; }
  currentUser.password = np;
  showToast('Password updated successfully!', 'success');
  document.getElementById('cur-pwd').value = '';
  document.getElementById('new-pwd').value = '';
  document.getElementById('new-cpwd').value = '';
}

// ═══════════════════════════════════════════
// MODAL
// ═══════════════════════════════════════════
function openForgotModal() {
  document.getElementById('forgotModal').classList.add('show');
}
function closeForgotModal() {
  document.getElementById('forgotModal').classList.remove('show');
}
function sendResetLink() {
  const email = document.getElementById('forgot-email').value;
  if (!email || !email.includes('@')) { showToast('Enter a valid email address.', 'error'); return; }
  closeForgotModal();
  showToast(`Reset link sent to ${email}`, 'success');
}

// ═══════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');

  // Update nav active state
  const titles = {
    'page-home': 'Dashboard',
    'page-submit': 'Submit Feedback',
    'page-history': 'My Submissions',
    'page-schedule': 'Feedback Schedule',
    'page-profile': 'My Profile',
    'page-results': 'Feedback Results',
    'page-dept-results': 'Department Results',
  };
  document.getElementById('topbarTitle').textContent = titles[id] || 'Dashboard';

  document.querySelectorAll('.nav-item').forEach(ni => {
    ni.classList.remove('active');
    const onclick = ni.getAttribute('onclick');
    if (onclick && onclick.includes(`'${id}'`)) ni.classList.add('active');
  });
}

function showError(errId, inputId) {
  document.getElementById(errId).classList.add('show');
  if (inputId) document.getElementById(inputId).classList.add('error');
}
function hideError(errId, inputId) {
  const el = document.getElementById(errId);
  if (el) el.classList.remove('show');
  if (inputId) { const inp = document.getElementById(inputId); if(inp) inp.classList.remove('error'); }
}

function showToast(msg, type = 'info') {
  const cont = document.getElementById('toastContainer');
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<span>${type==='success'?'✅':type==='error'?'❌':'ℹ️'}</span><span>${msg}</span>`;
  cont.appendChild(t);
  setTimeout(() => {
    t.classList.add('removing');
    setTimeout(() => t.remove(), 300);
  }, 3500);
}

function starsHTML(rating) {
  return [1,2,3,4,5].map(i => `<span class="star ${i <= Math.round(rating) ? 'on' : ''}">★</span>`).join('');
}

function updatePasswordStrength(pwd) {
  const fill = document.getElementById('pwdFill');
  const label = document.getElementById('pwdLabel');
  let score = 0;
  if (pwd.length >= 6) score++;
  if (pwd.length >= 10) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;

  const map = [
    {w:'0%', c:'var(--danger)', t:'Too short'},
    {w:'20%', c:'var(--danger)', t:'Very weak'},
    {w:'40%', c:'var(--warn)', t:'Weak'},
    {w:'65%', c:'var(--accent)', t:'Medium'},
    {w:'85%', c:'#65a30d', t:'Strong'},
    {w:'100%', c:'var(--success)', t:'Very strong'},
  ];
  const s = map[Math.min(score, 5)];
  fill.style.width = s.w;
  fill.style.background = s.c;
  label.textContent = `Password strength: ${s.t}`;
  label.style.color = s.c;
}

// Close modal on overlay click
document.getElementById('forgotModal').addEventListener('click', function(e) {
  if (e.target === this) closeForgotModal();
});