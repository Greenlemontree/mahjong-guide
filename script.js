// ===== TILE DEFINITIONS =====
const TILES = {
    man: ['🀇', '🀈', '🀉', '🀊', '🀋', '🀌', '🀍', '🀎', '🀏'],
    pin: ['🀙', '🀚', '🀛', '🀜', '🀝', '🀞', '🀟', '🀠', '🀡'],
    sou: ['🀐', '🀑', '🀒', '🀓', '🀔', '🀕', '🀖', '🀗', '🀘'],
    winds: ['🀀', '🀁', '🀂', '🀃'], // East, South, West, North
    dragons: ['🀆', '🀅', '中'] // White, Green, Red (using 中 for red dragon)
};

// ===== GAME STATE =====
let gameState = {
    mode: 4,
    startingPoints: 25000,
    players: [],
    currentRound: 1,
    currentWind: '東',
    honba: 0,
    riichiSticks: 0,
    dealer: 0,
    gameStarted: false
};

// ===== HAND CALCULATOR STATE =====
let handState = {
    tiles: [],
    maxTiles: 14,
    discardedTiles: [],
    checkFuriten: false
};

// ===== MULTIPLAYER STATE =====
let multiplayerState = {
    peer: null,
    conn: null,
    isHost: false,
    roomCode: null,
    connected: false,
    connections: [],
    playerName: '',
    playerNames: {} // Map of peer IDs to names
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    updateModeDisplay();
});

function setupEventListeners() {
    // Mode selection
    document.getElementById('mode3p')?.addEventListener('click', () => setMode(3));
    document.getElementById('mode4p')?.addEventListener('click', () => setMode(4));

    // Tab navigation
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tab = e.target.dataset.tab;
            switchTab(tab);
        });
    });

    // New game
    document.getElementById('newGame')?.addEventListener('click', startNewGame);

    // Result type buttons
    document.querySelectorAll('.result-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const result = e.target.dataset.result;
            handleResultType(result);
        });
    });

    // Hand calculator
    document.getElementById('clearHand')?.addEventListener('click', clearHand);
    document.getElementById('calculateHand')?.addEventListener('click', calculateHandScore);
    document.getElementById('checkFuriten')?.addEventListener('change', toggleFuritenCheck);
    document.getElementById('chomboBtn')?.addEventListener('click', declareChombo);

    // Multiplayer navigation
    document.getElementById('chooseHost')?.addEventListener('click', showHostScreen);
    document.getElementById('chooseJoin')?.addEventListener('click', showJoinScreen);
    document.getElementById('backFromHost')?.addEventListener('click', showInitialChoice);
    document.getElementById('backFromJoin')?.addEventListener('click', showInitialChoice);

    // Multiplayer connection - using simple wrapper functions
    document.getElementById('hostGame')?.addEventListener('click', () => window.SimpleMultiplayer.hostGame());
    document.getElementById('joinGame')?.addEventListener('click', () => window.SimpleMultiplayer.joinGame());
    document.getElementById('startGameFromHost')?.addEventListener('click', () => window.SimpleMultiplayer.startFromHost());

    // Host mode selection
    document.getElementById('hostMode3p')?.addEventListener('click', () => setHostMode(3));
    document.getElementById('hostMode4p')?.addEventListener('click', () => setHostMode(4));

    // Rules sub-tabs
    document.querySelectorAll('.rules-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const rulesTab = btn.dataset.rulesTab;
            switchRulesTab(rulesTab);
        });
    });
}

function setHostMode(mode) {
    gameState.mode = mode;
    document.querySelectorAll('#hostScreen .mode-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`hostMode${mode}p`).classList.add('active');

    const startingPointsSelect = document.getElementById('hostStartingPoints');
    if (mode === 3) {
        startingPointsSelect.value = '35000';
    } else {
        startingPointsSelect.value = '25000';
    }
}

// ===== NAVIGATION FUNCTIONS =====
function showInitialChoice() {
    document.getElementById('initialChoice').style.display = 'block';
    document.getElementById('hostScreen').style.display = 'none';
    document.getElementById('joinScreen').style.display = 'none';

    // Reset state
    if (multiplayerState.peer) {
        multiplayerState.peer.destroy();
    }
    multiplayerState = {
        peer: null,
        conn: null,
        isHost: false,
        roomCode: null,
        connected: false,
        connections: [],
        playerName: '',
        playerNames: {}
    };
}

function showHostScreen() {
    document.getElementById('initialChoice').style.display = 'none';
    document.getElementById('hostScreen').style.display = 'block';
    document.getElementById('joinScreen').style.display = 'none';
}

function showJoinScreen() {
    document.getElementById('initialChoice').style.display = 'none';
    document.getElementById('hostScreen').style.display = 'none';
    document.getElementById('joinScreen').style.display = 'block';
}

// ===== TAB SWITCHING =====
function switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');
}

function switchRulesTab(rulesTabName) {
    document.querySelectorAll('.rules-tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.rules-tab-content').forEach(content => content.classList.remove('active'));

    document.querySelector(`[data-rules-tab="${rulesTabName}"]`).classList.add('active');
    document.getElementById(`${rulesTabName}-rules-tab`).classList.add('active');
}

// ===== MODE MANAGEMENT =====
function setMode(mode) {
    gameState.mode = mode;
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`mode${mode}p`).classList.add('active');

    const startingPointsSelect = document.getElementById('startingPoints');
    if (mode === 3) {
        startingPointsSelect.value = '35000';
    } else {
        startingPointsSelect.value = '25000';
    }

    updateModeDisplay();
}

function updateModeDisplay() {
    // Mode display handled by active class
}

// ===== TILE PICKER INITIALIZATION =====
function initializeTilePicker() {
    const manContainer = document.getElementById('manTiles');
    const pinContainer = document.getElementById('pinTiles');
    const souContainer = document.getElementById('souTiles');
    const honorContainer = document.getElementById('honorTiles');

    if (!manContainer) return;

    // Guard: If tiles already exist, don't add them again
    if (manContainer.children.length > 0) return;

    // Man tiles
    TILES.man.forEach((tile, index) => {
        const btn = createTileButton(tile, 'm', index + 1);
        manContainer.appendChild(btn);
    });

    // Pin tiles
    TILES.pin.forEach((tile, index) => {
        const btn = createTileButton(tile, 'p', index + 1);
        pinContainer.appendChild(btn);
    });

    // Sou tiles
    TILES.sou.forEach((tile, index) => {
        const btn = createTileButton(tile, 's', index + 1);
        souContainer.appendChild(btn);
    });

    // Winds
    TILES.winds.forEach((tile, index) => {
        const btn = createTileButton(tile, 'w', index);
        honorContainer.appendChild(btn);
    });

    // Dragons
    TILES.dragons.forEach((tile, index) => {
        const btn = createTileButton(tile, 'd', index);
        honorContainer.appendChild(btn);
    });
}

