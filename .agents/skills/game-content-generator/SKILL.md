---
name: game-content-generator
description: Generates game ideas, quest objectives, item catalogs, difficulty curves, and theme specifications for 2D arcade catch games. Use this skill whenever designing new browser mini-games, adding game themes, creating quests, or balancing item point distributions.
---

# Game Content Generator Skill

This Agent Skill guides the generation of creative, balanced, and engine-ready JSON specifications for 2D falling-item arcade games (such as catch/basket mini-games).

## Required JSON Output Schema

When asked to generate a game theme or level configuration, produce JSON conforming to this exact structure:

```json
{
  "title": "Game Theme Title",
  "life_icon": "⚡",
  "target_score": 50,
  "session_seconds": 60,
  "starting_lives": 3,
  "items": {
    "good": [
      { "id": "item_id", "name": "Item Name", "points": 1, "emoji": "✨", "rarity": "common", "color": "#64ffda" }
    ],
    "bad": [
      { "id": "hazard_id", "name": "Hazard Name", "points": -3, "emoji": "🪨", "rarity": "common", "color": "#a0aab2", "deduct_life": false }
    ],
    "powerups": [
      { "id": "magnet", "name": "Magnet", "type": "magnet", "emoji": "🧲", "rarity": "uncommon", "color": "#ff0054" }
    ]
  },
  "difficulty_curve": [
    { "time_seconds": 0, "fall_speed_multiplier": 1.0, "spawn_rate_multiplier": 1.0, "note": "Stage description" }
  ],
  "messages": {
    "win": "Victory message with placeholder {score}",
    "lose": "Game over message with placeholder {score}",
    "restart_button": "Button label"
  }
}
```

## Item Balance Guidelines

1. **Rarity Tiers**:
   - `common`: ~60% spawn chance (Standard +1 to +3 points; -1 to -3 hazard).
   - `uncommon`: ~30% spawn chance (Bonus +5 points; -5 hazard).
   - `rare`: ~10% spawn chance (Jackpot +15 points; severe hazard -10 points with `"deduct_life": true`).

2. **Powerups**:
   - `magnet`: Attracts good items towards paddle.
   - `chrono`: Slows fall speed by 50%.
   - `shield`: Absorbs 1 hazard hit.
   - `heal`: Restores +1 life (or +10 points if lives are full).
   - `mystery`: 50% jackpot bonus (+20), 50% hazard detonation (-1 life).

3. **Difficulty Curve**:
   - Define at least 4 stage milestones (`0s`, `15s`, `30s`, `45s`) ramping fall speed and spawn density.

---

## References & Examples

- **Complete Verified Example**: [stardust_scoop.json](examples/stardust_scoop.json)
- **Quest & Balance Templates**: [TEMPLATES.md](references/TEMPLATES.md)
