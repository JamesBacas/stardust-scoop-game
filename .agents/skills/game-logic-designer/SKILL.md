---
name: game-logic-designer
description: Generates game logic rules, puzzle grid mechanics, special tile behaviors, move-limit objectives, and challenge levels for logic-based mini-games. Use this skill when designing browser puzzle games, grid matching systems, chain-reaction rules, or turn-based spatial challenges.
---

# Game Logic & Puzzle Designer Skill

This Agent Skill guides the generation of structured, engine-ready JSON specifications for grid-based logic and puzzle mini-games (such as match-3, energy reactors, tile aligners, and spatial chain-reaction games).

## Required JSON Output Schema

When generating a puzzle level or logic game specification, produce JSON conforming to this exact structure:

```json
{
  "game_title": "Stardust Reactor Logic Grid",
  "board_size": { "rows": 6, "cols": 6 },
  "max_moves": 20,
  "target_score": 1200,
  "objective": {
    "type": "contain_hazards_and_score",
    "target_black_holes_destroyed": 3,
    "description": "Destroy 3 Black Holes and reach 1,200 Energy before running out of moves!"
  },
  "tile_catalog": [
    {
      "id": "stardust",
      "name": "Stardust",
      "symbol": "✨",
      "color": "#64ffda",
      "base_score": 30,
      "matchable": true
    },
    {
      "id": "crystal",
      "name": "Power Crystal",
      "symbol": "💎",
      "color": "#bd5fff",
      "base_score": 50,
      "matchable": true
    },
    {
      "id": "nova",
      "name": "Golden Nova",
      "symbol": "🌟",
      "color": "#ffd166",
      "base_score": 80,
      "matchable": true
    },
    {
      "id": "blackhole",
      "name": "Black Hole",
      "symbol": "🕳️",
      "color": "#ff0054",
      "base_score": 200,
      "matchable": false,
      "behavior": "expands_on_timer",
      "turns_to_expand": 3
    }
  ],
  "special_tile_rules": {
    "match_4": {
      "name": "Line Pulsar",
      "symbol": "⚡",
      "effect": "clears_row_and_column"
    },
    "match_5": {
      "name": "Quantum Core",
      "symbol": "🌌",
      "effect": "clears_all_same_element"
    }
  },
  "cascade_multiplier": 1.5,
  "messages": {
    "win": "Reactor Stabilized! You cleared all objectives with {moves_left} moves remaining.",
    "lose": "Reactor Overload! Out of moves. Try again!",
    "restart_button": "Re-initialize Reactor"
  }
}
```

## Logic & Mechanics Design Guidelines

1. **Grid Balance & Solvability**:
   - Standard board sizes are 6x6 or 7x7 to ensure high spatial clarity on mobile and desktop screens.
   - Initial board generation MUST guarantee no pre-formed 3-tile matches exist before the player's first move.

2. **Special Tile & Hazard Mechanics**:
   - **Matchable Tiles**: Standard 3+ tile alignment triggers energy harvest and score calculation.
   - **Match-4 Combination**: Creates a **Line Pulsar** (⚡) that vaporizes its entire row and column when swapped or matched.
   - **Match-5 Combination**: Creates a **Quantum Core** (🌌) that obliterates all tiles matching the target element.
   - **Hazards (Black Holes 🕳️)**: Unmatchable tiles that can only be destroyed via adjacent explosions or Pulsar strikes. If unhandled for N turns, they expand into neighboring cells.

3. **Cascading Logic & Chain Reactions**:
   - Gravity causes tiles to fall downwards to fill empty gaps.
   - Subsequent matches formed by falling tiles grant exponential cascade multipliers (`Score * 1.5 ^ cascade_depth`).

---

## References & Examples

- **Complete Level Spec**: [reactor_quest.json](examples/reactor_quest.json)
