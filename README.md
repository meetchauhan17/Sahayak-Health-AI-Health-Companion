# Sahayak Health — AI Health Companion

**Sahayak** (सहायक / સહાયક) means *helper* or *assistant* in Hindi and Gujarati.

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-black?style=flat-square)](https://sahayak-health-ai-health-companion-nu.vercel.app)
[![API Docs](https://img.shields.io/badge/API_Docs-Railway-blueviolet?style=flat-square)](https://sahayak-health-ai-health-companion-production.up.railway.app/docs)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-Python-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![Groq](https://img.shields.io/badge/LLM-Groq_Llama_3.3_70B-F55036?style=flat-square)](https://groq.com)

A free, multilingual AI health companion that analyzes symptoms and provides structured medical guidance in English, Hindi, and Gujarati. Powered by Groq's Llama 3.3 70B model with a RAG pipeline grounded in a curated medical knowledge base.

> **Medical Disclaimer**: This is an informational tool only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider for any medical concerns.

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Local Development](#local-development)
- [Deployment](#deployment)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Multilingual Support](#multilingual-support)
- [Contributing](#contributing)
- [License](#license)

---

## Features

### AI-Powered Symptom Analysis
- Describe symptoms in plain language and receive structured health guidance
- Every response is grounded in a curated medical knowledge base via RAG
- Three-level triage on every response:
  - **Green** — Mild, self-care at home
  - **Yellow** — Moderate, see a doctor soon
  - **Red** — Emergency, seek immediate care

### Multilingual Support
- English, Hindi, and Gujarati — switch language at any time during chat
- AI generates responses natively in the selected language
- Voice input automatically uses the correct speech recognition locale

### Nearby Healthcare Finder
- Real-time hospital and clinic search powered by OpenStreetMap Nominatim
- Interactive Leaflet map with custom pins, popups, and directions
- Free OSRM routing for turn-by-turn directions
- Phone numbers extracted from OpenStreetMap data
- Quick search chips: Hospital, Clinic, Pharmacy, Emergency, Civil, Kiran

### Family Health Management
- Create and manage profiles for multiple family members
- Run symptom checks on behalf of any family member
- Each member has a separate consultation history

### Health Dashboard and History
- Persistent local consultation history across sessions
- One-click AI-generated health summary with PDF export
- Daily check-in streak tracking
- Visual overview of recent symptoms and severity trends

### Accessibility
- Voice input via the browser Web Speech API
- Eight pre-built quick symptom chips for rapid input
- Full dark and light theme support
- Responsive layout for mobile, tablet, and desktop

---

## Architecture

```
User Browser
    |
    |-- Next.js 16 Frontend (Vercel)
    |       |
    |       |-- /chat          (AI symptom chat)
    |       |-- /nearby-care   (Hospital map)
    |       |-- /family        (Family profiles)
    |       |-- /dashboard     (Health dashboard)
    |       |-- /history       (Consultation history)
    |
    |-- axios POST /api/chat
    |
    v
FastAPI Backend (Railway)
    |
    |-- RAG Pipeline
    |       |-- ChromaDB (vector store)
    |       |-- Sentence Transformers (all-MiniLM-L6-v2)
    |       |-- JSON fallback (medical_kb.json)
    |
    |-- Groq API (llama-3.3-70b-versatile)
    |
    v
Structured JSON Response { response, severity, advice }

External Free APIs (client-side only):
    -- OSM Nominatim  (geocoding and place search)
    -- OSRM           (open-source routing)
    -- Leaflet/CartoDB (map tiles)
```

---

## Tech Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| Next.js 16 (App Router, TypeScript) | UI framework and routing |
| Tailwind CSS v4 | Utility-first styling |
| Leaflet.js | Interactive OpenStreetMap map |
| Axios | HTTP client for API calls |
| Lucide React | Icon library |
| Web Speech API | Browser-native voice input |

### Backend

| Technology | Purpose |
|------------|---------|
| FastAPI | REST API framework |
| Groq SDK | LLM inference (Llama 3.3 70B) |
| ChromaDB | Vector store for RAG |
| Sentence Transformers | Embeddings (all-MiniLM-L6-v2) |
| Uvicorn | ASGI server |
| Python-dotenv | Environment variable management |

### Infrastructure

| Service | Purpose |
|---------|---------|
| Vercel | Frontend hosting with CI/CD |
| Railway | Backend Docker container hosting |
| OpenStreetMap / Nominatim | Free geocoding and place search |
| OSRM | Free open-source routing |
| Groq | Free-tier LLM API |

---

## Project Structure

```
Sahayak Health/
├── README.md
├── Dockerfile                   # Root Dockerfile for Railway deployment
│
├── backend/
│   ├── main.py                  # FastAPI app — /api/chat, /api/summary
│   ├── Dockerfile               # Backend-specific Dockerfile
│   ├── Procfile                 # Uvicorn start command for PaaS platforms
│   ├── requirements.txt         # Python dependencies (~25 MB, no PyTorch)
│   ├── .env.example             # Environment variable template
│   ├── data/
│   │   └── medical_kb.json      # Curated medical knowledge base
│   └── rag/
│       ├── ingest.py            # Embeds knowledge base into ChromaDB
│       └── query.py             # RAG retrieval and Groq LLM generation
│
└── frontend/
    ├── app/
    │   ├── page.tsx             # Landing page (/)
    │   ├── chat/page.tsx        # AI chat interface (/chat)
    │   ├── nearby-care/page.tsx # Hospital map (/nearby-care)
    │   ├── family/page.tsx      # Family profiles (/family)
    │   ├── dashboard/page.tsx   # Health dashboard (/dashboard)
    │   ├── history/page.tsx     # Consultation history (/history)
    │   └── onboarding/page.tsx  # User onboarding (/onboarding)
    ├── components/
    │   ├── SeverityBadge.tsx    # Green/Yellow/Red severity chip
    │   ├── HospitalFinder.tsx   # Hospital card component
    │   ├── HealthSummary.tsx    # AI summary modal and PDF export
    │   ├── CareMap.tsx          # Leaflet interactive map
    │   └── NavBar.tsx           # Bottom navigation bar
    ├── lib/
    │   ├── userProfile.ts       # User profile localStorage management
    │   ├── family.ts            # Family member CRUD operations
    │   ├── history.ts           # Consultation history storage
    │   ├── streak.ts            # Daily check-in streak tracker
    │   └── generatePDF.ts       # Health summary PDF export
    ├── next.config.ts
    ├── package.json
    └── .env.local.example       # Frontend environment variable template
```

---

## Local Development

### Prerequisites

- Node.js 18+ and npm
- Python 3.10+
- A free Groq API key from [console.groq.com](https://console.groq.com)

### 1. Clone the Repository

```bash
git clone https://github.com/meetchauhan17/Sahayak-Health-AI-Health-Companion.git
cd Sahayak-Health-AI-Health-Companion
```

### 2. Backend Setup

```bash
cd backend

# Create and activate a virtual environment
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
# source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Add your GROQ_API_KEY to .env

# Optional: ingest the knowledge base into ChromaDB for vector search
# Without this, the backend uses lightweight keyword-based JSON search
pip install chromadb sentence-transformers
python -m rag.ingest

# Start the server
uvicorn main:app --reload --port 8000
```

Backend available at `http://localhost:8000`  
Swagger docs at `http://localhost:8000/docs`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Optional: configure environment variables
cp .env.local.example .env.local
# Default settings connect to http://localhost:8000 automatically

# Start the development server
npm run dev
```

Frontend available at `http://localhost:3000`

---

## Deployment

### Backend on Railway (Recommended, Free)

1. Go to [railway.app](https://railway.app) and sign in with GitHub
2. Click **New Project** → **Deploy from GitHub repo**
3. Select `Sahayak-Health-AI-Health-Companion`
4. Railway auto-detects the root `Dockerfile` and builds the container
5. Under **Variables**, add:
   - `GROQ_API_KEY` = your Groq API key
   - `FRONTEND_URL` = your Vercel frontend URL
6. Under **Settings → Networking**, click **Generate Domain**
7. Copy the generated domain for use in the Vercel step below

### Frontend on Vercel (Free)

1. Go to [vercel.com](https://vercel.com) and import the GitHub repository
2. Set **Root Directory** to `frontend`
3. Under **Settings → Environment Variables**, add:
   - `NEXT_PUBLIC_API_URL` = your Railway backend URL (include `https://`)
4. Click **Redeploy**

> Without `NEXT_PUBLIC_API_URL`, the frontend falls back to the production Railway URL automatically — useful for quick demos.

### Backend on Koyeb (Alternative, No Credit Card)

1. Go to [koyeb.com](https://www.koyeb.com) and create a free account
2. Click **Create App** → **GitHub**
3. Select the repository, set **Work Directory** to `backend`
4. Add `GROQ_API_KEY` as an environment variable
5. Deploy — Koyeb auto-detects the `Dockerfile`

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | Yes | Groq API key from [console.groq.com](https://console.groq.com) |
| `FRONTEND_URL` | No | Vercel frontend URL for CORS configuration |

### Frontend (`frontend/.env.local`)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | No | Backend URL — defaults to the production Railway endpoint |

---

## API Reference

Base URL: `https://sahayak-health-ai-health-companion-production.up.railway.app`

### POST /api/chat

Analyze symptoms and return structured health guidance.

**Request**

```json
{
  "message": "I have a fever and headache since yesterday",
  "language": "en"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `message` | string | Symptom description in any language |
| `language` | string | `en`, `hi`, `gu`, `English`, `हिंदी`, or `ગુજરાતી` |

**Response**

```json
{
  "response": "You may be experiencing a viral infection. Rest and stay hydrated...",
  "severity": "yellow",
  "advice": "If fever exceeds 103°F or lasts more than 3 days, consult a doctor."
}
```

| Field | Type | Description |
|-------|------|-------------|
| `response` | string | Health guidance in the requested language |
| `severity` | string | `green`, `yellow`, or `red` — always in English |
| `advice` | string | Specific next step in the requested language |

---

### POST /api/summary

Generate a structured summary from a conversation.

**Request**

```json
{
  "conversation": [
    { "role": "user", "content": "I have a fever" },
    { "role": "assistant", "content": "You may have a viral infection..." }
  ]
}
```

**Response**

```json
{
  "symptoms": ["Fever"],
  "severity": "yellow",
  "recommendations": ["Rest", "Stay hydrated", "Monitor temperature"],
  "when_to_seek_care": "Visit a doctor if fever exceeds 103°F",
  "summary": "Based on your reported symptoms..."
}
```

---

### GET /health

Health check endpoint. Returns `{ "status": "ok" }`.

---

## Multilingual Support

| Language | Code | Script | Voice Locale |
|----------|------|--------|--------------|
| English | `en` | Latin | `en-IN` |
| Hindi | `hi` | Devanagari | `hi-IN` |
| Gujarati | `gu` | Gujarati script | `gu-IN` |

Language can be switched at any time during a chat session. The `response` and `advice` fields are generated in the selected language. The `severity` field is always returned in English for consistent UI rendering.

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "feat: describe your change"`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a pull request

Ideas for contributions:
- Additional Indian regional languages (Tamil, Telugu, Bengali, Marathi)
- Health trend analytics and charts
- Medication reminders and symptom tracking over time
- Unit and integration tests for the RAG pipeline
- Progressive Web App and offline support

---

## License

[MIT](LICENSE) — free to use, fork, and build upon.

---

*Built with Groq, FastAPI, Next.js, and OpenStreetMap. Empowering communities with accessible AI health guidance in their own language.*
