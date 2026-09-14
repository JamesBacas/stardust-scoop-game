/* Modern Arcade Engine - Stardust Scoop & Multi-Theme Skill Arcade */
document.addEventListener('DOMContentLoaded', () => {
    // --- Named Game Constants ---
    const DEFAULT_TARGET_SCORE = 50;
    const DEFAULT_SESSION_SECONDS = 60;
    const DEFAULT_STARTING_LIVES = 3;

    const PADDLE_WIDTH = 120;
    const PADDLE_HEIGHT = 24;
    const POWERUP_SPAWN_CHANCE = 0.10;
    const GOOD_ITEM_SPAWN_CHANCE = 0.65;
    const RARE_RARITY_THRESHOLD = 0.88;
    const UNCOMMON_RARITY_THRESHOLD = 0.58;

    const TWO_STAR_SCORE_THRESHOLD = 80;
    const THREE_STAR_SCORE_THRESHOLD = 120;

    const MYSTERY_JACKPOT_CHANCE = 0.5;
    const MYSTERY_JACKPOT_POINTS = 20;

    const DEFAULT_DIFFICULTY_CURVE = [
        { time_seconds: 0, fall_speed_multiplier: 1.0, spawn_rate_multiplier: 1.0 },
        { time_seconds: 15, fall_speed_multiplier: 1.25, spawn_rate_multiplier: 1.25 },
        { time_seconds: 30, fall_speed_multiplier: 1.55, spawn_rate_multiplier: 1.5 },
        { time_seconds: 45, fall_speed_multiplier: 1.9, spawn_rate_multiplier: 1.85 }
    ];

    // --- Predefined Skill Themes ---
    const THEMES = {
        candy: {
            title: "🍬 CANDY CRUSH",
            target_score: DEFAULT_TARGET_SCORE,
            session_seconds: DEFAULT_SESSION_SECONDS,
            starting_lives: DEFAULT_STARTING_LIVES,
            items: {
                good: [
                    { id: "grape", name: "Juicy Grape", points: 1, emoji: "🍇", rarity: "common", color: "#bd5fff", size: 28 },
                    { id: "strawberry", name: "Ripe Strawberry", points: 3, emoji: "🍓", rarity: "common", color: "#ff4d4d", size: 30 },
                    { id: "gummy", name: "Gummy Bear", points: 5, emoji: "🧸", rarity: "uncommon", color: "#70d6ff", size: 32 },
                    { id: "orange", name: "Orange Slice", points: 5, emoji: "🍊", rarity: "uncommon", color: "#ff9770", size: 32 },
                    { id: "candy", name: "Magic Candy", points: 15, emoji: "🍬", rarity: "rare", color: "#ff70a6", size: 36 }
                ],
                bad: [
                    { id: "chili", name: "Spicy Chili", points: -1, emoji: "🌶️", rarity: "common", color: "#ff4d4d", size: 28 },
                    { id: "trash", name: "Apple Core", points: -3, emoji: "🍏", rarity: "common", color: "#a8db10", size: 32 },
                    { id: "slime", name: "Toxic Slime", points: -5, emoji: "🧪", rarity: "uncommon", color: "#39ff14", size: 34 },
                    { id: "bomb", name: "Candy Bomb", points: -10, emoji: "💣", rarity: "rare", color: "#2b2b2b", size: 38, deduct_life: true }
                ],
                powerups: [
                    { id: "magnet", name: "Candy Magnet", type: "magnet", emoji: "🧲", rarity: "uncommon", color: "#ff0054", size: 34 },
                    { id: "chrono", name: "Sugar Slow-Mo", type: "chrono", emoji: "⏳", rarity: "uncommon", color: "#00f5d4", size: 34 },
                    { id: "shield", name: "Jelly Shield", type: "shield", emoji: "🛡️", rarity: "rare", color: "#70d6ff", size: 34 },
                    { id: "mystery", name: "Mystery Box", type: "mystery", emoji: "❓", rarity: "rare", color: "#ffd166", size: 36 }
                ]
            },
            difficulty_curve: DEFAULT_DIFFICULTY_CURVE,
            messages: {
                win: "Sugar Rush Victory! You collected {score} points of juicy candies. 🍬",
                lose: "Tummy ache overload... You collected {score} points. Try again!",
                restart_button: "Play Again"
            }
        },

        space: {
            title: "✨ STARDUST SCOOP",
            target_score: DEFAULT_TARGET_SCORE,
            session_seconds: DEFAULT_SESSION_SECONDS,
            starting_lives: DEFAULT_STARTING_LIVES,
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
                ],
                powerups: [
                    { id: "magnet", name: "Magnet", type: "magnet", emoji: "🧲", rarity: "uncommon", color: "#ff0054", size: 34 },
                    { id: "chrono", name: "Chrono Warp", type: "chrono", emoji: "⏳", rarity: "uncommon", color: "#00f5d4", size: 34 },
                    { id: "shield", name: "Energy Shield", type: "shield", emoji: "🛡️", rarity: "rare", color: "#70d6ff", size: 34 },
                    { id: "mystery", name: "Mystery Crate", type: "mystery", emoji: "❓", rarity: "rare", color: "#ffd166", size: 36 }
                ]
            },
            difficulty_curve: DEFAULT_DIFFICULTY_CURVE,
            messages: {
                win: "Mission complete! You scooped {score} points of cosmic energy across the galaxy. 🚀",
                lose: "Ship's shield collapsed... You collected {score} points. The cosmos awaits another run.",
                restart_button: "Launch Again"
            }
        },

        ocean: {
            title: "🌊 OCEAN DIVER",
            target_score: DEFAULT_TARGET_SCORE,
            session_seconds: DEFAULT_SESSION_SECONDS,
            starting_lives: DEFAULT_STARTING_LIVES,
            items: {
                good: [
                    { id: "shell", name: "Sea Shell", points: 1, emoji: "🐚", rarity: "common", color: "#e0fbfc", size: 28 },
                    { id: "pearl", name: "Shining Pearl", points: 3, emoji: "🦪", rarity: "common", color: "#98c1d9", size: 30 },
                    { id: "trident", name: "Golden Trident", points: 5, emoji: "🔱", rarity: "uncommon", color: "#ffd166", size: 32 },
                    { id: "gem", name: "Ocean Emerald", points: 5, emoji: "💎", rarity: "uncommon", color: "#06d6a0", size: 32 },
                    { id: "chest", name: "Treasure Chest", points: 15, emoji: "🪙", rarity: "rare", color: "#ffb703", size: 36 }
                ],
                bad: [
                    { id: "urchin", name: "Sea Urchin", points: -1, emoji: "🦔", rarity: "common", color: "#3d5a80", size: 28 },
                    { id: "jellyfish", name: "Electric Jelly", points: -3, emoji: "🪼", rarity: "common", color: "#ff006e", size: 32 },
                    { id: "shark", name: "Great Shark", points: -5, emoji: "🦈", rarity: "uncommon", color: "#293241", size: 34 },
                    { id: "seamine", name: "Deep Sea Mine", points: -10, emoji: "💥", rarity: "rare", color: "#d90429", size: 38, deduct_life: true }
                ],
                powerups: [
                    { id: "magnet", name: "Pearl Magnet", type: "magnet", emoji: "🧲", rarity: "uncommon", color: "#ff0054", size: 34 },
                    { id: "chrono", name: "Ocean Drift", type: "chrono", emoji: "⏳", rarity: "uncommon", color: "#00f5d4", size: 34 },
                    { id: "shield", name: "Sub Bubble", type: "shield", emoji: "🛡️", rarity: "rare", color: "#70d6ff", size: 34 },
                    { id: "mystery", name: "Mystery Chest", type: "mystery", emoji: "❓", rarity: "rare", color: "#ffd166", size: 36 }
                ]
            },
            difficulty_curve: DEFAULT_DIFFICULTY_CURVE,
            messages: {
                win: "Ocean Master! You retrieved {score} points of sunken treasure. 🌊",
                lose: "Lost in the deep trenches... You scored {score} points. Dive again!",
                restart_button: "Dive Again"
            }
        }
    };

    let activeThemeKey = 'candy';
    let currentConfig = THEMES[activeThemeKey];

    // --- Web Audio Synthesizer with Pitch-Scaling Harmony ---
    class SoundEngine {
        constructor() {
            this.ctx = null;
            this.muted = false;
            this.scaleNotes = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25];
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

        playCatch(streak = 0) {
            const noteIdx = streak % this.scaleNotes.length;
            const freq = this.scaleNotes[noteIdx];
            this.playTone(freq, 'sine', 0.1, 0.18, freq * 1.2);
        }
        
        playCombo(multiplier) {
            const baseFreq = 523 * (1 + multiplier * 0.15);
            this.playTone(baseFreq, 'triangle', 0.14, 0.18, baseFreq * 1.5);
        }

        playFeverSound() {
            const notes = [659, 784, 987, 1318];
            notes.forEach((freq, idx) => {
                setTimeout(() => this.playTone(freq, 'sine', 0.15, 0.2), idx * 60);
            });
        }

        playPowerup() {
            const notes = [523, 659, 784, 1046];
            notes.forEach((freq, idx) => {
                setTimeout(() => this.playTone(freq, 'triangle', 0.12, 0.15), idx * 50);
            });
        }

        playSurge() {
            this.playTone(440, 'sawtooth', 0.3, 0.25, 880);
        }

        playHit() { this.playTone(200, 'sawtooth', 0.22, 0.2, 70); }
        playShieldAbsorb() { this.playTone(880, 'sine', 0.2, 0.18, 440); }

        playGameOver() {
            const notes = [440, 349, 293, 220];
            notes.forEach((freq, idx) => {
                setTimeout(() => this.playTone(freq, 'sawtooth', 0.25, 0.2), idx * 110);
            });
        }

        playVictory() {
            const notes = [523, 659, 784, 1046, 1318];
            notes.forEach((freq, idx) => {
                setTimeout(() => this.playTone(freq, 'sine', 0.2, 0.2), idx * 75);
            });
        }
    }

    const audio = new SoundEngine();

    // --- DOM Elements ---
    const themeBgLayer = document.getElementById('themeBgLayer');
    const canvasContainer = document.getElementById('canvasContainer');
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    const headerHomeBtn = document.getElementById('headerHomeBtn');
    const themeSelect = document.getElementById('themeSelect');
    const gameTitleDisplay = document.getElementById('gameTitleDisplay');
    const soundToggle = document.getElementById('soundToggle');
    const soundIcon = document.getElementById('soundIcon');
    const pauseBtn = document.getElementById('pauseBtn');
    const infoBtn = document.getElementById('infoBtn');

    const scoreValue = document.getElementById('scoreValue');
    const targetValue = document.getElementById('targetValue');
    const timerValue = document.getElementById('timerValue');
    const livesValue = document.getElementById('livesValue');
    const progressFill = document.getElementById('progressFill');

    const comboBadge = document.getElementById('comboBadge');
    const feverBadge = document.getElementById('feverBadge');
    const hazardWarning = document.getElementById('hazardWarning');
    const surgeWarning = document.getElementById('surgeWarning');

    const magnetTag = document.getElementById('magnetTag');
    const chronoTag = document.getElementById('chronoTag');
    const shieldTag = document.getElementById('shieldTag');

    const homeOverlay = document.getElementById('homeOverlay');
    const homeBestScore = document.getElementById('homeBestScore');
    const homeStartBtn = document.getElementById('homeStartBtn');
    const realmCards = document.querySelectorAll('.realm-card');

    const startOverlay = document.getElementById('startOverlay');
    const startBackHomeBtn = document.getElementById('startBackHomeBtn');
    const pauseOverlay = document.getElementById('pauseOverlay');
    const pauseHomeBtn = document.getElementById('pauseHomeBtn');
    const resumeBtn = document.getElementById('resumeBtn');
    const infoOverlay = document.getElementById('infoOverlay');
    const closeInfoBtn = document.getElementById('closeInfoBtn');
    const endOverlay = document.getElementById('endOverlay');
    const endHomeBtn = document.getElementById('endHomeBtn');
    const startBtn = document.getElementById('startBtn');
    const restartBtn = document.getElementById('restartBtn');

    const startTitle = document.getElementById('startTitle');
    const legendGrid = document.getElementById('legendGrid');

    const star1 = document.getElementById('star1');
    const star2 = document.getElementById('star2');
    const star3 = document.getElementById('star3');

    const resultTitle = document.getElementById('resultTitle');
    const resultMsg = document.getElementById('resultMsg');
    const finalScore = document.getElementById('finalScore');
    const maxComboDisplay = document.getElementById('maxCombo');
    const bestScoreDisplay = document.getElementById('bestScore');

    let bestScore = parseInt(localStorage.getItem('stardust_best_score') || '0', 10);
    homeBestScore.textContent = bestScore;

    // --- Navigation & Menu Handlers ---
    function openHomeHub() {
        gameState = 'START';
        audio.init();
        homeBestScore.textContent = bestScore;
        homeOverlay.classList.remove('hidden');
        startOverlay.classList.add('hidden');
        pauseOverlay.classList.add('hidden');
        endOverlay.classList.add('hidden');
        infoOverlay.classList.add('hidden');
    }

    function togglePause() {
        if (gameState === 'PLAYING') {
            gameState = 'PAUSED';
            pauseOverlay.classList.remove('hidden');
        } else if (gameState === 'PAUSED') {
            gameState = 'PLAYING';
            pauseOverlay.classList.add('hidden');
            lastTime = performance.now();
            requestAnimationFrame(gameLoop);
        }
    }

    // Consolidated Home Navigation Event Listeners
    [headerHomeBtn, startBackHomeBtn, pauseHomeBtn, endHomeBtn].forEach(btn => {
        if (btn) btn.addEventListener('click', openHomeHub);
    });

    pauseBtn.addEventListener('click', togglePause);
    resumeBtn.addEventListener('click', togglePause);

    // Realm Cards Click Selection
    realmCards.forEach(card => {
        card.addEventListener('click', () => {
            realmCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            activeThemeKey = card.dataset.theme;
            themeSelect.value = activeThemeKey;
            currentConfig = THEMES[activeThemeKey];
            updateThemeUI();
        });
    });

    homeStartBtn.addEventListener('click', () => {
        homeOverlay.classList.add('hidden');
        startOverlay.classList.remove('hidden');
    });

    soundToggle.addEventListener('click', () => {
        const isMuted = audio.toggleMute();
        soundIcon.textContent = isMuted ? '🔇' : '🔊';
    });

    infoBtn.addEventListener('click', () => { infoOverlay.classList.remove('hidden'); });
    closeInfoBtn.addEventListener('click', () => { infoOverlay.classList.add('hidden'); });

    themeSelect.value = activeThemeKey;
    themeSelect.addEventListener('change', (e) => {
        activeThemeKey = e.target.value;
        currentConfig = THEMES[activeThemeKey];

        realmCards.forEach(card => {
            card.classList.toggle('active', card.dataset.theme === activeThemeKey);
        });

        updateThemeUI();
        if (gameState === 'PLAYING') resetGame();
    });

    function updateThemeUI() {
        gameTitleDisplay.textContent = currentConfig.title;
        targetValue.textContent = currentConfig.target_score;
        startTitle.textContent = currentConfig.title;

        themeBgLayer.className = `theme-bg-layer theme-${activeThemeKey}`;

        legendGrid.innerHTML = '';
        const allItems = [...currentConfig.items.good, ...currentConfig.items.bad];
        allItems.forEach(item => {
            const isGood = item.points > 0;
            const div = document.createElement('div');
            div.className = `legend-item ${isGood ? '' : 'bad'}`;
            div.innerHTML = `<span class="legend-emoji">${item.emoji}</span> ${item.name} (${isGood ? '+' : ''}${item.points})`;
            legendGrid.appendChild(div);
        });
    }

    // --- Game State Vars ---
    let gameState = 'START';
    let score = 0;
    let lives = DEFAULT_STARTING_LIVES;
    let timer = DEFAULT_SESSION_SECONDS;
    let comboStreak = 0;
    let maxComboStreak = 0;
    let isFeverMode = false;
    let isSurgeActive = false;

    let powerupState = {
        magnetTimer: 0,
        chronoTimer: 0,
        hasShield: false
    };

    let lastTime = 0;
    let spawnTimer = 0;
    let items = [];
    let particles = [];
    let thrusterParticles = [];
    let floatingTexts = [];
    let keys = {};

    const paddle = {
        x: canvas.width / 2,
        y: canvas.height - 45,
        width: PADDLE_WIDTH,
        height: PADDLE_HEIGHT,
        targetX: canvas.width / 2,
        speed: 700,
        tilt: 0,
        scaleY: 1.0
    };

    // --- Input Handlers ---
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        paddle.targetX = (e.clientX - rect.left) * scaleX;
    });

    const handleTouch = (e) => {
        if (e.touches.length > 0) {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            paddle.targetX = (e.touches[0].clientX - rect.left) * scaleX;
        }
    };
    canvas.addEventListener('touchstart', (e) => { audio.init(); handleTouch(e); e.preventDefault(); }, { passive: false });
    canvas.addEventListener('touchmove', (e) => { handleTouch(e); e.preventDefault(); }, { passive: false });

    window.addEventListener('keydown', (e) => {
        audio.init();
        keys[e.code] = true;
        if (e.code === 'KeyP' || e.code === 'Escape') togglePause();
    });
    window.addEventListener('keyup', (e) => { keys[e.code] = false; });

    // --- Helpers ---
    function triggerScreenShake() {
        canvasContainer.classList.remove('shake');
        void canvasContainer.offsetWidth;
        canvasContainer.classList.add('shake');
    }

    function triggerHazardWarning() {
        hazardWarning.classList.remove('hidden');
        setTimeout(() => hazardWarning.classList.add('hidden'), 1000);
    }

    function triggerSurgeWarning() {
        isSurgeActive = true;
        audio.playSurge();
        surgeWarning.classList.remove('hidden');
        setTimeout(() => {
            surgeWarning.classList.add('hidden');
            isSurgeActive = false;
        }, 4000);
    }

    function getDifficultyMultiplier(elapsedSeconds) {
        const curve = currentConfig.difficulty_curve;
        let currentStage = curve[0];
        for (let stage of curve) {
            if (elapsedSeconds >= stage.time_seconds) {
                currentStage = stage;
            }
        }
        return currentStage;
    }

    function getRandomItem(elapsedSeconds) {
        if (Math.random() < POWERUP_SPAWN_CHANCE) {
            const puPool = currentConfig.items.powerups;
            const selectedPu = puPool[Math.floor(Math.random() * puPool.length)];
            return {
                ...selectedPu,
                x: 40 + Math.random() * (canvas.width - 80),
                y: -30,
                velocityY: 140,
                isPowerup: true
            };
        }

        const isGood = Math.random() < GOOD_ITEM_SPAWN_CHANCE;
        const pool = isGood ? currentConfig.items.good : currentConfig.items.bad;

        const rarityRoll = Math.random();
        let rarityFilter = 'common';
        if (rarityRoll > RARE_RARITY_THRESHOLD && elapsedSeconds > 20) rarityFilter = 'rare';
        else if (rarityRoll > UNCOMMON_RARITY_THRESHOLD) rarityFilter = 'uncommon';

        const filtered = pool.filter(i => i.rarity === rarityFilter);
        const selected = filtered.length > 0 ? filtered[Math.floor(Math.random() * filtered.length)] : pool[0];

        if (selected.deduct_life) {
            triggerHazardWarning();
        }

        return {
            ...selected,
            x: 40 + Math.random() * (canvas.width - 80),
            y: -30,
            velocityY: 140 + Math.random() * 60,
            isGood: isGood,
            isPowerup: false
        };
    }

    function createExplosion(x, y, color, count = 16) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 60 + Math.random() * 160;
            particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color,
                radius: 2 + Math.random() * 4,
                alpha: 1,
                life: 0.35 + Math.random() * 0.35
            });
        }
    }

    function addFloatingText(text, x, y, color, scale = 1.0) {
        floatingTexts.push({
            text, x, y, color, scale,
            alpha: 1,
            life: 0.85
        });
    }

    function updateHUD() {
        scoreValue.textContent = score;
        timerValue.textContent = `${Math.ceil(timer)}s`;
        
        const fillPct = Math.min(100, Math.max(0, (score / currentConfig.target_score) * 100));
        progressFill.style.width = `${fillPct}%`;

        let hearts = '';
        for (let i = 0; i < currentConfig.starting_lives; i++) {
            hearts += i < lives ? '❤️' : '🖤';
        }
        livesValue.textContent = hearts;

        const newFeverState = (comboStreak >= 5 || score >= 25);
        if (newFeverState && !isFeverMode) {
            audio.playFeverSound();
            addFloatingText("⚡ FEVER TIME (2x POINTS!)", canvas.width / 2, 80, "#ffd166", 1.4);
        }
        isFeverMode = newFeverState;
        feverBadge.classList.toggle('hidden', !isFeverMode);

        const comboMult = Math.min(5, 1 + Math.floor(comboStreak / 3));
        comboBadge.textContent = `🔥 x${comboMult}`;

        magnetTag.classList.toggle('hidden', powerupState.magnetTimer <= 0);
        chronoTag.classList.toggle('hidden', powerupState.chronoTimer <= 0);
        shieldTag.classList.toggle('hidden', !powerupState.hasShield);
    }

    function resetGame() {
        score = 0;
        lives = currentConfig.starting_lives;
        timer = currentConfig.session_seconds;
        comboStreak = 0;
        maxComboStreak = 0;
        isFeverMode = false;
        isSurgeActive = false;

        powerupState.magnetTimer = 0;
        powerupState.chronoTimer = 0;
        powerupState.hasShield = false;

        items = [];
        particles = [];
        thrusterParticles = [];
        floatingTexts = [];

        paddle.x = canvas.width / 2;
        paddle.targetX = canvas.width / 2;

        gameState = 'PLAYING';
        updateHUD();
        homeOverlay.classList.add('hidden');
        pauseOverlay.classList.add('hidden');
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

        // Calculate Star Rating using Named Threshold Constants
        let starsCount = 0;
        if (score >= currentConfig.target_score) starsCount = 1;
        if (score >= TWO_STAR_SCORE_THRESHOLD) starsCount = 2;
        if (score >= THREE_STAR_SCORE_THRESHOLD) starsCount = 3;

        star1.classList.toggle('active', starsCount >= 1);
        star2.classList.toggle('active', starsCount >= 2);
        star3.classList.toggle('active', starsCount >= 3);

        const resultBadge = document.getElementById('resultBadge');
        if (isWin) {
            resultBadge.textContent = "LEVEL COMPLETE";
            resultBadge.style.borderColor = "var(--accent-teal)";
            resultBadge.style.color = "var(--accent-teal)";
            resultTitle.textContent = "VICTORY! 🎉";
            resultMsg.textContent = currentConfig.messages.win.replace('{score}', score);
            audio.playVictory();
        } else {
            resultBadge.textContent = "TRY AGAIN";
            resultBadge.style.borderColor = "var(--accent-red)";
            resultBadge.style.color = "var(--accent-red)";
            resultTitle.textContent = "GAME OVER";
            resultMsg.textContent = currentConfig.messages.lose.replace('{score}', score);
            audio.playGameOver();
        }

        finalScore.textContent = score;
        maxComboDisplay.textContent = `x${Math.min(5, 1 + Math.floor(maxComboStreak / 3))}`;
        bestScoreDisplay.textContent = bestScore;

        endOverlay.classList.remove('hidden');
    }

    function update(dt) {
        if (gameState !== 'PLAYING') return;

        const prevTimer = Math.ceil(timer);
        timer -= dt;
        const curTimer = Math.ceil(timer);

        if ((prevTimer > 30 && curTimer <= 30) || (prevTimer > 15 && curTimer <= 15)) {
            triggerSurgeWarning();
        }

        if (timer <= 0) {
            timer = 0;
            updateHUD();
            triggerGameOver(score >= currentConfig.target_score);
            return;
        }

        if (powerupState.magnetTimer > 0) powerupState.magnetTimer -= dt;
        if (powerupState.chronoTimer > 0) powerupState.chronoTimer -= dt;

        updateHUD();

        if (keys['ArrowLeft'] || keys['KeyA']) paddle.targetX -= paddle.speed * dt;
        if (keys['ArrowRight'] || keys['KeyD']) paddle.targetX += paddle.speed * dt;

        paddle.targetX = Math.max(paddle.width / 2, Math.min(canvas.width - paddle.width / 2, paddle.targetX));

        const dx = paddle.targetX - paddle.x;
        paddle.tilt = dx * 0.08;
        paddle.x += dx * 0.25;

        if (themeBgLayer) {
            const shiftX = (paddle.x - canvas.width / 2) * -0.05;
            themeBgLayer.style.transform = `translateX(${shiftX}px)`;
        }

        paddle.scaleY += (1.0 - paddle.scaleY) * 0.15;

        if (Math.random() < 0.8) {
            thrusterParticles.push({
                x: paddle.x + (Math.random() * 20 - 10),
                y: paddle.y + paddle.height / 2,
                vx: -paddle.tilt * 0.5 + (Math.random() * 20 - 10),
                vy: 60 + Math.random() * 80,
                color: activeThemeKey === 'candy' ? '#ff70a6' : '#64ffda',
                radius: 2 + Math.random() * 3,
                alpha: 1,
                life: 0.3
            });
        }

        const elapsed = currentConfig.session_seconds - timer;
        const diff = getDifficultyMultiplier(elapsed);

        spawnTimer += dt;
        const speedScale = powerupState.chronoTimer > 0 ? 0.5 : (isSurgeActive ? 1.8 : 1.0);
        const currentSpawnInterval = (0.9 / diff.spawn_rate_multiplier) / (isSurgeActive ? 2.5 : 1.0);

        if (spawnTimer >= currentSpawnInterval) {
            spawnTimer = 0;
            items.push(getRandomItem(elapsed));
        }

        for (let i = items.length - 1; i >= 0; i--) {
            const item = items[i];

            if (powerupState.magnetTimer > 0 && (item.isGood || item.isPowerup)) {
                const magDx = paddle.x - item.x;
                item.x += magDx * 4.5 * dt;
            }

            item.y += item.velocityY * diff.fall_speed_multiplier * speedScale * dt;

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
                paddle.scaleY = 0.75;

                if (item.isPowerup) {
                    audio.playPowerup();
                    if (item.type === 'magnet') {
                        powerupState.magnetTimer = 6;
                        addFloatingText("🧲 MAGNET ACTIVE!", item.x, item.y, "#ff0054", 1.2);
                    } else if (item.type === 'chrono') {
                        powerupState.chronoTimer = 6;
                        addFloatingText("⏳ SUGAR SLOW-MO!", item.x, item.y, "#00f5d4", 1.2);
                    } else if (item.type === 'shield') {
                        powerupState.hasShield = true;
                        addFloatingText("🛡️ SHIELD ACTIVE!", item.x, item.y, "#70d6ff", 1.2);
                    } else if (item.type === 'mystery') {
                        if (Math.random() < MYSTERY_JACKPOT_CHANCE) {
                            score += MYSTERY_JACKPOT_POINTS;
                            audio.playPowerup();
                            addFloatingText(`❓ MYSTERY JACKPOT! +${MYSTERY_JACKPOT_POINTS}`, item.x, item.y, "#ffd166", 1.35);
                            createExplosion(item.x, item.y, "#ffd166", 24);
                        } else {
                            audio.playHit();
                            triggerScreenShake();
                            addFloatingText("❓ MYSTERY BOMB! -1 LIFE", item.x, item.y, "#ef476f", 1.35);
                            createExplosion(item.x, item.y, "#ef476f", 24);
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
                    items.splice(i, 1);
                    continue;
                }

                if (item.isGood) {
                    comboStreak++;
                    if (comboStreak > maxComboStreak) maxComboStreak = comboStreak;

                    const comboMult = Math.min(5, 1 + Math.floor(comboStreak / 3));
                    const feverMult = isFeverMode ? 2 : 1;
                    const pointsGained = item.points * comboMult * feverMult;
                    score += pointsGained;

                    audio.playCatch(comboStreak);

                    if (comboMult > 1 || isFeverMode) {
                        addFloatingText(`+${pointsGained} (COMBO x${comboMult}${isFeverMode ? ' ⚡FEVER' : ''})`, item.x, item.y, item.color, 1.2);
                    } else {
                        addFloatingText(`+${pointsGained}`, item.x, item.y, item.color);
                    }
                    createExplosion(item.x, item.y, item.color, 16);
                } else {
                    comboStreak = 0;

                    if (powerupState.hasShield) {
                        powerupState.hasShield = false;
                        audio.playShieldAbsorb();
                        addFloatingText("🛡️ SHIELD ABSORBED HIT!", item.x, item.y, "#74c69d", 1.1);
                        createExplosion(item.x, item.y, "#74c69d", 18);
                        items.splice(i, 1);
                        continue;
                    }

                    audio.playHit();
                    triggerScreenShake();
                    addFloatingText(`${item.points}`, item.x, item.y, '#ef476f');
                    createExplosion(item.x, item.y, '#ef476f', 18);

                    score = Math.max(0, score + item.points);

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

                if (score >= THREE_STAR_SCORE_THRESHOLD && lives > 0) {
                    items.splice(i, 1);
                    triggerGameOver(true);
                    return;
                }

                items.splice(i, 1);
                continue;
            }

            if (item.y > canvas.height + 40) {
                if (item.isGood) comboStreak = 0;
                items.splice(i, 1);
            }
        }

        for (let i = thrusterParticles.length - 1; i >= 0; i--) {
            const tp = thrusterParticles[i];
            tp.x += tp.vx * dt;
            tp.y += tp.vy * dt;
            tp.alpha -= dt / tp.life;
            if (tp.alpha <= 0) thrusterParticles.splice(i, 1);
        }

        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.alpha -= dt / p.life;
            if (p.alpha <= 0) particles.splice(i, 1);
        }

        for (let i = floatingTexts.length - 1; i >= 0; i--) {
            const ft = floatingTexts[i];
            ft.y -= 45 * dt;
            ft.alpha -= dt / ft.life;
            if (ft.alpha <= 0) floatingTexts.splice(i, 1);
        }
    }

    function render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (powerupState.chronoTimer > 0) {
            ctx.strokeStyle = 'rgba(0, 245, 212, 0.14)';
            ctx.lineWidth = 2;
        } else {
            ctx.strokeStyle = 'rgba(100, 255, 218, 0.05)';
            ctx.lineWidth = 1;
        }

        for (let x = 0; x < canvas.width; x += 40) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }

        for (let tp of thrusterParticles) {
            ctx.save();
            ctx.globalAlpha = Math.max(0, tp.alpha);
            ctx.fillStyle = tp.color;
            ctx.shadowColor = tp.color;
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.arc(tp.x, tp.y, tp.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        const px = paddle.x;
        const py = paddle.y;
        const pw = paddle.width;
        const ph = paddle.height * paddle.scaleY;

        ctx.save();
        ctx.translate(px, py);
        ctx.rotate((paddle.tilt * Math.PI) / 180);

        if (powerupState.hasShield) {
            ctx.strokeStyle = activeThemeKey === 'candy' ? '#ff70a6' : '#52b788';
            ctx.shadowColor = activeThemeKey === 'candy' ? '#ff70a6' : '#52b788';
            ctx.shadowBlur = 18;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(0, 0, pw * 0.65, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.shadowColor = activeThemeKey === 'candy' ? '#ff70a6' : '#64ffda';
        ctx.shadowBlur = 14;

        const vesselGrad = ctx.createLinearGradient(-pw / 2, 0, pw / 2, 0);
        if (activeThemeKey === 'candy') {
            vesselGrad.addColorStop(0, '#ff70a6');
            vesselGrad.addColorStop(0.5, '#ffd166');
            vesselGrad.addColorStop(1, '#ff70a6');
        } else {
            vesselGrad.addColorStop(0, '#00b4d8');
            vesselGrad.addColorStop(0.5, '#64ffda');
            vesselGrad.addColorStop(1, '#00b4d8');
        }

        ctx.fillStyle = vesselGrad;
        ctx.beginPath();
        ctx.roundRect(-pw / 2, -ph / 2, pw, ph, [12, 12, 4, 4]);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-pw / 3, -ph / 4, pw * 0.66, 3);

        ctx.restore();

        ctx.font = '28px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        for (let item of items) {
            ctx.save();
            const depthScale = 0.85 + (item.y / canvas.height) * 0.25;
            ctx.translate(item.x, item.y);
            ctx.scale(depthScale, depthScale);

            ctx.shadowColor = item.color;
            ctx.shadowBlur = item.isPowerup ? 18 : 10;
            ctx.fillText(item.emoji, 0, 0);
            ctx.restore();
        }

        for (let p of particles) {
            ctx.save();
            ctx.globalAlpha = Math.max(0, p.alpha);
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        for (let ft of floatingTexts) {
            ctx.save();
            ctx.globalAlpha = Math.max(0, ft.alpha);
            ctx.font = `700 ${Math.floor(20 * ft.scale)}px Orbitron, sans-serif`;
            ctx.fillStyle = ft.color;
            ctx.shadowColor = ft.color;
            ctx.shadowBlur = 10;
            ctx.fillText(ft.text, ft.x, ft.y);
            ctx.restore();
        }
    }

    function gameLoop(timestamp) {
        const dt = Math.min((timestamp - lastTime) / 1000, 0.1);
        lastTime = timestamp;

        update(dt);
        render();

        if (gameState === 'PLAYING') requestAnimationFrame(gameLoop);
    }

    startBtn.addEventListener('click', () => { audio.init(); resetGame(); });
    restartBtn.addEventListener('click', () => { audio.init(); resetGame(); });

    updateThemeUI();
});