function createTileButton(tile, suit, value) {
    const btn = document.createElement('div');
    btn.className = 'pickable-tile';
    btn.textContent = tile;
    btn.dataset.tile = tile;
    btn.dataset.suit = suit;
    btn.dataset.value = value;

    // Add tile count display
    const countSpan = document.createElement('span');
    countSpan.className = 'tile-count';
    countSpan.textContent = '0';
    btn.appendChild(countSpan);

    btn.addEventListener('click', function(e) {
        // If shift key is held and furiten check is on, add to discards
        if (e.shiftKey && handState.checkFuriten) {
            addToDiscards(tile, suit, value);
            return;
        }

        // Check tile count
        const key = `${suit}-${value}`;
        const currentCount = getTileCount(key);

        if (currentCount >= 4) {
            alert(`Cannot add more than 4 of the same tile!`);
            return;
        }

        // Otherwise add to hand
        if (handState.tiles.length < handState.maxTiles) {
            addTileToHand(tile, suit, value);
            updateTilePicker();
        }
    });

    return btn;
}

function getTileCount(key) {
    return handState.tiles.filter(t => `${t.suit}-${t.value}` === key).length;
}

// ===== HAND BUILDING =====
function addTileToHand(tile, suit, value) {
    handState.tiles.push({ tile, suit, value });
    renderSelectedTiles();
    document.getElementById('handResult').style.display = 'none';
}

function removeTileFromHand(index) {
    handState.tiles.splice(index, 1);
    renderSelectedTiles();
    updateTilePicker();
    document.getElementById('handResult').style.display = 'none';
}

function clearHand() {
    handState.tiles = [];
    handState.discardedTiles = [];
    renderSelectedTiles();
    updateTilePicker();
    document.getElementById('handResult').style.display = 'none';
    document.getElementById('chomboBtn').style.display = 'none';

    // Clear discard picker
    const discardPicker = document.getElementById('discardPicker');
    if (discardPicker) discardPicker.innerHTML = '';
}

function toggleFuritenCheck(event) {
    handState.checkFuriten = event.target.checked;
    const discardSection = document.getElementById('discardedTiles');

    if (handState.checkFuriten) {
        discardSection.style.display = 'block';
        renderDiscardPicker();
    } else {
        discardSection.style.display = 'none';
        handState.discardedTiles = [];
    }
}

function renderDiscardPicker() {
    const container = document.getElementById('discardPicker');
    if (!container) return;

    if (handState.discardedTiles.length === 0) {
        container.innerHTML = '<p style="color: rgba(255,255,255,0.6); margin: 0; font-size: 0.9em;">Click tiles below to mark as discarded...</p>';
        return;
    }

    container.innerHTML = '';
    handState.discardedTiles.forEach((tileData, index) => {
        const tileDiv = document.createElement('div');
        tileDiv.className = 'selected-tile';
        tileDiv.style.fontSize = '1.5em';
        tileDiv.textContent = tileData.tile;
        tileDiv.addEventListener('click', () => {
            handState.discardedTiles.splice(index, 1);
            renderDiscardPicker();
        });
        container.appendChild(tileDiv);
    });
}

function addToDiscards(tile, suit, value) {
    if (!handState.checkFuriten) return;

    handState.discardedTiles.push({ tile, suit, value });
    renderDiscardPicker();
}

function declareChombo() {
    const message = `⚠️ CHOMBO PENALTY ⚠️

A chombo (錯和/チョンボ) is declared when a player makes an illegal win claim.

Common Chombo Penalties:
• Dealer pays 4,000 points to each other player (12,000 total in 4-player)
• Non-dealer pays 4,000 points to each player (12,000 total in 4-player)
• Some rules: Penalty is 8,000 or 12,000 depending on severity
• The hand does NOT end - continue playing

Why this might be chombo:
• No valid yaku (winning pattern)
• Hand is furiten (discarded winning tile)
• Incorrect hand composition
• False riichi declaration

Ruling: Penalize the player who made the false win claim according to your house rules.`;

    alert(message);
}

function renderSelectedTiles() {
    const container = document.getElementById('selectedTiles');
    if (!container) return;

    if (handState.tiles.length === 0) {
        container.innerHTML = '<p style="color: rgba(255,255,255,0.6); margin: 0;">No tiles selected yet...</p>';
        return;
    }

    container.innerHTML = '';
    handState.tiles.forEach((tileData, index) => {
        const tileDiv = document.createElement('div');
        tileDiv.className = 'selected-tile';
        tileDiv.textContent = tileData.tile;
        tileDiv.addEventListener('click', () => removeTileFromHand(index));
        container.appendChild(tileDiv);
    });
}

function updateTilePicker() {
    // Count tiles in hand
    const tileCounts = {};
    handState.tiles.forEach(t => {
        const key = `${t.suit}-${t.value}`;
        tileCounts[key] = (tileCounts[key] || 0) + 1;
    });

    // Update picker buttons
    document.querySelectorAll('.pickable-tile').forEach(btn => {
        const suit = btn.dataset.suit;
        const value = btn.dataset.value;
        const key = `${suit}-${value}`;
        const count = tileCounts[key] || 0;

        // Update count display
        const countSpan = btn.querySelector('.tile-count');
        if (countSpan) {
            countSpan.textContent = count;
            countSpan.style.display = count > 0 ? 'flex' : 'none';
        }

        if (count >= 4) {
            btn.classList.add('disabled');
        } else {
            btn.classList.remove('disabled');
        }
    });
}

// ===== HAND SCORE CALCULATION =====
function validateHandStructure(tiles) {
    // Check for proper tile counts
    const tileCounts = {};
    tiles.forEach(t => {
        const key = `${t.suit}-${t.value}`;
        tileCounts[key] = (tileCounts[key] || 0) + 1;
    });

    // Check for invalid tile counts (more than 4 of any tile)
    for (const count of Object.values(tileCounts)) {
        if (count > 4) {
            return '❌ Invalid hand: Cannot have more than 4 of the same tile';
        }
    }

    // Special case: Seven pairs needs exactly 7 unique tiles with 2 each
    const pairs = Object.values(tileCounts).filter(c => c === 2);
    if (pairs.length === 7 && Object.keys(tileCounts).length === 7) {
        return null; // Valid seven pairs
    }

    // For standard hands, validate 4 sets + 1 pair structure
    if (!canFormWinningHand(tileCounts)) {
        return '❌ Invalid hand: Does not form a valid winning pattern (4 sets + 1 pair)';
    }

    return null; // Hand structure is valid
}

