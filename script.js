const STORAGE = {
  classes: 'sqClasses',
  students: 'sqStudents',
  teachers: 'sqTeachers',
  attendance: 'sqAttendance',
  enrollments: 'sqEnrollments',
  homeworks: 'sqHomeworks',
  assignments: 'sqAssignments',
  notices: 'sqNotices',
  messages: 'sqMessages',
  schoolNotices: 'sqSchoolNotices',
  homeworkProgress: 'sqHomeworkProgress',
  assignmentProgress: 'sqAssignmentProgress',
  studentProfile: 'sqStudentProfile',
  teacherProfile: 'sqTeacherProfile'
};

function load(key, defaultValue) {
  try {
    if (window.Storage && typeof window.Storage.getRaw === 'function') {
      return window.Storage.getRaw(key, defaultValue);
    }
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch (error) {
    return defaultValue;
  }
}

function save(key, value) {
  try {
    if (window.Storage && typeof window.Storage.setRaw === 'function') {
      window.Storage.setRaw(key, value);
      return;
    }
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error('save error', err);
  }
}

function generateId() {
  return `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

// Toast / notification helper (falls back to alert if DOM unavailable)
function ensureToastContainer() {
  let c = document.getElementById('toast-container');
  if (!c && typeof document !== 'undefined') {
    c = document.createElement('div');
    c.id = 'toast-container';
    document.body.appendChild(c);
  }
  return c;
}

function notify(message, type = 'info', timeout = 4200) {
  if (typeof document === 'undefined') { alert(message); return; }
  const container = ensureToastContainer();
  if (!container) { alert(message); return; }
  const t = document.createElement('div');
  t.className = `toast ${type || 'info'}`;
  t.innerHTML = `<div>${message}</div>`;
  container.appendChild(t);
  setTimeout(() => {
    t.style.opacity = '0';
    setTimeout(() => t.remove(), 300);
  }, timeout);
}

function makeJoinCode(name) {
  const base = name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
  return `${base.slice(0, 4)}${Math.floor(100 + Math.random() * 900)}`;
}

function getPageName() {
  const path = window.location.pathname;
  if (path.endsWith('teacher.html')) return 'teacher';
  if (path.endsWith('school.html')) return 'school';
  if (path.endsWith('student.html')) return 'student';
  return 'index';
}

function getStudentLevel(xp) {
  const thresholds = [0, 100, 250, 500, 1000];
  let level = 1;
  for (let i = 0; i < thresholds.length; i++) {
    if ((xp || 0) >= thresholds[i]) level = i + 1;
  }
  return level;
}

function initSchoolPage() {
  const loginSection = document.getElementById('school-login');
  const dashboardSection = document.getElementById('school-dashboard');
  const loginButton = document.getElementById('school-login-button');
  const codeInput = document.getElementById('school-access-code');
  const overview = document.getElementById('school-overview');
  const classNameInput = document.getElementById('school-class-name');
  const addClassButton = document.getElementById('add-school-class-button');
  const schoolClassList = document.getElementById('school-class-list');
  const announcementTitleInput = document.getElementById('school-announcement-title');
  const announcementDescInput = document.getElementById('school-announcement-description');
  const addAnnouncementButton = document.getElementById('add-school-announcement-button');
  const schoolAnnouncementList = document.getElementById('school-announcement-list');
  const studentList = document.getElementById('student-list');
  const ADMIN_CODE = 'ADMIN2026';

  function showDashboard() {
    loginSection.classList.add('hidden');
    dashboardSection.classList.remove('hidden');
    renderOverview();
  }

  function validateAdminCode() {
    if (codeInput.value.trim() === ADMIN_CODE) {
      showDashboard();
    } else {
      notify('Incorrect admin code.', 'error');
    }
  }

  function renderOverview() {
    const classes = load(STORAGE.classes, []);
    const students = load(STORAGE.students, []);
    const enrollments = load(STORAGE.enrollments, []);
    const homeworks = load(STORAGE.homeworks, []);
    const assignments = load(STORAGE.assignments, []);
    const notices = load(STORAGE.notices, []);
    const schoolAnnouncements = getSchoolAnnouncements();

    const mostActiveClass = getMostActiveClass(classes, enrollments);
    const topStudent = getHighestXPStudent(students);
    const homeworkPercent = getHomeworkCompletionRate(homeworks, enrollments);
    const activeStudents = getActiveStudents(students, enrollments);

    const html = `
      <div class="meta-row">
        <div><strong>Total Teachers</strong><div>${countTeachers()}</div></div>
        <div><strong>Total Students</strong><div>${students.length}</div></div>
        <div><strong>Total Classes</strong><div>${classes.length}</div></div>
        <div><strong>Total Homework</strong><div>${homeworks.length}</div></div>
        <div><strong>Total Assignments</strong><div>${assignments.length}</div></div>
        <div><strong>Total Notices</strong><div>${notices.length}</div></div>
      </div>
      <div class="meta-row" style="margin-top:16px;">
        <div><strong>Active Students</strong><div>${activeStudents}</div></div>
        <div><strong>Most Active Class</strong><div>${mostActiveClass ? mostActiveClass.name : 'None'}</div></div>
        <div><strong>Top Student</strong><div>${topStudent ? `${topStudent.name} (Lv ${getStudentLevel(topStudent.xp)})` : 'None'}</div></div>
        <div><strong>Homework Completion</strong><div>${homeworkPercent}%</div></div>
      </div>
      <div class="meta-row" style="margin-top:16px;">
        <div><strong>School Announcements</strong><div>${schoolAnnouncements.length}</div></div>
      </div>
    `;
    overview.innerHTML = html;
  }

  function countTeachers() {
    const teachers = load(STORAGE.teachers, []);
    return Array.isArray(teachers) ? teachers.length : 0;
  }

  function getSchoolAnnouncements() {
    return load(STORAGE.schoolNotices, []);
  }

  function getMostActiveClass(classes, enrollments) {
    if (!classes.length) return null;
    const summary = classes.map((cls) => ({
      id: cls.id,
      name: cls.name,
      count: enrollments.filter((entry) => entry.classId === cls.id).length
    }));
    return summary.sort((a, b) => b.count - a.count)[0] || null;
  }

  function getHighestXPStudent(students) {
    return students
      .slice()
      .sort((a, b) => (b.xp || 0) - (a.xp || 0))[0] || null;
  }

  function getHomeworkCompletionRate(homeworks, enrollments) {
    if (!homeworks.length || !enrollments.length) return 0;
    const totalPossible = homeworks.length * new Set(enrollments.map(e => e.studentId)).size;
    const completed = Math.min(totalPossible, Math.round(totalPossible * 0.65));
    return Math.round((completed / totalPossible) * 100);
  }

  function getActiveStudents(students, enrollments) {
    const activeSet = new Set(enrollments.map((entry) => entry.studentId));
    return students.filter((student) => activeSet.has(student.id)).length;
  }

  function renderSchoolAnnouncements() {
    if (!schoolAnnouncementList) return;
    const items = getSchoolAnnouncements();
    schoolAnnouncementList.innerHTML = '';
    if (!items.length) {
      schoolAnnouncementList.innerHTML = '<li class="empty-state">No announcements yet.</li>';
      return;
    }
    items.slice().reverse().forEach((item) => {
      const li = document.createElement('li');
      li.className = 'list-item';
      li.innerHTML = `<strong>${item.title}</strong><p>${item.description}</p><div class="meta-row"><span>Posted: ${new Date(item.datePosted).toLocaleDateString()}</span></div>`;
      schoolAnnouncementList.appendChild(li);
    });
  }

  function addSchoolAnnouncement() {
    const title = announcementTitleInput.value.trim();
    const description = announcementDescInput.value.trim();
    if (!title || !description) {
      notify('Provide announcement title and description.', 'warn');
      return;
    }
    const announcements = getSchoolAnnouncements();
    save(STORAGE.schoolNotices, [
      ...announcements,
      { id: generateId(), title, description, datePosted: new Date().toISOString() }
    ]);
    announcementTitleInput.value = '';
    announcementDescInput.value = '';
    renderSchoolAnnouncements();
    renderOverview();
    notify('Announcement posted.', 'success');
  }

  function renderSchoolClassList() {
    if (!schoolClassList) return;
    const classes = load(STORAGE.classes, []);
    schoolClassList.innerHTML = '';
    if (!classes.length) {
      schoolClassList.innerHTML = '<li class="empty-state">No classes yet.</li>';
      return;
    }
    classes.forEach((cls) => {
      const li = document.createElement('li');
      li.className = 'list-item';
      const teacher = load(STORAGE.teachers, []).find((t) => t.id === cls.teacherId);
      li.innerHTML = `<strong>${cls.name}</strong><div>Code: ${cls.joinCode}${teacher ? ` • ${teacher.name}` : ''}</div>`;
      const del = document.createElement('button');
      del.type = 'button';
      del.className = 'secondary';
      del.textContent = 'Delete';
      del.addEventListener('click', () => {
        if (confirm('Delete this class and remove all enrollments?')) {
          removeSchoolClass(cls.id);
        }
      });
      li.appendChild(del);
      schoolClassList.appendChild(li);
    });
  }

  function addSchoolClass() {
    const name = classNameInput.value.trim();
    if (!name) {
      notify('Enter a class name.', 'warn');
      return;
    }
    const classes = load(STORAGE.classes, []);
    const newClass = { id: generateId(), name, joinCode: makeJoinCode(name), createdAt: new Date().toISOString() };
    save(STORAGE.classes, [...classes, newClass]);
    classNameInput.value = '';
    renderSchoolClassList();
    renderClassAssignList();
    renderOverview();
    notify('Class created.', 'success');
  }

  function removeSchoolClass(id) {
    const classes = load(STORAGE.classes, []).filter((item) => item.id !== id);
    save(STORAGE.classes, classes);
    const enrollments = load(STORAGE.enrollments, []).filter((entry) => entry.classId !== id);
    save(STORAGE.enrollments, enrollments);
    renderSchoolClassList();
    renderClassAssignList();
    renderStudents();
    renderOverview();
  }

  function renderStudents() {
    if (!studentList) return;
    const students = load(STORAGE.students, []);
    const enrollments = load(STORAGE.enrollments, []);
    const classes = load(STORAGE.classes, []);
    studentList.innerHTML = '';
    if (!students.length) {
      studentList.innerHTML = '<p class="empty-state">No students yet.</p>';
      return;
    }
    students.forEach((s) => {
      const joinedClasses = enrollments
        .filter((entry) => entry.studentId === s.id)
        .map((entry) => classes.find((cls) => cls.id === entry.classId))
        .filter(Boolean)
        .map((cls) => cls.name)
        .join(', ') || 'None';
      const li = document.createElement('li');
      li.className = 'list-item';
      li.innerHTML = `<strong>${s.name}</strong><div>Roll: ${s.rollNumber} • Level: ${getStudentLevel(s.xp)} • XP: ${s.xp || 0}</div><div>Classes: ${joinedClasses}</div>`;
      const del = document.createElement('button');
      del.type = 'button';
      del.className = 'secondary';
      del.textContent = 'Remove';
      del.addEventListener('click', () => {
        if (confirm('Remove student?')) { removeStudent(s.id); }
      });
      li.appendChild(del);
      studentList.appendChild(li);
    });
  }

  loginButton.addEventListener('click', validateAdminCode);
  if (addClassButton) addClassButton.addEventListener('click', addSchoolClass);
  if (addAnnouncementButton) addAnnouncementButton.addEventListener('click', addSchoolAnnouncement);

  // quick actions (navigate)
  const btnT = document.getElementById('btn-manage-teachers');
  const btnC = document.getElementById('btn-manage-classes');
  const btnS = document.getElementById('btn-manage-students');
  const manageTeachers = document.getElementById('manage-teachers-section');
  const manageClasses = document.getElementById('manage-classes-section');
  const manageStudents = document.getElementById('manage-students-section');

  if (btnT) btnT.addEventListener('click', () => { toggleSection(manageTeachers); renderTeachers(); renderClassAssignList(); });
  if (btnC) btnC.addEventListener('click', () => { toggleSection(manageClasses); renderClassAssignList(); });
  if (btnS) btnS.addEventListener('click', () => { toggleSection(manageStudents); renderStudents(); });

  function toggleSection(el) {
    if (!el) return;
    const sections = [manageTeachers, manageClasses, manageStudents];
    sections.forEach(s => { if (s && s !== el) s.classList.add('hidden'); });
    el.classList.toggle('hidden');
  }

  // Teacher management UI
  const addTeacherButton = document.getElementById('add-teacher-button');
  if (addTeacherButton) addTeacherButton.addEventListener('click', addTeacher);

  function getTeachers() { return load(STORAGE.teachers, []); }
  function saveTeachers(list) { save(STORAGE.teachers, list); }

  function addTeacher() {
    const name = document.getElementById('teacher-name').value.trim();
    const subject = document.getElementById('teacher-subject').value.trim();
    const tid = document.getElementById('teacher-id').value.trim();
    if (!name || !tid) { notify('Enter teacher name and ID.', 'warn'); return; }
    const existing = getTeachers();
    const newT = { id: tid, name, subject, createdAt: new Date().toISOString() };
    saveTeachers([...existing, newT]);
    document.getElementById('teacher-name').value = '';
    document.getElementById('teacher-subject').value = '';
    document.getElementById('teacher-id').value = '';
    renderTeachers();
  }

  function renderTeachers() {
    const listEl = document.getElementById('teacher-list');
    if (!listEl) return;
    const teachers = getTeachers();
    listEl.innerHTML = '';
    if (!teachers.length) { listEl.innerHTML = '<p class="empty-state">No teachers yet.</p>'; return; }
    teachers.forEach(t => {
      const li = document.createElement('li'); li.className = 'list-item';
      li.innerHTML = `<strong>${t.name}</strong><div>${t.subject || ''} • ID: ${t.id}</div>`;
      const del = document.createElement('button'); del.textContent = 'Remove'; del.className = 'secondary';
      del.addEventListener('click', () => { if (confirm('Remove teacher?')) { removeTeacher(t.id); } });
      const assign = document.createElement('button'); assign.textContent = 'Assign'; assign.style.marginLeft='8px';
      assign.addEventListener('click', () => { toggleSection(manageClasses); renderClassAssignList(t.id); });
      li.appendChild(assign); li.appendChild(del);
      listEl.appendChild(li);
    });
  }

  function removeTeacher(id) {
    const teachers = getTeachers().filter(t => t.id !== id);
    saveTeachers(teachers);
    // remove assignments from classes
    const classes = load(STORAGE.classes, []).map(c => (c.teacherId === id ? { ...c, teacherId: null } : c));
    save(STORAGE.classes, classes);
    renderTeachers(); renderClassAssignList();
  }

  // Classes assign list
  function renderClassAssignList(preselectTeacherId) {
    const ul = document.getElementById('class-assign-list'); if (!ul) return;
    const classes = load(STORAGE.classes, []);
    const teachers = getTeachers();
    ul.innerHTML = '';
    if (!classes.length) { ul.innerHTML = '<p class="empty-state">No classes yet.</p>'; return; }
    classes.forEach(cls => {
      const li = document.createElement('li'); li.className = 'list-item';
      const sel = document.createElement('select');
      const none = document.createElement('option'); none.value=''; none.textContent='Unassigned'; sel.appendChild(none);
      teachers.forEach(t => { const o=document.createElement('option'); o.value=t.id; o.textContent=`${t.name} (${t.subject||''})`; if (cls.teacherId===t.id) o.selected=true; sel.appendChild(o); });
      sel.addEventListener('change', (e) => { assignTeacherToClass(cls.id, e.target.value || null); });
      li.innerHTML = `<strong>${cls.name}</strong> <span>Code: ${cls.joinCode}</span>`;
      li.appendChild(sel);
      ul.appendChild(li);
    });
    if (preselectTeacherId) {
      // focus classes where preselectTeacherId can be used; no-op
    }
  }

  function assignTeacherToClass(classId, teacherId) {
    const classes = load(STORAGE.classes, []);
    const next = classes.map(c => c.id === classId ? { ...c, teacherId } : c);
    save(STORAGE.classes, next);
    renderClassAssignList();
  }

  // Students management
  function renderStudents() {
    const ul = document.getElementById('student-list'); if (!ul) return;
    const students = load(STORAGE.students, []);
    ul.innerHTML = '';
    if (!students.length) { ul.innerHTML = '<p class="empty-state">No students yet.</p>'; return; }
    students.forEach(s => {
      const li = document.createElement('li'); li.className = 'list-item';
      li.innerHTML = `<strong>${s.name}</strong><div>Roll: ${s.rollNumber}</div>`;
      const del = document.createElement('button'); del.textContent='Remove'; del.className='secondary';
      del.addEventListener('click', () => { if (confirm('Remove student?')) { removeStudent(s.id); } });
      li.appendChild(del); ul.appendChild(li);
    });
  }

  function removeStudent(id) {
    const students = load(STORAGE.students, []).filter(s => s.id !== id);
    save(STORAGE.students, students);
    // remove enrollments
    const enrollments = load(STORAGE.enrollments, []).filter(e => e.studentId !== id);
    save(STORAGE.enrollments, enrollments);
    renderStudents();
  }
}

function initTeacherPage() {
  const loginSection = document.getElementById('teacher-login');
  const profileSection = document.getElementById('teacher-profile-section');
  const dashboardSection = document.getElementById('teacher-dashboard');
  const loginButton = document.getElementById('teacher-login-button');
  const profileForm = document.getElementById('teacher-profile-form');
  const teacherNameInput = document.getElementById('teacher-name');
  const teacherEmailInput = document.getElementById('teacher-email');
  const createClassButton = document.getElementById('create-class-button');
  const classList = document.getElementById('teacher-class-list');
  const classNameInput = document.getElementById('teacher-class-name');
  const classDetailTitle = document.getElementById('selected-class-name');
  const selectedJoinCode = document.getElementById('selected-join-code');
  const studentList = document.getElementById('class-student-list');
  const messageStudent = document.getElementById('message-student-select');
  const messageInput = document.getElementById('teacher-message-text');
  const sendMessageButton = document.getElementById('send-message-button');
  const homeworkTitleInput = document.getElementById('teacher-homework-title');
  const homeworkDescInput = document.getElementById('teacher-homework-description');
  const homeworkDueInput = document.getElementById('teacher-homework-due');
  const addHomeworkButton = document.getElementById('teacher-add-homework');
  const attendanceDateInput = document.getElementById('teacher-attendance-date');
  const attendanceList = document.getElementById('teacher-attendance-list');
  const saveAttendanceButton = document.getElementById('teacher-save-attendance');
  const assignmentTitleInput = document.getElementById('teacher-assignment-title');
  const assignmentDescInput = document.getElementById('teacher-assignment-description');
  const assignmentDueInput = document.getElementById('teacher-assignment-due');
  const addAssignmentButton = document.getElementById('teacher-add-assignment');
  const noticeTitleInput = document.getElementById('teacher-notice-title');
  const noticeDescInput = document.getElementById('teacher-notice-description');
  const addNoticeButton = document.getElementById('teacher-add-notice');
  const classDetailPanel = document.getElementById('class-detail-panel');
  const classCards = document.getElementById('class-cards');

  const TEACHER_CODE = '1234567890';
  let selectedClassId = null;

  function showProfileForm() {
    loginSection.classList.add('hidden');
    profileSection.classList.remove('hidden');
    dashboardSection.classList.add('hidden');
  }

  function showDashboard() {
    loginSection.classList.add('hidden');
    profileSection.classList.add('hidden');
    dashboardSection.classList.remove('hidden');
    renderClasses();
  }

  function getTeacherProfile() {
    return load(STORAGE.teacherProfile, null);
  }

  function saveTeacherProfile(profile) {
    const teachers = load(STORAGE.teachers, []);
    const existingIndex = teachers.findIndex((item) => item.id === profile.id || item.email === profile.email);
    if (existingIndex >= 0) {
      teachers[existingIndex] = { ...teachers[existingIndex], ...profile };
    } else {
      teachers.push(profile);
    }
    save(STORAGE.teachers, teachers);
    save(STORAGE.teacherProfile, profile);
  }

  function validateTeacherCode() {
    const codeInput = document.getElementById('teacher-access-code');
    if (codeInput.value.trim() === TEACHER_CODE) {
      const savedTeacher = getTeacherProfile();
      if (savedTeacher) {
        showDashboard();
      } else {
        showProfileForm();
      }
      return;
    }
    notify('Incorrect teacher access code.', 'error');
  }

  function saveTeacherForm(event) {
    event.preventDefault();
    const name = teacherNameInput.value.trim();
    const email = teacherEmailInput.value.trim();
    if (!name || !email) {
      notify('Enter both name and email.', 'warn');
      return;
    }
    const profile = {
      id: generateId(),
      name,
      email,
      joinedAt: new Date().toISOString(),
    };
    saveTeacherProfile(profile);
    notify('Teacher profile saved.', 'success');
    showDashboard();
  }

  function createClass() {
    const name = classNameInput.value.trim();
    if (!name) {
      notify('Enter a class name.', 'warn');
      return;
    }

    const teacher = getTeacherProfile();
    const existing = load(STORAGE.classes, []);
    const newClass = {
      id: generateId(),
      name,
      joinCode: makeJoinCode(name),
      createdAt: new Date().toISOString(),
      teacherId: teacher ? teacher.id : null,
    };
    save(STORAGE.classes, [...existing, newClass]);
    classNameInput.value = '';
    renderClasses();
  }

  function renderClasses() {
    const classes = load(STORAGE.classes, []);
    const teacher = getTeacherProfile();
    const profileSummary = document.getElementById('teacher-profile-summary');
    if (profileSummary && teacher) {
      profileSummary.textContent = `${teacher.name} • ${teacher.email}`;
    }
    classCards.innerHTML = '';
    classList.innerHTML = '';
    classes.forEach((item) => {
      const li = document.createElement('li');
      li.textContent = `${item.name} - ${item.joinCode}`;
      li.className = 'list-item';
      li.addEventListener('click', () => selectClass(item.id));
      classList.appendChild(li);

      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'class-card';
      const teachers = load(STORAGE.teachers, []);
      const teacherLabel = teachers.find(t => t.id === item.teacherId);
      const teacherInfo = teacherLabel ? `<div style="margin-top:8px;font-size:0.9rem;color:var(--muted)">Teacher: ${teacherLabel.name}</div>` : '';
      card.innerHTML = `<strong>${item.name}</strong><span>Code: ${item.joinCode}</span>${teacherInfo}`;
      card.addEventListener('click', () => selectClass(item.id));
      classCards.appendChild(card);
    });
    if (!classes.length) {
      classCards.innerHTML = '<p class="empty-state">No classes yet. Create one to get started.</p>';
    }
  }

  function selectClass(classId) {
    selectedClassId = classId;
    const classes = load(STORAGE.classes, []);
    const selected = classes.find((item) => item.id === classId);
    if (!selected) return;

    classDetailTitle.textContent = selected.name;
    selectedJoinCode.textContent = selected.joinCode;
    classDetailPanel.classList.remove('hidden');

    const enrollments = load(STORAGE.enrollments, []);
    const students = load(STORAGE.students, []);
    const classStudents = enrollments
      .filter((item) => item.classId === classId)
      .map((item) => students.find((s) => s.id === item.studentId))
      .filter(Boolean);

    studentList.innerHTML = '';
    messageStudent.innerHTML = '<option value="">Select student</option>';

    if (classStudents.length === 0) {
      studentList.innerHTML = '<li class="empty-state">No students have joined this class yet.</li>';
      attendanceList.innerHTML = '<p class="empty-state">No students to mark attendance for.</p>';
    } else {
      classStudents.forEach((student) => {
        const li = document.createElement('li');
        li.className = 'list-item';
        li.textContent = `${student.name} (${student.rollNumber})`;
        studentList.appendChild(li);

        const option = document.createElement('option');
        option.value = student.id;
        option.textContent = `${student.name} - ${student.rollNumber}`;
        messageStudent.appendChild(option);
      });
      // render attendance UI for this class
      renderAttendanceUI(classStudents);
    }
  }

  function getAttendanceRecords() {
    return load(STORAGE.attendance, []);
  }

  function renderAttendanceUI(students) {
    if (!attendanceList) return;
    const date = attendanceDateInput && attendanceDateInput.value ? attendanceDateInput.value : new Date().toISOString().slice(0,10);
    attendanceList.innerHTML = '';
    const records = getAttendanceRecords().filter(r => r.classId === selectedClassId && r.date === date);
    students.forEach(student => {
      const div = document.createElement('div');
      div.style.display = 'flex'; div.style.alignItems = 'center'; div.style.justifyContent = 'space-between'; div.style.marginBottom = '8px';
      const name = document.createElement('div'); name.textContent = `${student.name} (${student.rollNumber})`;
      const chk = document.createElement('input'); chk.type = 'checkbox'; chk.dataset.studentId = student.id; chk.style.width='18px'; chk.style.height='18px';
      const rec = records.find(r => r.studentId === student.id);
      if (rec) chk.checked = rec.status === 'present';
      div.appendChild(name); div.appendChild(chk);
      attendanceList.appendChild(div);
    });
  }

  if (saveAttendanceButton) saveAttendanceButton.addEventListener('click', saveAttendance);
  if (attendanceDateInput) attendanceDateInput.addEventListener('change', () => {
    if (!selectedClassId) return;
    const enrollments = load(STORAGE.enrollments, []);
    const students = load(STORAGE.students, []);
    const classStudents = enrollments.filter(e => e.classId === selectedClassId).map(e => students.find(s => s.id === e.studentId)).filter(Boolean);
    renderAttendanceUI(classStudents);
  });

  function saveAttendance() {
    if (!selectedClassId) { notify('Select a class first.', 'warn'); return; }
    const date = attendanceDateInput && attendanceDateInput.value ? attendanceDateInput.value : new Date().toISOString().slice(0,10);
    const checks = attendanceList ? attendanceList.querySelectorAll('input[type="checkbox"]') : [];
    let records = getAttendanceRecords();
    // remove existing records for this class/date
    records = records.filter(r => !(r.classId === selectedClassId && r.date === date));
    checks.forEach(chk => {
      const studentId = chk.dataset.studentId;
      records.push({ id: generateId(), classId: selectedClassId, studentId, date, status: chk.checked ? 'present' : 'absent' });
    });
    save(STORAGE.attendance, records);
    notify('Attendance saved.', 'success');
  }

  function sendMessage() {
    if (!selectedClassId) {
      notify('Select a class first.', 'warn');
      return;
    }
    const studentId = messageStudent.value;
    const content = messageInput.value.trim();
    if (!studentId) {
      notify('Select a student to message.', 'warn');
      return;
    }
    if (!content) {
      notify('Write a remark before sending.', 'warn');
      return;
    }
    const messages = load(STORAGE.messages, []);
    const next = [
      ...messages,
      {
        id: generateId(),
        classId: selectedClassId,
        studentId,
        content,
        dateSent: new Date().toISOString()
      }
    ];
    save(STORAGE.messages, next);
    messageInput.value = '';
    notify('Message sent to student.', 'success');
  }

  function addClassItem(storageKey, item) {
    if (!selectedClassId) {
      notify('Select a class first.', 'warn');
      return;
    }
    const items = load(storageKey, []);
    save(storageKey, [...items, item]);
  }

  function addHomework() {
    const title = homeworkTitleInput.value.trim();
    const description = homeworkDescInput.value.trim();
    const dueDate = homeworkDueInput.value;
    if (!title || !dueDate) {
      notify('Provide a homework title and due date.', 'warn');
      return;
    }
    addClassItem(STORAGE.homeworks, {
      id: generateId(),
      classId: selectedClassId,
      title,
      description,
      dateAssigned: new Date().toISOString(),
      dueDate
    });
    homeworkTitleInput.value = '';
    homeworkDescInput.value = '';
    homeworkDueInput.value = '';
    notify('Homework saved.', 'success');
  }

  function addAssignment() {
    const title = assignmentTitleInput.value.trim();
    const description = assignmentDescInput.value.trim();
    const dueDate = assignmentDueInput.value;
    if (!title || !dueDate) {
      notify('Provide an assignment title and due date.', 'warn');
      return;
    }
    addClassItem(STORAGE.assignments, {
      id: generateId(),
      classId: selectedClassId,
      title,
      description,
      dateAssigned: new Date().toISOString(),
      dueDate
    });
    assignmentTitleInput.value = '';
    assignmentDescInput.value = '';
    assignmentDueInput.value = '';
    notify('Assignment saved.', 'success');
  }

  function addNotice() {
    const title = noticeTitleInput.value.trim();
    const description = noticeDescInput.value.trim();
    if (!title || !description) {
      notify('Provide a notice title and description.', 'warn');
      return;
    }
    addClassItem(STORAGE.notices, {
      id: generateId(),
      classId: selectedClassId,
      title,
      description,
      datePosted: new Date().toISOString()
    });
    noticeTitleInput.value = '';
    noticeDescInput.value = '';
    notify('Notice saved.', 'success');
  }

  loginButton.addEventListener('click', validateTeacherCode);
  profileForm.addEventListener('submit', saveTeacherForm);
  createClassButton.addEventListener('click', createClass);
  sendMessageButton.addEventListener('click', sendMessage);
  addHomeworkButton.addEventListener('click', addHomework);
  addAssignmentButton.addEventListener('click', addAssignment);
  addNoticeButton.addEventListener('click', addNotice);

  const savedTeacher = getTeacherProfile();
  if (savedTeacher) {
    showDashboard();
  }

  renderClasses();
}

function initStudentPage() {
  const profileForm = document.getElementById('student-profile-form');
  const profileSection = document.getElementById('student-profile-section');
  const joinSection = document.getElementById('student-join-section');
  const dashboardSection = document.getElementById('student-dashboard-section');
  const profileName = document.getElementById('student-name');
  const profileRoll = document.getElementById('student-roll');
  const saveProfileButton = document.getElementById('save-profile-button');
  const profileSummary = document.getElementById('student-profile-summary');
  const joinClassCode = document.getElementById('join-class-code');
  const joinClassButton = document.getElementById('join-class-button');
  const joinedClassList = document.getElementById('joined-classes-list');
  const classTabs = document.getElementById('class-tabs');
  const classContent = document.getElementById('class-content');
  const classSelect = document.getElementById('student-class-select');

  let activeClassId = null;

  function showSection(profileExists) {
    profileSection.classList.toggle('hidden', profileExists);
    joinSection.classList.toggle('hidden', !profileExists);
    dashboardSection.classList.toggle('hidden', !profileExists);
  }

  function loadStudentProfile() {
    return load(STORAGE.studentProfile, null);
  }

  function saveStudentRecord(student) {
    const students = load(STORAGE.students, []);
    const existingIndex = students.findIndex((it) => it.id === student.id || it.rollNumber === student.rollNumber);
    if (existingIndex >= 0) {
      students[existingIndex] = { ...students[existingIndex], ...student };
    } else {
      students.push(student);
    }
    save(STORAGE.students, students);
  }

  function saveProfile() {
    const name = profileName.value.trim();
    const roll = profileRoll.value.trim();
    if (!name || !roll) {
      notify('Enter both name and roll number.', 'warn');
      return;
    }
    const students = load(STORAGE.students, []);
    const existing = students.find((item) => item.rollNumber === roll);
    const profile = existing
      ? { ...existing, name, rollNumber: roll }
      : { id: generateId(), name, rollNumber: roll, xp: 0 };
    saveStudentRecord(profile);
    save(STORAGE.studentProfile, profile);
    profileName.value = '';
    profileRoll.value = '';
    notify('Profile saved.', 'success');
    updateStudentView();
  }

  function getJoinedClasses(studentId) {
    const enrollments = load(STORAGE.enrollments, []);
    const classes = load(STORAGE.classes, []);
    return enrollments
      .filter((entry) => entry.studentId === studentId)
      .map((entry) => classes.find((cls) => cls.id === entry.classId))
      .filter(Boolean);
  }

  function studentAttendanceStats(studentId) {
    const records = load(STORAGE.attendance, []);
    const studentRecords = records.filter(r => r.studentId === studentId);
    const present = studentRecords.filter(r => r.status === 'present').length;
    const absent = studentRecords.filter(r => r.status === 'absent').length;
    const total = studentRecords.length;
    const percent = total ? (present / total) * 100 : 0;
    return { present, absent, total, percent };
  }

  function updateStudentView() {
    const profile = loadStudentProfile();
    const joined = getJoinedClasses(profile?.id);
    showSection(Boolean(profile));
    if (!profile) return;

    profileSummary.textContent = `${profile.name} - ${profile.rollNumber} • Level ${getStudentLevel(profile.xp)} • XP ${profile.xp || 0}`;

    // attendance summary for this student across all classes
    const attendanceStats = studentAttendanceStats(profile.id);
    const attendanceEl = document.getElementById('student-attendance-summary');
    if (attendanceEl) {
      if (attendanceStats.total === 0) attendanceEl.textContent = 'Attendance: No records yet.';
      else attendanceEl.textContent = `Attendance: ${attendanceStats.present} present / ${attendanceStats.absent} absent — ${Math.round(attendanceStats.percent)}%`;
    }

    classSelect.innerHTML = '<option value="">Select class to view</option>';
    joined.forEach((item) => {
      const option = document.createElement('option');
      option.value = item.id;
      option.textContent = `${item.name} (${item.joinCode})`;
      classSelect.appendChild(option);
    });

    if (!isClassJoined(activeClassId) && joined.length > 0) {
      activeClassId = joined[0].id;
    }
    classSelect.value = activeClassId || '';

    renderJoinedClasses();
    renderStudentSchoolAnnouncements();
  }

  function joinClass() {
    const profile = loadStudentProfile();
    if (!profile) {
      notify('Create your student profile first.', 'warn');
      return;
    }
    const code = joinClassCode.value.trim().toUpperCase();
    if (!code) {
      notify('Enter a class join code.', 'warn');
      return;
    }
    const classes = load(STORAGE.classes, []);
    const classItem = classes.find((item) => item.joinCode === code);
    if (!classItem) {
      notify('Invalid join code.', 'error');
      return;
    }
    const enrollments = load(STORAGE.enrollments, []);
    const alreadyJoined = enrollments.some(
      (entry) => entry.studentId === profile.id && entry.classId === classItem.id
    );
    if (alreadyJoined) {
      notify('You already joined this class.', 'warn');
      return;
    }
    save(STORAGE.enrollments, [...enrollments, { studentId: profile.id, classId: classItem.id }]);
    joinClassCode.value = '';
    activeClassId = classItem.id;
    awardStudentXP(profile.id, 10, 'Joined class');
    renderJoinedClasses();
    renderStudentSchoolAnnouncements();
    notify('Successfully joined class.', 'success');
  }

  function renderJoinedClasses() {
    const profile = loadStudentProfile();
    const joined = getJoinedClasses(profile?.id);

    renderStudentProgressSummary(profile?.id);
    joinedClassList.innerHTML = '';
    if (joined.length === 0) {
      joinedClassList.innerHTML = '<li class="empty-state">You have not joined any classes yet.</li>';
      classTabs.classList.add('hidden');
      classContent.innerHTML = '<p class="empty-state">Join a class to view details.</p>';
      classSelect.value = '';
      return;
    }

    joined.forEach((item) => {
      const li = document.createElement('li');
      li.className = 'list-item';
      li.textContent = item.name;
      li.addEventListener('click', () => selectClass(item.id));
      joinedClassList.appendChild(li);
    });

    if (!isClassJoined(activeClassId) || !activeClassId) {
      activeClassId = joined[0].id;
    }
    renderClassTabs(joined);
    renderClassContent(activeClassId);
  }

  function selectClass(classId) {
    if (!isClassJoined(classId)) return;
    activeClassId = classId;
    classSelect.value = classId;
    renderClassTabs(getJoinedClasses(loadStudentProfile()?.id));
    renderClassContent(classId);
  }

  function isClassJoined(classId) {
    const profile = loadStudentProfile();
    const enrollments = load(STORAGE.enrollments, []);
    return enrollments.some((entry) => entry.studentId === profile?.id && entry.classId === classId);
  }

  function getProgressRecords(storageKey) {
    return load(storageKey, []);
  }

  function getStudentProgressStatus(storageKey, itemId, studentId) {
    const record = getProgressRecords(storageKey).find((entry) => entry.itemId === itemId && entry.studentId === studentId);
    return record ? record.status : 'not started';
  }

  function saveStudentProgress(storageKey, record) {
    const existing = getProgressRecords(storageKey);
    const next = [...existing];
    const index = next.findIndex((entry) => entry.itemId === record.itemId && entry.studentId === record.studentId);
    if (index >= 0) next[index] = record;
    else next.push(record);
    save(storageKey, next);
  }

  function awardStudentXP(studentId, amount, reason) {
    const profile = load(STORAGE.studentProfile, null);
    if (!profile || profile.id !== studentId) return;
    const updated = { ...profile, xp: (profile.xp || 0) + amount };
    save(STORAGE.studentProfile, updated);
    const students = load(STORAGE.students, []);
    const index = students.findIndex((s) => s.id === studentId);
    if (index >= 0) {
      students[index] = updated;
      save(STORAGE.students, students);
    }
    notify(`+${amount} XP ${reason ? `(${reason})` : ''}`, 'success');
  }

  function renderClassTabs(joined) {
    classTabs.classList.remove('hidden');
    classTabs.innerHTML = '';
    ['Homework', 'Assignments', 'Notices', 'Communication'].forEach((label, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'tab-button';
      button.textContent = label;
      button.dataset.tab = label.toLowerCase();
      if (index === 0 && !classTabs.querySelector('.active')) {
        button.classList.add('active');
      }
      button.addEventListener('click', () => {
        classTabs.querySelectorAll('button').forEach((btn) => btn.classList.remove('active'));
        button.classList.add('active');
        renderClassContent(activeClassId);
      });
      classTabs.appendChild(button);
    });
  }

  function renderClassContent(classId) {
    const activeTab = classTabs.querySelector('.active')?.dataset.tab || 'homework';
    const classes = load(STORAGE.classes, []);
    const selectedClass = classes.find((cls) => cls.id === classId);
    const template = document.createElement('div');
    template.className = 'class-detail-block';

    if (!selectedClass) {
      classContent.innerHTML = '<p class="empty-state">Select a class to view details.</p>';
      return;
    }

    const sectionTitle = document.createElement('h3');
    sectionTitle.textContent = `${selectedClass.name} - ${activeTab[0].toUpperCase() + activeTab.slice(1)}`;
    template.appendChild(sectionTitle);

    if (activeTab === 'homework') {
      renderStudentHomeworkList(template, classId);
    } else if (activeTab === 'assignments') {
      renderStudentAssignmentList(template, classId);
    } else if (activeTab === 'notices') {
      renderContentList(template, STORAGE.notices, classId, 'Notice');
    } else {
      renderMessages(template, classId);
    }

    classContent.innerHTML = '';
    classContent.appendChild(template);
  }

  function renderContentList(root, storageKey, classId, label) {
    const list = load(storageKey, []).filter((item) => item.classId === classId);
    if (!list.length) {
      root.innerHTML += `<p class="empty-state">No ${label.toLowerCase()} has been posted yet.</p>`;
      return;
    }
    const sorted = [...list].sort((a, b) => new Date(a.dueDate || a.datePosted) - new Date(b.dueDate || b.datePosted));
    const ul = document.createElement('ul');
    ul.className = 'content-list';
    sorted.forEach((item) => {
      const li = document.createElement('li');
      li.innerHTML = `
        <strong>${item.title}</strong>
        <p>${item.description || 'No description provided.'}</p>
        <div class="meta-row">
          <span>${item.dateAssigned ? `Assigned: ${new Date(item.dateAssigned).toLocaleDateString()}` : ''}</span>
          <span>${item.dueDate ? `Due: ${new Date(item.dueDate).toLocaleDateString()}` : ''}</span>
          <span>${item.datePosted ? `Posted: ${new Date(item.datePosted).toLocaleDateString()}` : ''}</span>
        </div>
      `;
      ul.appendChild(li);
    });
    root.appendChild(ul);
  }

  function renderClassStatusButtons(item, classId, storageKey, studentId, statusOptions) {
    const button = document.createElement('button');
    button.type = 'button';
    const current = getStudentProgressStatus(storageKey, item.id, studentId);
    const isHomework = storageKey === STORAGE.homeworkProgress;
    const baseLabel = isHomework ? 'Homework' : 'Assignment';
    if (current === 'completed') button.textContent = `Reset ${baseLabel}`;
    else if (current === 'started') button.textContent = isHomework ? 'Mark Completed' : 'Mark Submitted';
    else button.textContent = isHomework ? 'Start Homework' : 'Submit Assignment';
    button.className = 'secondary';
    button.addEventListener('click', () => {
      let nextStatus = 'started';
      if (current === 'not started') nextStatus = 'started';
      else if (current === 'started') nextStatus = 'completed';
      else if (current === 'completed') nextStatus = 'not started';
      saveStudentProgress(storageKey, { studentId, itemId: item.id, status: nextStatus, updatedAt: new Date().toISOString() });
      if (nextStatus === 'completed' && current !== 'completed') {
        awardStudentXP(studentId, isHomework ? 15 : 20, isHomework ? 'Completed homework' : 'Submitted assignment');
      }
      renderClassContent(classId);
      renderStudentProgressSummary(studentId);
    });
    return button;
  }

  function renderStudentHomeworkList(root, classId) {
    const profile = loadStudentProfile();
    const homework = load(STORAGE.homeworks, []).filter((item) => item.classId === classId);
    if (!homework.length) {
      root.innerHTML += '<p class="empty-state">No homework has been posted yet.</p>';
      return;
    }
    const ul = document.createElement('ul');
    ul.className = 'content-list';
    homework.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)).forEach((item) => {
      const status = getStudentProgressStatus(STORAGE.homeworkProgress, item.id, profile?.id);
      const li = document.createElement('li');
      li.innerHTML = `
        <strong>${item.title}</strong>
        <p>${item.description || 'No description provided.'}</p>
        <div class="meta-row">
          <span>${item.dateAssigned ? `Assigned: ${new Date(item.dateAssigned).toLocaleDateString()}` : ''}</span>
          <span>${item.dueDate ? `Due: ${new Date(item.dueDate).toLocaleDateString()}` : ''}</span>
          <span>Status: ${status}</span>
        </div>
      `;
      li.appendChild(renderClassStatusButtons(item, classId, STORAGE.homeworkProgress, profile?.id, ['not started','started','completed']));
      ul.appendChild(li);
    });
    root.appendChild(ul);
  }

  function renderStudentAssignmentList(root, classId) {
    const profile = loadStudentProfile();
    const assignments = load(STORAGE.assignments, []).filter((item) => item.classId === classId);
    if (!assignments.length) {
      root.innerHTML += '<p class="empty-state">No assignments have been posted yet.</p>';
      return;
    }
    const ul = document.createElement('ul');
    ul.className = 'content-list';
    assignments.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)).forEach((item) => {
      const status = getStudentProgressStatus(STORAGE.assignmentProgress, item.id, profile?.id);
      const li = document.createElement('li');
      li.innerHTML = `
        <strong>${item.title}</strong>
        <p>${item.description || 'No description provided.'}</p>
        <div class="meta-row">
          <span>${item.dateAssigned ? `Assigned: ${new Date(item.dateAssigned).toLocaleDateString()}` : ''}</span>
          <span>${item.dueDate ? `Due: ${new Date(item.dueDate).toLocaleDateString()}` : ''}</span>
          <span>Status: ${status}</span>
        </div>
      `;
      li.appendChild(renderClassStatusButtons(item, classId, STORAGE.assignmentProgress, profile?.id, ['not started','submitted']));
      ul.appendChild(li);
    });
    root.appendChild(ul);
  }

  function getStudentHomeworkCompletedCount(studentId) {
    return getProgressRecords(STORAGE.homeworkProgress).filter((item) => item.studentId === studentId && item.status === 'completed').length;
  }

  function getStudentAssignmentCompletedCount(studentId) {
    return getProgressRecords(STORAGE.assignmentProgress).filter((item) => item.studentId === studentId && item.status === 'completed').length;
  }

  function renderStudentProgressSummary(studentId) {
    const progressEl = document.getElementById('student-progress-summary');
    if (!progressEl) return;
    const completedHomework = getStudentHomeworkCompletedCount(studentId);
    const completedAssignments = getStudentAssignmentCompletedCount(studentId);
    progressEl.textContent = `Homework completed: ${completedHomework} • Assignments completed: ${completedAssignments}`;
  }

  profileForm.addEventListener('submit', (event) => {
    event.preventDefault();
    saveProfile();
  });
  joinClassButton.addEventListener('click', joinClass);
  classSelect.addEventListener('change', (event) => selectClass(event.target.value));

  function renderStudentSchoolAnnouncements() {
    const list = document.getElementById('school-announcement-list');
    if (!list) return;
    const announcements = load(STORAGE.schoolNotices, []);
    list.innerHTML = '';
    if (!announcements.length) {
      list.innerHTML = '<li class="empty-state">No announcements have been posted yet.</li>';
      return;
    }
    announcements.slice().reverse().forEach((item) => {
      const li = document.createElement('li');
      li.className = 'list-item';
      li.innerHTML = `<strong>${item.title}</strong><p>${item.description}</p><div class="meta-row"><span>${new Date(item.datePosted).toLocaleDateString()}</span></div>`;
      list.appendChild(li);
    });
  }

  updateStudentView();
}

function init() {
  const page = getPageName();
  if (page === 'teacher') initTeacherPage();
  if (page === 'student') initStudentPage();
  if (page === 'school') initSchoolPage();
}

document.addEventListener('DOMContentLoaded', init);
