---
name: game-content-generator
description: >-
  Generates game content, item definitions, difficulty curves, and UI copy for falling-item
  arcade games. Use this skill whenever the user wants to generate balanced items, point distributions,
  theme concepts, or game text for catch games.
---

# Game Content Generator Skill

This skill guides the agent in generating structured, balanced content for 2D falling-item arcade games (such as basket/catcher games).

## Objective
To produce consistent, balanced JSON content files that can be directly consumed by a game engine.

## Required JSON Structure

When requested to generate a game theme, produce JSON conforming to the following structure:

```json
{
  "title": "Game Title",
  "objective": "Clear description of player objective and target score",
  "target_score": 50,
  "session_seconds": 60,
  "starting_lives": 3,
  "items": {
    "good": [
      { "name": "Item Name", "points": 1, "emoji": "✨", "rarity": "common" }
    ],
    "bad": [
      { "name": "Item Name", "points": -1, "emoji": "🪨", "rarity": "common" }
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

## Balance Guidelines

1. **Rarity Tiers**:
   - `common`: 60% spawn chance
   - `uncommon`: 30% spawn chance
   - `rare`: 10% spawn chance (high reward or high risk)

2. **Scoring Values**:
   - Standard Good Item: +1 to +3 points
   - Bonus Good Item: +5 points
   - Jackpot Good Item: +10 to +15 points (rare)
   - Mild Bad Item: -1 to -2 points
   - Severe Bad Item: -5 points or -1 life
   - Deadly Bad Item: -10 points or immediate lose (rare)

3. **Pacing**:
   - Starts slow for the first 15 seconds to allow player orientation.
   - Ramps speed up every 15 seconds.
   - Peak density during final 15 seconds.

## Usage Procedure

1. Solicit or confirm the game theme from the user (e.g. Space, Food, Fantasy, Ocean).
2. Generate the JSON schema with balanced items across `good` and `bad` arrays.
3. Include at least 4 difficulty progression stages.
4. Output the JSON object along with design rationale notes.
