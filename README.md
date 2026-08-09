# 🏥 Sahayak Health — AI Health Companion

> **Sahayak** (सहायक / સહાયક) means *helper* or *assistant* in Hindi and Gujarati.

Sahayak Health is a **free, multilingual AI health companion** that helps users describe their symptoms and receive instant, structured health guidance in English, हिंदी, and ગુજરાતી — right from their browser. It triages symptoms into three severity levels (Self-Care / See a Doctor / Emergency), shows nearby hospitals for urgent cases, and can generate a shareable health summary of the conversation.

> ⚠️ **Disclaimer**: This is an informational tool only. It is **not** a substitute for professional medical advice, diagnosis, or treatment.

---

## 🌟 Features

| Feature | Description |
|---|---|
| 💬 **Multilingual chat** | English, हिंदी, ગુજરાતી — switch at any time |
| 🩺 **Symptom triage** | Green / Yellow / Red severity badges on every AI response |
| 🏥 **Hospital Finder** | Shows nearby Surat clinics for yellow/red severity responses |
| 🎤 **Voice input** | Browser Web Speech API with locale-matched recognition |
| 📋 **Health Summary** | One-click AI-generated structured summary of the conversation |
| ⚡ **Quick chips** | 8 symptom shortcut buttons for rapid input |
| 🔁 **Error retry** | Inline retry button if the backend is temporarily unreachable |

---

## 🛠 Tech Stack

### Frontend
- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS v4**
- **Lucide React** (icons)
- **Axios** (HTTP client)
- **Web Speech API** (voice input)

### Backend
- **FastAPI** (Python)
- **Groq API** (`llama-3.3-70b-versatile`) — LLM responses
- **ChromaDB** — local vector store for RAG
- **Sentence Transformers** (`all-MiniLM-L6-v2`) — embeddings
- **Uvicorn** — ASGI server

---

## 📁 Project Structure

```
Sahayak Health/
├── backend/
│   ├── main.py              # FastAPI app, /api/chat, /api/summary endpoints
│   ├── Procfile             # For Render/Railway deployment
│   ├── requirements.txt
│   ├── .env.example         # ← copy to .env and fill in GROQ_API_KEY
│   ├── data/
│   │   └── medical_kb.json  # Source knowledge base
│   └── rag/
│       ├── ingest.py        # Embeds knowledge base into ChromaDB
│       └── query.py         # RAG retrieval + Groq LLM generation
└── frontend/
    ├── app/
    │   ├── page.tsx         # Landing page (/)
    │   └── chat/page.tsx    # Chat interface (/chat)
    ├── components/
    │   ├── SeverityBadge.tsx
    │   ├── HospitalFinder.tsx
    │   └── HealthSummary.tsx
    ├── data/
    │   └── hospitals.json
    └── .env.local.example   # ← copy to .env.local and fill in API URL
```

---

## 🚀 Local Development Setup

### Prerequisites
- **Node.js** 18+ and npm
- **Python** 3.10+
- A **Groq API key** (free tier at [console.groq.com](https://console.groq.com))

### 1 — Backend

```bash
cd backend

# Create and activate a virtual environment
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # macOS / Linux

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env and add your GROQ_API_KEY

# Ingest the knowledge base into ChromaDB (run once)
python -m rag.ingest

# Start the API server
uvicorn main:app --reload --port 8000
```

The backend will be available at `http://localhost:8000`.  
Swagger docs: `http://localhost:8000/docs`

### 2 — Frontend

```bash
cd frontend

# Install dependencies
npm install

# Set up environment variables (optional for local dev)
cp .env.local.example .env.local
# For local dev the default (http://localhost:8000) works without any changes

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ☁️ Deployment

### Backend → Render

1. Create a new **Web Service** on [render.com](https://render.com).
2. Set **Root Directory** to `backend`.
3. Set **Build Command**: `pip install -r requirements.txt && python -m rag.ingest`
4. Set **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add **Environment Variables** in the Render dashboard:
   - `GROQ_API_KEY` = your key
   - `FRONTEND_URL` = your Vercel frontend URL (set after step below)

### Frontend → Vercel

1. Import the repo on [vercel.com](https://vercel.com).
2. Set **Root Directory** to `frontend`.
3. Add **Environment Variable**:
   - `NEXT_PUBLIC_API_URL` = your Render backend URL (e.g. `https://sahayak-health-api.onrender.com`)
4. Deploy.

---

## 📸 Screenshots

<!-- Add screenshots here after deployment -->

| Landing Page | Chat Interface | Health Summary |
|---|---|---|
| _Coming soon_ | _Coming soon_ | _Coming soon_ |

---

## 📄 License

MIT — feel free to fork and build on top of this.

---

*Built with ❤️ using Groq, FastAPI, and Next.js.*
