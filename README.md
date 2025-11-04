# Patient Dashboard – Jessica Taylor  
Coalition Technologies Frontend Skills Test

## 📌 Project Overview
This project is a pixel-accurate implementation of the provided Adobe XD UI, built using **HTML, CSS, and Vanilla JavaScript**.  
It fetches real patient data from the **Coalition Technologies Patient Data API** and renders the UI dynamically.

Only **Jessica Taylor’s** data is displayed, as required in the test instructions.

---

## 🚀 Tech Stack
| Purpose | Tool |
|---------|------|
| UI / Layout | HTML5, CSS3 |
| Logic / API | Vanilla JavaScript (ES6) |
| Charts | Chart.js (via CDN) |
| API | Fetch with Basic Auth |

---

## 📂 Folder Structure
patient-dashboard/
│── index.html
│── styles.css
│── script.js
│── README.md
│── assets/
│ ├── jessica-taylor.jpg (optional)
│ └── doctor.jpg (optional)

---


✅ No build tools  
✅ No frameworks  
✅ Runs in any browser

---

## 🔌 API Info
- URL: `https://fedskillstest.coalitiontechnologies.workers.dev/`
- Auth: **Basic**
  - Username: `coalition`
  - Password: `skills-test`

The project does **not** store any credentials locally — all calls use `fetch()` with Basic Auth.

---

## 🧠 Features Implemented

✔ Fetches live patient data from API  
✔ Displays only **Jessica Taylor** (as required)  
✔ BP chart using Chart.js  
✔ Latest vitals auto-mapped from diagnosis history  
✔ Diagnosis timeline (newest first)  
✔ Other patients list (excluding Jessica)  
✔ Responsive layout (matching XD)  
✔ Sticky sidebar + scrollable content  
✔ Divider between chart row & lower cards  
✔ No extra UI interactions coded (per test rules)

---

## ▶️ How to Run
You **must** use a local server (due to API + CORS).

### Option 1 — VS Code (easiest)
1. Install Live Server extension  
2. Right-click `index.html` → **Open with Live Server**

### Option 2 — Python
```sh
python -m http.server 3000
```

### Option 3 — NPM
```sh
npx http-server .
```

Then open:

http://localhost:3000/
