# Deployment Instructions

This project now uses a custom WebSocket signaling server for multiplayer functionality, replacing the unreliable PeerJS cloud server.

## Architecture

- **Frontend**: Static files (HTML, CSS, JS) hosted on GitHub Pages
- **Signaling Server**: Node.js WebSocket server for coordinating peer connections
- **WebRTC**: Direct peer-to-peer connections using simple-peer library

## Local Testing

1. Start the signaling server:
```bash
cd signaling-server
npm install
npm start
```

2. In another terminal, start the web server:
```bash
python3 -m http.server 3000
```

3. Open http://localhost:3000 in your browser

## Deploying the Signaling Server

### Option 1: Render.com (Recommended - Free)

1. Create account at https://render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: mahjong-signaling-server
   - **Root Directory**: signaling-server
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free
5. Click "Create Web Service"
6. Copy the deployment URL (e.g., `https://mahjong-signaling-server.onrender.com`)

### Option 2: Railway.app (Alternative - Free)

1. Install Railway CLI: `npm install -g @railway/cli`
2. Login: `railway login`
3. Navigate to signaling-server folder: `cd signaling-server`
4. Deploy: `railway up`
5. Link to project: `railway link`
6. Get URL: `railway domain`

### Option 3: Fly.io (Alternative)

1. Install flyctl: `brew install flyctl` (macOS) or visit https://fly.io/docs/hands-on/install-flyctl/
2. Login: `fly auth login`
3. Navigate to signaling-server: `cd signaling-server`
4. Deploy: `fly launch`
5. Follow prompts and note the deployment URL

## Update Client Configuration

After deploying the signaling server:

1. Open `webrtc-client.js`
2. Update line 3 with your server URL:
```javascript
const SIGNALING_SERVER = 'wss://your-server.onrender.com'; // Replace with your URL
```

3. Commit and push changes:
```bash
git add webrtc-client.js
git commit -m "Update signaling server URL"
git push origin main
```

## GitHub Pages Deployment

The frontend is automatically deployed to GitHub Pages when you push to main:

1. Ensure GitHub Pages is enabled in repository settings (Settings → Pages)
2. Source should be set to "Deploy from branch: main"
3. Changes pushed to main will be live at: https://greenlemontree.github.io/mahjong-guide/

## Monitoring

### Signaling Server Health Check
```bash
curl https://your-server.onrender.com/health
```
Should return: `OK`

### View Server Logs
- **Render**: Dashboard → Select your service → Logs tab
- **Railway**: `railway logs`
- **Fly.io**: `fly logs`

## Troubleshooting

### "Failed to connect to signaling server"
- Check if signaling server is running: `curl https://your-server/health`
- Verify SIGNALING_SERVER URL in webrtc-client.js matches your deployment
- Check browser console for WebSocket errors

### Render Free Tier Limitations
- Server spins down after 15 minutes of inactivity
- First connection after spin-down takes ~30 seconds to wake up
- Solution: Use a service like UptimeRobot to ping `/health` every 14 minutes

### CORS Issues
The signaling server is configured to accept WebSocket connections from any origin. If you need to restrict this, modify the WebSocket server configuration in `signaling-server/server.js`.

## Cost Estimate

- **Render Free Tier**: $0/month (750 hours/month included)
- **Railway Free Tier**: $0/month (500 hours/month included)
- **GitHub Pages**: $0/month (free for public repos)

**Total**: $0/month for basic usage
