// SIMPLE PEERJS MULTIPLAYER - NO SERVER ACCOUNT NEEDED
// This file contains drop-in replacement functions for the complex WebRTC implementation

// Use better PeerJS configuration with multiple ICE servers
function hostMultiplayerGameSimple() {
    const hostButton = document.getElementById('hostGame');
    const nameInput = document.getElementById('hostNameInput');
    const playerName = nameInput.value.trim();

    if (!playerName) {
        alert('Please enter your name');
        nameInput.focus();
        return;
    }

    if (multiplayerState.peer || multiplayerState.isHost) {
        alert('Already hosting a game');
        return;
    }

    hostButton.disabled = true;
    hostButton.textContent = 'Creating Room...';
    nameInput.disabled = true;

    multiplayerState.playerName = playerName;
    const roomCode = generateRoomCode();
    multiplayerState.roomCode = roomCode;
    multiplayerState.isHost = true;

    // Use the helper with better config
    multiplayerState.peer = window.PeerHelper.createPeer(roomCode);

    multiplayerState.peer.on('open', (id) => {
        console.log('Room created:', id);
        multiplayerState.playerNames[id] = playerName;

        document.getElementById('roomCode').style.display = 'block';
        document.querySelector('.code-display').textContent = roomCode;

        const hostStatus = document.getElementById('hostStatus');
        hostStatus.style.display = 'block';
        hostStatus.innerHTML = '<p>✅ Room created! Share code: <strong>' + roomCode + '</strong></p>';
        hostStatus.classList.add('connected');

        hostButton.textContent = 'Room Created';
        updatePlayerList();
        document.getElementById('connectedPlayers').style.display = 'block';
    });

    multiplayerState.peer.on('connection', (conn) => {
        console.log('Player connecting:', conn.peer);
        multiplayerState.connections.push(conn);

        conn.on('open', () => {
            conn.send({ type: 'requestName' });
        });

        conn.on('data', (data) => {
            if (data.type === 'playerName') {
                multiplayerState.playerNames[conn.peer] = data.name;
                updatePlayerList();

                // Broadcast to all players
                conn.send({ type: 'gameState', data: gameState });

                const hostStatus = document.getElementById('hostStatus');
                hostStatus.innerHTML = `<p>✅ ${multiplayerState.connections.length} player(s) connected</p>`;
            }
        });

        conn.on('close', () => {
            const index = multiplayerState.connections.indexOf(conn);
            if (index > -1) {
                multiplayerState.connections.splice(index, 1);
                delete multiplayerState.playerNames[conn.peer];
                updatePlayerList();
            }
        });
    });

    multiplayerState.peer.on('error', (err) => {
        console.error('Peer error:', err);
        let errorMsg = 'Connection error. ';
        if (err.type === 'unavailable-id') {
            errorMsg += 'Room code already in use. Try again.';
        } else if (err.type === 'network') {
            errorMsg += 'Network issue. Check your connection.';
        } else {
            errorMsg += err.message;
        }
        alert(errorMsg);

        hostButton.disabled = false;
        hostButton.textContent = 'Create Room';
        nameInput.disabled = false;
        multiplayerState.peer = null;
        multiplayerState.isHost = false;
    });
}

