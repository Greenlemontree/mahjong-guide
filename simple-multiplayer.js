// Simple P2P Multiplayer using PeerJS with optimized settings
// No server needed - uses public STUN/TURN servers for NAT traversal

// Better ICE servers configuration (multiple free public servers)
const ICE_SERVERS = {
    iceServers: [
        // Google's public STUN servers
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' },

        // Metered's free TURN servers (no auth needed for basic usage)
        {
            urls: 'turn:openrelay.metered.ca:80',
            username: 'openrelayproject',
            credential: 'openrelayproject'
        },
        {
            urls: 'turn:openrelay.metered.ca:443',
            username: 'openrelayproject',
            credential: 'openrelayproject'
        },
        {
            urls: 'turn:openrelay.metered.ca:443?transport=tcp',
            username: 'openrelayproject',
            credential: 'openrelayproject'
        }
    ],
    sdpSemantics: 'unified-plan',
    iceCandidatePoolSize: 10
};

// Enhanced PeerJS configuration with retries
const PEER_CONFIG = {
    config: ICE_SERVERS,
    debug: 0,
    // Use multiple PeerJS cloud servers as fallbacks
    host: '0.peerjs.com',
    port: 443,
    path: '/',
    secure: true,
    // Connection timeout settings
    pingInterval: 5000,
    // Retry settings
    connectionTimeout: 20000
};

function createPeerWithRetry(peerId = null, options = {}) {
    const config = { ...PEER_CONFIG, ...options };

    if (peerId) {
        return new Peer(peerId, config);
    }
    return new Peer(config);
}

// Export for use in script.js
window.PeerHelper = {
    createPeer: createPeerWithRetry,
    iceServers: ICE_SERVERS
};
