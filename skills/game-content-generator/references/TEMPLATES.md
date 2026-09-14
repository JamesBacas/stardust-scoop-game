# Game Content Generator Reference Templates

This reference guide provides ready-to-use schemas, quest definitions, and theme templates for AI agents using the `game-content-generator` skill.

## 1. Arcade Quest Definition Template

```json
{
  "quest_id": "quest_cosmic_collector_01",
  "title": "Stardust Scoop Mastery",
  "description": "Achieve 3 Stars by scoring 120 points without losing a single life.",
  "objective": {
    "target_score": 120,
    "max_lives_lost": 0,
    "session_time_limit": 60
  },
  "rewards": {
    "stars": 3,
    "title": "Cosmic Champion",
    "unlocked_theme": "cyberpunk"
  }
}
```

## 2. Item & Hazard Distribution Rules

| Rarity | Base Spawn Weight | Point Range | Effect Guidelines |
| :--- | :--- | :--- | :--- |
| `common` | 60% | +1 to +3 (Good)<br>-1 to -3 (Bad) | Standard items dropped frequently to establish rhythm. |
| `uncommon` | 30% | +5 (Good)<br>-5 (Bad) | Higher value items requiring quick movement. |
| `rare` | 10% | +15 (Good)<br>-10 & Life Loss (Bad) | High-stakes jackpot items or severe hazards. |

## 3. Powerup Definitions

- **Magnet (`🧲`)**: Pulls falling good items toward player paddle for 6 seconds.
- **Chrono (`⏳`)**: Slows item fall speed by 50% for 6 seconds.
- **Shield (`🛡️`)**: Absorbs 1 hazard hit without penalty.
- **Mystery Box (`❓`)**: 50% chance of +20 jackpot, 50% chance of hazard explosion.
