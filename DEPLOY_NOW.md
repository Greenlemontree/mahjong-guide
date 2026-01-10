# 🚀 Deploy Signaling Server NOW

Your multiplayer feature is ready but needs the signaling server deployed. This takes **5 minutes**.

## Quick Deploy to Render (FREE)

### Step 1: Create Render Account
1. Go to https://render.com
2. Click "Get Started"
3. Sign up with GitHub (easiest - auto-connects your repo)

### Step 2: Deploy the Server
1. Once logged in, click the blue "New +" button (top right)
2. Select "Web Service"
3. Click "Build and deploy from a Git repository" → Next
4. Find and select your repository: `greenlemontree/mahjong-guide`
5. Configure the service:
   - **Name**: `mahjong-signaling-server` (or any name you like)
   - **Region**: Oregon (US West) - closest to you
   - **Branch**: `main`
   - **Root Directory**: `signaling-server` ⚠️ IMPORTANT!
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free
6. Click "Create Web Service"

### Step 3: Wait for Deployment
- First deploy takes 2-3 minutes
- You'll see logs streaming - wait for "Signaling server listening on port..."
- Once it says "Live", copy the URL at the top (looks like `https://mahjong-signaling-server.onrender.com`)

### Step 4: Update the Client URL
The code already auto-detects the server URL! But we need to verify it matches:

1. Open `webrtc-client.js`
2. Check line 4 - it should say:
   ```javascript
   ? 'wss://mahjong-signaling-server.onrender.com'
   ```
3. If your Render URL is different (e.g., `mahjong-signaling-server-abc123.onrender.com`), update line 4
4. Save, commit, and push:
   ```bash
   git add webrtc-client.js
   git commit -m "Update signaling server URL"
   git push
   ```

### Step 5: Test!
1. Wait 2-3 minutes for GitHub Pages to rebuild
2. Open https://greenlemontree.github.io/mahjong-guide/
3. Try creating a room - it should work instantly! ✅

## Troubleshooting

### "Failed to connect to signaling server"
- Check Render dashboard - is the server "Live"? (green status)
- Click "Logs" tab - do you see "Signaling server listening on port 8080"?
- If server shows "Build failed":
  - Make sure **Root Directory** is set to `signaling-server` (not blank!)
  - Check that Build Command is `npm install` and Start Command is `npm start`

### Server goes to sleep
- Free tier spins down after 15 minutes of inactivity
- First connection after sleep takes ~30 seconds to wake up
- To keep it awake 24/7 (optional):
  - Sign up for UptimeRobot (free): https://uptimerobot.com
  - Create monitor: `https://your-server.onrender.com/health`
  - Check every 14 minutes

### Connection still slow
- Check browser console (F12) for errors
- Make sure you're using `wss://` (not `ws://`) for the production URL
- Verify the URL in `webrtc-client.js` matches your Render deployment URL

## Alternative: Deploy to Railway (if Render doesn't work)

1. Go to https://railway.app
2. Sign in with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select `greenlemontree/mahjong-guide`
5. Click "Add variables" → Skip (none needed)
6. In Settings:
   - **Root Directory**: `signaling-server`
   - **Start Command**: `npm start`
7. Click "Generate Domain" to get your URL
8. Update `webrtc-client.js` line 4 with the Railway URL

## Current Status

✅ Signaling server code is ready
✅ Client code is ready and pushed to GitHub
⏳ **Waiting for you to deploy the server** (5 minutes)
⏳ Then multiplayer will work perfectly!

---

**Need help?** Check [DEPLOYMENT.md](DEPLOYMENT.md) for detailed troubleshooting.