function canFormWinningHand(tileCounts) {
    // Try to find a valid hand composition: 4 sets (triplets or sequences) + 1 pair
    // We'll try each possible pair and see if the remaining tiles form 4 sets

    const tileKeys = Object.keys(tileCounts);

    // Try each unique tile as the pair
    for (const pairKey of tileKeys) {
        if (tileCounts[pairKey] >= 2) {
            // Clone the counts and remove the pair
            const remainingCounts = { ...tileCounts };
            remainingCounts[pairKey] -= 2;
            if (remainingCounts[pairKey] === 0) {
                delete remainingCounts[pairKey];
            }

            // Check if remaining tiles can form 4 sets (12 tiles)
            if (canFormSets(remainingCounts, 4)) {
                return true;
            }
        }
    }

    return false;
}

function canFormSets(counts, numSets) {
    if (numSets === 0) {
        // All sets formed - check if no tiles remain
        return Object.keys(counts).length === 0;
    }

    const keys = Object.keys(counts);
    if (keys.length === 0) {
        return false; // Still need sets but no tiles left
    }

    // Get the first tile
    const firstKey = keys[0];
    const [suit, value] = firstKey.split('-');
    const val = parseInt(value);

    // Try forming a triplet (3 of the same tile)
    if (counts[firstKey] >= 3) {
        const newCounts = { ...counts };
        newCounts[firstKey] -= 3;
        if (newCounts[firstKey] === 0) {
            delete newCounts[firstKey];
        }
        if (canFormSets(newCounts, numSets - 1)) {
            return true;
        }
    }

    // Try forming a sequence (only for number suits: m, p, s)
    if ((suit === 'm' || suit === 'p' || suit === 's') && val <= 7) {
        const key1 = `${suit}-${val}`;
        const key2 = `${suit}-${val + 1}`;
        const key3 = `${suit}-${val + 2}`;

        if (counts[key1] >= 1 && counts[key2] >= 1 && counts[key3] >= 1) {
            const newCounts = { ...counts };
            newCounts[key1] -= 1;
            newCounts[key2] -= 1;
            newCounts[key3] -= 1;
            if (newCounts[key1] === 0) delete newCounts[key1];
            if (newCounts[key2] === 0) delete newCounts[key2];
            if (newCounts[key3] === 0) delete newCounts[key3];

            if (canFormSets(newCounts, numSets - 1)) {
                return true;
            }
        }
    }

    // If we can't form any valid set with the first tile, this combination doesn't work
    return false;
}

function checkFuriten(tiles) {
    // Check if any of the tiles in the hand match discarded tiles
    // This is a simplified furiten check - in real mahjong, you check if ANY waiting tile was discarded

    if (handState.discardedTiles.length === 0) {
        return { isFuriten: false };
    }

    // For simplicity, we check if any tile in the hand appears in discards
    // A more accurate check would identify waiting tiles first, then check those
    for (const handTile of tiles) {
        for (const discardedTile of handState.discardedTiles) {
            if (handTile.suit === discardedTile.suit && handTile.value === discardedTile.value) {
                return {
                    isFuriten: true,
                    message: `You discarded ${handTile.tile} which is in your winning hand. You cannot call Ron!`
                };
            }
        }
    }

    return { isFuriten: false };
}

function calculateHandScore() {
    if (handState.tiles.length !== 14) {
        alert(`You need exactly 14 tiles. You currently have ${handState.tiles.length} tiles.`);
        return;
    }

    const playerCount = parseInt(document.getElementById('handPlayerCount').value);
    const winType = document.getElementById('handWinType').value;
    const position = document.getElementById('handPosition').value;
    const closed = document.getElementById('handClosed').value === 'yes';

    // Get special conditions
    const conditions = {
        riichi: document.getElementById('handRiichi').checked,
        doubleRiichi: document.getElementById('handDoubleRiichi').checked,
        ippatsu: document.getElementById('handIppatsu').checked,
        rinshan: document.getElementById('handRinshan').checked,
        chankan: document.getElementById('handChankan').checked,
        haitei: document.getElementById('handHaitei').checked
    };

    const result = analyzeHand(handState.tiles, winType, position, closed, conditions);

    displayHandResult(result, position, winType, playerCount);
}

