# RetinaGuard AI

## Overview

RetinaGuard AI is a full-stack AI-powered web application for detecting early signs of Diabetic Retinopathy from retinal fundus images. Built for rural healthcare centers to enable instant AI-based diagnosis and risk reports.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite + Tailwind CSS + Recharts + Framer Motion
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server
│   └── retina-guard/       # React + Vite frontend (preview at /)
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Authentication

- Username: `admin` / Password: `admin123` (admin role)
- Username: `doctor` / Password: `doc123` (doctor role)
- Auth stored in localStorage (demo only)

## Key Features

1. **AI Diagnosis Dashboard** - Upload retinal image, get DR stage (0-4), confidence score
2. **Explainable AI Heatmap** - SVG-based Grad-CAM simulation highlighting affected regions
3. **Risk Assessment** - Automatic risk levels (low/medium/high/critical)
4. **Medical Report** - Browser-printable PDF report
5. **Patient History** - Full scan history with patient records
6. **Doctor Dashboard** - Review and confirm AI diagnoses
7. **Analytics Dashboard** - DR stage distribution, risk breakdown charts
8. **Emergency Alerts** - Red alert for severe/proliferative DR
9. **Voice Assistance** - Web Speech API text-to-speech for diagnosis
10. **Blindness Risk Score** - 0-100 numerical score

## DR Stages

- 0: No DR → Low Risk
- 1: Mild DR → Medium Risk
- 2: Moderate DR → High Risk
- 3: Severe DR → Critical Risk
- 4: Proliferative DR → Critical Risk

## API Routes

- `GET /api/healthz` - Health check
- `GET/POST /api/patients` - Patient management
- `GET /api/patients/:id` - Single patient
- `GET /api/scans` - List scans (optional ?patientId=)
- `POST /api/scans/analyze` - Run AI analysis on uploaded image
- `GET /api/scans/:id` - Single scan
- `PATCH /api/scans/:id` - Doctor update (confirm/notes)
- `GET /api/reports/:scanId` - Report data for PDF
- `GET /api/analytics/summary` - Analytics data

## Database Schema

- `patients` - Patient records (name, age, gender, diabetesType, contactInfo)
- `scans` - Scan results (drStage, confidenceScore, riskLevel, blindnessRiskScore, heatmapData, doctorConfirmed, etc.)

## Development

```bash
# Start API server
pnpm --filter @workspace/api-server run dev

# Start frontend
pnpm --filter @workspace/retina-guard run dev

# Push DB schema
pnpm --filter @workspace/db run push

# Run codegen
pnpm --filter @workspace/api-spec run codegen

# Seed database
pnpm --filter @workspace/scripts run seed
```
