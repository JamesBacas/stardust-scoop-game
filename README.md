# ✨ Stardust Scoop — Skill-Driven Web Game 🚀

> A fast-paced arcade catch game built using an **AI Agent Skill** workflow.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![HTML5 Canvas](https://img.shields.io/badge/HTML5-Canvas-orange.svg)
![Web Audio API](https://img.shields.io/badge/Audio-WebAudioAPI-purple.svg)
![Agent Skill](https://img.shields.io/badge/AI-Agent%20Skill-brightgreen.svg)

---

## 🎯 Game Objective & Mechanics

Steer your cosmic catcher vessel left and right across space to collect valuable stardust and celestial fragments while dodging dangerous space debris!

- **Objective**: Collect **50 points** of cosmic energy before the **60-second timer** expires.
- **Lives System**: You start with **3 Lives** (❤️❤️❤️). Hitting a Black Hole deducts 10 points and 1 life.
- **Dynamic Difficulty**: As time progresses, item fall speeds increase and rare items begin spawning.

### 🎮 Controls
- **Desktop (Mouse)**: Move your mouse across the canvas to steer your ship.
- **Desktop (Keyboard)**: Press `← / A` to move left and `→ / D` to move right.
- **Mobile / Touch**: Touch and drag anywhere on the screen to position your vessel.

### 📦 Item Legend & Points
| Item | Emoji | Points | Rarity | Effect |
| :--- | :---: | :---: | :--- | :--- |
| **Stardust** | ✨ | +1 | Common | Standard cosmic score |
| **Comet Fragment** | ☄️ | +3 | Common | Faster celestial chunk |
| **Power Crystal** | 💎 | +5 | Uncommon | High value energy gem |
| **Satellite Part** | 🛰️ | +5 | Uncommon | Tech salvage |
| **Golden Nova** | 🌟 | +15 | Rare | Jackpot bonus |
| **Space Junk** | 🗑️ | -1 | Common | Debris penalty |
| **Asteroid** | 🪨 | -3 | Common | Rock collision |
| **Meteor** | 🔥 | -5 | Uncommon | Fire hazard |
| **Black Hole** | 🕳️ | -10 | Rare | **Deducts 1 Life (❤️)** |

---

## 🤖 2. The Agent Skill Workflow

Per **Part 2** of the assignment requirements, this game's content, point distribution, difficulty curve, and flavor copy were generated using a custom **Agent Skill**.

### What is an Agent Skill?
An Agent Skill is a structured instruction package (located in `.agents/skills/`) that teaches an AI model how to generate consistent, high-quality, domain-specific content every time.

- **Skill Definition (agentskills.io Spec)**: [skills/game-content-generator/SKILL.md](skills/game-content-generator/SKILL.md)
- **Reference Templates**: [skills/game-content-generator/references/TEMPLATES.md](skills/game-content-generator/references/TEMPLATES.md)

---

## 🚀 3. Features & Architecture

- **Zero External Dependencies**: Pure vanilla JavaScript (ES6+), HTML5 Canvas, and CSS3.
- **Procedural Audio**: Custom retro sound effects generated programmatically via the native browser **Web Audio API** (catch tones, powerups, damage hits, victory fanfare, and game over sounds).
- **Restart Mechanism**: Full zero-state reset routine triggered by the **"Launch Again"** button on the game over screen.

---

## 🐛 Bug Fix & Playtesting Log

- **Bug 1**: Scoring target cut off gameplay at 50 points, preventing players from accumulating enough points to achieve 2-star (80 pts) or 3-star (120 pts) ratings.
- **Fix**: Updated game loop logic in `game.js` so reaching minimum target score allows gameplay to continue up to the timer expiration or 3-star threshold (120 pts), allowing players to achieve all star ratings.
- **Bug 2**: Bad items displayed negative floating point values on collision but failed to deduct points from the player's score.
- **Fix**:
  ```javascript
  score = Math.max(0, score + item.points);
  ```
- **Cleanup**: Removed the legacy Emerald Kingdom theme to streamline active arcade realms (Candy Crush, Stardust Scoop, Ocean Diver).

---

## 📦 4. Git Upload & Deployment Guide

### Step 1: Initialize Git Repository
In your terminal, navigate to this folder and run:

```bash
git init
git add .
git commit -m "Initial commit: Stardust Scoop - Skill-driven Arcade Game"
```

### Step 2: Push to GitHub
1. Create a new public repository on [GitHub](https://github.com/new) named `stardust-scoop`.
2. Connect your local repository and push:

```bash
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/stardust-scoop.git
git branch -M main
git push -u origin main
```

### Step 3: Deploy to Cadeplay / GitHub Pages
- **GitHub Pages**: Go to **Repository Settings -> Pages**, select `main` branch root (`/`), and click **Save**.
- **Cadeplay**: Upload your GitHub repository link or deploy directly on [Cadeplay](https://cadeplay.com) by pointing to `index.html`.

---

## 📄 License
MIT License - Created for Portfolio & CS Demonstration.
