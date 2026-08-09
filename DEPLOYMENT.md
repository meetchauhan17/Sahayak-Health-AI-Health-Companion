# 🚀 Sahayak Health — Deployment Guide

This guide walks you through deploying **Sahayak Health** for production.

---

## 🌟 Option A: Free Vercel (Frontend) + Render (Backend) — *Recommended*

### 1. Deploy Frontend (Vercel)
1. Go to [Vercel](https://vercel.com) and click **Add New Project**.
2. Import your GitHub repository: [`meetchauhan17/Sahayak-Health-AI-Health-Companion`](https://github.com/meetchauhan17/Sahayak-Health-AI-Health-Companion).
3. Set **Root Directory** to `frontend`.
4. Add **Environment Variable**:
   - `NEXT_PUBLIC_API_URL` = `https://your-backend-url.onrender.com` (your deployed backend URL)
5. Click **Deploy**! Your site will be live at `https://sahayak-health.vercel.app`.

---

### 2. Deploy Backend (Render / Railway / Cloud Run)
1. Go to [Render](https://render.com) and click **New Web Service**.
2. Select your repository: `meetchauhan17/Sahayak-Health-AI-Health-Companion`.
3. Set **Root Directory** to `backend`.
4. Configuration:
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add **Environment Variables**:
   - `GROQ_API_KEY` = `your_groq_api_key_here`
6. Click **Create Web Service**.

---

## 🐳 Option B: Docker Container Deployment

### Backend Dockerfile (`backend/Dockerfile`)
```dockerfile
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Frontend Dockerfile (`frontend/Dockerfile`)
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
```

---

## 📱 Option C: Local Network Access (Phone / LAN)

To access Sahayak Health on your phone or local network:

1. **Backend**:
   ```powershell
   cd backend
   python -m uvicorn main:app --host 0.0.0.0 --port 8000
   ```

2. **Frontend**:
   ```powershell
   cd frontend
   npm run dev -- -H 0.0.0.0
   ```

3. Open **`http://<YOUR_LOCAL_IP>:3000`** (e.g. `http://10.211.47.239:3000`) on your phone connected to the same Wi-Fi!

---

## 🔒 Post-Deployment Checklist
- [x] Verify `GROQ_API_KEY` is set in production environment variables.
- [x] CORS middleware in `backend/main.py` allows your production frontend domain.
- [x] All build checks pass (`npm run build`).