function analyzeHand(tiles, winType, position, closed, conditions = {}) {
    // Simple yaku detection - this is a simplified version
    const yaku = [];
    let han = 0;
    let fu = 30; // Base fu

    // Validate hand structure first
    const validationError = validateHandStructure(tiles);
    if (validationError) {
        return { yaku: [{ name: validationError, han: 0 }], han: 0, fu: 30, error: true };
    }

    // Check for furiten if enabled
    if (handState.checkFuriten && winType === 'ron') {
        const furitenCheck = checkFuriten(tiles);
        if (furitenCheck.isFuriten) {
            return {
                yaku: [{ name: `🚫 FURITEN! ${furitenCheck.message}`, han: 0 }],
                han: 0,
                fu: 30,
                error: true,
                isFuriten: true
            };
        }
    }

    // Check for all honors (字一色 - Tsuuiisou)
    const allHonors = tiles.every(t => t.suit === 'w' || t.suit === 'd');
    if (allHonors) {
        yaku.push({ name: '字一色 (Tsuuiisou - All Honors)', han: 13 });
        han += 13;
        return { yaku, han, fu };
    }

    // Check for seven pairs (七対子 - Chiitoitsu)
    const isSevenPairs = checkSevenPairs(tiles);
    if (isSevenPairs) {
        yaku.push({ name: '七対子 (Chiitoitsu - Seven Pairs)', han: 2 });
        han += 2;
        fu = 25; // Always 25 fu
    }

    // Check for all simples (断幺九 - Tanyao)
    const allSimples = tiles.every(t => {
        if (t.suit === 'w' || t.suit === 'd') return false;
        return t.value >= 2 && t.value <= 8;
    });
    if (allSimples) {
        yaku.push({ name: '断幺九 (Tanyao - All Simples)', han: 1 });
        han += 1;
    }

    // Check for Pinfu (平和 - All Sequences, Valueless Pair, Two-sided Wait)
    let hasPinfu = false;
    if (closed && !isSevenPairs) {
        const pinfuValid = checkPinfu(tiles, winType);
        if (pinfuValid) {
            yaku.push({ name: '平和 (Pinfu - Simple Hand)', han: 1 });
            han += 1;
            fu = 30; // Pinfu always 30 fu (20 base + 10 for closed ron, or 20 + 2 for tsumo = 22 → 30)
            hasPinfu = true;
        }
    }

    // Check for flush (清一色 - Chinitsu)
    const suits = new Set(tiles.map(t => t.suit));
    if (suits.size === 1 && !suits.has('w') && !suits.has('d')) {
        const hanValue = closed ? 6 : 5;
        yaku.push({ name: `清一色 (Chinitsu - Full Flush)`, han: hanValue });
        han += hanValue;
    } else if (suits.size === 2 && (suits.has('w') || suits.has('d'))) {
        // Half flush (混一色 - Honitsu)
        const nonHonorSuits = Array.from(suits).filter(s => s !== 'w' && s !== 'd');
        if (nonHonorSuits.length === 1) {
            const hanValue = closed ? 3 : 2;
            yaku.push({ name: `混一色 (Honitsu - Half Flush)`, han: hanValue });
            han += hanValue;
        }
    }

    // Check for triplets (対々和 - Toitoi)
    const triplets = countTriplets(tiles);
    if (triplets >= 4) {
        yaku.push({ name: '対々和 (Toitoi - All Triplets)', han: 2 });
        han += 2;
    } else if (triplets === 3) {
        yaku.push({ name: '三暗刻 (Sanankou - Three Concealed Triplets)', han: 2 });
        han += 2;
    }

    // Check for dragons
    const dragonTriplets = countDragonTriplets(tiles);
    if (dragonTriplets === 3) {
        yaku.push({ name: '大三元 (Daisangen - Big Three Dragons)', han: 13 });
        han += 13;
        return { yaku, han, fu };
    } else if (dragonTriplets > 0) {
        for (let i = 0; i < dragonTriplets; i++) {
            yaku.push({ name: '役牌 (Yakuhai - Dragon Triplet)', han: 1 });
            han += 1;
        }
    }

    // Menzen Tsumo (門前清自摸和) - closed hand self-draw
    // NOT awarded with Pinfu or Chiitoitsu (they already account for the closed hand)
    if (winType === 'tsumo' && closed && !hasPinfu && !isSevenPairs) {
        yaku.push({ name: '門前清自摸和 (Menzen Tsumo)', han: 1 });
        han += 1;
    }

    // Check special conditions
    if (conditions.doubleRiichi) {
        yaku.push({ name: 'ダブル立直 (Double Riichi)', han: 2 });
        han += 2;
    } else if (conditions.riichi) {
        yaku.push({ name: '立直 (Riichi)', han: 1 });
        han += 1;
    }

    if (conditions.ippatsu) {
        // Ippatsu requires riichi
        if (conditions.riichi || conditions.doubleRiichi) {
            yaku.push({ name: '一発 (Ippatsu - First Turn Win)', han: 1 });
            han += 1;
        }
    }

    if (conditions.rinshan) {
        yaku.push({ name: '嶺上開花 (Rinshan Kaihou - After Kan)', han: 1 });
        han += 1;
    }

    if (conditions.chankan) {
        yaku.push({ name: '槍槓 (Chankan - Robbing a Kan)', han: 1 });
        han += 1;
    }

    if (conditions.haitei) {
        const yakuName = winType === 'tsumo'
            ? '海底摸月 (Haitei - Last Tile from Wall)'
            : '河底撈魚 (Houtei - Last Discard)';
        yaku.push({ name: yakuName, han: 1 });
        han += 1;
    }

    // If no yaku detected, this is an invalid hand
    if (yaku.length === 0) {
        return {
            yaku: [{ name: '❌ No yaku detected! This hand has no valid scoring patterns.', han: 0 }],
            han: 0,
            fu: 30,
            error: true
        };
    }

    return { yaku, han, fu };
}

function sortTiles(tiles) {
    return [...tiles].sort((a, b) => {
        if (a.suit !== b.suit) {
            const suitOrder = { m: 0, p: 1, s: 2, w: 3, d: 4 };
            return suitOrder[a.suit] - suitOrder[b.suit];
        }
        return a.value - b.value;
    });
}

function checkSevenPairs(tiles) {
    const counts = {};
    tiles.forEach(t => {
        const key = `${t.suit}-${t.value}`;
        counts[key] = (counts[key] || 0) + 1;
    });

    const pairs = Object.values(counts).filter(count => count === 2);
    return pairs.length === 7;
}

function countTriplets(tiles) {
    const counts = {};
    tiles.forEach(t => {
        const key = `${t.suit}-${t.value}`;
        counts[key] = (counts[key] || 0) + 1;
    });

    return Object.values(counts).filter(count => count >= 3).length;
}

function countDragonTriplets(tiles) {
    const dragonCounts = { 0: 0, 1: 0, 2: 0 };
    tiles.forEach(t => {
        if (t.suit === 'd') {
            dragonCounts[t.value]++;
        }
    });

    return Object.values(dragonCounts).filter(count => count >= 3).length;
}

function checkPinfu(tiles, winType) {
    // Pinfu requirements:
    // 1. All sequences (no triplets except the pair)
    // 2. Valueless pair (not dragons, not seat/round wind - simplified: no honor tiles in pair)
    // 3. Two-sided wait (ryanmen) - simplified check
    // 4. Closed hand (already checked before calling this)

    const counts = {};
    tiles.forEach(t => {
        const key = `${t.suit}-${t.value}`;
        counts[key] = (counts[key] || 0) + 1;
    });

    // Find the pair
    const pairs = Object.entries(counts).filter(([key, count]) => count === 2);
    if (pairs.length !== 1) return false; // Must have exactly one pair

    const pairKey = pairs[0][0];
    const [pairSuit, pairValue] = pairKey.split('-');

    // Pair must not be honor tiles (dragons or winds)
    if (pairSuit === 'w' || pairSuit === 'd') return false;

    // Check all other tiles form sequences (no triplets)
    const triplets = Object.values(counts).filter(count => count >= 3);
    if (triplets.length > 0) return false; // No triplets allowed in Pinfu

    // Check that all groups are sequences (not isolated tiles)
    // Simplified: if we have 4 groups + 1 pair and no triplets, they must be sequences
    const nonPairTiles = tiles.filter(t => `${t.suit}-${t.value}` !== pairKey);

    // All non-pair tiles must be part of sequences (in suits, not honors)
    const hasHonorSequences = nonPairTiles.some(t => t.suit === 'w' || t.suit === 'd');
    if (hasHonorSequences) return false; // Can't make sequences with honors

    // Simplified check: if hand is valid and has no triplets, no honor sequences,
    // and valueless pair, it's likely Pinfu
    // A full implementation would check for two-sided wait specifically
    return true;
}

