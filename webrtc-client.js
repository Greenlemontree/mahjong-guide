// WebRTC Client using simple-peer with custom signaling server
// Signaling server URL - update this after deployment
const SIGNALING_SERVER = 'ws://localhost:8080'; // For local testing
// const SIGNALING_SERVER = 'wss://your-signaling-server.onrender.com'; // For production

class WebRTCClient {
    constructor() {
        this.ws = null;
        this.peers = new Map(); // Map of peerId -> SimplePeer instance
        this.roomCode = null;
        this.peerId = this.generatePeerId();
        this.isHost = false;
        this.onMessage = null;
        this.onPeerJoined = null;
        this.onPeerLeft = null;
        this.onRoomCreated = null;
        this.onJoinedRoom = null;
        this.onError = null;
    }

    generatePeerId() {
        return 'peer_' + Math.random().toString(36).substring(2, 15);
    }

    connect() {
        return new Promise((resolve, reject) => {
            try {
                this.ws = new WebSocket(SIGNALING_SERVER);

                this.ws.onopen = () => {
                    console.log('Connected to signaling server');
                    resolve();
                };

                this.ws.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    if (this.onError) {
                        this.onError(new Error('Failed to connect to signaling server'));
                    }
                    reject(error);
                };

                this.ws.onclose = () => {
                    console.log('Disconnected from signaling server');
                    // Reconnect logic could go here
                };

                this.ws.onmessage = (event) => {
                    this.handleSignalingMessage(JSON.parse(event.data));
                };
            } catch (error) {
                reject(error);
            }
        });
    }

    createRoom(roomCode, name) {
        this.roomCode = roomCode;
        this.isHost = true;

        this.ws.send(JSON.stringify({
            type: 'create-room',
            roomCode: roomCode,
            peerId: this.peerId,
            name: name
        }));
    }

    joinRoom(roomCode, name) {
        this.roomCode = roomCode;
        this.isHost = false;

        this.ws.send(JSON.stringify({
            type: 'join-room',
            roomCode: roomCode,
            peerId: this.peerId,
            name: name
        }));
    }

    handleSignalingMessage(data) {
        console.log('Signaling message:', data.type);

        switch (data.type) {
            case 'room-created':
                if (this.onRoomCreated) {
                    this.onRoomCreated(data.roomCode);
                }
                break;

            case 'joined-room':
                if (this.onJoinedRoom) {
                    this.onJoinedRoom(data.roomCode);
                }
                // As a guest, create peer connection to host
                this.createPeerConnection(data.hostPeerId, false);
                break;

            case 'peer-joined':
                if (this.onPeerJoined) {
                    this.onPeerJoined(data.peerId, data.name);
                }
                // As host, create peer connection to new guest (as initiator)
                this.createPeerConnection(data.peerId, true);
                break;

            case 'signal':
                // Forward WebRTC signaling data to the appropriate peer
                const peer = this.peers.get(data.from);
                if (peer) {
                    peer.signal(data.signal);
                }
                break;

            case 'peer-left':
                this.handlePeerDisconnect(data.peerId);
                break;

            case 'host-left':
                if (this.onError) {
                    this.onError(new Error('Host left the room'));
                }
                this.cleanup();
                break;

            case 'error':
                if (this.onError) {
                    this.onError(new Error(data.message));
                }
                break;
        }
    }

    createPeerConnection(remotePeerId, initiator) {
        console.log(`Creating peer connection to ${remotePeerId}, initiator: ${initiator}`);

        const peer = new SimplePeer({
            initiator: initiator,
            trickle: true,
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' },
                    {
                        urls: 'turn:a.relay.metered.ca:80',
                        username: 'openrelayproject',
                        credential: 'openrelayproject'
                    },
                    {
                        urls: 'turn:a.relay.metered.ca:443',
                        username: 'openrelayproject',
                        credential: 'openrelayproject'
                    },
                    {
                        urls: 'turn:a.relay.metered.ca:443?transport=tcp',
                        username: 'openrelayproject',
                        credential: 'openrelayproject'
                    }
                ]
            }
        });

        peer.on('signal', (signal) => {
            // Send signaling data through WebSocket
            this.ws.send(JSON.stringify({
                type: 'signal',
                roomCode: this.roomCode,
                from: this.peerId,
                to: remotePeerId,
                signal: signal
            }));
        });

        peer.on('connect', () => {
            console.log(`Peer connection established with ${remotePeerId}`);
        });

        peer.on('data', (data) => {
            // Handle incoming data from peer
            if (this.onMessage) {
                const message = JSON.parse(data.toString());
                this.onMessage(message, remotePeerId);
            }
        });

        peer.on('close', () => {
            console.log(`Peer connection closed with ${remotePeerId}`);
            this.handlePeerDisconnect(remotePeerId);
        });

        peer.on('error', (err) => {
            console.error(`Peer connection error with ${remotePeerId}:`, err);
        });

        this.peers.set(remotePeerId, peer);
    }

    handlePeerDisconnect(peerId) {
        const peer = this.peers.get(peerId);
        if (peer) {
            peer.destroy();
            this.peers.delete(peerId);
        }

        if (this.onPeerLeft) {
            this.onPeerLeft(peerId);
        }
    }

    send(peerId, data) {
        const peer = this.peers.get(peerId);
        if (peer && peer.connected) {
            peer.send(JSON.stringify(data));
        } else {
            console.warn(`Cannot send to ${peerId}: not connected`);
        }
    }

    broadcast(data) {
        const message = JSON.stringify(data);
        this.peers.forEach((peer, peerId) => {
            if (peer.connected) {
                peer.send(message);
            }
        });
    }

    leave() {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                type: 'leave-room',
                roomCode: this.roomCode,
                peerId: this.peerId
            }));
        }
        this.cleanup();
    }

    cleanup() {
        // Close all peer connections
        this.peers.forEach(peer => peer.destroy());
        this.peers.clear();

        // Close WebSocket
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }

        this.roomCode = null;
        this.isHost = false;
    }
}
