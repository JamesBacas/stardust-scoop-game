/* Stardust Reactor - Spatial Logic Puzzle Engine */
document.addEventListener('DOMContentLoaded', () => {
    // --- Constants ---
    const GRID_SIZE = 6;
    const DEFAULT_MOVES = 16; // Tighter Move Limit Cap for higher difficulty!
    const TARGET_SCORE = 1200;
    const TARGET_BLACK_HOLES = 3;
    const MAX_ACTIVE_BLACK_HOLES = 2; // Active Black Hole Board Cap

    const TILE_TYPES = [
        { id: 'stardust', symbol: '✨', color: '#64ffda', score: 30, matchable: true },
        { id: 'crystal', symbol: '💎', color: '#bd5fff', score: 50, matchable: true },
        { id: 'nova', symbol: '🌟', color: '#ffd166', score: 80, matchable: true }
    ];

    const BLACK_HOLE_TILE = { id: 'blackhole', symbol: '🕳️', color: '#ff0054', score: 200, matchable: false };
    const PULSAR_TILE = { id: 'pulsar', symbol: '⚡', color: '#00b4d8', score: 150, matchable: true, isSpecial: true };
    const CORE_TILE = { id: 'core', symbol: '🌌', color: '#ff70a6', score: 300, matchable: true, isSpecial: true };

    // --- Web Audio Synthesizer ---
    class SoundEngine {
        constructor() {
            this.ctx = null;
            this.muted = false;
        }

        init() {
            if (!this.ctx) {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                this.ctx = new AudioCtx();
            }
            if (this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
        }

        toggleMute() {
            this.muted = !this.muted;
            return this.muted;
        }

        playTone(freq, type = 'sine', duration = 0.1, volume = 0.15, pitchEnd = null) {
            if (this.muted) return;
            try {
                this.init();
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = type;
                osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
                if (pitchEnd) {
                    osc.frequency.exponentialRampToValueAtTime(pitchEnd, this.ctx.currentTime + duration);
                }
                gain.gain.setValueAtTime(volume, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start();
                osc.stop(this.ctx.currentTime + duration);
            } catch (e) { }
        }

        playSelect() { this.playTone(440, 'sine', 0.08, 0.12); }
        playSwap() { this.playTone(523.25, 'triangle', 0.1, 0.15, 659.25); }
        playInvalid() { this.playTone(220, 'sawtooth', 0.15, 0.15, 110); }

        playMatch(combo = 1) {
            const baseFreq = 440 * Math.pow(1.15, combo - 1);
            this.playTone(baseFreq, 'sine', 0.15, 0.2, baseFreq * 1.4);
        }

        playPulsar() {
            this.playTone(880, 'sawtooth', 0.35, 0.25, 220);
        }

        playBlackHoleExplosion() {
            this.playTone(150, 'sawtooth', 0.4, 0.3, 50);
        }

        playVictory() {
            const notes = [523, 659, 784, 1046, 1318];
            notes.forEach((freq, idx) => {
                setTimeout(() => this.playTone(freq, 'sine', 0.2, 0.2), idx * 80);
            });
        }

        playGameOver() {
            const notes = [440, 349, 293, 220];
            notes.forEach((freq, idx) => {
                setTimeout(() => this.playTone(freq, 'sawtooth', 0.25, 0.2), idx * 110);
            });
        }
    }

    const audio = new SoundEngine();

    // --- DOM Elements ---
    const canvasContainer = document.getElementById('canvasContainer');
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    canvas.style.touchAction = 'none';

    const movesValue = document.getElementById('movesValue');
    const scoreValue = document.getElementById('scoreValue');
    const bestScoreValue = document.getElementById('bestScoreValue');
    const hazardValue = document.getElementById('hazardValue');
    const comboBadge = document.getElementById('comboBadge');

    const restartHeaderBtn = document.getElementById('restartHeaderBtn');
    const restartOverlayBtn = document.getElementById('restartOverlayBtn');
    const soundToggle = document.getElementById('soundToggle');
    const soundIcon = document.getElementById('soundIcon');
    const infoBtn = document.getElementById('infoBtn');
    const closeInfoBtn = document.getElementById('closeInfoBtn');

    const infoOverlay = document.getElementById('infoOverlay');
    const endOverlay = document.getElementById('endOverlay');

    const resultBadge = document.getElementById('resultBadge');
    const resultTitle = document.getElementById('resultTitle');
    const resultMsg = document.getElementById('resultMsg');
    const finalScore = document.getElementById('finalScore');
    const finalMoves = document.getElementById('finalMoves');
    const finalHazards = document.getElementById('finalHazards');

    const star1 = document.getElementById('star1');
    const star2 = document.getElementById('star2');
    const star3 = document.getElementById('star3');

    // --- Game State Variables ---
    let grid = [];
    let movesLeft = DEFAULT_MOVES;
    let score = 0;
    localStorage.removeItem('stardust_reactor_best_score');
    let bestScore = 0; // High score resets on every page reload
    let blackHolesDestroyed = 0;
    let movesSinceLastBHSpawn = 2; // Non-consecutive turn cooldown
    let selectedCell = null; // { r, c }
    let isAnimating = false;
    let gameState = 'PLAYING'; // 'PLAYING', 'VICTORY', 'GAMEOVER'
    let particles = [];
    let laserLines = [];
    let floatingTexts = [];
    let touchStartPos = null;
    let lastTouchTime = 0;

    if (bestScoreValue) bestScoreValue.textContent = bestScore;

    // Grid Metrics
    let cellSize = canvas.width / GRID_SIZE;

    // --- Board Logic Functions ---

    function createRandomTile() {
        const rand = TILE_TYPES[Math.floor(Math.random() * TILE_TYPES.length)];
        return { ...rand, turns: 0, animY: 0, animX: 0, scale: 1.0 };
    }

    function activeBlackHoleCount() {
        let count = 0;
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (grid[r] && grid[r][c] && grid[r][c].id === 'blackhole') count++;
            }
        }
        return count;
    }

    function hasEmptyCells() {
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (grid[r] && grid[r][c] && grid[r][c].id === 'empty') return true;
            }
        }
        return false;
    }

    function initBoard() {
        grid = [];
        for (let r = 0; r < GRID_SIZE; r++) {
            grid[r] = [];
            for (let c = 0; c < GRID_SIZE; c++) {
                grid[r][c] = createRandomTile();
            }
        }

        // Board starts clean with 0 Black Holes so players can learn & build combos first!
        clearMatchesInitial();
    }

    function clearMatchesInitial() {
        let matches = findMatches();
        let safetyCounter = 0;
        while (matches.length > 0 && safetyCounter < 50) {
            safetyCounter++;
            for (let m of matches) {
                grid[m.r][m.c] = createRandomTile();
            }
            matches = findMatches();
        }
    }

    function findMatches() {
        let matched = [];
        let matchedSet = new Set();

        // Check horizontal matches
        for (let r = 0; r < GRID_SIZE; r++) {
            let matchLength = 1;
            for (let c = 0; c < GRID_SIZE; c++) {
                let checkNext = false;
                if (c < GRID_SIZE - 1) {
                    const t1 = grid[r][c];
                    const t2 = grid[r][c + 1];
                    if (t1 && t2 && t1.matchable && t2.matchable && t1.id === t2.id) {
                        matchLength++;
                        checkNext = true;
                    }
                }
                if (!checkNext) {
                    if (matchLength >= 3) {
                        for (let k = 0; k < matchLength; k++) {
                            const matchC = c - k;
                            const key = `${r},${matchC}`;
                            if (!matchedSet.has(key)) {
                                matchedSet.add(key);
                                matched.push({ r, c: matchC, length: matchLength, dir: 'h' });
                            }
                        }
                    }
                    matchLength = 1;
                }
            }
        }

        // Check vertical matches
        for (let c = 0; c < GRID_SIZE; c++) {
            let matchLength = 1;
            for (let r = 0; r < GRID_SIZE; r++) {
                let checkNext = false;
                if (r < GRID_SIZE - 1) {
                    const t1 = grid[r][c];
                    const t2 = grid[r + 1][c];
                    if (t1 && t2 && t1.matchable && t2.matchable && t1.id === t2.id) {
                        matchLength++;
                        checkNext = true;
                    }
                }
                if (!checkNext) {
                    if (matchLength >= 3) {
                        for (let k = 0; k < matchLength; k++) {
                            const matchR = r - k;
                            const key = `${matchR},${c}`;
                            if (!matchedSet.has(key)) {
                                matchedSet.add(key);
                                matched.push({ r: matchR, c, length: matchLength, dir: 'v' });
                            }
                        }
                    }
                    matchLength = 1;
                }
            }
        }

        return matched;
    }

    // --- User Action & Swap Mechanics ---

    function handleCellClick(r, c) {
        if (gameState !== 'PLAYING' || isAnimating) return;

        audio.init();

        if (!selectedCell) {
            selectedCell = { r, c };
            audio.playSelect();
        } else {
            const r1 = selectedCell.r;
            const c1 = selectedCell.c;
            const r2 = r;
            const c2 = c;

            const isAdjacent = (Math.abs(r1 - r2) + Math.abs(c1 - c2)) === 1;

            if (r1 === r2 && c1 === c2) {
                // Deselect on clicking same cell
                selectedCell = null;
            } else if (isAdjacent) {
                // Attempt Swap!
                attemptSwap(r1, c1, r2, c2);
                selectedCell = null;
            } else {
                // Select new cell
                selectedCell = { r, c };
                audio.playSelect();
            }
        }
    }

    async function attemptSwap(r1, c1, r2, c2) {
        if (isAnimating) return;
        isAnimating = true;

        // Perform swap
        const tile1 = grid[r1][c1];
        const tile2 = grid[r2][c2];

        grid[r1][c1] = tile2;
        grid[r2][c2] = tile1;

        audio.playSwap();

        // Check for Special triggers or valid matches
        let isSpecialTrigger = (tile1.isSpecial || tile2.isSpecial);
        let matches = findMatches();

        if (!isSpecialTrigger && matches.length === 0) {
            // Invalid swap -> Revert swap smoothly
            audio.playInvalid();
            await new Promise(res => setTimeout(res, 180));
            grid[r1][c1] = tile1;
            grid[r2][c2] = tile2;
            isAnimating = false;
            return;
        }

        // Valid move confirmed! Deduct 1 move
        movesLeft--;
        movesSinceLastBHSpawn++;
        updateHUD();

        // Handle Special tile swap triggers if present
        if (tile1.id === 'pulsar' || tile2.id === 'pulsar') {
            triggerPulsarLaser(tile1.id === 'pulsar' ? r2 : r1, tile1.id === 'pulsar' ? c2 : c1);
        }
        if (tile1.id === 'core' || tile2.id === 'core') {
            const targetTile = tile1.id === 'core' ? tile2 : tile1;
            triggerQuantumCore(targetTile.id);
        }

        // Resolve cascades and matches
        await processCascades(r1, c1, r2, c2);

        // Turn-based Black Hole Expansion check
        await checkBlackHoleExpansion();

        // Check Win/Loss conditions
        checkGameEndState();

        isAnimating = false;
    }

    function triggerPulsarLaser(r, c) {
        audio.playPulsar();
        laserLines.push({ type: 'row', r, alpha: 1.0 });
        laserLines.push({ type: 'col', c, alpha: 1.0 });

        // Vaporize row
        for (let col = 0; col < GRID_SIZE; col++) {
            destroyTileAt(r, col);
        }
        // Vaporize column
        for (let row = 0; row < GRID_SIZE; row++) {
            destroyTileAt(row, c);
        }
    }

    function triggerQuantumCore(targetId) {
        audio.playPulsar();
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (grid[r][c].id === targetId) {
                    destroyTileAt(r, c);
                }
            }
        }
    }

    function destroyTileAt(r, c) {
        const tile = grid[r][c];
        if (!tile || tile.id === 'empty') return;

        if (tile.id === 'blackhole') {
            blackHolesDestroyed++;
            score += BLACK_HOLE_TILE.score;
            audio.playBlackHoleExplosion();
            triggerScreenShake();
            createExplosion(c * cellSize + cellSize / 2, r * cellSize + cellSize / 2, '#ff0054', 28);
            addFloatingText("🕳️ CONTAINED! +200", c * cellSize + cellSize / 2, r * cellSize + cellSize / 2, '#ff0054', 1.2);
        } else {
            createExplosion(c * cellSize + cellSize / 2, r * cellSize + cellSize / 2, tile.color, 14);
        }
        grid[r][c] = { id: 'empty', symbol: '', color: 'transparent', score: 0, matchable: false };
    }

    async function processCascades(swapR1, swapC1, swapR2, swapC2) {
        let cascadeDepth = 0;
        let loopLimit = 0;

        while (loopLimit < 20) {
            loopLimit++;
            let matches = findMatches();
            let emptyExists = hasEmptyCells();

            if (matches.length === 0 && !emptyExists) {
                break;
            }

            if (matches.length > 0) {
                cascadeDepth++;
                audio.playMatch(cascadeDepth);

                if (cascadeDepth > 1) {
                    comboBadge.textContent = `⚡ COMBO x${cascadeDepth}`;
                    comboBadge.classList.remove('hidden');
                }

                const matchedTiles = new Set();
                let specialMatch = null;

                for (let m of matches) {
                    matchedTiles.add(`${m.r},${m.c}`);
                    if (m.length >= 4 && !specialMatch) specialMatch = m;

                    // Destroy adjacent Black Holes
                    destroyAdjacentBlackHoles(m.r, m.c);

                    const tile = grid[m.r][m.c];
                    const points = Math.round((tile.score || 30) * Math.pow(1.5, cascadeDepth - 1));
                    score += points;

                    createExplosion(m.c * cellSize + cellSize / 2, m.r * cellSize + cellSize / 2, tile.color, 12);
                }

                let specialTileToSpawn = null;
                let spawnR = null;
                let spawnC = null;

                if (specialMatch) {
                    specialTileToSpawn = specialMatch.length >= 5 ? { ...CORE_TILE, turns: 0 } : { ...PULSAR_TILE, turns: 0 };
                    if (swapR2 !== undefined && matchedTiles.has(`${swapR2},${swapC2}`)) {
                        spawnR = swapR2; spawnC = swapC2;
                    } else if (swapR1 !== undefined && matchedTiles.has(`${swapR1},${swapC1}`)) {
                        spawnR = swapR1; spawnC = swapC1;
                    } else {
                        spawnR = specialMatch.r; spawnC = specialMatch.c;
                    }
                }

                for (let key of matchedTiles) {
                    const [r, c] = key.split(',').map(Number);
                    if (specialTileToSpawn && r === spawnR && c === spawnC) {
                        grid[r][c] = specialTileToSpawn;
                    } else {
                        grid[r][c] = { id: 'empty', symbol: '', color: 'transparent', score: 0, matchable: false };
                    }
                }

                updateHUD();
                await new Promise(res => setTimeout(res, 180));
            }

            // ALWAYS apply gravity if empty cells exist!
            if (hasEmptyCells()) {
                applyGravity();
                updateHUD();
                await new Promise(res => setTimeout(res, 180));
            }
        }

        setTimeout(() => comboBadge.classList.add('hidden'), 1200);
    }

    function destroyAdjacentBlackHoles(r, c) {
        const neighbors = [
            { r: r - 1, c }, { r: r + 1, c },
            { r, c: c - 1 }, { r, c: c + 1 }
        ];

        for (let n of neighbors) {
            if (n.r >= 0 && n.r < GRID_SIZE && n.c >= 0 && n.c < GRID_SIZE) {
                if (grid[n.r] && grid[n.r][n.c] && grid[n.r][n.c].id === 'blackhole') {
                    destroyTileAt(n.r, n.c);
                }
            }
        }
    }

    function getActiveBlackHoleCols() {
        let cols = [];
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (grid[r] && grid[r][c] && grid[r][c].id === 'blackhole') {
                    cols.push(c);
                }
            }
        }
        return cols;
    }

    function applyGravity() {
        let spawnedNewBlackHole = false;

        // Choose a column spaced away from existing Black Holes
        const activeCols = getActiveBlackHoleCols();
        let candidateCols = [0, 1, 2, 3, 4, 5].filter(c => !activeCols.includes(c) && !activeCols.includes(c - 1) && !activeCols.includes(c + 1));
        if (candidateCols.length === 0) {
            candidateCols = [0, 1, 2, 3, 4, 5].filter(c => !activeCols.includes(c));
        }
        if (candidateCols.length === 0) candidateCols = [0, 1, 2, 3, 4, 5];

        const randomBHCol = candidateCols[Math.floor(Math.random() * candidateCols.length)];

        for (let c = 0; c < GRID_SIZE; c++) {
            let emptyCount = 0;
            for (let r = GRID_SIZE - 1; r >= 0; r--) {
                if (grid[r][c].id === 'empty') {
                    emptyCount++;
                } else if (emptyCount > 0) {
                    grid[r + emptyCount][c] = grid[r][c];
                    grid[r][c] = { id: 'empty', symbol: '', color: 'transparent', score: 0, matchable: false };
                }
            }

            // Fill top empty cells with new tiles
            for (let r = 0; r < emptyCount; r++) {
                const activeBH = activeBlackHoleCount();
                const movesUsed = DEFAULT_MOVES - movesLeft;

                // Non-consecutive spawn check: movesSinceLastBHSpawn >= 2
                if (!spawnedNewBlackHole && movesUsed >= 4 && movesSinceLastBHSpawn >= 2 && activeBH < MAX_ACTIVE_BLACK_HOLES && (activeBH + blackHolesDestroyed) < TARGET_BLACK_HOLES && c === randomBHCol && r === 0) {
                    grid[r][c] = { ...BLACK_HOLE_TILE, turns: 0, animY: 0, animX: 0, scale: 1.0 };
                    spawnedNewBlackHole = true;
                    movesSinceLastBHSpawn = 0; // Reset turn cooldown!
                    addFloatingText("🕳️ BLACK HOLE ENTERING REACTOR!", canvas.width / 2, 80, "#ff0054", 1.25);
                } else {
                    grid[r][c] = createRandomTile();
                }
            }
        }
    }

    async function checkBlackHoleExpansion() {
        let blackHoles = [];
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (grid[r] && grid[r][c] && grid[r][c].id === 'blackhole') {
                    grid[r][c].turns = (grid[r][c].turns || 0) + 1;
                    if (grid[r][c].turns >= 2) { // 2-turn expansion for higher difficulty!
                        blackHoles.push({ r, c });
                    }
                }
            }
        }

        // Expand Black Hole to an empty or normal adjacent cell with -50 Energy penalty!
        for (let bh of blackHoles) {
            grid[bh.r][bh.c].turns = 0; // reset turns
            const neighbors = [
                { r: bh.r - 1, c: bh.c }, { r: bh.r + 1, c: bh.c },
                { r: bh.r, c: bh.c - 1 }, { r: bh.r, c: bh.c + 1 }
            ].filter(n => n.r >= 0 && n.r < GRID_SIZE && n.c >= 0 && n.c < GRID_SIZE && grid[n.r][n.c].id !== 'blackhole');

            if (neighbors.length > 0) {
                const target = neighbors[Math.floor(Math.random() * neighbors.length)];
                grid[target.r][target.c] = { ...BLACK_HOLE_TILE, turns: 0, animY: 0, animX: 0, scale: 1.0 };
                audio.playTone(180, 'sawtooth', 0.2, 0.2, 90);

                // Expansion Penalty: Deduct 50 Energy for tile consumption
                score = Math.max(0, score - 50);
                triggerScreenShake();
                createExplosion(target.c * cellSize + cellSize / 2, target.r * cellSize + cellSize / 2, '#ff0054', 18);
                addFloatingText("🚨 CONSUMED TILE! -50 PTS", target.c * cellSize + cellSize / 2, target.r * cellSize + cellSize / 2, "#ff0054", 1.25);
            }
        }
    }

    // --- Particle & Visual Effects ---

    function createExplosion(x, y, color, count = 16) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 40 + Math.random() * 120;
            particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color,
                radius: 2 + Math.random() * 3,
                alpha: 1.0,
                life: 0.3 + Math.random() * 0.3
            });
        }
        // Cap max active particles for smooth 60fps performance
        if (particles.length > 100) {
            particles = particles.slice(-100);
        }
    }

    function addFloatingText(text, x, y, color = '#64ffda', scale = 1.0) {
        floatingTexts.push({
            text, x, y, color, scale,
            alpha: 1.0,
            life: 0.8
        });
        if (floatingTexts.length > 10) {
            floatingTexts = floatingTexts.slice(-10);
        }
    }

    function triggerScreenShake() {
        canvasContainer.classList.remove('shake');
        void canvasContainer.offsetWidth;
        canvasContainer.classList.add('shake');
    }

    function updateHUD() {
        movesValue.textContent = movesLeft;
        scoreValue.textContent = score;
        hazardValue.textContent = `${blackHolesDestroyed}/${TARGET_BLACK_HOLES} 🕳️`;

        // Update High Score Display (Resets on every site reload)
        if (score > bestScore) {
            bestScore = score;
        }
        if (bestScoreValue) bestScoreValue.textContent = bestScore;
    }

    function checkGameEndState() {
        const isGoalMet = (blackHolesDestroyed >= TARGET_BLACK_HOLES && score >= TARGET_SCORE);
        if (isGoalMet || movesLeft <= 0) {
            triggerGameOver();
        }
    }

    function triggerGameOver() {
        // Star Rating Criteria requested by user:
        // Below 1200 Energy -> 1 Star (if score >= 400 or contained 1 BH)
        // Reached 1200 Energy -> 2 Stars
        // Beyond 1200 Energy (>= 1500) -> 3 Stars
        // No stars = Game Over (score < 400 and 0 BH)

        let stars = 0;

        if (score >= 1500 && blackHolesDestroyed >= 1) {
            stars = 3; // Beyond 1200 Energy
        } else if (score >= TARGET_SCORE) {
            stars = 2; // 1200 Energy Target
        } else if (score >= 400 || blackHolesDestroyed >= 1) {
            stars = 1; // Anything below 1200 Energy
        } else {
            stars = 0; // No stars = Game Over
        }

        gameState = stars > 0 ? 'VICTORY' : 'GAMEOVER';

        star1.classList.toggle('active', stars >= 1);
        star2.classList.toggle('active', stars >= 2);
        star3.classList.toggle('active', stars >= 3);

        if (stars === 0) {
            resultBadge.textContent = "REACTOR OVERLOAD";
            resultBadge.style.borderColor = "var(--accent-red)";
            resultBadge.style.color = "var(--accent-red)";
            resultTitle.textContent = "GAME OVER";
            resultMsg.textContent = `Out of moves! You collected ${score} Energy (0 Stars). Try again!`;
            audio.playGameOver();
        } else if (stars === 1) {
            resultBadge.textContent = "STAGE COMPLETED";
            resultBadge.style.borderColor = "var(--accent-gold)";
            resultBadge.style.color = "var(--accent-gold)";
            resultTitle.textContent = "1-STAR PASS! ⭐";
            resultMsg.textContent = `Good start! You collected ${score} Energy (Below 1200). Reach 1200 Energy for 2 Stars!`;
            audio.playVictory();
        } else if (stars === 2) {
            resultBadge.textContent = "REACTOR STABILIZED";
            resultBadge.style.borderColor = "var(--accent-teal)";
            resultBadge.style.color = "var(--accent-teal)";
            resultTitle.textContent = "2-STAR VICTORY! ⭐⭐";
            resultMsg.textContent = `Great run! You reached ${score} Energy (1200 Target achieved!). Push past 1500 for 3 Stars!`;
            audio.playVictory();
        } else {
            resultBadge.textContent = "FLAWLESS CORE";
            resultBadge.style.borderColor = "var(--accent-gold)";
            resultBadge.style.color = "var(--accent-gold)";
            resultTitle.textContent = "3-STAR MASTER! ⭐⭐⭐";
            resultMsg.textContent = `Flawless execution! You went beyond 1200 Energy (${score} pts) and contained Black Hole anomalies!`;
            audio.playVictory();
        }

        finalScore.textContent = score;
        finalMoves.textContent = movesLeft;
        finalHazards.textContent = blackHolesDestroyed;

        endOverlay.classList.remove('hidden');
    }

    function resetGame() {
        movesLeft = DEFAULT_MOVES;
        score = 0;
        blackHolesDestroyed = 0;
        selectedCell = null;
        isAnimating = false;
        gameState = 'PLAYING';
        particles = [];
        laserLines = [];
        floatingTexts = [];

        initBoard();
        updateHUD();

        endOverlay.classList.add('hidden');
        infoOverlay.classList.add('hidden');
    }

    // --- Input Gesture Handlers (Desktop Mouse & Mobile Touch) ---

    function getCanvasCoords(clientX, clientY) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY
        };
    }

    canvas.addEventListener('click', (e) => {
        // Prevent synthetic ghost click fired by mobile browsers after touch events
        if (Date.now() - lastTouchTime < 500) {
            e.preventDefault();
            return;
        }

        const coords = getCanvasCoords(e.clientX, e.clientY);
        const c = Math.floor(coords.x / cellSize);
        const r = Math.floor(coords.y / cellSize);

        if (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE) {
            handleCellClick(r, c);
        }
    });

    // Touch Swipe & Tap Gesture Support for Mobile
    canvas.addEventListener('touchstart', (e) => {
        lastTouchTime = Date.now();
        if (e.touches && e.touches.length > 0) {
            if (e.cancelable) e.preventDefault();
            const coords = getCanvasCoords(e.touches[0].clientX, e.touches[0].clientY);
            touchStartPos = coords;
        }
    }, { passive: false });

    canvas.addEventListener('touchend', (e) => {
        lastTouchTime = Date.now();
        if (e.cancelable) e.preventDefault();

        if (!touchStartPos || e.changedTouches.length === 0) return;

        const coords = getCanvasCoords(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
        const dx = coords.x - touchStartPos.x;
        const dy = coords.y - touchStartPos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const startC = Math.floor(touchStartPos.x / cellSize);
        const startR = Math.floor(touchStartPos.y / cellSize);

        if (dist > 25) {
            // Swipe gesture detected
            let targetR = startR;
            let targetC = startC;

            if (Math.abs(dx) > Math.abs(dy)) {
                targetC += dx > 0 ? 1 : -1;
            } else {
                targetR += dy > 0 ? 1 : -1;
            }

            if (startR >= 0 && startR < GRID_SIZE && startC >= 0 && startC < GRID_SIZE &&
                targetR >= 0 && targetR < GRID_SIZE && targetC >= 0 && targetC < GRID_SIZE) {
                selectedCell = null;
                attemptSwap(startR, startC, targetR, targetC);
            }
        } else {
            // Tap detected
            if (startR >= 0 && startR < GRID_SIZE && startC >= 0 && startC < GRID_SIZE) {
                handleCellClick(startR, startC);
            }
        }

        touchStartPos = null;
    }, { passive: false });

    // --- Render Engine ---

    function render(dt) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw Grid Lines & Board Cells
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                const x = c * cellSize;
                const y = r * cellSize;

                // Bright Checkerboard Cells
                ctx.fillStyle = (r + c) % 2 === 0 ? 'rgba(255, 255, 255, 0.08)' : 'rgba(100, 255, 218, 0.05)';
                ctx.fillRect(x, y, cellSize, cellSize);

                ctx.strokeStyle = 'rgba(100, 255, 218, 0.35)';
                ctx.lineWidth = 1.5;
                ctx.strokeRect(x, y, cellSize, cellSize);

                // Highlight Selected Cell with Bright Neon Border & Soft Glow
                if (selectedCell && selectedCell.r === r && selectedCell.c === c) {
                    ctx.fillStyle = 'rgba(100, 255, 218, 0.45)';
                    ctx.fillRect(x, y, cellSize, cellSize);
                    ctx.strokeStyle = '#ffffff';
                    ctx.shadowColor = '#64ffda';
                    ctx.shadowBlur = 12;
                    ctx.lineWidth = 3.5;
                    ctx.strokeRect(x + 2, y + 2, cellSize - 4, cellSize - 4);
                    ctx.shadowBlur = 0;
                }

                // Render Tile Emoji & Vibrant Tile Backing Pill
                const tile = grid[r][c];
                if (tile && tile.id !== 'empty') {
                    ctx.save();
                    const pad = 6;
                    const tileW = cellSize - pad * 2;
                    const tileH = cellSize - pad * 2;

                    // Sci-Fi Backing Pill with Soft Neon Glow
                    ctx.fillStyle = tile.id === 'blackhole' ? 'rgba(40, 10, 20, 0.9)' : 'rgba(18, 26, 52, 0.88)';
                    ctx.strokeStyle = tile.color;
                    ctx.lineWidth = tile.id === 'blackhole' ? 3.0 : 2.0;
                    ctx.shadowColor = tile.color;
                    ctx.shadowBlur = tile.id === 'blackhole' ? 14 : 8;

                    ctx.beginPath();
                    ctx.roundRect(x + pad, y + pad, tileW, tileH, 12);
                    ctx.fill();
                    ctx.stroke();

                    // Render Symbol Inside Pill
                    ctx.shadowBlur = 0;
                    ctx.translate(x + cellSize / 2, y + cellSize / 2);
                    ctx.font = `${Math.floor(cellSize * 0.54)}px "Segoe UI Emoji", "Apple Color Emoji", Orbitron, sans-serif`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(tile.symbol, 0, 0);

                    // If Black Hole, render expansion timer badge
                    if (tile.id === 'blackhole' && tile.turns > 0) {
                        ctx.font = '800 13px Orbitron, sans-serif';
                        ctx.fillStyle = '#ff0054';
                        ctx.shadowColor = '#ff0054';
                        ctx.shadowBlur = 6;
                        ctx.fillText(`⏳${3 - tile.turns}`, cellSize * 0.28, -cellSize * 0.28);
                    }

                    ctx.restore();
                }
            }
        }

        // Draw Laser Lines (Pulsar triggers)
        for (let i = laserLines.length - 1; i >= 0; i--) {
            const line = laserLines[i];
            ctx.save();
            ctx.globalAlpha = line.alpha;
            ctx.fillStyle = '#00b4d8';
            ctx.shadowColor = '#00b4d8';
            ctx.shadowBlur = 20;

            if (line.type === 'row') {
                ctx.fillRect(0, line.r * cellSize + cellSize / 4, canvas.width, cellSize / 2);
            } else {
                ctx.fillRect(line.c * cellSize + cellSize / 4, 0, cellSize / 2, canvas.height);
            }
            ctx.restore();

            line.alpha -= dt * 3;
            if (line.alpha <= 0) laserLines.splice(i, 1);
        }

        // Render Particles
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.alpha -= dt / p.life;

            if (p.alpha <= 0) {
                particles.splice(i, 1);
                continue;
            }

            ctx.save();
            ctx.globalAlpha = Math.max(0, p.alpha);
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // Render Floating Texts
        for (let i = floatingTexts.length - 1; i >= 0; i--) {
            const ft = floatingTexts[i];
            ft.y -= 35 * dt;
            ft.alpha -= dt / ft.life;

            if (ft.alpha <= 0) {
                floatingTexts.splice(i, 1);
                continue;
            }

            ctx.save();
            ctx.globalAlpha = Math.max(0, ft.alpha);
            ctx.font = `800 ${Math.floor(18 * ft.scale)}px Orbitron, sans-serif`;
            ctx.fillStyle = ft.color;
            ctx.shadowColor = ft.color;
            ctx.shadowBlur = 10;
            ctx.textAlign = 'center';
            ctx.fillText(ft.text, ft.x, ft.y);
            ctx.restore();
        }
    }

    let lastTimestamp = performance.now();
    function mainLoop(timestamp) {
        const dt = Math.min((timestamp - lastTimestamp) / 1000, 0.1);
        lastTimestamp = timestamp;

        render(dt);
        requestAnimationFrame(mainLoop);
    }

    // --- Event Listeners ---
    restartHeaderBtn.addEventListener('click', () => { audio.init(); resetGame(); });
    restartOverlayBtn.addEventListener('click', () => { audio.init(); resetGame(); });

    soundToggle.addEventListener('click', () => {
        const isMuted = audio.toggleMute();
        soundIcon.textContent = isMuted ? '🔇' : '🔊';
    });

    infoBtn.addEventListener('click', () => { infoOverlay.classList.remove('hidden'); });
    closeInfoBtn.addEventListener('click', () => { infoOverlay.classList.add('hidden'); });

    // Initialize Game
    initBoard();
    updateHUD();
    requestAnimationFrame(mainLoop);
});