function displayHandResult(result, position, winType, playerCount = 4) {
    const container = document.getElementById('handResult');
    const chomboBtn = document.getElementById('chomboBtn');
    if (!container) return;

    // Check if this is an error/invalid hand
    if (result.error || result.han === 0) {
        container.style.background = 'linear-gradient(135deg, #f56565 0%, #c53030 100%)';

        let tipMessage = '💡 Tip: Make sure your hand has valid sets (sequences or triplets) plus one pair. Use the Rules & Yaku tab to check winning hand patterns.';

        if (result.isFuriten) {
            tipMessage = '⚠️ Furiten Rule: You cannot win by Ron if you previously discarded a tile you can win on. You can still win by Tsumo (self-draw)!';
        }

        container.innerHTML = `
            <h3>❌ Invalid Win Declaration</h3>
            <div class="yaku-detected">
                <p style="font-size: 1.2em; margin: 0;">${result.yaku[0].name}</p>
            </div>
            <div style="background: rgba(255,255,255,0.15); padding: 12px; border-radius: 6px; margin-top: 12px;">
                <p style="margin: 0; font-size: 0.95em;">${tipMessage}</p>
            </div>
            ${winType === 'ron' ? '<div style="background: rgba(255,255,255,0.15); padding: 12px; border-radius: 6px; margin-top: 12px;"><p style="margin: 0; font-size: 0.95em;">⚠️ If this was a false Ron declaration during play, this is a <strong>Chombo</strong> (penalty). Click the Chombo button below for penalty rules.</p></div>' : ''}
        `;
        container.style.display = 'block';

        // Show chombo button
        if (chomboBtn) chomboBtn.style.display = 'inline-block';
        return;
    }

    // Hide chombo button for valid hands
    if (chomboBtn) chomboBtn.style.display = 'none';

    // Valid hand - show results
    container.style.background = 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)';
    const isDealer = position === 'dealer';
    const points = calculateScoreFromHanFu(result.han, result.fu, isDealer, winType);

    let yakuListHTML = '';
    if (result.yaku.length > 0) {
        yakuListHTML = '<ul>' + result.yaku.map(y =>
            `<li>${y.name} - ${y.han} han</li>`
        ).join('') + '</ul>';
    }

    const limitName = getLimitHandName(result.han);

    // Check if a game is active (show button for solo OR if host in multiplayer)
    const gameActive = gameState.gameStarted;
    const isSoloGame = gameActive && !multiplayerState.peer && !multiplayerState.conn;
    const isMultiplayerHost = gameActive && multiplayerState.isHost;
    const reportButton = (isSoloGame || isMultiplayerHost) ?
        `<button id="reportToGame" class="btn-primary btn-large" style="margin-top: 16px; width: 100%;">📊 Report to Game</button>` : '';

    container.innerHTML = `
        <h3>✅ Hand Analysis</h3>
        <div class="yaku-detected">
            <h4>Yaku Detected:</h4>
            ${yakuListHTML}
            <p style="margin-top: 12px;"><strong>Total: ${result.han} han, ${result.fu} fu</strong></p>
            ${limitName ? `<p><strong>Limit Hand: ${limitName}</strong></p>` : ''}
        </div>
        <div class="score-breakdown">
            <h4>Score:</h4>
            <p style="font-size: 2em; font-weight: 700; margin: 12px 0;">${formatScore(points, isDealer, winType)}</p>
            ${getPaymentDetails(points, isDealer, winType, playerCount)}
        </div>
        ${reportButton}
    `;

    container.style.display = 'block';

    // Add event listener for report button if game is active
    if (isSoloGame || isMultiplayerHost) {
        const btn = document.getElementById('reportToGame');
        if (btn) {
            btn.addEventListener('click', () => reportScoreToGame(result, position, winType, points));
        }
    }
}

function calculateScoreFromHanFu(han, fu, isDealer, winType) {
    // Limit hands
    if (han >= 13) return isDealer ? (winType === 'tsumo' ? { all: 16000 } : 48000) : (winType === 'tsumo' ? { dealer: 16000, nondealer: 8000 } : 32000);
    if (han >= 11) return isDealer ? (winType === 'tsumo' ? { all: 12000 } : 36000) : (winType === 'tsumo' ? { dealer: 12000, nondealer: 6000 } : 24000);
    if (han >= 8) return isDealer ? (winType === 'tsumo' ? { all: 8000 } : 24000) : (winType === 'tsumo' ? { dealer: 8000, nondealer: 4000 } : 16000);
    if (han >= 6) return isDealer ? (winType === 'tsumo' ? { all: 6000 } : 18000) : (winType === 'tsumo' ? { dealer: 6000, nondealer: 3000 } : 12000);
    if (han >= 5) return isDealer ? (winType === 'tsumo' ? { all: 4000 } : 12000) : (winType === 'tsumo' ? { dealer: 4000, nondealer: 2000 } : 8000);

    let basePoints = fu * Math.pow(2, 2 + han);

    if (basePoints >= 2000) {
        return isDealer ? (winType === 'tsumo' ? { all: 4000 } : 12000) : (winType === 'tsumo' ? { dealer: 4000, nondealer: 2000 } : 8000);
    }

    if (winType === 'ron') {
        return isDealer ? Math.ceil(basePoints * 6 / 100) * 100 : Math.ceil(basePoints * 4 / 100) * 100;
    } else {
        if (isDealer) {
            return { all: Math.ceil(basePoints * 2 / 100) * 100 };
        } else {
            return {
                dealer: Math.ceil(basePoints * 2 / 100) * 100,
                nondealer: Math.ceil(basePoints / 100) * 100
            };
        }
    }
}

function formatScore(points, isDealer, winType) {
    if (winType === 'ron') {
        return `${points.toLocaleString()} points`;
    } else {
        if (isDealer) {
            return `${points.all.toLocaleString()} points from each`;
        } else {
            return `${points.dealer.toLocaleString()}/${points.nondealer.toLocaleString()} points`;
        }
    }
}

function getPaymentDetails(points, isDealer, winType, mode) {
    if (winType === 'ron') {
        return `<p>Discarder pays: <strong>${points.toLocaleString()} points</strong></p>`;
    } else {
        if (isDealer) {
            const numPlayers = mode || 4;
            const total = points.all * (numPlayers - 1);
            return `<p>Each player pays: <strong>${points.all.toLocaleString()} points</strong></p>
                    <p>Total received: <strong>${total.toLocaleString()} points</strong></p>`;
        } else {
            const numNonDealers = (mode || 4) - 2;
            const total = points.dealer + (points.nondealer * numNonDealers);
            return `<p>Dealer pays: <strong>${points.dealer.toLocaleString()} points</strong></p>
                    <p>Non-dealers pay: <strong>${points.nondealer.toLocaleString()} points each</strong></p>
                    <p>Total received: <strong>${total.toLocaleString()} points</strong></p>`;
        }
    }
}

function getLimitHandName(han) {
    if (han >= 13) return 'Yakuman (役満)';
    if (han >= 11) return 'Sanbaiman (三倍満)';
    if (han >= 8) return 'Baiman (倍満)';
    if (han >= 6) return 'Haneman (跳満)';
    if (han >= 5) return 'Mangan (満貫)';
    return null;
}

// ===== MULTIPLAYER FUNCTIONS =====
// Note: The actual multiplayer functions are in multiplayer-simple.js
// and accessed via window.SimpleMultiplayer.hostGame() and window.SimpleMultiplayer.joinGame()

function generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

function handleMultiplayerMessage(data, fromPeerId) {
    if (data.type === 'gameState') {
        gameState = data.data;

        // If game has started, show game area
        if (gameState.gameStarted) {
            const gameSetup = document.getElementById('gameSetup');
            if (gameSetup) gameSetup.style.display = 'none';
            document.getElementById('gameArea').style.display = 'block';
        }

        renderGame();
    }
}

function broadcastGameState() {
    if (multiplayerState.isHost && multiplayerState.connections) {
        multiplayerState.connections.forEach(conn => {
            if (conn.open) {
                conn.send({ type: 'gameState', data: gameState });
            }
        });
    }
}

function updatePlayerList() {
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
    if (multiplayerState.connections) {
        multiplayerState.connections.forEach((conn) => {
            const playerDiv = document.createElement('div');
            playerDiv.className = 'connected-player';
            const playerName = multiplayerState.playerNames[conn.peer] || 'Guest';
            playerDiv.innerHTML = `<span>${playerName}</span><span class="player-role">GUEST</span>`;
            listEl.appendChild(playerDiv);
        });
    }
}

function showGameSetup() {
    // Hide all connection screens
    document.getElementById('initialChoice').style.display = 'none';
    document.getElementById('hostScreen').style.display = 'none';
    document.getElementById('joinScreen').style.display = 'none';

    // Show game setup
    const gameSetup = document.getElementById('gameSetup');

    if (gameSetup && multiplayerState.isHost) {
        gameSetup.style.display = 'block';
    } else if (gameSetup) {
        // For guests, show a waiting message instead
        gameSetup.style.display = 'block';
        const newGameBtn = document.getElementById('newGame');
        const modeButtons = document.querySelectorAll('.mode-btn');
        const startingPoints = document.getElementById('startingPoints');

        if (newGameBtn) {
            newGameBtn.disabled = true;
            newGameBtn.textContent = 'Waiting for host to start game...';
        }

        // Disable controls for guests
        modeButtons.forEach(btn => btn.disabled = true);
        if (startingPoints) startingPoints.disabled = true;
    }
}

// ===== GAME FUNCTIONS (from original code) =====
function startNewGame() {
    const startingPoints = parseInt(document.getElementById('startingPoints').value);
    gameState.startingPoints = startingPoints;
    gameState.currentRound = 1;
    gameState.currentWind = '東';
    gameState.honba = 0;
    gameState.riichiSticks = 0;
    gameState.dealer = 0;
    gameState.gameStarted = true;

    gameState.players = [];
    const winds = gameState.mode === 3 ? ['東', '南', '西'] : ['東', '南', '西', '北'];

    for (let i = 0; i < gameState.mode; i++) {
        gameState.players.push({
            name: `Player ${i + 1}`,
            wind: winds[i],
            points: startingPoints,
            riichi: false
        });
    }

    renderGame();

    // Hide game setup, show game area
    const gameSetup = document.getElementById('gameSetup');
    if (gameSetup) gameSetup.style.display = 'none';
    document.getElementById('gameArea').style.display = 'block';

    broadcastGameState();
}

function startGameFromHostRoom() {
    // Read settings from host screen
    const startingPoints = parseInt(document.getElementById('hostStartingPoints').value);

    // Apply settings to game state
    gameState.startingPoints = startingPoints;
    gameState.currentRound = 1;
    gameState.currentWind = '東';
    gameState.honba = 0;
    gameState.riichiSticks = 0;
    gameState.dealer = 0;
    gameState.gameStarted = true;

    // Initialize players based on connected players
    gameState.players = [];
    const winds = gameState.mode === 3 ? ['東', '南', '西'] : ['東', '南', '西', '北'];

    // Add host as first player
    gameState.players.push({
        name: multiplayerState.playerName,
        wind: winds[0],
        points: startingPoints,
        riichi: false
    });

    // Add connected players
    if (multiplayerState.connections) {
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
    }

    renderGame();

    // Hide host screen, show game area
    document.getElementById('hostScreen').style.display = 'none';
    document.getElementById('gameArea').style.display = 'block';

    // Broadcast game start to all players
    broadcastGameState();
}

function renderGame() {
    updateRoundDisplay();
    renderPlayerScores();

    // Hide score actions for guests (only host can record scores)
    const scoreActions = document.getElementById('scoreActions');
    const resultForm = document.getElementById('resultForm');

    if (scoreActions) {
        // Check if user is a guest (connected but not host)
        const isGuest = (multiplayerState.connected || multiplayerState.conn) && !multiplayerState.isHost;

        if (isGuest) {
            scoreActions.style.display = 'none';

            // Add read-only notice for guests
            if (resultForm && !document.getElementById('guestNotice')) {
                resultForm.innerHTML = `
                    <div id="guestNotice" style="background: linear-gradient(135deg, #718096 0%, #4a5568 100%); padding: 16px; border-radius: 8px; margin-top: 16px; text-align: center;">
                        <p style="margin: 0; color: white;">👁️ <strong>Spectator Mode</strong></p>
                        <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.8); font-size: 0.9em;">The host is managing the game scores</p>
                    </div>
                `;
                resultForm.style.display = 'block';
            }
        } else {
            scoreActions.style.display = 'block';
            // Clear guest notice if exists
            const guestNotice = document.getElementById('guestNotice');
            if (guestNotice) {
                guestNotice.remove();
            }
        }
    }
}

function updateRoundDisplay() {
    const windEl = document.getElementById('roundWind');
    const numberEl = document.getElementById('roundNumber');
    const honbaEl = document.getElementById('honba');
    const riichiEl = document.getElementById('riichiSticks');

    if (windEl) windEl.textContent = gameState.currentWind;
    if (numberEl) numberEl.textContent = gameState.currentRound;
    if (honbaEl) honbaEl.textContent = gameState.honba;
    if (riichiEl) riichiEl.textContent = gameState.riichiSticks;
}

function renderPlayerScores() {
    const container = document.getElementById('playerScores');
    if (!container) return;

    container.innerHTML = '';

    gameState.players.forEach((player, index) => {
        const isDealer = index === gameState.dealer;
        const card = document.createElement('div');
        card.className = `player-card ${isDealer ? 'dealer' : ''}`;

        card.innerHTML = `
            <div class="player-info">
                <div class="player-name">${player.name}</div>
                <div class="player-wind">${player.wind}</div>
            </div>
            <div class="player-score">${player.points.toLocaleString()}</div>
            ${player.riichi ? '<div class="player-riichi">立直</div>' : ''}
        `;

        container.appendChild(card);
    });
}

