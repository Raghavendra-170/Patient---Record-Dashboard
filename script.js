// ------------------------------
// Config
// ------------------------------
const API_URL = "https://fedskillstest.coalitiontechnologies.workers.dev/";
const authHeader = "Basic " + btoa("coalition:skills-test");

// ------------------------------
// Entry
// ------------------------------
document.addEventListener("DOMContentLoaded", () => {
  fetchPatientData();
});

// ------------------------------
// Fetch + Render
// ------------------------------
async function fetchPatientData() {
  try {
    const res = await fetch(API_URL, { headers: { Authorization: authHeader } });
    if (!res.ok) throw new Error(`Network error: ${res.status}`);
    const data = await res.json();

    const jessica = (data || []).find((p) => p.name === "Jessica Taylor");
    if (!jessica) throw new Error("Jessica Taylor not found.");

    const latestDiag = getLatestDiagnosis(jessica.diagnosis_history);

    // Render sections
    populatePatientInfo(jessica);
    renderVitalsFromDiagnosis(latestDiag);
    renderBloodPressureChart(jessica.diagnosis_history);
    renderDiagnosisList(jessica.diagnosis_history);
    renderOtherPatients(data); // avatars for remaining patients
  } catch (err) {
    console.error(err);
    const msg = String(err && err.message ? err.message : err);
    const pc = document.getElementById("patient-card");
    if (pc) pc.innerHTML = `<p style="color:#c00;">Failed to load patient info: ${msg}</p>`;
    const vg = document.getElementById("vitals-grid");
    if (vg) vg.innerHTML = `<p style="color:#c00;">Failed to load vitals: ${msg}</p>`;
    const dl = document.getElementById("diagnosis-list");
    if (dl) dl.innerHTML = `<li style="color:#c00;">Failed to load diagnosis history: ${msg}</li>`;
    const op = document.getElementById("other-patients-list");
    if (op) op.innerHTML = `<li style="color:#c00;">Failed to load patients: ${msg}</li>`;
  }
}

// ------------------------------
// Utilities
// ------------------------------
function safe(getter, fallback = "—") {
  try {
    const v = getter();
    return v === undefined || v === null || v === "" ? fallback : v;
  } catch {
    return fallback;
  }
}

