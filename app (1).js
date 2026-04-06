// ── STATE ──
let currentRole = 'user';
let currentUser = null;
let patientProfile = null;
let doctorProfile = null;
let patients = [];
let selectedGender = 'Male';
let currentQ = 0;
let answers = {};
let selectedPatientIdx = null;

// ── QUESTIONS ──
const questions = [
  {section:'Section A — Possible Infection Source',text:'Has the patient had fever, chills, or felt very cold recently?',options:[{label:'Yes',pts:2},{label:'No',pts:0},{label:'Not sure',pts:1}]},
  {section:'Section A — Possible Infection Source',text:'Does the patient have cough, mucus/phlegm, chest pain, or breathing symptoms suggesting chest infection?',options:[{label:'Yes',pts:2},{label:'No',pts:0},{label:'Not sure',pts:1}]},
  {section:'Section A — Possible Infection Source',text:'Does the patient have burning urine, frequent urination, foul-smelling urine, or lower abdominal pain?',options:[{label:'Yes',pts:2},{label:'No',pts:0},{label:'Not sure',pts:1}]},
  {section:'Section A — Possible Infection Source',text:'Does the patient have a wound, pus, skin redness, swelling, boil, or infected cut?',options:[{label:'Yes',pts:2},{label:'No',pts:0},{label:'Not sure',pts:1}]},
  {section:'Section A — Possible Infection Source',text:'Has the patient had vomiting, diarrhea, or severe abdominal pain with suspected infection?',options:[{label:'Yes',pts:2},{label:'No',pts:0},{label:'Not sure',pts:1}]},
  {section:'Section A — Possible Infection Source',text:'Has the patient had recent surgery, hospitalization, IV line, catheter, or medical procedure?',options:[{label:'Yes',pts:3},{label:'No',pts:0},{label:'Not sure',pts:1}]},
  {section:'Section B — General Deterioration',text:'Is the patient getting much worse in the last 6–24 hours?',options:[{label:'Yes',pts:3},{label:'No',pts:0},{label:'Not sure',pts:1}]},
  {section:'Section B — General Deterioration',text:'Does the patient look unusually weak, very sick, or "not like themselves"?',options:[{label:'Yes',pts:3},{label:'No',pts:0},{label:'Not sure',pts:1}]},
  {section:'Section B — General Deterioration',text:'Is the patient sweating a lot, shivering badly, or feeling clammy?',options:[{label:'Yes',pts:2},{label:'No',pts:0},{label:'Not sure',pts:1}]},
  {section:'Section B — General Deterioration',text:'Is the patient too weak to walk, sit, eat, or drink properly?',options:[{label:'Yes',pts:4},{label:'No',pts:0},{label:'Not sure',pts:1}]},
  {section:'Section C — Red Flag Symptoms',text:'Is the patient confused, unusually sleepy, hard to wake, or not thinking clearly?',options:[{label:'Yes',pts:5},{label:'No',pts:0},{label:'Not sure',pts:2}]},
  {section:'Section C — Red Flag Symptoms',text:'Is the patient breathing faster than normal or struggling to breathe at rest?',options:[{label:'Yes',pts:5},{label:'No',pts:0},{label:'Not sure',pts:2}]},
  {section:'Section C — Red Flag Symptoms',text:'Is the patient unable to finish a full sentence because of breathing difficulty?',options:[{label:'Yes',pts:5},{label:'No',pts:0},{label:'Not sure',pts:2}]},
  {section:'Section C — Red Flag Symptoms',text:'Has the patient felt faint, nearly collapsed, or actually collapsed?',options:[{label:'Yes',pts:5},{label:'No',pts:0},{label:'Not sure',pts:2}]},
  {section:'Section C — Red Flag Symptoms',text:'Are the hands/feet very cold, or is the skin pale, bluish, grey, or mottled?',options:[{label:'Yes',pts:5},{label:'No',pts:0},{label:'Not sure',pts:2}]},
  {section:'Section C — Red Flag Symptoms',text:'Is the patient passing much less urine than usual or not urinating for many hours?',options:[{label:'Yes',pts:5},{label:'No',pts:0},{label:'Not sure',pts:2}]},
  {section:'Section D — High-Risk Background',text:'Is the patient age 65+ or a very young child/infant?',options:[{label:'Yes',pts:2},{label:'No',pts:0},{label:'Not sure',pts:1}]},
  {section:'Section D — High-Risk Background',text:'Does the patient have diabetes, kidney disease, liver disease, or heart disease?',options:[{label:'Yes',pts:2},{label:'No',pts:0},{label:'Not sure',pts:1}]},
  {section:'Section D — High-Risk Background',text:'Does the patient have cancer, HIV, low immunity, or take steroids/immunosuppressants?',options:[{label:'Yes',pts:3},{label:'No',pts:0},{label:'Not sure',pts:1}]},
  {section:'Section D — High-Risk Background',text:'Is the patient pregnant or recently gave birth?',options:[{label:'Yes',pts:3},{label:'No',pts:0},{label:'Not sure',pts:1}]},
];

