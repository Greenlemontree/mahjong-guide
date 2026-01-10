# Simple Multiplayer - No Server Required! 🎮

Your multiplayer is now working with **zero setup required** - no accounts, no deployment, no server to manage!

## What Changed

**Before**: Complex WebRTC signaling server requiring deployment to Render/Railway
**Now**: Simple PeerJS configuration that works immediately

## How It Works

- Uses **PeerJS** library with optimized settings
- Connects through **free public STUN/TURN servers**:
  - Google's STUN servers (for peer discovery)
  - Metered.ca's free TURN servers (for NAT traversal)
- No backend server needed - peer-to-peer connections only

## Usage

Just open https://greenlemontree.github.io/mahjong-guide/ and:

1. **Host**: Click "Host New Game" → Enter your name → Get a 6-character code
2. **Join**: Click "Join Game" → Enter name + room code
3. **Play**: Start the game when all players connect!

## Why This Is Better

✅ **Zero setup** - works immediately
✅ **No accounts** - no sign-ups required
✅ **No costs** - completely free
✅ **No maintenance** - no server to manage
✅ **Better reliability** - uses multiple ICE servers for redundancy

## Connection Improvements

The new configuration includes:

- **10 ICE candidate pool size** - tries multiple connection paths
- **5 Google STUN servers** - better peer discovery
- **3 Metered.ca TURN servers** - works behind strict firewalls
- **20-second timeout** - gives more time for slow networks
- **Better error messages** - clear feedback on what went wrong

## Troubleshooting

### "Room code already in use"
- The random 6-character code collided (very rare!)
- Just try creating the room again

### "Room not found"
- Check the code is correct (case-insensitive)
- Make sure host created the room first
- Host might have closed the page

### "Network issue"
- Check internet connection
- Try refreshing the page
- Firewall might be blocking WebRTC

## Technical Details

Files:
- `simple-multiplayer.js` - PeerJS configuration with optimized ICE servers
- `multiplayer-simple.js` - Simple host/join/broadcast functions
- `script.js` - Bridge functions to connect existing code

The peer-to-peer connection uses WebRTC, which means:
- No data goes through our servers (privacy!)
- Low latency (direct connection)
- Works globally
- Firewall-friendly (TURN fallback)

## Files You Can Delete

If you want to clean up, these files are no longer needed:
- `signaling-server/` folder (entire directory)
- `webrtc-client.js` (complex WebRTC client)
- `DEPLOY_NOW.md` (deployment instructions)
- `DEPLOYMENT.md` (server deployment guide)

The signaling server was a good idea but overengineered for this use case!