function formatDOB(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${mm}/${dd}/${yyyy}`; // MM/DD/YYYY
}

function monthNumber(m) {
  return (
    [
      "january","february","march","april","may","june",
      "july","august","september","october","november","december",
    ].indexOf(String(m || "").toLowerCase()) + 1
  );
}

function getLatestDiagnosis(history = []) {
  if (!Array.isArray(history) || history.length === 0) return null;
  const sorted = [...history].sort((a, b) => {
    const aKey = (a.year || 0) * 100 + monthNumber(a.month);
    const bKey = (b.year || 0) * 100 + monthNumber(b.month);
    return aKey - bKey;
  });
  return sorted[sorted.length - 1];
}

// ------------------------------
// Patient Card (with contact block)
// ------------------------------
function populatePatientInfo(patient) {
  const container = document.getElementById("patient-card");
  if (!container) return;

  const bloodType = safe(() => patient.blood_type);
  const gender = safe(() => patient.gender);
  const age = safe(() => patient.age);
  const dob = formatDOB(patient.date_of_birth);
  const phone = safe(() => patient.phone_number);
  const email = safe(() => patient.email);
  const insurance = safe(() => patient.insurance_type);
  const emergencyName = safe(() => patient.emergency_contact.name);
  const emergencyPhone = safe(() => patient.emergency_contact.phone);

  container.innerHTML = `
    <div class="patient-top">
      <img src="${patient.profile_picture}" class="patient-photo" alt="${patient.name}">
      <div class="patient-details">
        <h2>${patient.name}</h2>
        <div class="patient-meta">
          <span>${age} yrs</span>
          <span>${gender}</span>
          <span>Blood: ${bloodType}</span>
        </div>
        <div class="status-badge">Active Patient</div>
      </div>
    </div>

    <div class="patient-contact">
      <p><strong>DOB:</strong> ${dob}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Emergency Contact:</strong> ${emergencyName} (${emergencyPhone})</p>
      <p><strong>Insurance:</strong> ${insurance}</p>
    </div>
  `;
}

// ------------------------------
// Vitals (from latest diagnosis)
// ------------------------------
function renderVitalsFromDiagnosis(diag) {
  const container = document.getElementById("vitals-grid");
  if (!container) return;

  if (!diag) {
    container.innerHTML = `<p style="color:#c00;">No vitals available.</p>`;
    return;
  }

  const hr = safe(() => diag.heart_rate.value);
  const sys = safe(() => diag.blood_pressure.systolic.value);
  const dia = safe(() => diag.blood_pressure.diastolic.value);
  const temp = safe(() => diag.temperature.value);
  const rr = safe(() => diag.respiratory_rate.value);

  const items = [
    { label: "Heart Rate", value: `${hr} bpm`, icon: "❤️" },
    { label: "Blood Pressure", value: `${sys}/${dia}`, icon: "🩸" },
    { label: "Temperature", value: `${temp} °F`, icon: "🌡️" },
    { label: "Respiratory Rate", value: `${rr} bpm`, icon: "🫁" },
  ];

  container.innerHTML = items
    .map(
      (v) => `
      <div class="vital-box">
        <div class="vital-icon" aria-hidden="true">${v.icon}</div>
        <div class="vital-info">
          <span class="vital-label">${v.label}</span>
          <span class="vital-value">${v.value}</span>
        </div>
      </div>
    `
    )
    .join("");
}

// ------------------------------
// Blood Pressure Chart (default Chart.js)
// ------------------------------
function renderBloodPressureChart(history) {
  const ctx = document.getElementById("bpChart");
  if (!ctx || !history || !history.length) return;

  // sort years ascending
  const sorted = [...history].sort((a, b) => (a.year || 0) - (b.year || 0));
  const labels = sorted.map((d) => d.year);
  const systolic = sorted.map((d) => safe(() => d.blood_pressure.systolic.value, null));
  const diastolic = sorted.map((d) => safe(() => d.blood_pressure.diastolic.value, null));

  new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        { label: "Systolic", data: systolic, borderWidth: 2, pointRadius: 3, tension: 0.3 },
        { label: "Diastolic", data: diastolic, borderWidth: 2, pointRadius: 3, tension: 0.3 },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: true, position: "top" }, tooltip: { enabled: true } },
      scales: { x: { ticks: { autoSkip: true, maxTicksLimit: 8 } }, y: { beginAtZero: false } },
    },
  });
}

// ------------------------------
// Diagnosis History (newest first)
// ------------------------------
function renderDiagnosisList(history) {
  const list = document.getElementById("diagnosis-list");
  if (!list) return;

  if (!Array.isArray(history) || history.length === 0) {
    list.innerHTML = `<li style="color:#c00;">No diagnosis history available.</li>`;
    return;
  }

  const sorted = [...history].sort((a, b) => {
    const aKey = (a.year || 0) * 100 + monthNumber(a.month);
    const bKey = (b.year || 0) * 100 + monthNumber(b.month);
    return bKey - aKey; // newest first
  });

  list.innerHTML = sorted
    .map((d) => {
      const dateLabel = `${d.month} ${d.year}`;
      const title = d.diagnosis || "Checkup";
      const sys = safe(() => d.blood_pressure.systolic.value);
      const dia = safe(() => d.blood_pressure.diastolic.value);
      const hr = safe(() => d.heart_rate.value);

      return `
        <li class="diagnosis-item">
          <div class="diagnosis-icon" aria-hidden="true">📋</div>
          <div class="diagnosis-text">
            <span class="diagnosis-title">${title}</span>
            <span class="diagnosis-meta">${dateLabel} · BP ${sys}/${dia} · HR ${hr} bpm</span>
          </div>
        </li>
      `;
    })
    .join("");
}

// ------------------------------
// Other Patients (avatars, right column bottom)
// ------------------------------
function renderOtherPatients(allPatients) {
  const list = document.getElementById("other-patients-list");
  if (!list) return;

  const others = (allPatients || []).filter((p) => p.name !== "Jessica Taylor");

  list.innerHTML = others
    .map(
      (p) => `
      <li class="other-patient-item">
        <img src="${p.profile_picture}" class="other-patient-photo" alt="${p.name}">
        <div>
          <div class="other-patient-name">${p.name}</div>
          <div class="other-patient-meta">${safe(() => p.gender)}, ${safe(() => p.age)} yrs</div>
        </div>
      </li>
    `
    )
    .join("");
}
