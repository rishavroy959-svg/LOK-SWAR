# 🚀 Lok Swar - Live Cloud Deployment & Real SMS Integration Guide

This guide explains how to **publish Lok Swar live to the internet** so real citizens and district administrators can access it from their mobile phones, receive real SMS OTPs, and login with genuine Aadhaar / Mobile credentials.

---

## 📱 Part 1: Enabling Real SMS OTP to Real Mobile Numbers

Lok Swar has built-in support for **Fast2SMS**, **Twilio**, and **MSG91**.

### Option A: Fast2SMS (Recommended for India — Instant & Free)
1. Sign up at [https://www.fast2sms.com/](https://www.fast2sms.com/)
2. Navigate to **Dev API** in the sidebar.
3. Copy your **API Authorization Key**.
4. Open your `.env` file and set:
   ```env
   FAST2SMS_API_KEY=your_fast2sms_api_key_here
   ```
5. Restart the server. Now, when any citizen enters their **real 10-digit mobile number**, a real SMS containing the 6-digit OTP will be delivered directly to their phone within 2 seconds.

---

### Option B: Twilio (Global SMS Delivery)
1. Sign up at [https://www.twilio.com/](https://www.twilio.com/)
2. In the Twilio Console, copy your **Account SID**, **Auth Token**, and **Twilio Phone Number**.
3. Open your `.env` file and set:
   ```env
   TWILIO_ACCOUNT_SID=ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   TWILIO_AUTH_TOKEN=your_auth_token_here
   TWILIO_PHONE_NUMBER=+1XXXXXXXXXX
   ```
4. Restart the server.

---

## 🏛️ Part 2: Official Admin Authentication Credentials

Administrators can login via 12-digit Aadhaar ID or official email:

| Official Role | 12-Digit Aadhaar ID / Username | Password | Jurisdiction |
| :--- | :--- | :--- | :--- |
| **District Magistrate (IAS)** | `8899 1122 3344` or `admin@sundargarh.gov.in` | `admin123` | Entire AC-134 Constituency |
| **District Planning Coordinator (DPC)** | `5566 7788 9900` or `dpc.planner@sundargarh.gov.in` | `admin123` | 142 Gram Panchayats |
| **Executive Engineer (R&B Works)** | `1234 5678 9012` or `ee.roads@sundargarh.gov.in` | `admin123` | Lathikata & Bisra Blocks |
| **Aerial Drone Telemetry Commander** | `9988 7766 5544` or `drone.commander@sundargarh.gov.in` | `admin123` | UAV Flight Grid |

---

## 🌐 Part 3: Deploying & Publishing Online (Free 1-Click Hosting)

### Method 1: Deploy on Render (Recommended — Free & 100% Automated)
1. Push your repository to **GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Deploy Lok Swar Civic Portal"
   git remote add origin https://github.com/your-username/lok-swar.git
   git push -u origin main
   ```
2. Go to [https://render.com/](https://render.com/) and click **New + Web Service**.
3. Connect your GitHub repository.
4. Render will automatically detect `Procfile` and `requirements.txt`:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python server.py`
5. In **Environment Variables**, add:
   - `MONGODB_URI`: `mongodb+srv://admin:admin123@cluster0.8zc9thi.mongodb.net/lok_swar_db?retryWrites=true&w=majority&appName=Cluster0`
   - `FAST2SMS_API_KEY`: *(Optional for real SMS)*
6. Click **Deploy Web Service**.
7. In 1 minute, you will receive a public HTTPS link (e.g., `https://lok-swar-portal.onrender.com`).

---

### Method 2: Instant Public Tunnel for Immediate Mobile Testing (No Deployment Required)
If you want to test on real phones right now without cloud hosting:

1. **Option via Cloudflare Tunnel (Free & Instant)**:
   ```bash
   npx cloudflared tunnel --url http://localhost:8000
   ```
2. **Option via Localtunnel**:
   ```bash
   npx localtunnel --port 8000
   ```
3. Copy the generated `https://xxxx.trycloudflare.com` URL and open it on your smartphone.
