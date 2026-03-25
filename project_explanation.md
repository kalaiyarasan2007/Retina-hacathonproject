# 🏥 RetinaGuard AI — Complete Project Explanation

> **Prepared for:** Viva / Presentation / Project Review  
> **Style:** Beginner-friendly, structured, professional  
> **Note:** This document only explains what is already implemented — no assumptions, no additions.

---

## 1. 📌 Project Title & Overview

### Project Name: **RetinaGuard AI**

**What does this project do?**

RetinaGuard AI is a **medical web application** that helps doctors and admins detect **Diabetic Retinopathy (DR)** — an eye disease caused by diabetes — by analyzing retinal (eye) scan images using Artificial Intelligence.

**In simple words:**
> A doctor uploads a patient's eye fundus image → the AI system analyzes it → the system tells the doctor which stage of the disease the patient has, the risk level, and what treatment steps to take.

**Who uses it?**
- **Doctor** — uploads scans, sees results, writes clinical notes, confirms diagnoses
- **Admin** — manages the overall system and patient records

---

## 2. 🛠️ Technologies Used

### Frontend & UI
| Layer | Technology |
|-------|-----------|
| **UI Framework** | React 19 (TypeScript) |
| **Build Tool** | Vite 7 |
| **Routing** | Wouter |
| **Animations** | Framer Motion |
| **Styling** | Tailwind CSS v4 |
| **UI Components** | shadcn/ui (new-york style) + Radix UI primitives |
| **State / Data Fetching** | TanStack React Query v5 |
| **Forms** | React Hook Form + Zod |
| **Charts** | Recharts (bar chart, pie/donut chart) |
| **File Upload** | React Dropzone |
| **Icons** | Lucide React, React Icons |
| **Notifications** | Sonner (toasts) |
| **Theme** | next-themes (dark/light mode) |
| **Date Formatting** | date-fns |

### Backend (Node.js API Server)
| Layer | Technology |
|-------|-----------|
| **Runtime** | Node.js |
| **Framework** | Express 5 (TypeScript) |
| **TS Execution** | tsx (runs TypeScript directly in dev) |
| **Middleware** | cors, cookie-parser |
| **Image Processing** | jimp |

### Backend (Python AI Layer)
| Layer | Technology |
|-------|-----------|
| **Web Framework** | Flask ≥ 2.3 |
| **Deep Learning** | TensorFlow ≥ 2.12 / Keras |
| **AI Model Backbone** | MobileNetV2 (pre-trained on ImageNet) |
| **Image Processing** | OpenCV (cv2) |
| **Numerical Computing** | NumPy |
| **Image Support** | Pillow |
| **Training Only** | pandas, scikit-learn |

### Database & ORM
| Layer | Technology |
|-------|-----------|
| **Database** | PostgreSQL |
| **ORM** | Drizzle ORM |
| **Migrations** | drizzle-kit |
| **Schema Validation** | Zod + drizzle-zod |
| **DB Driver** | pg (node-postgres) |

### API Design & Code Generation
| Layer | Technology |
|-------|-----------|
| **API Specification** | OpenAPI 3.1 (YAML) |
| **Code Generator** | Orval (generates React Query hooks + Zod validators from OpenAPI) |
| **Validation** | Zod v3 |

### Developer Tooling & Monorepo
| Layer | Technology |
|-------|-----------|
| **Package Manager** | pnpm (workspaces monorepo) |
| **Monorepo Manager** | pnpm workspaces |
| **Multi-server Dev** | concurrently |
| **Type Checking** | TypeScript ~5.9 |
| **Code Formatter** | Prettier |
| **Bundler (internal)** | esbuild |

### Authentication
| Method | Details |
|--------|---------|
| Custom React Context + localStorage | Frontend-only; role stored as JSON under key `retina_auth` |
| Two roles | `doctor`, `admin` |

---

## 3. 📁 Project Structure (High-Level)

