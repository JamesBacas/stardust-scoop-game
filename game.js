/* Game Engine - Stardust Scoop */
document.addEventListener('DOMContentLoaded', () => {
    // --- Skill Content Data ---
    const GAME_CONFIG = {
        title: "Stardust Scoop",
        target_score: 50,
        session_seconds: 60,
        starting_lives: 3,
        items: {
            good: [
                { id: "stardust", name: "Stardust", points: 1, emoji: "✨", rarity: "common", color: "#64ffda", size: 28 },
                { id: "comet", name: "Comet Fragment", points: 3, emoji: "☄️", rarity: "common", color: "#00b4d8", size: 30 },
                { id: "crystal", name: "Power Crystal", points: 5, emoji: "💎", rarity: "uncommon", color: "#bd5fff", size: 32 },
                { id: "satellite", name: "Satellite Part", points: 5, emoji: "🛰️", rarity: "uncommon", color: "#48cae4", size: 32 },
                { id: "nova", name: "Golden Nova", points: 15, emoji: "🌟", rarity: "rare", color: "#ffd166", size: 36 }
            ],
            bad: [
                { id: "junk", name: "Space Junk", points: -1, emoji: "🗑️", rarity: "common", color: "#8d99ae", size: 28 },
                { id: "asteroid", name: "Asteroid", points: -3, emoji: "🪨", rarity: "common", color: "#a0aab2", size: 32 },
                { id: "meteor", name: "Meteor", points: -5, emoji: "🔥", rarity: "uncommon", color: "#ef476f", size: 34 },
                { id: "blackhole", name: "Black Hole", points: -10, emoji: "🕳️", rarity: "rare", color: "#bd5fff", size: 38, deduct_life: true }
            ]
        },
        difficulty_curve: [
            { time_seconds: 0, fall_speed_multiplier: 1.0, spawn_rate_multiplier: 1.0 },
            { time_seconds: 15, fall_speed_multiplier: 1.25, spawn_rate_multiplier: 1.25 },
            { time_seconds: 30, fall_speed_multiplier: 1.55, spawn_rate_multiplier: 1.5 },
            { time_seconds: 45, fall_speed_multiplier: 1.9, spawn_rate_multiplier: 1.85 }
        ],
        messages: {
            win: "Mission complete! You scooped {score} points of cosmic energy across the galaxy. 🚀",
            lose: "Ship's shield collapsed... You collected {score} points. The cosmos awaits another run.",
            restart_button: "Launch Again"
        }
    };

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

        playCatch() {
            this.playTone(660, 'sine', 0.1, 0.15, 880);
        }

        playPowerup() {
            const notes = [523, 659, 784, 1046];
            notes.forEach((freq, idx) => {
                setTimeout(() => this.playTone(freq, 'triangle', 0.12, 0.15), idx * 60);
            });
        }

        playHit() {
            this.playTone(220, 'sawtooth', 0.25, 0.2, 80);
        }

        playGameOver() {
            const notes = [440, 349, 293, 220];
            notes.forEach((freq, idx) => {
                setTimeout(() => this.playTone(freq, 'sawtooth', 0.25, 0.2), idx * 120);
            });
        }

        playVictory() {
            const notes = [523, 659, 784, 1046, 1318];
            notes.forEach((freq, idx) => {
                setTimeout(() => this.playTone(freq, 'sine', 0.2, 0.2), idx * 80);
            });
        }
    }

    const audio = new SoundEngine();

    // --- Sound UI Handler ---
    const soundToggle = document.getElementById('soundToggle');
    const soundIcon = document.getElementById('soundIcon');
    soundToggle.addEventListener('click', () => {
        const isMuted = audio.toggleMute();
        soundIcon.textContent = isMuted ? '🔇' : '🔊';
    });

    // --- DOM Elements ---
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    const scoreValue = document.getElementById('scoreValue');
    const targetValue = document.getElementById('targetValue');
    const timerValue = document.getElementById('timerValue');
    const livesValue = document.getElementById('livesValue');
    const targetScoreDisplay = document.getElementById('targetScoreDisplay');

    const startOverlay = document.getElementById('startOverlay');
    const endOverlay = document.getElementById('endOverlay');
    const startBtn = document.getElementById('startBtn');
    const restartBtn = document.getElementById('restartBtn');

    const resultBadge = document.getElementById('resultBadge');
    const resultTitle = document.getElementById('resultTitle');
    const resultMsg = document.getElementById('resultMsg');
    const finalScore = document.getElementById('finalScore');
    const itemsCaughtDisplay = document.getElementById('itemsCaught');
    const bestScoreDisplay = document.getElementById('bestScore');

    targetValue.textContent = GAME_CONFIG.target_score;
    targetScoreDisplay.textContent = GAME_CONFIG.target_score;

    // --- Game State Vars ---
    let gameState = 'START'; // 'START', 'PLAYING', 'GAMEOVER', 'VICTORY'
    let score = 0;
    let lives = GAME_CONFIG.starting_lives;
    let timer = GAME_CONFIG.session_seconds;
    let itemsCaughtCount = 0;
    let bestScore = parseInt(localStorage.getItem('stardust_best_score') || '0', 10);

    let lastTime = 0;
    let spawnTimer = 0;
    let items = [];
    let particles = [];
    let floatingTexts = [];
    let keys = {};

    // Vessel / Paddle Object
    const paddle = {
        x: canvas.width / 2,
        y: canvas.height - 45,
        width: 120,
        height: 24,
        targetX: canvas.width / 2,
        speed: 650
    };

    // --- Input Controls ---

    // Mouse movement
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        paddle.targetX = (e.clientX - rect.left) * scaleX;
    });

    // Touch controls (Mobile Drag)
    const handleTouch = (e) => {
        if (e.touches.length > 0) {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            paddle.targetX = (e.touches[0].clientX - rect.left) * scaleX;
        }
    };
    canvas.addEventListener('touchstart', (e) => { audio.init(); handleTouch(e); e.preventDefault(); }, { passive: false });
    canvas.addEventListener('touchmove', (e) => { handleTouch(e); e.preventDefault(); }, { passive: false });

    // Keyboard movement
    window.addEventListener('keydown', (e) => {
        audio.init();
        keys[e.code] = true;
    });
    window.addEventListener('keyup', (e) => {
        keys[e.code] = false;
    });

    // --- Helper Functions ---

    function getDifficultyMultiplier(elapsedSeconds) {
        const curve = GAME_CONFIG.difficulty_curve;
        let currentStage = curve[0];
        for (let stage of curve) {
            if (elapsedSeconds >= stage.time_seconds) {
                currentStage = stage;
            }
        }
        return currentStage;
    }

    function getRandomItem(elapsedSeconds) {
        const isLate = elapsedSeconds > 25;
        // Roll for Good vs Bad (65% good, 35% bad)
        const isGood = Math.random() < 0.65;
        const pool = isGood ? GAME_CONFIG.items.good : GAME_CONFIG.items.bad;

        // Roll rarity: 60% common, 30% uncommon, 10% rare
        const rarityRoll = Math.random();
        let rarityFilter = 'common';
        if (rarityRoll > 0.90 && isLate) rarityFilter = 'rare';
        else if (rarityRoll > 0.60) rarityFilter = 'uncommon';

        const filtered = pool.filter(i => i.rarity === rarityFilter);
        const selected = filtered.length > 0 ? filtered[Math.floor(Math.random() * filtered.length)] : pool[0];

        const padding = 40;
        const spawnX = padding + Math.random() * (canvas.width - padding * 2);

        return {
            ...selected,
            x: spawnX,
            y: -30,
            velocityY: (140 + Math.random() * 60), // Base fall speed
            isGood: isGood
        };
    }

    function createExplosion(x, y, color, count = 12) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 50 + Math.random() * 150;
            particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color,
                radius: 2 + Math.random() * 4,
                alpha: 1,
                life: 0.4 + Math.random() * 0.4
            });
        }
    }

    function addFloatingText(text, x, y, color) {
        floatingTexts.push({
            text, x, y, color,
            alpha: 1,
            life: 0.8
        });
    }

    function updateHUD() {
        scoreValue.textContent = score;
        timerValue.textContent = `${Math.ceil(timer)}s`;
        
        let hearts = '';
        for (let i = 0; i < GAME_CONFIG.starting_lives; i++) {
            hearts += i < lives ? '❤️' : '🖤';
        }
        livesValue.textContent = hearts;
    }

    // --- Game Reset & Loop ---

    function resetGame() {
        score = 0;
        lives = GAME_CONFIG.starting_lives;
        timer = GAME_CONFIG.session_seconds;
        itemsCaughtCount = 0;
        items = [];
        particles = [];
        floatingTexts = [];
        paddle.x = canvas.width / 2;
        paddle.targetX = canvas.width / 2;

        gameState = 'PLAYING';
        updateHUD();
        endOverlay.classList.add('hidden');
        startOverlay.classList.add('hidden');

        lastTime = performance.now();
        requestAnimationFrame(gameLoop);
    }

    function triggerGameOver(isWin) {
        gameState = isWin ? 'VICTORY' : 'GAMEOVER';

        if (score > bestScore) {
            bestScore = score;
            localStorage.setItem('stardust_best_score', bestScore.toString());
        }

        if (isWin) {
            resultBadge.textContent = "MISSION ACCOMPLISHED";
            resultBadge.style.borderColor = "var(--accent-teal)";
            resultBadge.style.color = "var(--accent-teal)";
            resultTitle.textContent = "VICTORY! 🚀";
            resultMsg.textContent = GAME_CONFIG.messages.win.replace('{score}', score);
            audio.playVictory();
        } else {
            resultBadge.textContent = "SHIELD COLLAPSED";
            resultBadge.style.borderColor = "var(--accent-red)";
            resultBadge.style.color = "var(--accent-red)";
            resultTitle.textContent = "GAME OVER";
            resultMsg.textContent = GAME_CONFIG.messages.lose.replace('{score}', score);
            audio.playGameOver();
        }

        finalScore.textContent = score;
        itemsCaughtDisplay.textContent = itemsCaughtCount;
        bestScoreDisplay.textContent = bestScore;

        endOverlay.classList.remove('hidden');
    }

    function update(dt) {
        if (gameState !== 'PLAYING') return;

        // Timer Update
        timer -= dt;
        if (timer <= 0) {
            timer = 0;
            updateHUD();
            if (score >= GAME_CONFIG.target_score) {
                triggerGameOver(true);
            } else {
                triggerGameOver(false);
            }
            return;
        }
        updateHUD();

        // Keyboard Movement Update
        if (keys['ArrowLeft'] || keys['KeyA']) {
            paddle.targetX -= paddle.speed * dt;
        }
        if (keys['ArrowRight'] || keys['KeyD']) {
            paddle.targetX += paddle.speed * dt;
        }

        // Clamp targetX within screen bounds
        paddle.targetX = Math.max(paddle.width / 2, Math.min(canvas.width - paddle.width / 2, paddle.targetX));

        // Smooth vessel position interpolation
        paddle.x += (paddle.targetX - paddle.x) * 0.25;

        // Spawning Logic
        const elapsed = GAME_CONFIG.session_seconds - timer;
        const diff = getDifficultyMultiplier(elapsed);

        spawnTimer += dt;
        const currentSpawnInterval = 0.95 / diff.spawn_rate_multiplier;
        if (spawnTimer >= currentSpawnInterval) {
            spawnTimer = 0;
            items.push(getRandomItem(elapsed));
        }

        // Update Items & Collision Checking
        for (let i = items.length - 1; i >= 0; i--) {
            const item = items[i];
            item.y += item.velocityY * diff.fall_speed_multiplier * dt;

            // Collision with Paddle
            const paddleTop = paddle.y - paddle.height / 2;
            const paddleBottom = paddle.y + paddle.height / 2;
            const paddleLeft = paddle.x - paddle.width / 2;
            const paddleRight = paddle.x + paddle.width / 2;

            if (
                item.y + item.size / 2 >= paddleTop &&
                item.y - item.size / 2 <= paddleBottom &&
                item.x + item.size / 2 >= paddleLeft &&
                item.x - item.size / 2 <= paddleRight
            ) {
                // Catch Event!
                itemsCaughtCount++;
                score += item.points;

                if (item.isGood) {
                    if (item.points >= 5) audio.playPowerup();
                    else audio.playCatch();
                    addFloatingText(`+${item.points}`, item.x, item.y, item.color);
                    createExplosion(item.x, item.y, item.color, 16);
                } else {
                    audio.playHit();
                    addFloatingText(`${item.points}`, item.x, item.y, '#ef476f');
                    createExplosion(item.x, item.y, '#ef476f', 16);

                    if (item.deduct_life) {
                        lives--;
                        if (lives <= 0) {
                            lives = 0;
                            updateHUD();
                            items.splice(i, 1);
                            triggerGameOver(false);
                            return;
                        }
                    }
                }

                // Check instant target win condition
                if (score >= GAME_CONFIG.target_score && lives > 0) {
                    items.splice(i, 1);
                    triggerGameOver(true);
                    return;
                }

                items.splice(i, 1);
                continue;
            }

            // Remove items that fell off bottom
            if (item.y > canvas.height + 40) {
                items.splice(i, 1);
            }
        }

        // Update Particles
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.alpha -= dt / p.life;
            if (p.alpha <= 0) {
                particles.splice(i, 1);
            }
        }

        // Update Floating Text
        for (let i = floatingTexts.length - 1; i >= 0; i--) {
            const ft = floatingTexts[i];
            ft.y -= 40 * dt;
            ft.alpha -= dt / ft.life;
            if (ft.alpha <= 0) {
                floatingTexts.splice(i, 1);
            }
        }
    }

    function render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw Canvas Grid / Cosmic Glow
        ctx.strokeStyle = 'rgba(100, 255, 218, 0.04)';
        ctx.lineWidth = 1;
        for (let x = 0; x < canvas.width; x += 40) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }

        // Draw Paddle Vessel
        const px = paddle.x;
        const py = paddle.y;
        const pw = paddle.width;
        const ph = paddle.height;

        // Thruster glow
        ctx.save();
        const glowGradient = ctx.createRadialGradient(px, py + ph, 5, px, py + ph + 15, 30);
        glowGradient.addColorStop(0, 'rgba(100, 255, 218, 0.8)');
        glowGradient.addColorStop(1, 'rgba(100, 255, 218, 0)');
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(px, py + ph + 5, 25, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Ship / Basket Body
        ctx.save();
        ctx.shadowColor = '#64ffda';
        ctx.shadowBlur = 12;
        const vesselGrad = ctx.createLinearGradient(px - pw / 2, py, px + pw / 2, py);
        vesselGrad.addColorStop(0, '#00b4d8');
        vesselGrad.addColorStop(0.5, '#64ffda');
        vesselGrad.addColorStop(1, '#00b4d8');

        ctx.fillStyle = vesselGrad;
        ctx.beginPath();
        ctx.roundRect(px - pw / 2, py - ph / 2, pw, ph, [12, 12, 4, 4]);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Inner catcher beam
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(px - pw / 3, py - ph / 4, pw * 0.66, 3);
        ctx.restore();

        // Draw Falling Items
        ctx.font = '28px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        for (let item of items) {
            ctx.save();
            // Glow aura around items
            ctx.shadowColor = item.color;
            ctx.shadowBlur = 10;
            ctx.fillText(item.emoji, item.x, item.y);
            ctx.restore();
        }

        // Draw Particles
        for (let p of particles) {
            ctx.save();
            ctx.globalAlpha = Math.max(0, p.alpha);
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // Draw Floating Text (+1, +5, etc.)
        for (let ft of floatingTexts) {
            ctx.save();
            ctx.globalAlpha = Math.max(0, ft.alpha);
            ctx.font = '700 20px Orbitron, sans-serif';
            ctx.fillStyle = ft.color;
            ctx.shadowColor = ft.color;
            ctx.shadowBlur = 8;
            ctx.fillText(ft.text, ft.x, ft.y);
            ctx.restore();
        }
    }

    function gameLoop(timestamp) {
        const dt = Math.min((timestamp - lastTime) / 1000, 0.1);
        lastTime = timestamp;

        update(dt);
        render();

        if (gameState === 'PLAYING') {
            requestAnimationFrame(gameLoop);
        }
    }

    // --- Button Listeners ---
    startBtn.addEventListener('click', () => {
        audio.init();
        resetGame();
    });

    restartBtn.addEventListener('click', () => {
        audio.init();
        resetGame();
    });
});
