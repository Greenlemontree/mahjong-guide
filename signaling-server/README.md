# Mahjong Guide Signaling Server

WebSocket signaling server for peer-to-peer connections in Mahjong Guide multiplayer.

## Deployment Options

### Option 1: Railway (Recommended)
1. Install Railway CLI: `npm install -g @railway/cli`
2. Login: `railway login`
3. Deploy: `railway up`

### Option 2: Render
1. Go to https://render.com
2. Create New > Web Service
3. Connect your GitHub repository
4. Set:
   - Build Command: `cd signaling-server && npm install`
   - Start Command: `cd signaling-server && npm start`

### Option 3: Fly.io
1. Install flyctl: `brew install flyctl` (macOS)
2. Login: `fly auth login`
3. Deploy: `fly launch`

## Local Testing
```bash
cd signaling-server
npm install
npm start
```

Server will run on http://localhost:8080