// ── NAVIGATION ──
function goTo(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');
  window.scrollTo(0, 0);
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

// ── AUTH ──
function setRole(role) {
  currentRole = role;
  document.querySelectorAll('.role-tab').forEach((t, i) =>
    t.classList.toggle('active', (i === 0 && role === 'user') || (i === 1 && role === 'doctor'))
  );
}

function showRegister() {
  document.getElementById('login-form').style.display = 'none';
  document.getElementById('register-form').style.display = 'block';
}

function showLogin() {
  document.getElementById('register-form').style.display = 'none';
  document.getElementById('login-form').style.display = 'block';
}

function handleRegister() {
  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  if (!name || !email) return showToast('Please fill all fields');
  currentUser = { name, email, role: currentRole };
  afterLogin();
}

function handleLogin() {
  const email = document.getElementById('login-email').value.trim();
  if (!email) return showToast('Please enter your email');
  currentUser = { name: email.split('@')[0], email, role: currentRole };
  afterLogin();
}

function afterLogin() {
  document.getElementById('nav-user-name').textContent = `Hi, ${currentUser.name}`;
  goTo('page-home');
  showToast(`Welcome, ${currentUser.name}!`);
}

// ── PATIENT FORM ──
function selectGender(el, g) {
  selectedGender = g;
  document.querySelectorAll('.gender-chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
}

function previewAvatar(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    const ap = document.getElementById('avatar-preview');
    ap.innerHTML = `<img src="${ev.target.result}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`;
  };
  reader.readAsDataURL(file);
}

function savePatient() {
  const name = document.getElementById('p-name').value.trim();
  const age = document.getElementById('p-age').value;
  if (!name || !age) return showToast('Name and age are required');
  patientProfile = {
    name, age,
    gender: selectedGender,
    blood: document.getElementById('p-blood').value,
    glucose: document.getElementById('p-glucose').value,
    heartrate: document.getElementById('p-heartrate').value,
    cholesterol: document.getElementById('p-cholesterol').value,
    phone: document.getElementById('p-phone').value,
    history: document.getElementById('p-history').value,
    reviews: [],
    screeningScore: null
  };
  if (!patients.find(p => p.name === name)) patients.push(patientProfile);
  renderPatientDashboard();
  goTo('page-patient-dashboard');
  showToast('Dashboard saved!');
}

function renderPatientDashboard() {
  if (!patientProfile) return;
  const p = patientProfile;
  const av = document.getElementById('dash-avatar');
  const ap = document.getElementById('avatar-preview');
  if (ap && ap.querySelector('img')) {
    av.innerHTML = ap.querySelector('img').outerHTML;
    av.style.background = 'none';
  } else {
    av.textContent = p.name.charAt(0).toUpperCase();
  }
  document.getElementById('dash-name').textContent = p.name;
  document.getElementById('dash-subtitle').textContent = `Age ${p.age} · ${p.gender} · ${p.blood || 'Blood group N/A'}`;
  const grid = document.getElementById('dash-info-grid');
  const cards = [
    ['Glucose', p.glucose || '—', 'mg/dL'],
    ['Heart Rate', p.heartrate || '—', 'bpm'],
    ['Cholesterol', p.cholesterol || '—', 'mg/dL'],
    ['Blood Group', p.blood || '—', ''],
    ['Phone', p.phone || '—', ''],
    ['Screening Score', p.screeningScore !== null ? p.screeningScore : '—', 'pts'],
  ];
  grid.innerHTML = cards.map(([l, v, u]) =>
    `<div class="info-card"><div class="label">${l}</div><div class="value">${v}<span class="unit">${u}</span></div></div>`
  ).join('');
  const rv = document.getElementById('patient-reviews');
  if (p.reviews && p.reviews.length > 0) {
    rv.innerHTML = p.reviews.map(r =>
      `<div style="background:#F8FBFE;border-radius:10px;padding:14px;margin-bottom:10px;border:1px solid var(--border)">
        <div style="font-size:12px;color:var(--primary-light);font-weight:600;margin-bottom:4px">${r.doctor}</div>
        <div style="font-size:13px;color:var(--text);line-height:1.6">${r.note}</div>
        <div style="font-size:11px;color:var(--muted);margin-top:4px">${r.time}</div>
      </div>`
    ).join('');
  } else {
    rv.innerHTML = '<div class="review-empty">No doctor reviews yet.</div>';
  }
}

// ── DOCTOR FORM ──
function saveDoctor() {
  const name = document.getElementById('d-name').value.trim();
  const license = document.getElementById('d-license').value.trim();
  if (!name || !license) return showToast('Name and license number are required');
  doctorProfile = {
    name, license,
    email: document.getElementById('d-email').value,
    phone: document.getElementById('d-phone').value,
    dept: document.getElementById('d-dept').value,
    spec: document.getElementById('d-spec').value,
    hospital: document.getElementById('d-hospital').value,
    exp: document.getElementById('d-exp').value,
    role: document.getElementById('d-role').value,
  };
  renderDoctorDashboard();
  goTo('page-doctor-dashboard');
  showToast('Doctor profile created!');
}

function renderDoctorDashboard() {
  if (!doctorProfile) return;
  const d = doctorProfile;
  document.getElementById('doc-name').textContent = d.name;
  document.getElementById('doc-sub').textContent = `${d.spec || 'Specialist'} · ${d.hospital || 'Healthcare Provider'}`;
  document.getElementById('doc-role-badge').textContent = d.role || 'Physician';
  const grid = document.getElementById('doc-info-grid');
  const cards = [
    ['Department', d.dept || '—'],
    ['Speciality', d.spec || '—'],
    ['Experience', d.exp ? d.exp + ' years' : '—'],
    ['License No.', d.license],
    ['Email', d.email || '—'],
    ['Phone', d.phone || '—'],
  ];
  grid.innerHTML = cards.map(([l, v]) =>
    `<div class="info-card"><div class="label">${l}</div><div class="value" style="font-size:14px">${v}</div></div>`
  ).join('');
  renderPatientsList();
}

function renderPatientsList() {
  const container = document.getElementById('patients-list-container');
  if (patients.length === 0) {
    container.innerHTML = '<div class="review-empty"><div class="big">🏥</div><p>No patients registered yet. Patients will appear here once they create their dashboards.</p></div>';
    return;
  }
  container.innerHTML = patients.map((p, i) => {
    const risk = getRiskBadge(p.screeningScore);
    return `<div class="patient-row" onclick="openPatientModal(${i})">
      <div class="avatar">${p.name.charAt(0).toUpperCase()}</div>
      <div class="info">
        <h4>${p.name}</h4>
        <p>Age ${p.age} · ${p.gender} · ${p.blood || 'Blood N/A'}</p>
      </div>
      <span class="risk-badge ${risk.cls}">${risk.label}</span>
    </div>`;
  }).join('');
}

function getRiskBadge(score) {
  if (score === null || score === undefined) return { label: 'Unscreened', cls: 'risk-low' };
  if (score <= 7) return { label: 'Low Risk', cls: 'risk-low' };
  if (score <= 14) return { label: 'Moderate', cls: 'risk-mod' };
  if (score <= 24) return { label: 'High Risk', cls: 'risk-high' };
  return { label: 'Emergency', cls: 'risk-emergency' };
}

function openPatientModal(idx) {
  selectedPatientIdx = idx;
  const p = patients[idx];
  document.getElementById('modal-patient-name').textContent = p.name;
  document.getElementById('modal-patient-info').innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">
      ${[
        ['Age', p.age],
        ['Gender', p.gender],
        ['Blood Group', p.blood || 'N/A'],
        ['Glucose', p.glucose ? p.glucose + ' mg/dL' : 'N/A'],
        ['Heart Rate', p.heartrate ? p.heartrate + ' bpm' : 'N/A'],
        ['Cholesterol', p.cholesterol ? p.cholesterol + ' mg/dL' : 'N/A'],
        ['Screening Score', p.screeningScore !== null ? p.screeningScore + ' pts' : 'Not screened']
      ].map(([l, v]) =>
        `<div style="background:#F8FBFE;border-radius:8px;padding:10px">
          <div style="font-size:11px;color:var(--muted);font-weight:600">${l}</div>
          <div style="font-size:14px;font-weight:500;color:var(--text);margin-top:2px">${v}</div>
        </div>`
      ).join('')}
    </div>
    ${p.history ? `<div style="background:#F8FBFE;border-radius:8px;padding:10px;margin-bottom:8px">
      <div style="font-size:11px;color:var(--muted);font-weight:600;margin-bottom:4px">Medical History</div>
      <div style="font-size:13px;color:var(--text);line-height:1.6">${p.history}</div>
    </div>` : ''}
  `;
  document.getElementById('review-text').value = '';
  document.getElementById('patient-modal').style.display = 'flex';
}

function closeModal() {
  document.getElementById('patient-modal').style.display = 'none';
}

function submitReview() {
  const note = document.getElementById('review-text').value.trim();
  if (!note) return showToast('Please write a note');
  const p = patients[selectedPatientIdx];
  if (!p.reviews) p.reviews = [];
  p.reviews.push({
    doctor: doctorProfile ? doctorProfile.name : 'Doctor',
    note,
    time: new Date().toLocaleString()
  });
  if (patientProfile && patientProfile.name === p.name) {
    patientProfile.reviews = p.reviews;
    if (document.getElementById('page-patient-dashboard').classList.contains('active')) {
      renderPatientDashboard();
    }
  }
  closeModal();
  showToast('Review submitted!');
}

// ── SCREENING ──
function startScreening() {
  currentQ = 0;
  answers = {};
  renderQuestion();
  goTo('page-screening');
}

function renderQuestion() {
  const q = questions[currentQ];
  const progress = ((currentQ + 1) / questions.length) * 100;
  document.getElementById('progress-bar').style.width = progress + '%';
  document.getElementById('q-counter').textContent = `Question ${currentQ + 1} of ${questions.length}`;
  document.getElementById('q-section').textContent = q.section.split('—')[0].trim();
  document.getElementById('q-section-label').textContent = q.section.split('—')[1]?.trim() || '';
  document.getElementById('q-num').textContent = `Q${currentQ + 1}`;
  document.getElementById('q-text').textContent = q.text;
  const opts = document.getElementById('q-options');
  opts.innerHTML = q.options.map((o, i) => {
    const sel = answers[currentQ] === i ? ' selected' : '';
    return `<button class="option-btn${sel}" onclick="selectAnswer(${i})"><span>${o.label}</span><span class="pts">${o.pts} pt${o.pts !== 1 ? 's' : ''}</span></button>`;
  }).join('');
  document.getElementById('btn-prev').style.visibility = currentQ === 0 ? 'hidden' : 'visible';
  document.getElementById('btn-next').textContent = currentQ === questions.length - 1 ? 'See Results →' : 'Next →';
}

function selectAnswer(i) {
  answers[currentQ] = i;
  document.querySelectorAll('.option-btn').forEach((b, j) => b.classList.toggle('selected', j === i));
}

function nextQ() {
  if (answers[currentQ] === undefined) return showToast('Please select an answer');
  if (currentQ < questions.length - 1) {
    currentQ++;
    renderQuestion();
  } else {
    showResults();
  }
}

function prevQ() {
  if (currentQ > 0) { currentQ--; renderQuestion(); }
}

function showResults() {
  let total = 0;
  const breakdown = [];
  questions.forEach((q, i) => {
    const ai = answers[i] ?? 1;
    const opt = q.options[ai];
    total += opt.pts;
    breakdown.push({ q: q.text.substring(0, 50) + '...', ans: opt.label, pts: opt.pts });
  });

  if (patientProfile) patientProfile.screeningScore = total;
  patients.forEach(p => { if (patientProfile && p.name === patientProfile.name) p.screeningScore = total; });

  let level, desc, bgColor, textColor;
  if (total <= 7) {
    level = 'Low Suspicion';
    desc = 'Your score suggests low likelihood of sepsis at this time. Continue monitoring. Seek care if symptoms worsen.';
    bgColor = '#EAFAF1'; textColor = '#27AE60';
  } else if (total <= 14) {
    level = 'Possible Infection / Moderate Concern';
    desc = 'There are signs of possible infection. A medical review is recommended soon. Do not delay if symptoms are worsening.';
    bgColor = '#FEFCE8'; textColor = '#D97706';
  } else if (total <= 24) {
    level = 'High Suspicion of Sepsis';
    desc = 'Your score indicates high suspicion of sepsis. Urgent clinical evaluation is strongly recommended. Please visit a hospital or call emergency services.';
    bgColor = '#FEF2F2'; textColor = '#DC2626';
  } else {
    level = 'Emergency — Seek Help Immediately';
    desc = 'Your score is critically high. This requires immediate emergency evaluation. Call emergency services or go to the nearest emergency room NOW.';
    bgColor = '#FF3B30'; textColor = '#fff';
  }

  const ring = document.getElementById('score-ring');
  ring.style.background = bgColor;
  ring.style.border = `4px solid ${textColor}`;
  document.getElementById('final-score').style.color = textColor;
  document.getElementById('final-score').textContent = total;
  document.getElementById('result-level').textContent = level;
  document.getElementById('result-level').style.color = textColor;
  document.getElementById('result-desc').textContent = desc;

  const redFlags = [];
  [10, 11, 12, 13, 14, 15].forEach(i => { if (answers[i] === 0) redFlags.push(questions[i].text.split('?')[0]); });
  const rfSection = document.getElementById('red-flag-section');
  if (redFlags.length > 0) {
    rfSection.innerHTML = `<div class="red-flag-alert"><h4>⚠️ Red Flag Override — Treat as Emergency</h4><ul>${redFlags.map(f => `<li>${f}</li>`).join('')}</ul></div>`;
  } else {
    rfSection.innerHTML = '';
  }

  document.getElementById('breakdown-list').innerHTML = breakdown.map((b, i) =>
    `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border);font-size:13px">
      <span style="color:var(--muted);flex:1;margin-right:8px">Q${i + 1}: ${b.q}</span>
      <span style="font-weight:500;color:var(--text);margin-right:8px">${b.ans}</span>
      <span style="font-weight:700;color:${b.pts >= 5 ? '#DC2626' : b.pts >= 3 ? '#D97706' : 'var(--primary)'};min-width:40px;text-align:right">${b.pts} pts</span>
    </div>`
  ).join('');

  goTo('page-result');
}
