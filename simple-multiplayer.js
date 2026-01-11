// Simple P2P Multiplayer using PeerJS with optimized settings
// No server needed - uses public STUN/TURN servers for NAT traversal

// NAT-friendly ICE servers with multiple TURN transports for maximum compatibility
const ICE_SERVERS = {
    iceServers: [
        // Primary Google STUN server (fastest)
        { urls: 'stun:stun.l.google.com:19302' },

        // Backup STUN server
        { urls: 'stun:stun1.l.google.com:19302' },

        // TURN servers with multiple transports for NAT traversal
        // Port 80 UDP - most compatible with mobile networks
        {
            urls: 'turn:openrelay.metered.ca:80',
            username: 'openrelayproject',
            credential: 'openrelayproject'
        },
        // Port 443 TCP - works through most corporate firewalls
        {
            urls: 'turn:openrelay.metered.ca:443?transport=tcp',
            username: 'openrelayproject',
            credential: 'openrelayproject'
        },
        // Port 443 TLS - encrypted, works through HTTPS-only networks
        {
            urls: 'turns:openrelay.metered.ca:443?transport=tcp',
            username: 'openrelayproject',
            credential: 'openrelayproject'
        }
    ],
    sdpSemantics: 'unified-plan',
    iceCandidatePoolSize: 3, // Reduced from 10 for faster initialization
    iceTransportPolicy: 'all', // Try all connection methods (STUN, TURN, host)
    bundlePolicy: 'max-bundle', // Bundle media for efficiency
    rtcpMuxPolicy: 'require' // Reduce ports needed
};

// Enhanced PeerJS configuration optimized for mobile
const PEER_CONFIG = {
    config: ICE_SERVERS,
    debug: 0,
    // Use PeerJS cloud server
    host: '0.peerjs.com',
    port: 443,
    path: '/',
    secure: true,
    // Optimized for faster mobile connections
    pingInterval: 3000, // Reduced from 5000 for faster keepalive
    connectionTimeout: 10000 // Reduced from 20000 - fail faster and let user retry
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