function handleResultType(resultType) {
    const resultForm = document.getElementById('resultForm');
    if (!resultForm) return;

    if (resultType === 'draw') {
        // Handle draw - no score change, advance dealer with honba
        if (confirm('Confirm draw? This will advance to the next hand with +1 honba.')) {
            gameState.honba++;
            renderGame();
            broadcastGameState();
        }
        return;
    }

    if (resultType === 'chombo') {
        // Handle chombo (penalty)
        resultForm.innerHTML = `
            <div style="background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%); padding: 20px; border-radius: 8px; margin-top: 16px;">
                <h3 style="margin-top: 0; color: white;">⚠️ Chombo (Dead Hand Penalty)</h3>

                <div style="margin-bottom: 16px;">
                    <label style="display: block; margin-bottom: 8px; color: white; font-weight: bold;">Who committed chombo?</label>
                    <select id="chomboSelect" style="width: 100%; padding: 10px; border-radius: 4px; border: none; font-size: 1em;">
                        ${gameState.players.map((p, i) => `<option value="${i}">${p.name} (${p.wind})</option>`).join('')}
                    </select>
                </div>

                <p style="color: rgba(255,255,255,0.9); font-size: 0.9em; margin-bottom: 16px;">
                    Penalty: Player loses points (usually equivalent to mangan payment)
                </p>

                <div style="display: flex; gap: 12px;">
                    <button id="confirmChombo" class="btn-primary" style="flex: 1;">Confirm Penalty</button>
                    <button id="cancelChombo" class="btn-back" style="flex: 1;">Cancel</button>
                </div>
            </div>
        `;

        resultForm.style.display = 'block';

        document.getElementById('confirmChombo').addEventListener('click', () => {
            const playerIdx = parseInt(document.getElementById('chomboSelect').value);
            // Standard chombo penalty (varies by rules, using 8000 as common value)
            const penaltyAmount = 8000;

            if (gameState.players[playerIdx].points >= penaltyAmount) {
                gameState.players[playerIdx].points -= penaltyAmount;
            } else {
                gameState.players[playerIdx].points = 0;
            }

            renderGame();
            broadcastGameState();
            resultForm.style.display = 'none';
            resultForm.innerHTML = '';
            alert(`Chombo penalty applied to ${gameState.players[playerIdx].name}`);
        });

        document.getElementById('cancelChombo').addEventListener('click', () => {
            resultForm.style.display = 'none';
            resultForm.innerHTML = '';
        });
        return;
    }

    // Handle Ron or Tsumo - manual score entry
    const winType = resultType; // 'ron' or 'tsumo'

    resultForm.innerHTML = `
        <div style="background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); padding: 20px; border-radius: 8px; margin-top: 16px;">
            <h3 style="margin-top: 0; color: white;">🎯 ${winType === 'ron' ? 'Ron (Discard Win)' : 'Tsumo (Self-Draw)'}</h3>

            <div style="margin-bottom: 16px;">
                <label style="display: block; margin-bottom: 8px; color: white; font-weight: bold;">Winner:</label>
                <select id="winnerSelect" style="width: 100%; padding: 10px; border-radius: 4px; border: none; font-size: 1em;">
                    ${gameState.players.map((p, i) => `<option value="${i}">${p.name} (${p.wind})</option>`).join('')}
                </select>
            </div>

            ${winType === 'ron' ? `
            <div style="margin-bottom: 16px;">
                <label style="display: block; margin-bottom: 8px; color: white; font-weight: bold;">Who discarded (loser):</label>
                <select id="loserSelect" style="width: 100%; padding: 10px; border-radius: 4px; border: none; font-size: 1em;">
                    ${gameState.players.map((p, i) => `<option value="${i}">${p.name} (${p.wind})</option>`).join('')}
                </select>
            </div>
            ` : ''}

            <div style="margin-bottom: 16px;">
                <label style="display: block; margin-bottom: 8px; color: white; font-weight: bold;">Score (points):</label>
                <input type="number" id="scoreInput" placeholder="Enter total points (e.g., 3900, 8000, 12000)"
                    style="width: 100%; padding: 10px; border-radius: 4px; border: none; font-size: 1em;" step="100" min="0">
            </div>

            <p style="color: rgba(255,255,255,0.9); font-size: 0.85em; margin-bottom: 16px;">
                💡 Tip: Use the Hand Calculator to calculate exact scores, or enter manually
            </p>

            <div style="display: flex; gap: 12px;">
                <button id="confirmManualScore" class="btn-primary" style="flex: 1;">Confirm & Apply</button>
                <button id="cancelManualScore" class="btn-back" style="flex: 1;">Cancel</button>
            </div>
        </div>
    `;

    resultForm.style.display = 'block';

    document.getElementById('confirmManualScore').addEventListener('click', () => {
        const winnerIdx = parseInt(document.getElementById('winnerSelect').value);
        const loserIdx = winType === 'ron' ? parseInt(document.getElementById('loserSelect').value) : null;
        const scoreValue = parseInt(document.getElementById('scoreInput').value);

        if (!scoreValue || scoreValue <= 0) {
            alert('Please enter a valid score value');
            return;
        }

        if (winType === 'ron' && winnerIdx === loserIdx) {
            alert('Winner and loser cannot be the same person!');
            return;
        }

        const isDealer = winnerIdx === gameState.dealer;
        applyScore(winnerIdx, loserIdx, winType, scoreValue, isDealer);
        resultForm.style.display = 'none';
        resultForm.innerHTML = '';
    });

    document.getElementById('cancelManualScore').addEventListener('click', () => {
        resultForm.style.display = 'none';
        resultForm.innerHTML = '';
    });
}

