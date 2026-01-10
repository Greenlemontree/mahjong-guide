const WebSocket = require('ws');
const http = require('http');

const PORT = process.env.PORT || 8080;

const server = http.createServer((req, res) => {
    if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('OK');
    } else {
        res.writeHead(404);
        res.end();
    }
});

const wss = new WebSocket.Server({ server });

const rooms = new Map();

wss.on('connection', (ws) => {
    console.log('New connection established');

    let currentRoomCode = null;
    let currentPeerId = null;

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            console.log('Received:', data.type, data);

            switch (data.type) {
                case 'create-room':
                    currentRoomCode = data.roomCode;
                    currentPeerId = data.peerId;

                    if (!rooms.has(currentRoomCode)) {
                        rooms.set(currentRoomCode, {
                            host: { ws, peerId: currentPeerId, name: data.name },
                            guests: []
                        });
                        ws.send(JSON.stringify({
                            type: 'room-created',
                            roomCode: currentRoomCode
                        }));
                        console.log(`Room ${currentRoomCode} created by ${currentPeerId}`);
                    } else {
                        ws.send(JSON.stringify({
                            type: 'error',
                            message: 'Room already exists'
                        }));
                    }
                    break;

                case 'join-room':
                    currentRoomCode = data.roomCode;
                    currentPeerId = data.peerId;

                    const room = rooms.get(currentRoomCode);
                    if (room) {
                        room.guests.push({ ws, peerId: currentPeerId, name: data.name });

                        ws.send(JSON.stringify({
                            type: 'joined-room',
                            roomCode: currentRoomCode,
                            hostPeerId: room.host.peerId
                        }));

                        room.host.ws.send(JSON.stringify({
                            type: 'peer-joined',
                            peerId: currentPeerId,
                            name: data.name
                        }));

                        console.log(`${currentPeerId} joined room ${currentRoomCode}`);
                    } else {
                        ws.send(JSON.stringify({
                            type: 'error',
                            message: 'Room not found'
                        }));
                    }
                    break;

                case 'signal':
                    const targetRoom = rooms.get(data.roomCode);
                    if (targetRoom) {
                        let targetWs = null;

                        if (targetRoom.host.peerId === data.to) {
                            targetWs = targetRoom.host.ws;
                        } else {
                            const guest = targetRoom.guests.find(g => g.peerId === data.to);
                            if (guest) targetWs = guest.ws;
                        }

                        if (targetWs && targetWs.readyState === WebSocket.OPEN) {
                            targetWs.send(JSON.stringify({
                                type: 'signal',
                                from: data.from,
                                signal: data.signal
                            }));
                        }
                    }
                    break;

                case 'leave-room':
                    handleLeave(currentRoomCode, currentPeerId);
                    break;
            }
        } catch (error) {
            console.error('Error handling message:', error);
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Invalid message format'
            }));
        }
    });

    ws.on('close', () => {
        console.log('Connection closed');
        handleLeave(currentRoomCode, currentPeerId);
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });

    function handleLeave(roomCode, peerId) {
        if (!roomCode || !peerId) return;

        const room = rooms.get(roomCode);
        if (!room) return;

        if (room.host.peerId === peerId) {
            room.guests.forEach(guest => {
                if (guest.ws.readyState === WebSocket.OPEN) {
                    guest.ws.send(JSON.stringify({
                        type: 'host-left'
                    }));
                }
            });
            rooms.delete(roomCode);
            console.log(`Room ${roomCode} deleted (host left)`);
        } else {
            const guestIndex = room.guests.findIndex(g => g.peerId === peerId);
            if (guestIndex !== -1) {
                room.guests.splice(guestIndex, 1);

                if (room.host.ws.readyState === WebSocket.OPEN) {
                    room.host.ws.send(JSON.stringify({
                        type: 'peer-left',
                        peerId: peerId
                    }));
                }
                console.log(`${peerId} left room ${roomCode}`);
            }
        }
    }
});

server.listen(PORT, () => {
    console.log(`Signaling server listening on port ${PORT}`);
});
