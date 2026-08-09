# 🏥 Sahayak Health — AI Health Companion

<div align="center">

> **Sahayak** (सहायक / સહાયક) means *helper* or *assistant* in Hindi and Gujarati.

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-Vercel-black?style=for-the-badge)](https://sahayak-health-ai-health-companion-nu.vercel.app)
[![Backend](https://img.shields.io/badge/🚀_API-Railway-blueviolet?style=for-the-badge)](https://sahayak-health-ai-health-companion-production.up.railway.app/docs)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-Python-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)
[![Groq](https://img.shields.io/badge/LLM-Groq_Llama_3.3_70B-F55036?style=for-the-badge)](https://groq.com)

**A free, multilingual AI health companion that triages symptoms and provides structured medical guidance in English, हिंदी, and ગુજરાતી.**

</div>

---

> ⚠️ **Medical Disclaimer**: Sahayak Health is an informational tool only. It is **not** a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider for any medical concerns.

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [📸 Screenshots](#-screenshots)
- [🏗️ Architecture](#️-architecture)
- [🛠️ Tech Stack](#️-tech-stack)
- [📁 Project Structure](#-project-structure)
- [🚀 Local Development](#-local-development)
- [☁️ Deployment](#️-deployment)
- [🔑 Environment Variables](#-environment-variables)
- [📡 API Reference](#-api-reference)
- [🌍 Multilingual Support](#-multilingual-support)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## ✨ Features

### 🤖 AI-Powered Chat
- **Symptom Analysis** — Describe any symptom in natural language and get structured medical guidance powered by Groq's Llama 3.3 70B model
- **RAG Pipeline** — Responses are grounded in a curated medical knowledge base for accuracy
- **3-Level Triage** — Every response includes a severity badge:
  - 🟢 **Green** — Mild / Self-care at home
  - 🟡 **Yellow** — Moderate / See a doctor soon
  - 🔴 **Red** — Emergency / Seek immediate care

### 🌐 Multilingual Support
- **English**, **हिंदी** (Hindi), **ગુજરાતી** (Gujarati) — switch language at any time during chat
- Voice input automatically uses the correct locale for speech recognition
- AI responses are generated natively in the selected language

### 🗺️ Nearby Healthcare
- **Live OpenStreetMap Integration** — Searches real hospitals, clinics, pharmacies near your city
- **Interactive Leaflet Map** — Toggle between list and map view with custom pins and popups
- **Free OSRM Routing** — Clickable "Get Directions" links using open-source routing
- **Phone Numbers** — Real phone numbers extracted from OpenStreetMap extra tags
- **Quick Search Chips** — One-click search for Hospital, Clinic, Pharmacy, Emergency, Civil, Kiran

### 👨‍👩‍👧 Family Health Management
- **Family Profiles** — Add and manage multiple family members (name, age, relation)
- **Symptom Check for Others** — Check symptoms on behalf of any family member
- **Separate History** — Each member has their own consultation history

### 📊 Health Dashboard & History
- **Consultation History** — Persistent local storage of all previous symptom checks
- **Health Summary** — One-click AI-generated structured summary (PDF export)
- **Daily Streak** — Gamified streak tracking to encourage regular health check-ins
- **Health Dashboard** — Visual overview of recent symptoms and severity trends

### 🎤 Accessibility
- **Voice Input** — Browser Web Speech API with locale-matched recognition
- **Quick Symptom Chips** — 8 pre-built symptom shortcuts for rapid input
- **Dark Mode** — Full dark/light theme support
- **Responsive Design** — Works on mobile, tablet, and desktop

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    USER BROWSER                             │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           Next.js 16 Frontend (Vercel)              │   │
│  │                                                     │   │
│  │  ┌──────────┐  ┌────────────┐  ┌───────────────┐   │   │
│  │  │ /chat    │  │ /nearby-   │  │  /family      │   │   │
│  │  │ AI Chat  │  │ care  Map  │  │  Profiles     │   │   │
│  │  └────┬─────┘  └─────┬──────┘  └───────────────┘   │   │
│  │       │              │                              │   │
│  │       │ axios POST   │ Nominatim/OSRM APIs          │   │
│  └───────┼──────────────┼──────────────────────────────┘   │
│          │              │                                   │
└──────────┼──────────────┼───────────────────────────────────┘
           │              │
           ▼              ▼
┌─────────────────┐   ┌──────────────────────────┐
│  FastAPI Backend │   │  Free External APIs      │
│  (Railway)      │   │                          │
│                 │   │  • OSM Nominatim (search) │
│  /api/chat ─────┤   │  • OSRM (routing)        │
│  /api/summary   │   │  • Leaflet/CartoDB (map) │
│        │        │   └──────────────────────────┘
│        ▼        │
│  RAG Pipeline   │
│  ┌───────────┐  │
│  │ ChromaDB  │  │
│  │ (vectors) │  │
│  └─────┬─────┘  │
│        ▼        │
│  ┌───────────┐  │
│  │ Groq API  │  │
│  │ Llama 3.3 │  │
│  │  70B      │  │
│  └───────────┘  │
└─────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16 | App Router, SSR, TypeScript |
| **Tailwind CSS** | v4 | Utility-first styling |
| **Leaflet.js** | Latest | Interactive OpenStreetMap map |
| **Axios** | Latest | HTTP client for API calls |
| **Lucide React** | Latest | Icon library |
| **Web Speech API** | Browser | Voice input with locale support |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| **FastAPI** | 0.115+ | REST API framework |
| **Groq SDK** | 0.9+ | LLM calls (Llama 3.3 70B) |
| **ChromaDB** | Latest | Vector store for RAG |
| **Sentence Transformers** | Latest | `all-MiniLM-L6-v2` embeddings |
| **Uvicorn** | 0.30+ | ASGI server |
| **Python-dotenv** | 1.0+ | Environment variable management |

### Infrastructure
| Service | Purpose |
|---------|---------|
| **Vercel** | Frontend hosting (CI/CD from GitHub) |
| **Railway** | Backend Docker container hosting |
| **OpenStreetMap / Nominatim** | Free geocoding & place search |
| **OSRM** | Free open-source routing |
| **Groq** | Free-tier LLM API (llama-3.3-70b-versatile) |

---

## 📁 Project Structure

```
Sahayak Health/
├── 📄 README.md
├── 📄 DEPLOYMENT.md         # Detailed deployment guide
├── 📄 DEMO.md               # Feature demo notes
├── 🐳 Dockerfile            # Root Dockerfile for Railway deployment
│
├── backend/
│   ├── 🐍 main.py           # FastAPI app: /api/chat, /api/summary endpoints
│   ├── 🐳 Dockerfile        # Backend-specific Dockerfile
│   ├── 📋 Procfile          # Uvicorn start command for PaaS platforms
│   ├── 📦 requirements.txt  # Python dependencies (lightweight: ~25MB)
│   ├── 🔒 .env.example      # Environment variable template
│   ├── data/
│   │   └── 📚 medical_kb.json   # Curated medical knowledge base (JSON)
│   └── rag/
│       ├── 🔄 ingest.py     # Embeds medical_kb.json into ChromaDB
│       └── 🔍 query.py      # RAG retrieval + Groq LLM generation
│
└── frontend/
    ├── app/
    │   ├── 🏠 page.tsx              # Landing page (/)
    │   ├── chat/page.tsx            # AI chat interface (/chat)
    │   ├── nearby-care/page.tsx     # Nearby hospitals map (/nearby-care)
    │   ├── family/page.tsx          # Family profiles (/family)
    │   ├── dashboard/page.tsx       # Health dashboard (/dashboard)
    │   ├── history/page.tsx         # Consultation history (/history)
    │   └── onboarding/page.tsx      # User onboarding (/onboarding)
    ├── components/
    │   ├── SeverityBadge.tsx        # Green/Yellow/Red severity chip
    │   ├── HospitalFinder.tsx       # Hospital card component
    │   ├── HealthSummary.tsx        # AI summary modal + PDF export
    │   ├── CareMap.tsx              # Leaflet interactive map
    │   └── NavBar.tsx               # Bottom navigation bar
    ├── lib/
    │   ├── userProfile.ts           # User profile localStorage management
    │   ├── family.ts                # Family member CRUD
    │   ├── history.ts               # Consultation history storage
    │   ├── streak.ts                # Daily check-in streak tracker
    │   └── generatePDF.ts           # Health summary PDF export
    ├── 📋 next.config.ts
    ├── 📋 package.json
    └── 🔒 .env.local.example        # Frontend environment variable template
```

---

## 🚀 Local Development

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.10+
- A free **Groq API key** → [console.groq.com](https://console.groq.com)

---

### Step 1 — Clone the Repository

```bash
git clone https://github.com/meetchauhan17/Sahayak-Health-AI-Health-Companion.git
cd Sahayak-Health-AI-Health-Companion
```

---

### Step 2 — Backend Setup

```bash
cd backend

# Create and activate a virtual environment
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate

# Install dependencies (~25MB, no PyTorch required for cloud deploy)
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Open .env and set your GROQ_API_KEY:
# GROQ_API_KEY=gsk_your_key_here

# (Optional) Ingest knowledge base into ChromaDB for vector search
# Skip this if you want the lightweight JSON fallback mode
pip install chromadb sentence-transformers
python -m rag.ingest

# Start the API server
uvicorn main:app --reload --port 8000
```

✅ Backend running at: `http://localhost:8000`  
📖 Swagger API docs: `http://localhost:8000/docs`

> **Note**: Without ChromaDB ingest, the backend automatically falls back to lightweight keyword-based JSON search from `data/medical_kb.json`. Groq LLM responses still work perfectly.

---

### Step 3 — Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# (Optional) Set environment variables for local dev
cp .env.local.example .env.local
# Default settings connect to http://localhost:8000 automatically

# Start the development server
npm run dev
```

✅ Frontend running at: `http://localhost:3000`

---

## ☁️ Deployment

### Backend → Railway (Recommended, Free)

1. Go to [railway.app](https://railway.app) and sign in with GitHub
2. Click **New Project** → **Deploy from GitHub repo**
3. Select `Sahayak-Health-AI-Health-Companion`
4. Railway auto-detects the root `Dockerfile` and builds the container
5. Go to **Variables** tab and add:
   - `GROQ_API_KEY` = `gsk_your_key_here`
   - `FRONTEND_URL` = `https://your-vercel-url.vercel.app`
6. Go to **Settings** → **Networking** → **Generate Domain**
7. Copy your Railway domain (e.g. `https://sahayak-health-ai-health-companion-production.up.railway.app`)

---

### Frontend → Vercel (Free)

1. Go to [vercel.com](https://vercel.com) and import the GitHub repo
2. Set **Root Directory** to `frontend`
3. Go to **Settings** → **Environment Variables** and add:
   - `NEXT_PUBLIC_API_URL` = your Railway backend URL (with `https://`)
4. Click **Redeploy**

> **Tip**: Even without `NEXT_PUBLIC_API_URL`, the frontend auto-connects to the production Railway backend — perfect for instant demos!

---

### Backend → Koyeb (Alternative Free Option, No Credit Card)

1. Go to [koyeb.com](https://www.koyeb.com) and create a free account
2. Click **Create App** → **GitHub**
3. Select the repo, set **Work Directory** to `backend`
4. Add `GROQ_API_KEY` environment variable
5. Deploy — Koyeb auto-detects the `Dockerfile`

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | ✅ Yes | Groq API key from [console.groq.com](https://console.groq.com) |
| `FRONTEND_URL` | ⚪ Optional | Vercel frontend URL for CORS configuration |

### Frontend (`frontend/.env.local`)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | ⚪ Optional | Backend API URL (defaults to Railway production URL) |

---

## 📡 API Reference

Base URL: `https://sahayak-health-ai-health-companion-production.up.railway.app`

### `POST /api/chat`

Analyze user symptoms and return structured health guidance.

**Request Body:**
```json
{
  "message": "I have a fever and headache since yesterday",
  "language": "en"
}
```

| Field | Type | Values |
|-------|------|--------|
| `message` | `string` | User's symptom description (any language) |
| `language` | `string` | `"en"`, `"hi"`, `"gu"`, `"English"`, `"हिंदी"`, `"ગુજરાતી"` |

**Response:**
```json
{
  "response": "You may be experiencing a viral infection. Rest, stay hydrated, and monitor your temperature...",
  "severity": "yellow",
  "advice": "If fever exceeds 103°F or lasts more than 3 days, consult a doctor immediately."
}
```

| Field | Type | Values |
|-------|------|--------|
| `response` | `string` | AI health guidance (in requested language) |
| `severity` | `string` | `"green"` / `"yellow"` / `"red"` (always in English) |
| `advice` | `string` | Specific actionable next step (in requested language) |

---

### `POST /api/summary`

Generate a structured health summary from a conversation.

**Request Body:**
```json
{
  "conversation": [
    { "role": "user", "content": "I have a fever" },
    { "role": "assistant", "content": "You may have a viral infection..." }
  ]
}
```

**Response:**
```json
{
  "symptoms": ["Fever", "Headache"],
  "severity": "yellow",
  "recommendations": ["Rest", "Stay hydrated", "Monitor temperature"],
  "when_to_seek_care": "Visit a doctor if fever exceeds 103°F",
  "summary": "Based on your reported symptoms..."
}
```

---

### `GET /health`

Health check endpoint.

```json
{ "status": "ok" }
```

---

## 🌍 Multilingual Support

| Language | Code | Script | Voice Input |
|----------|------|--------|-------------|
| English | `en` | Latin | `en-IN` |
| हिंदी (Hindi) | `hi` | Devanagari | `hi-IN` |
| ગુજરાતી (Gujarati) | `gu` | Gujarati | `gu-IN` |

Language can be switched at any time during a chat session. The AI responds in the selected language for both the `response` and `advice` fields, while always keeping `severity` in English for consistent UI rendering.

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/your-feature-name`
3. **Commit** your changes: `git commit -m "feat: add your feature"`
4. **Push** to the branch: `git push origin feature/your-feature-name`
5. **Open** a Pull Request

### Ideas for Contributions
- 🌐 Add more regional Indian languages (Tamil, Telugu, Bengali, Marathi)
- 📊 Health trend analytics dashboard
- 🔔 Medication reminders and symptom tracking
- 🧪 Unit tests for the RAG pipeline
- 📱 PWA / offline support

---

## 📄 License

[MIT](LICENSE) — free to use, fork, and build upon.

---

<div align="center">

**Built with ❤️ using Groq, FastAPI, Next.js, and OpenStreetMap**

*Empowering communities with accessible AI health guidance in their own language.*

[🌐 Live Demo](https://sahayak-health-ai-health-companion-nu.vercel.app) · [📖 API Docs](https://sahayak-health-ai-health-companion-production.up.railway.app/docs) · [🐛 Report Bug](https://github.com/meetchauhan17/Sahayak-Health-AI-Health-Companion/issues) · [✨ Request Feature](https://github.com/meetchauhan17/Sahayak-Health-AI-Health-Companion/issues)

</div>