// ===== SCORE REPORTING FUNCTIONS =====
function reportScoreToGame(result, position, winType, points) {
    // Show a form to select winner and loser
    switchTab('game');

    // Create score reporting UI
    const resultForm = document.getElementById('resultForm');
    if (!resultForm) return;

    const isDealer = position === 'dealer';
    const totalPoints = typeof points === 'number' ? points :
        (winType === 'tsumo' ?
            (isDealer ? points.all * (gameState.mode - 1) :
                points.dealer + points.nondealer * (gameState.mode - 2)) :
            points);

    resultForm.innerHTML = `
        <div style="background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%); padding: 20px; border-radius: 8px; margin-top: 16px;">
            <h3 style="margin-top: 0; color: white;">📊 Record Score</h3>

            <div style="background: rgba(255,255,255,0.15); padding: 12px; border-radius: 6px; margin-bottom: 16px;">
                <p style="margin: 0; color: white;"><strong>${result.han} han, ${result.fu} fu</strong></p>
                <p style="margin: 4px 0 0 0; color: rgba(255,255,255,0.9);">${winType === 'tsumo' ? 'Tsumo (Self-draw)' : 'Ron (Discard)'}</p>
            </div>

            <div style="margin-bottom: 16px;">
                <label style="display: block; margin-bottom: 8px; color: white; font-weight: bold;">Winner:</label>
                <select id="winnerSelect" style="width: 100%; padding: 10px; border-radius: 4px; border: none; font-size: 1em;">
                    ${gameState.players.map((p, i) => `<option value="${i}">${p.name} (${p.wind})</option>`).join('')}
                </select>
            </div>

            ${winType === 'ron' ? `
            <div style="margin-bottom: 16px;">
                <label style="display: block; margin-bottom: 8px; color: white; font-weight: bold;">Who discarded (loser):</label>
                <select id="loserSelect" style="width: 100%; padding: 10px; border-radius: 4px; border: none; font-size: 1em;">
                    ${gameState.players.map((p, i) => `<option value="${i}">${p.name} (${p.wind})</option>`).join('')}
                </select>
            </div>
            ` : ''}

            <div style="display: flex; gap: 12px;">
                <button id="confirmScore" class="btn-primary" style="flex: 1;">Confirm & Apply</button>
                <button id="cancelScore" class="btn-back" style="flex: 1;">Cancel</button>
            </div>
        </div>
    `;

    resultForm.style.display = 'block';

    // Add event listeners
    document.getElementById('confirmScore').addEventListener('click', () => {
        const winnerIdx = parseInt(document.getElementById('winnerSelect').value);
        const loserIdx = winType === 'ron' ? parseInt(document.getElementById('loserSelect').value) : null;

        if (winType === 'ron' && winnerIdx === loserIdx) {
            alert('Winner and loser cannot be the same person!');
            return;
        }

        applyScore(winnerIdx, loserIdx, winType, points, isDealer);
        resultForm.style.display = 'none';
        resultForm.innerHTML = '';
    });

    document.getElementById('cancelScore').addEventListener('click', () => {
        resultForm.style.display = 'none';
        resultForm.innerHTML = '';
    });
}

function applyScore(winnerIdx, loserIdx, winType, points, isDealer) {
    if (winType === 'ron') {
        // Ron: loser pays winner
        const payment = typeof points === 'number' ? points : points;
        gameState.players[winnerIdx].points += payment;
        gameState.players[loserIdx].points -= payment;
    } else {
        // Tsumo: everyone pays winner
        if (typeof points === 'object') {
            // Complex tsumo payment
            gameState.players.forEach((player, idx) => {
                if (idx === winnerIdx) {
                    // Winner receives
                    const received = isDealer ?
                        points.all * (gameState.mode - 1) :
                        points.dealer + points.nondealer * (gameState.mode - 2);
                    player.points += received;
                } else {
                    // Others pay
                    const payment = (idx === gameState.dealer && !isDealer) ?
                        points.dealer : points.nondealer || points.all;
                    player.points -= payment;
                }
            });
        }
    }

    // Check if winner was in riichi (collect riichi sticks)
    if (gameState.players[winnerIdx].riichi) {
        gameState.players[winnerIdx].points += gameState.riichiSticks * 1000;
        gameState.riichiSticks = 0;
        gameState.players[winnerIdx].riichi = false;
    }

    // Advance round
    advanceRound(winnerIdx);

    // Update display
    renderGame();

    // Broadcast to other players
    broadcastGameState();

    alert(`Score recorded! ${gameState.players[winnerIdx].name} wins!`);
}

function advanceRound(winnerIdx) {
    // If dealer wins, increment honba
    if (winnerIdx === gameState.dealer) {
        gameState.honba++;
    } else {
        // Non-dealer wins: advance dealer, reset honba
        gameState.dealer = (gameState.dealer + 1) % gameState.mode;
        gameState.honba = 0;

        // Check if we need to advance wind
        if (gameState.dealer === 0) {
            const winds = ['東', '南', '西', '北'];
            const currentWindIdx = winds.indexOf(gameState.currentWind);

            // Standard game: East + South rounds (Hanchan)
            // For a full game, uncomment the line below to play all four winds
            const maxWindIdx = 1; // 0 = East only (Tonpuu), 1 = East+South (Hanchan), 3 = All four winds

            if (currentWindIdx < maxWindIdx) {
                gameState.currentWind = winds[currentWindIdx + 1];
                gameState.currentRound = 1;
            } else {
                // Game finished - show final scores
                showGameEnd();
                return;
            }
        } else {
            gameState.currentRound++;
        }
    }
}

function showGameEnd() {
    // Sort players by points
    const sortedPlayers = [...gameState.players].sort((a, b) => b.points - a.points);

    const resultHTML = `
        <div style="background: linear-gradient(135deg, #805ad5 0%, #6b46c1 100%); padding: 24px; border-radius: 12px; margin: 20px 0; text-align: center;">
            <h2 style="color: white; margin-top: 0;">🎊 Game Finished!</h2>

            <div style="background: rgba(255,255,255,0.15); padding: 20px; border-radius: 8px; margin-top: 20px;">
                <h3 style="color: white; margin-top: 0;">Final Standings</h3>
                ${sortedPlayers.map((p, i) => `
                    <div style="background: rgba(255,255,255,${i === 0 ? '0.3' : '0.1'}); padding: 12px; margin: 8px 0; border-radius: 6px; display: flex; justify-content: space-between; align-items: center;">
                        <span style="color: white; font-weight: bold;">${i + 1}. ${p.name} (${p.wind})</span>
                        <span style="color: ${i === 0 ? '#ffd700' : 'white'}; font-size: 1.2em; font-weight: bold;">${p.points.toLocaleString()}</span>
                    </div>
                `).join('')}
            </div>

            <button id="newGame" class="btn-primary" style="margin-top: 20px; width: 100%; padding: 12px; font-size: 1.1em;">Start New Game</button>
        </div>
    `;

    const resultForm = document.getElementById('resultForm');
    if (resultForm) {
        resultForm.innerHTML = resultHTML;
        resultForm.style.display = 'block';

        document.getElementById('newGame').addEventListener('click', () => {
            if (confirm('Start a new game? This will reset all scores.')) {
                // Reset to initial choice screen
                showInitialChoice();
            }
        });
    }

    // Hide score actions when game is over
    const scoreActions = document.getElementById('scoreActions');
    if (scoreActions) {
        scoreActions.style.display = 'none';
    }

    alert(`Game Over! Winner: ${sortedPlayers[0].name} with ${sortedPlayers[0].points.toLocaleString()} points!`);
}

// Bridge functions to simple multiplayer (defined in multiplayer-simple.js)
function updatePlayerList() {
    if (window.SimpleMultiplayer) {
        window.SimpleMultiplayer.updatePlayerList();
    }
}

function broadcastGameState() {
    if (window.SimpleMultiplayer) {
        window.SimpleMultiplayer.broadcast();
    }
}

// Make tiles appear immediately
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeTilePicker);
} else {
    initializeTilePicker();
}