```
RETINA-EYE PROJECT/                 ← Monorepo root
├── .env                            ← DATABASE_URL + PORT secrets
├── package.json                    ← Root scripts (dev:all, build, typecheck)
├── pnpm-workspace.yaml             ← Monorepo package registry
│
├── artifacts/
│   ├── api-server/                 ← Node.js/Express REST API (TypeScript)
│   │   └── src/
│   │       ├── index.ts            ← Server entry point (binds port)
│   │       ├── app.ts              ← Express app setup
│   │       ├── routes/             ← patients, scans, analytics, reports, health
│   │       └── lib/
│   │           ├── image-analysis.ts  ← Spawns Python worker, sends image path
│   │           └── ai-simulation.ts   ← Builds AnalysisResult from Python output
│   │
│   └── retina-guard/               ← React Frontend (Vite SPA)
│       ├── vite.config.ts          ← Vite config + /api proxy → localhost:3000
│       ├── components.json         ← shadcn/ui config
│       └── src/
│           ├── App.tsx             ← Router + QueryClient + AuthProvider
│           ├── main.tsx            ← React DOM render entry
│           ├── index.css           ← Tailwind base + CSS variables
│           ├── pages/              ← Login, Dashboard, UploadAnalyze, ScanResult, etc.
│           ├── components/         ← DeleteButton, AppLayout, UI components
│           └── lib/
│               ├── auth.tsx        ← AuthContext, AuthProvider, useAuth hook
│               ├── utils.ts        ← clsx / tailwind-merge helper
│               └── i18n-data.ts    ← All 5-language translation strings
│
├── lib/                            ← Shared libraries (used by both frontend & backend)
│   ├── db/
│   │   ├── drizzle.config.ts       ← Drizzle-kit config (PostgreSQL dialect)
│   │   └── src/
│   │       └── schema/
│   │           ├── patients.ts     ← patients table definition
│   │           └── scans.ts        ← scans table definition
│   ├── api-spec/
│   │   ├── openapi.yaml            ← Full OpenAPI 3.1 API contract
│   │   └── orval.config.ts         ← Orval code-gen config
│   ├── api-client-react/
│   │   └── src/generated/          ← Auto-generated React Query hooks
│   └── api-zod/
│       └── src/generated/          ← Auto-generated Zod request validators
│
├── backend/
│   └── app.py                      ← Flask server (/health, /predict routes)
├── predict.py                      ← Python AI worker (stdin → inference → stdout JSON)
├── train_dr.py                     ← MobileNetV2 training script
├── requirements.txt                ← Python dependencies
├── model/
│   └── dr_model.h5                 ← Trained Keras model file
└── scripts/
    └── src/seed.ts                 ← Seeds database with sample patients & scans
```

---

## 4. 🗄️ Database Design

There are **two main tables** in the PostgreSQL database:

### Table 1: `patients`

| Column | Type | Description |
|--------|------|-------------|
| `id` | Serial (Auto number) | Unique patient ID |
| `name` | Text | Patient full name |
| `age` | Integer | Patient age |
| `gender` | Text | male / female / other |
| `diabetesType` | Text | type1 / type2 / gestational / null |
| `contactInfo` | Text | Phone or email |
| `isDeleted` | Boolean | Soft-delete flag (default: false) |
| `createdAt` | Timestamp | Registration date & time (server-set) |

### Table 2: `scans`

| Column | Type | Description |
|--------|------|-------------|
| `id` | Serial (Auto number) | Unique scan ID |
| `patientId` | Integer | Links to the patients table |
| `imageData` | Text | Base64 encoded eye image |
| `drStage` | Integer (0–4) | The AI-predicted DR stage |
| `confidenceScore` | Real | AI's confidence (0.0 to 1.0) |
| `riskLevel` | Text | low / medium / high / critical |
| `blindnessRiskScore` | Integer (0–100) | Numeric risk of vision loss |
| `heatmapData` | Text (JSON) | Hotspot coordinates on the retinal image |
| `doctorConfirmed` | Boolean | Has a doctor reviewed this scan? |
| `doctorNotes` | Text | Doctor's written notes |
| `doctorId` | Text | Which doctor confirmed the scan |
| `recommendation` | Text | Medical advice text |
| `isDeleted` | Boolean | Soft-delete flag (default: false) |
| `createdAt` | Timestamp | When the scan was taken |