function joinMultiplayerGameSimple() {
    const roomCodeInput = document.getElementById('joinCodeInput');
    const roomCode = roomCodeInput.value.toUpperCase().trim();
    const joinButton = document.getElementById('joinGame');
    const nameInput = document.getElementById('guestNameInput');
    const playerName = nameInput.value.trim();

    if (!playerName) {
        alert('Please enter your name');
        nameInput.focus();
        return;
    }

    if (!roomCode || roomCode.length !== 6) {
        alert('Please enter a valid 6-character room code');
        roomCodeInput.focus();
        return;
    }

    if (multiplayerState.peer || multiplayerState.connected) {
        alert('Already connecting or connected to a game');
        return;
    }

    joinButton.disabled = true;
    joinButton.textContent = 'Connecting...';
    nameInput.disabled = true;
    roomCodeInput.disabled = true;

    multiplayerState.playerName = playerName;

    const joinStatus = document.getElementById('joinStatus');
    joinStatus.innerHTML = '<p>🔄 Connecting to room...</p>';

    // Use the helper with better config
    multiplayerState.peer = window.PeerHelper.createPeer();

    multiplayerState.peer.on('open', (id) => {
        console.log('Joining room:', roomCode);
        const conn = multiplayerState.peer.connect(roomCode, { reliable: true });

        conn.on('open', () => {
            multiplayerState.conn = conn;
            multiplayerState.connected = true;

            joinStatus.innerHTML = '<p>✅ Connected!</p>';
            joinStatus.classList.add('connected');

            // Send player name to host
            conn.send({ type: 'playerName', name: playerName });
        });

        conn.on('data', (data) => {
            if (data.type === 'gameState') {
                gameState = data.data;
                if (gameState.gameStarted) {
                    const gameSetup = document.getElementById('gameSetup');
                    if (gameSetup) gameSetup.style.display = 'none';
                    document.getElementById('gameArea').style.display = 'block';
                }
                renderGame();
            } else if (data.type === 'requestName') {
                conn.send({ type: 'playerName', name: playerName });
            }
        });

        conn.on('error', (err) => {
            console.error('Connection error:', err);
            alert('Failed to connect. Make sure the room code is correct.');
            joinButton.disabled = false;
            joinButton.textContent = 'Join Game';
            nameInput.disabled = false;
            roomCodeInput.disabled = false;
            multiplayerState.peer = null;
            joinStatus.innerHTML = '<p>❌ Connection failed</p>';
        });
    });

    multiplayerState.peer.on('error', (err) => {
        console.error('Peer error:', err);
        let errorMsg = 'Connection error. ';
        if (err.type === 'peer-unavailable') {
            errorMsg += 'Room not found. Check the code.';
        } else if (err.type === 'network') {
            errorMsg += 'Network issue. Check your connection.';
        } else {
            errorMsg += err.message;
        }
        alert(errorMsg);

        joinButton.disabled = false;
        joinButton.textContent = 'Join Game';
        nameInput.disabled = false;
        roomCodeInput.disabled = false;
        multiplayerState.peer = null;
        joinStatus.innerHTML = '<p>❌ Connection failed</p>';
    });
}

function broadcastGameStateSimple() {
    if (multiplayerState.isHost) {
        multiplayerState.connections.forEach(conn => {
            if (conn.open) {
                conn.send({ type: 'gameState', data: gameState });
            }
        });
    }
}

function updatePlayerListSimple() {
    const listEl = document.getElementById('playerList');
    const containerEl = document.getElementById('connectedPlayers');

    if (!listEl || !containerEl) return;

    containerEl.style.display = 'block';
    listEl.innerHTML = '';

    // Add host
    const hostDiv = document.createElement('div');
    hostDiv.className = 'connected-player host';
    const hostName = multiplayerState.playerName || 'Host';
    hostDiv.innerHTML = `<span>${hostName} (You)</span><span class="player-role">HOST</span>`;
    listEl.appendChild(hostDiv);

    // Add other players
    multiplayerState.connections.forEach((conn) => {
        const playerDiv = document.createElement('div');
        playerDiv.className = 'connected-player';
        const playerName = multiplayerState.playerNames[conn.peer] || 'Guest';
        playerDiv.innerHTML = `<span>${playerName}</span><span class="player-role">GUEST</span>`;
        listEl.appendChild(playerDiv);
    });
}

function startGameFromHostRoomSimple() {
    const startingPoints = parseInt(document.getElementById('hostStartingPoints').value);

    gameState.startingPoints = startingPoints;
    gameState.currentRound = 1;
    gameState.currentWind = '東';
    gameState.honba = 0;
    gameState.riichiSticks = 0;
    gameState.dealer = 0;
    gameState.gameStarted = true;

    gameState.players = [];
    const winds = gameState.mode === 3 ? ['東', '南', '西'] : ['東', '南', '西', '北'];

    // Add host
    gameState.players.push({
        name: multiplayerState.playerName,
        wind: winds[0],
        points: startingPoints,
        riichi: false
    });

    // Add connected players
    multiplayerState.connections.forEach((conn, index) => {
        const playerName = multiplayerState.playerNames[conn.peer] || `Player ${index + 2}`;
        if (index < gameState.mode - 1) {
            gameState.players.push({
                name: playerName,
                wind: winds[index + 1],
                points: startingPoints,
                riichi: false
            });
        }
    });

    renderGame();
    document.getElementById('hostScreen').style.display = 'none';
    document.getElementById('gameArea').style.display = 'block';
    broadcastGameStateSimple();
}

// Export functions
window.SimpleMultiplayer = {
    hostGame: hostMultiplayerGameSimple,
    joinGame: joinMultiplayerGameSimple,
    broadcast: broadcastGameStateSimple,
    updatePlayerList: updatePlayerListSimple,
    startFromHost: startGameFromHostRoomSimple
};
