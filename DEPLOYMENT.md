# 🚀 Eventra Deployment Guide

Eventra is built to deploy easily anywhere: **Render**, **Railway**, **Vercel + Render**, **Heroku**, or any Docker/VPS environment.

---

## 🌟 Quick Choice: Which Deployment Option Should You Choose?

| Option | Architecture | Cost | Best For |
|---|---|---|---|
| **Option A (Recommended)** | **Unified Fullstack on Render / Railway** | 100% Free | Simplest 1-service setup, zero CORS setup, automatic builds |
| **Option B** | **Vercel (Frontend) + Render (Backend)** | 100% Free | Global Edge CDN for React frontend, separate backend scale |

---

## 📋 Required Prerequisites Before Deploying

Make sure you have accounts for these free services:

1. **MongoDB Atlas** (Database - Free 512MB M0 cluster)
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
   - In **Network Access**, add IP: `0.0.0.0/0` (Allow access from anywhere, required for cloud PaaS hosts like Render/Vercel).
   - In **Database Access**, create a database user and password.
   - Click **Connect** → **Drivers** and copy your `MONGO_URI`.

2. **Cloudinary** (Image Uploads - Free Tier)
   - Sign up at [Cloudinary](https://cloudinary.com/).
   - Copy `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` from the Dashboard.

3. **Resend** (Email Delivery & Ticket QR Codes - Free Tier 3,000 emails/month)
   - Sign up at [Resend](https://resend.com/).
   - Create an API key and copy it (`re_...`).
   - *(Note: If omitted, the server automatically uses Ethereal test inboxes with instant preview links).*

4. **Stripe** *(Optional)*
   - Test mode Stripe key (`sk_test_...`) or leave blank for instant free demo booking.

---

## Option A: Deploy as a Single Fullstack Service on Render (Recommended)

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "feat: ready for production deployment"
   git push origin main
   ```

2. **Log into [Render Dashboard](https://dashboard.render.com/)**:
   - Click **New +** → **Blueprint**.
   - Select your repository.
   - Render will detect `render.yaml` automatically.
   - Or click **New +** → **Web Service**:
     - **Build Command**: `npm run install:all && npm run build`
     - **Start Command**: `npm start`
     - **Environment Variables**:
       | Variable | Value |
       |---|---|
       | `NODE_ENV` | `production` |
       | `PORT` | `5000` |
       | `MONGO_URI` | `mongodb+srv://...` |
       | `JWT_SECRET` | *(click Generate or enter 64-char string)* |
       | `JWT_EXPIRE` | `7d` |
       | `CLOUDINARY_CLOUD_NAME` | *(from Cloudinary)* |
       | `CLOUDINARY_API_KEY` | *(from Cloudinary)* |
       | `CLOUDINARY_API_SECRET` | *(from Cloudinary)* |
       | `CLIENT_URL` | `*` |
       | `RESEND_API_KEY` | `re_...` |
       | `EMAIL_FROM` | `Eventra <onboarding@resend.dev>` |

3. Click **Deploy Web Service**. That's it!

---

## Option B: Decoupled Deploy (Vercel Frontend + Render Backend)

### 1. Deploy the Backend on Render
- Follow the Render Web Service steps above, but set:
  - **Root Directory**: `server`
  - **Build Command**: `npm install`
  - **Start Command**: `npm start`
  - Set `CLIENT_URL` to your future Vercel domain (e.g. `https://my-eventra.vercel.app`).
  - Copy the deployed backend URL (e.g. `https://eventra-api.onrender.com`).

### 2. Deploy the Frontend on Vercel
- Go to [Vercel](https://vercel.com/) and click **Add New Project**.
- Select your repository.
- **Root Directory**: `client`
- **Framework Preset**: `Vite`
- **Environment Variables**:
  - `VITE_API_URL`: `https://eventra-api.onrender.com/api`
- Click **Deploy**.
- The included `client/vercel.json` ensures all React Router deep links (`/events/:id`, `/bookings`, etc.) work flawlessly without 404 errors.

---

## Option C: Deploy Frontend on Netlify (with Render Backend)

Your backend is already running on Render (`https://eventra-backend-bio5.onrender.com`).

### Step-by-Step Netlify Setup:

1. **Log in to [Netlify Dashboard](https://app.netlify.com/)** and click **Add new site** → **Import an existing project**.
2. Select your Git provider (GitHub / GitLab) and select the `event-portal` repository.
3. **Build settings** (Netlify will auto-detect from [netlify.toml](file:///d:/event-portal/netlify.toml)):
   - **Base directory**: `client`
   - **Build command**: `npm run build`
   - **Publish directory**: `client/dist` (or `dist` if base is `client`)
4. **Environment Variables**:
   - Click **Add environment variable**:
     - **Key**: `VITE_API_URL`
     - **Value**: `https://eventra-backend-bio5.onrender.com/api`
5. Click **Deploy site**.
6. **Update Render CORS**:
   - In your Render dashboard for `eventra-backend-bio5`, go to **Environment** and set:
     - `CLIENT_URL` = `*` (or your Netlify URL, e.g. `https://your-site-name.netlify.app`).

---

## 🔒 Security Best Practices for Git

- Never commit `.env` files containing real production secrets.
- `.env` is already configured in `.gitignore`.
- Provide environment variables directly via your hosting platform's dashboard (Render, Vercel, Railway, Heroku).
- Use `.env.example` as a template.

---

## 🩺 Production Health Check

Once deployed, you can verify your service status anytime:
- `GET https://your-domain.com/api/health` -> `{"success": true, "message": "Eventra API is running"}`