> **Soft Delete (Scans):** Records are never truly erased. `isDeleted` is set to `true`. All queries filter `WHERE isDeleted = false`.  
> **Hard Delete (Patients):** Patients are physically removed from the DB, and all remaining patient IDs are re-compacted to stay sequential (e.g., #PT-0001, #PT-0002...).

---

## 5. 🔐 Module 1 — Authentication (Login)

**File:** `artifacts/retina-guard/src/pages/Login.tsx`  
**Auth context:** `artifacts/retina-guard/src/lib/auth.tsx`

### What it does:
The Login page is the **entry gate** to the system. No one can access any page without logging in.

### How it works:
1. The user sees a **two-column page**:
   - **Left side:** Branding panel with the RetinaGuard AI logo and tagline
   - **Right side:** Login form

2. There are **two quick-select buttons** at the top of the form:
   - **Doctor** button → auto-fills `doctor / doc123`
   - **Admin** button → auto-fills `admin / admin123`

3. The user clicks **"Secure Login"**. The system waits 800ms (to simulate authentication) and then checks:
   - `admin` + `admin123` → grants **admin** role
   - `doctor` + `doc123` → grants **doctor** role
   - Anything else → shows error: `"Invalid credentials"`

4. On success, the `login()` function from `AuthProvider` saves the user object (username + role) into:
   - **React Context** (in-memory, for the current session)
   - **localStorage** (under key `retina_auth`, so login survives page refresh)

### Key Point:
Authentication is **frontend-only** — no server-side session, no JWT tokens. The user's role controls what they can see and do inside the app.

---

## 6. 🏠 Module 2 — Dashboard

**File:** `artifacts/retina-guard/src/pages/Dashboard.tsx`

### What it does:
The Dashboard is the **home screen** after login. It shows a real-time overview of the entire clinic's DR screening activity.

### What is displayed:
1. **4 Stat Cards** at the top:
   - Total Patients registered
   - Total Scans analyzed
   - Critical Cases count (highlighted in red)
   - Average AI Confidence score (in %)

2. **Recent Screenings Table** (bottom):
   - Shows the last 5 scans
   - Columns: Patient Name, Date, DR Stage, Risk Level, Confirmation Status, Action
   - Each row has a **"View Result"** link and a **Delete button**

3. **"New Scan" button** (top-right) — takes the user to the upload page

### How data loads:
- Calls `GET /api/analytics/summary` → gets the 4 stat card values
- Calls `GET /api/scans` → gets the recent scans list
- Both calls use **TanStack React Query** (auto-fetches, caches data)

---

## 7. 📤 Module 3 — Upload & Analyze (Scan Submission)

**File:** `artifacts/retina-guard/src/pages/UploadAnalyze.tsx`

### What it does:
This is where a doctor actually **uploads a patient's retinal image** and triggers the AI analysis.

### Step-by-step user flow:

**Step 1 — Select Patient**
- A dropdown lists all registered patients (fetched live from database)
- Doctor picks the patient whose eye is being scanned

**Step 2 — Upload Image**
- A **drag-and-drop zone** (powered by React Dropzone) allows the doctor to drag a `.jpg` or `.png` eye image
- Alternatively, they can click to open a file picker
- Once an image is dropped, a **preview** appears immediately in the zone
- There is also a **"Load Demo Image"** button for testing (pre-loads a sample retina image)

**Step 3 — Analyze**
- A summary panel on the right shows: selected patient name, filename, file size
- Doctor clicks **"Analyze Scan"** button (disabled until both patient and image are selected)
- A **scanning animation** screen appears:
  - Shows the uploaded image with a glowing ring and a **moving scan line**
  - Shows text: *"Running AI Model..."*
  - This lasts ~2.5 seconds (simulated processing delay)

**Step 4 — Redirect**
- After analysis completes, the app automatically navigates to:
  `/scans/{new-scan-id}` — the Scan Result page

### How it sends data:
- The image is converted to **Base64** (a text representation of the image)
- A `POST /api/scans/analyze` request is sent with:
  ```json
  {
    "patientId": 3,
    "imageData": "data:image/png;base64,iVBOR..."
  }
  ```

---

## 8. ⚙️ Module 4 — API Communication (Frontend ↔ Backend)

### Node.js API Server (`artifacts/api-server/`)

The **Node.js/Express API** is the central brain that handles all data operations.

#### API Endpoints:

| Method | Endpoint | What it does |
|--------|----------|-------------|
| `GET` | `/api/healthz` | Server health check |
| `GET` | `/api/patients` | Get all active patients |
| `POST` | `/api/patients` | Register a new patient |
| `GET` | `/api/patients/:id` | Get one patient's details |
| `DELETE` | `/api/patients/:id` | **Hard-delete** a patient + re-compress IDs |
| `GET` | `/api/scans` | Get all active scans (filterable by patientId) |
| `POST` | `/api/scans/analyze` | Analyze a retinal image → triggers Python AI → creates scan record |
| `GET` | `/api/scans/:id` | Get a specific scan result |
| `PATCH` | `/api/scans/:id` | Doctor confirms or adds notes to a scan |
| `DELETE` | `/api/scans/:id` | Soft-delete a scan (`isDeleted = true`) |
| `GET` | `/api/reports/:scanId` | Get full medical report for a scan |
| `GET` | `/api/analytics/summary` | Get dashboard statistics |

#### Auto-generated API Client (Orval):
The OpenAPI YAML (`lib/api-spec/openapi.yaml`) is the **single source of truth** for the API contract. Orval reads it and generates:
- **`lib/api-client-react/src/generated/`** — React Query hooks (e.g., `useGetPatients()`, `useAnalyzeScan()`)
- **`lib/api-zod/src/generated/`** — Zod validators for request bodies

This means all API types and hooks are **auto-generated** — never written by hand.

#### Vite Dev Proxy:
In development, all `/api/*` requests from the frontend are automatically forwarded to `http://localhost:3000` by Vite's proxy config. The frontend never needs to know the backend port.

### Python Flask API (`backend/app.py`)

This is a **separate Python server** that directly exposes the Keras model via HTTP (useful for standalone testing).

| Method | Endpoint | What it does |
|--------|----------|-------------|
| `GET` | `/health` | Confirms Flask API is running |
| `POST` | `/predict` | Accepts a multipart image file, runs Keras model, returns DR prediction JSON |

> **Note:** In the main workflow, Node.js does **not** call Flask over HTTP. Instead it spawns `predict.py` directly as a **child process** and communicates via stdin/stdout. The Flask API exists as a standalone alternative interface.

---

## 9. 🤖 Module 5 — AI Analysis Logic

There are **two AI analysis layers** in this project:

### Layer 1: Python AI Worker (`predict.py`)

This is the **real deep learning pipeline**, spawned by Node.js as a background child process:

1. **Model Loading:**
   - On startup, loads `model/dr_model.h5` — a Keras model with **MobileNetV2** backbone (pre-trained on ImageNet, fine-tuned for DR)
   - If the model file is missing or corrupted, a baseline MobileNetV2 model is auto-created and saved
   - Loaded **once** and kept alive in memory for all subsequent requests

2. **Image Preprocessing (per request):**
   - Reads the image with **OpenCV** (`cv2.imread`)
   - Resizes to **160×160 pixels**
   - Converts from BGR → RGB (`cv2.cvtColor`)
   - Normalizes pixel values from 0–255 → **0.0 to 1.0**
   - Adds a batch dimension: shape becomes `(1, 160, 160, 3)`

3. **Prediction (Smart Decision Logic):**
   - Runs `model.predict()` → outputs 5 class probabilities
   - Gets the top-2 highest-probability classes (top1 and top2)
   - **Smart Decision:** If the difference between top1 and top2 confidence is **< 0.15** (model is uncertain), it randomly picks between them. This prevents always returning the same class for borderline images.
   - Final stage is clipped to valid range **0–4**

4. **Communication with Node.js:**
   - Listens on **stdin** for file paths (one per line)
   - Returns result JSON on **stdout**: `{"stage": 2, "label": "Moderate", "confidence": 0.81}`

### Layer 2: Node.js Analysis Bridge (`image-analysis.ts` + `ai-simulation.ts`)

When `POST /api/scans/analyze` is called:
1. The base64 image is decoded and saved to a **temp file**
2. The file path is sent to the Python worker via stdin
3. Python returns `{stage, confidence}` JSON via stdout
4. `buildAnalysisResult()` enriches this with:
   - **Risk Level**: Stage 0 = low, 1 = medium, 2 = high, 3–4 = critical
   - **Blindness Risk Score**: Based on stage (0→5, 1→20, 2→40, 3→65, 4→90) with slight random variance
   - **Heatmap Data**: Coordinate points for SVG overlay (empty array for deep learning path)
   - **Recommendation text**: One of 5 clinical recommendation messages

> If no image is provided, a **fallback simulation** randomly picks a DR stage using weighted probabilities.

**The 5 DR Stages:**

| Stage | Name | Risk |
|-------|------|------|
| 0 | No DR | Low |
| 1 | Mild NPDR | Medium |
| 2 | Moderate NPDR | High |
| 3 | Severe NPDR | Critical |
| 4 | Proliferative DR | Critical |

### Model Training (`train_dr.py`)

The model is trained using transfer learning on the Kaggle DR dataset:
- **Dataset:** `dataset/resized_train/` (JPEG fundus images) + `dataset/trainLabels.csv` (labels 0–4)
- **Backbone:** MobileNetV2 (pre-trained on ImageNet, top layer frozen initially)
- **Data Augmentation:** rotation, flips, zoom, shifts
- **Split:** 80% train / 20% validation (stratified)
- **Stage 1 Training:** Top classification layers only (15 epochs, EarlyStopping)
- **Stage 2 Fine-tuning:** Top 20 layers of MobileNetV2 unfrozen (5 epochs)
- **Saved to:** `model/dr_model.h5`

---

## 10. 📊 Module 6 — Scan Result Page

**File:** `artifacts/retina-guard/src/pages/ScanResult.tsx`

### What it shows:
This is the **most feature-rich page** in the system. After analysis, the doctor sees:

**Left Panel — Retinal Image + Heatmap:**
- The uploaded retinal image is displayed
- An **SVG heatmap overlay** is drawn on top:
  - **Red circles** = high-intensity damage areas
  - **Yellow circles** = medium-intensity damage areas
  - These are placed based on `heatmapData` (JSON coordinates from the database)

**Right Panel — Diagnostic Cards:**
- **DR Stage Card**: Big number (0–4), stage label, confidence %, blindness risk score
- **AI Recommendation Card**: Plain-English advice for the detected stage
- **Doctor Review Panel** (only shown if user is a Doctor AND scan is not yet confirmed):
  - A text area to enter clinical notes
  - "Confirm Diagnosis" button

**If Doctor Confirms:**
- The `PATCH /api/scans/:id` API is called with `doctorConfirmed: true`, doctor notes, and doctor ID
- The confirmation panel is replaced by a **green "Confirmed by Dr. [name]"** badge

**Critical Alert:**
- If `drStage >= 3`, a bold red warning banner appears at the top

### 🌐 Multi-language Support (Unique Feature):
The scan result page supports **5 languages** (data stored in `lib/i18n-data.ts`):

| Language | Code |
|----------|------|
| English | `en-US` |
| Tamil | `ta-IN` |
| Hindi | `hi-IN` |
| Telugu | `te-IN` |
| Malayalam | `ml-IN` |

The doctor can switch the language using a **dropdown selector**. All labels, stage names, risk levels, recommendations, and UI strings instantly switch to the selected language.

### 🔊 Text-to-Speech (Voice Narration):
- A **"Listen" button** reads the scan result aloud using the browser's `SpeechSynthesis` API
- The narration is spoken in the selected language (e.g., Tamil voice for Tamil text)
- A **"Stop" button** cancels speech mid-way

### 🖨️ Print Report:
- A **"Print Report"** link navigates to `/reports/:scanId` — a printable, formatted medical report

---

## 11. 👥 Module 7 — Patient Management

**File:** `artifacts/retina-guard/src/pages/Patients.tsx`

### What it does:
The Patient Directory page allows viewing and managing all registered patients.

### Features:
- **Search bar** — filters patients by name in real-time (client-side filtering)
- **Patient table** with columns: Patient ID (formatted as #PT-0001), Name, Age/Gender, Diabetes Type, Registration Date, Action
- **"Add Patient" button** → opens a **modal form** with fields:
  - Full Name (required)
  - Age (required, 1–120)
  - Gender (male/female/other)
  - Diabetes Type (type1/type2/gestational/none)
  - Contact Info (phone/email)
- **"View History"** link → goes to `PatientDetail` page (shows all scans for that patient)
- **Delete button** → **permanently hard-deletes** the patient and all their scans; remaining IDs re-compact automatically

---

## 12. 📈 Module 8 — Analytics Page

**File:** `artifacts/retina-guard/src/pages/Analytics.tsx`

### What it shows:
Visual charts derived from all scans in the database:

1. **DR Stage Distribution Bar Chart**
   - Shows how many scans belong to each stage (Stage 0 to Stage 4)
   - Teal-colored bars using Recharts `BarChart`

2. **Risk Level Breakdown Donut Chart**
   - Shows the % of scans at each risk level (low, medium, high, critical)
   - Color-coded: green, yellow, orange, red

All data comes from `GET /api/analytics/summary`.

---

## 13. 📄 Module 9 — Report Page

**File:** `artifacts/retina-guard/src/pages/Report.tsx`

### What it does:
A **printable, formatted medical report** for a specific scan.

**Data shown:**
- Patient details (name, age, gender, diabetes type)
- Scan details (date, DR stage name, confidence, risk, blindness risk)
- AI recommendation
- Treatment plan (from server-side `TREATMENT_PLANS` lookup)
- Risk description
- Doctor confirmation status and notes

**Treatment Plans by Stage (stored in `reports.ts`):**
- Stage 0: Annual eye exam, maintain HbA1c < 7%
- Stage 1: Every 6–9 months, glycemic control
- Stage 2: Referral within 3–6 months, consider laser photocoagulation
- Stage 3: Urgent referral within 1–4 weeks, anti-VEGF therapy
- Stage 4: Emergency referral to vitreoretinal surgeon, immediate surgery evaluation

---

## 14. 🗑️ Module 10 — Global Delete Functionality

**File:** `artifacts/retina-guard/src/components/DeleteButton.tsx`

### What it does:
A **reusable delete button component** that can be placed anywhere in the app.

### How it works:
1. A **red trash icon button** appears on any item (patient or scan)
2. User clicks it → an **AlertDialog (confirmation modal)** appears:
   - Title: e.g., *"Delete Scan?"*
   - Description: *"This will permanently delete this scan..."*
   - Two buttons: **Cancel** and **Delete** (red)
3. User clicks Delete → the `onDelete()` function is called (which calls the API)
4. On success: a **toast notification** appears: *"Record deleted successfully"*
5. On failure: *"Delete failed. Try again."*
6. The UI updates **instantly** without any page reload (React Query refetch)

**It is used in:** Dashboard, Patients page, Scan Result page, Patient Detail page.

---

## 15. 🔄 Complete Data Flow (Step-by-Step)

```
[User types username/password]
        ↓
[Frontend validates role → saves to React Context + localStorage]
        ↓
[Dashboard loads → GET /api/analytics/summary + GET /api/scans]
        ↓ (Doctor clicks "New Scan")
[UploadAnalyze page → Doctor selects patient from GET /api/patients]
        ↓ (Doctor uploads image)
[Image converted to Base64 in browser]
        ↓ (Doctor clicks "Analyze Scan")
[POST /api/scans/analyze → { patientId, imageData }]
        ↓
[Node.js Server receives request]
        ↓
[image-analysis.ts saves Base64 image to temp file]
        ↓
[Temp file path sent via stdin to Python worker (predict.py)]
        ↓
[Python worker: OpenCV reads image → resize 160×160 → normalize → MobileNetV2 predict()]
        ↓
[Smart Decision Logic selects final DR stage]
        ↓
[Python returns JSON via stdout: { stage, label, confidence }]
        ↓
[buildAnalysisResult() maps to: risk level, blindness score, heatmap, recommendation]
        ↓
[INSERT into scans table in PostgreSQL via Drizzle ORM]
        ↓
[Server returns the new scan record (including scan ID)]
        ↓
[Frontend navigates to /scans/{id}]
        ↓
[GET /api/scans/{id} → fetch scan + patient data]
        ↓
[ScanResult page displays: image, heatmap overlay, DR stage,
 confidence, risk, recommendation, doctor review panel]
        ↓ (Doctor types notes + clicks "Confirm Diagnosis")
[PATCH /api/scans/{id} → { doctorConfirmed: true, doctorNotes, doctorId }]
        ↓
[UPDATE scans table in PostgreSQL]
        ↓
[UI updates to show "Confirmed by Dr. [name]" badge]
        ↓ (Doctor clicks "Print Report")
[GET /api/reports/{scanId} → returns full report with treatment plan]
        ↓
[Report page renders a printer-friendly medical document]
```

---

## 16. 🧑‍⚕️ Real-Time Example Walkthrough

> **Scenario:** Dr. Rajan logs in and screens a new patient, Priya Sharma, for Diabetic Retinopathy.

**Step 1 — Login**
Dr. Rajan opens the app. He clicks the **"Doctor"** quick-select button on the login page. The credentials are auto-filled (`doctor` / `doc123`). He clicks **"Secure Login"**. After 0.8 seconds, he is taken to the Dashboard.

**Step 2 — Dashboard**
The dashboard shows: 8 patients, 8 scans analyzed, 2 critical cases, 89.4% average confidence. He can see recent screenings in the table.

**Step 3 — Upload**
Dr. Rajan clicks **"New Scan"**. The Upload & Analyze page opens.
- He selects **Priya Sharma** from the patient dropdown.
- He drags a JPEG fundus image of her eye into the upload zone. A preview appears.
- The summary panel shows: Patient: Priya Sharma, Image: priya_eye.jpg, Size: 1.42 MB.
- He clicks **"Analyze Scan"**.

**Step 4 — Scanning Animation**
The app shows the scanning screen. Priya's image is displayed in a glowing circle with a moving teal scan line and pulsing icon. Text reads: *"Running AI Model..."*. After 2.5 seconds, the system completes.

**Step 5 — Scan Result**
The app navigates to `/scans/9`. The result shows:
- **DR Stage: 2** (Moderate NPDR)
- **Risk: High** (orange badge)
- **AI Confidence: 91.0%**
- **Blindness Risk: 42/100**
- A retinal image with red/yellow heatmap spots showing affected areas
- **AI Recommendation:** *"Noticeable changes were found in your retina. Please see an eye specialist within 3 to 6 months..."*

**Step 6 — Language Change**
Dr. Rajan switches the language to **Tamil (தமிழ்)** so he can explain the results to the patient. All text on the page switches to Tamil instantly.

**Step 7 — Voice Narration**
He clicks **"கேளுங்கள்"** (Listen). The browser speaks the diagnosis result aloud in Tamil.

**Step 8 — Doctor Confirms**
Dr. Rajan types in the notes area: *"Referred to Dr. Arun, retinal specialist. Laser evaluation scheduled in 3 months."* He clicks **"நோய் கண்டறிதலை உறுதிப்படுத்து"** (Confirm Diagnosis).

The panel changes to a **green "Confirmed by Dr. doctor"** badge with his notes displayed.

**Step 9 — Print Report**
Dr. Rajan clicks **"அறிக்கை அச்சிடு"** (Print Report). The report page opens showing the full printable medical report including patient info, scan data, risk description, and treatment plan.

**Step 10 — Done**
The scan is saved in the database with `doctorConfirmed = true`, ready for future reference.

---

## 17. 🏗️ Architecture Summary

```
┌──────────────────────────────────────────────────────┐
│               React Frontend (Vite SPA)              │
│  Wouter routing │ React Query │ shadcn/ui + Tailwind  │
└────────────────────────┬─────────────────────────────┘
                         │ /api/* (Vite proxy)
                         ▼
┌──────────────────────────────────────────────────────┐
│          Node.js + Express API (TypeScript)           │
│  Drizzle ORM │ Zod validation │ Orval-generated types │
└──────────┬───────────────────────────┬───────────────┘
           │ Drizzle ORM queries        │ child_process.spawn
           ▼                            ▼
┌─────────────────┐         ┌───────────────────────────┐
│   PostgreSQL    │         │  Python Worker (predict.py)│
│  patients table │         │  MobileNetV2 + TensorFlow  │
│  scans table    │         │  OpenCV image processing   │
└─────────────────┘         └───────────────────────────┘
```

---

## 18. 📋 Summary: Key Features

| Feature | Status |
|---------|--------|
| Doctor & Admin Login (role-based) | ✅ Implemented |
| Session persistence via localStorage | ✅ Implemented |
| Dashboard with live stats | ✅ Implemented |
| Patient registration & management | ✅ Implemented |
| Sequential Patient ID generation (#PT-0001...) | ✅ Implemented |
| Drag-and-drop retinal image upload | ✅ Implemented |
| AI-based DR stage detection (0–4 stages) | ✅ Implemented |
| MobileNetV2 deep learning model | ✅ Implemented |
| Model training script (transfer learning) | ✅ Implemented |
| Node.js ↔ Python IPC via stdin/stdout | ✅ Implemented |
| Heatmap overlay on retinal image | ✅ Implemented |
| Confidence score & blindness risk score | ✅ Implemented |
| Smart Decision Logic for uncertain predictions | ✅ Implemented |
| Doctor review & confirmation workflow | ✅ Implemented |
| Multi-language support (5 languages) | ✅ Implemented |
| Text-to-speech narration in local language | ✅ Implemented |
| Analytics charts (Bar + Pie/Donut) | ✅ Implemented |
| Printable medical report with treatment plan | ✅ Implemented |
| Soft-delete for scans | ✅ Implemented |
| Hard-delete + ID re-compaction for patients | ✅ Implemented |
| Confirmation modal before delete | ✅ Implemented |
| Instant UI updates without page reload | ✅ Implemented |
| OpenAPI spec + auto-generated API client (Orval) | ✅ Implemented |
| Drizzle ORM + drizzle-zod type-safe DB layer | ✅ Implemented |
| pnpm monorepo workspace structure | ✅ Implemented |
| Database seeding with sample data | ✅ Implemented |
| Python Flask standalone inference API | ✅ Implemented |
