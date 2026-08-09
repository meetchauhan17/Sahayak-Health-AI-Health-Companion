# 🚀 Sahayak Health — Production Deployment Guide

If you don't want to use Render, here are the top **alternative deployment options** for Sahayak Health:

---

## ⚡ Option 1: Deploy BOTH Frontend + Backend Together on Vercel (100% Free)

You can deploy the entire application (Next.js Frontend + Python FastAPI Backend) together on **Vercel** with zero extra hosting services required!

### Steps:
1. Go to [Vercel](https://vercel.com) and click **Add New Project**.
2. Import your GitHub repository: [`meetchauhan17/Sahayak-Health-AI-Health-Companion`](https://github.com/meetchauhan17/Sahayak-Health-AI-Health-Companion).
3. Set **Root Directory** to `./` (repository root).
4. Add **Environment Variables**:
   - `GROQ_API_KEY` = `your_groq_api_key_here`
5. Click **Deploy**!

Vercel will host both your Next.js UI and your Python FastAPI endpoints under the same domain (`https://sahayak-health.vercel.app`).

---

## 🚀 Option 2: Koyeb (100% Free — No Credit Card Needed)

Koyeb offers a free global container platform with zero cold starts.

### Steps:
1. Go to [Koyeb.com](https://www.koyeb.com) and sign up for a free account.
2. Click **Create App** and select **GitHub**.
3. Choose repository `meetchauhan17/Sahayak-Health-AI-Health-Companion`.
4. Set **Work Directory** to `backend`.
5. Build & Run settings:
   - **Build Command**: `pip install -r requirements.txt`
   - **Run Command**: `python -m uvicorn main:app --host 0.0.0.0 --port 8000`
6. Add **Environment Variables**:
   - `GROQ_API_KEY` = `your_groq_api_key_here`
7. Click **Deploy**. Copy your Koyeb backend URL (e.g. `https://sahayak-backend.koyeb.app`).

---

## 🚂 Option 3: Railway.app

Railway provides instant GitHub deployments for Python and Node.js.

### Steps:
1. Go to [Railway.app](https://railway.app) and click **New Project** -> **Deploy from GitHub**.
2. Select repository `meetchauhan17/Sahayak-Health-AI-Health-Companion`.
3. Set root directory to `backend`.
4. Add variable `GROQ_API_KEY`.
5. Click **Deploy**.

---

## ☁️ Option 4: Google Cloud Run (2 Million Free Requests / Month)

Google Cloud Run runs your backend container with automatic scaling to zero when idle.

### Steps:
1. Install [Google Cloud CLI](https://cloud.google.com/sdk).
2. Deploy backend from the `backend` directory:
   ```bash
   gcloud run deploy sahayak-backend \
     --source . \
     --region us-central1 \
     --allow-unauthenticated \
     --set-env-vars GROQ_API_KEY=your_groq_api_key_here
   ```

---

## 📱 Option 5: Local Network Access (Phone / LAN)

To access Sahayak Health on your phone or local network without cloud hosting:

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

3. Open **`http://<YOUR_LOCAL_IP>:3000`** (e.g. `http://10.211.47.239:3000`) on any phone or laptop on the same Wi-Fi network.
