# ⚡ Stardust Reactor — Skill-Driven Spatial Logic Web Game 🚀

> A compact, logic-focused browser puzzle game built using an **AI Agent Skill** workflow following the [agentskills.io](https://agentskills.io/) specification.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![HTML5 Canvas](https://img.shields.io/badge/HTML5-Canvas-orange.svg)
![Web Audio API](https://img.shields.io/badge/Audio-WebAudioAPI-purple.svg)
![Agent Skill](https://img.shields.io/badge/AI-Agent%20Skill-brightgreen.svg)

---

## 🎯 Game Objective & Mechanics

Manage energy alignment on a 6x6 cosmic grid in **Stardust Reactor**!

- **Objective**: Contain **3 Black Holes 🕳️** and reach **1,200 Energy** within a **16-Move Limit**.
- **Match 3+ Tiles**: Align 3 identical tiles (✨ Stardust, 💎 Power Crystal, 🌟 Golden Nova) to harvest energy.
- **Special Combos**:
  - **Match 4 (Line Pulsar ⚡)**: Creates a Pulsar tile that vaporizes its entire row & column when cleared!
  - **Match 5 (Quantum Core 🌌)**: Creates a Core tile that obliterates all tiles matching the target element.
- **Black Hole Hazard 🕳️**:
  - Drops into orbit starting after **Move 4** (gives you time to learn & build combos first!).
  - Spawns in **spaced-out columns** away from active Black Holes.
  - Expand after **2 turns** of neglect, consuming adjacent tiles and deducting a **50 Energy Penalty**!
- **Star Rating Criteria**:
  - ⭐ **1 Star**: Finished stage below 1,200 Energy.
  - ⭐⭐ **2 Stars**: Reached 1,200 Target Energy.
  - ⭐⭐⭐ **3 Stars**: Went beyond 1,200 Energy (1,500+ pts)!
  - 🚫 **0 Stars**: Game Over (Reactor Overload).
- **Persistent High Score (`BEST`)**: Saves your personal record locally in `localStorage`.

---

## 🎮 Controls

- **Desktop (Mouse)**: Click a tile and click an adjacent cell (or click-and-drag) to swap.
- **Mobile / Touch**: Tap a tile and tap an adjacent cell (or swipe in direction) to swap. Responsive 100dvh layout fits all phone screens.

---

## 🤖 The Agent Skill Workflow

This game's rules, grid layout, special tile behaviors, and objective constraints were generated using a custom **Agent Skill** adhering to the **[agentskills.io](https://agentskills.io/)** specification.

- **Skill Definition (`agentskills.io` Spec)**: [.agents/skills/game-logic-designer/SKILL.md](.agents/skills/game-logic-designer/SKILL.md)
- **Reference Template JSON**: [.agents/skills/game-logic-designer/examples/reactor_quest.json](.agents/skills/game-logic-designer/examples/reactor_quest.json)

---

## 🚀 Features & Architecture

- **Zero External Dependencies**: Pure vanilla ES6+ JavaScript, HTML5 Canvas, and CSS3.
- **Procedural Synthesizer**: Web Audio API retro sound synthesis for tile selection, swaps, invalid spring-backs, laser blasts, black hole explosions, cascade combos, victory fanfares, and game over signals.
- **Restart Routine**: Instant state reset via header button or end overlay button.

---

## 📱 GitHub Pages Deployment (Play on Phone!)

To publish this game to GitHub and play it live on your mobile phone:

1. **Commit & Push to GitHub**:
   ```bash
   git add .
   git commit -m "Updated Stardust Reactor with High Score, Star Ratings & Agent Skill"
   git push origin main
   ```

2. **Enable GitHub Pages**:
   - Go to your repository settings on GitHub: **Settings -> Pages**.
   - Under **Build and deployment**, set Source to **Deploy from a branch**.
   - Select Branch: `main` and Folder: `/ (root)`, then click **Save**.

3. **Play on Mobile**:
   - Open your GitHub Pages link (e.g. `https://<your-username>.github.io/<repository-name>/`) in Safari or Chrome on your phone!
   - Tap **"Add to Home Screen"** to play anytime full-screen!

---

## 📄 License
MIT License - Created for Portfolio & AI Agent Skill Demonstration.
