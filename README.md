# @tribally.games/game-base

[![CI](https://github.com/tribally-games/game-base/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/tribally-games/game-base/actions/workflows/ci.yml)
[![Coverage Status](https://coveralls.io/repos/github/Tribally-Games/game-base/badge.svg?branch=main)](https://coveralls.io/github/Tribally-Games/game-base?branch=main)

Core dependency package for Tribally arcade games providing:
- Standard game module exports structure
- Common objectives handling logic
- Base game snapshot types
- Shared constants and utilities

## Installation

```bash
bun add @tribally.games/game-base @hiddentao/clockwork-engine
# or
npm install @tribally.games/game-base @hiddentao/clockwork-engine
```

## Features

- **Standardized Game Module Exports**: Factory function to generate required arcade exports
- **Objectives System**: TypeScript types, validators, formatters, and payout calculation
- **Base GameSnapshot Types**: Extensible base interface for game state snapshots
- **Shared Constants**: Common constants for objective tiers and operators

## Creating a Game Module

All games must export a standardized set of exports that the arcade platform expects. Use the `createGameModule` factory:

```typescript
// src/index.ts
import { createGameModule, OBJECTIVE_TIERS, type ObjectiveDefinition } from '@tribally.games/game-base'
import { GameEngine } from './GameEngine'
import { GameCanvas } from './GameCanvas'
import { GameInputType, GameIntent } from './types/game'

// Define your custom objective operators
const CUSTOM_OPERATORS = {
  APPLE: "APPLE",
  POTION: "POTION",
} as const

// Define objective metadata for custom operators
const CUSTOM_OPERATOR_METADATA = {
  APPLE: {
    name: "Apples",
    icon: "🍎",
    description: (threshold: number) => `Eat ${threshold} apple${threshold > 1 ? 's' : ''}`,
  },
  POTION: {
    name: "Potions",
    icon: "🧪",
    description: (threshold: number) => `Collect ${threshold} potion${threshold > 1 ? 's' : ''}`,
  },
}

// Define all possible objectives for your game
const OBJECTIVE_DEFINITIONS: ObjectiveDefinition[] = [
  { tier: "EASY", operator: "APPLE", threshold: 1 },
  { tier: "EASY", operator: "POTION", threshold: 1 },
  { tier: "EASY", operator: "SCORE", threshold: 10 },
  { tier: "MEDIUM", operator: "APPLE", threshold: 5 },
  { tier: "MEDIUM", operator: "POTION", threshold: 3 },
  { tier: "HARD", operator: "APPLE", threshold: 20 },
]

// Export standard game module structure
export const { GameEngine: ExportedGameEngine, GameCanvas: ExportedGameCanvas, GameInputType: ExportedGameInputType, GameIntent: ExportedGameIntent, getVersion } = createGameModule(
  GameEngine,
  GameCanvas,
  GameInputType,
  GameIntent,
  {
    version: "1.0.0",
    customOperators: Object.values(CUSTOM_OPERATORS),
    objectiveDefinitions: OBJECTIVE_DEFINITIONS,
    operatorMetadata: CUSTOM_OPERATOR_METADATA,

    // Validate custom objectives
    validateCustomObjective: (objective, gameSnapshot) => {
      switch (objective.operator) {
        case CUSTOM_OPERATORS.APPLE:
          return (gameSnapshot.applesEaten || 0) >= objective.threshold
        case CUSTOM_OPERATORS.POTION:
          return (gameSnapshot.potionsEaten || 0) >= objective.threshold
        default:
          return false
      }
    },

    // Extract game-specific stats for display
    extractGameStats: (gameSnapshot) => ({
      applesEaten: gameSnapshot.applesEaten || 0,
      potionsEaten: gameSnapshot.potionsEaten || 0,
    }),

    // Get progress value for custom operators
    getProgressValue: (operator, gameSnapshot) => {
      switch (operator) {
        case CUSTOM_OPERATORS.APPLE:
          return gameSnapshot.applesEaten ?? null
        case CUSTOM_OPERATORS.POTION:
          return gameSnapshot.potionsEaten ?? null
        default:
          return null
      }
    },

    // Setup game initialization data (e.g., random map selection)
    setupInitializationData: () => ({
      mapName: "base_map",
    }),
  }
)

// Re-export for CommonJS compatibility
export { ExportedGameEngine as GameEngine, ExportedGameCanvas as GameCanvas, ExportedGameInputType as GameInputType, ExportedGameIntent as GameIntent }
```

### Required Exports

The arcade platform expects these exports from every game:

```typescript
export interface GameModuleExports {
  GameEngine: typeof GameEngine  // Your game engine class
  GameCanvas: typeof GameCanvas  // Your game canvas class
  GameInputType: Record<string, string>  // Input type enum (e.g., { INTENT: "intent" })
  GameIntent: Record<string, string>     // Game intents (e.g., { UP: "up", DOWN: "down", ... })
  getVersion: () => string               // Returns game version
}
```

## Usage

### Objectives

```typescript
import {
  Objective,
  ObjectiveProgress,
  BaseGameSnapshot,
  validateCoreObjective,
  calculateProgress,
  formatObjectiveDescription,
  getObjectiveIcon,
  calculateActualPayouts,
  OBJECTIVE_TIERS,
  OBJECTIVE_OPERATORS,
} from '@tribally.games/game-base'

// Define an objective
const objective: Objective = {
  id: 1,
  tier: "EASY",
  operator: "SCORE",
  threshold: 100,
  prizeValue: 10,
  isComplete: false,
}

// Validate objective against game snapshot
const gameSnapshot: BaseGameSnapshot = {
  score: 150,
  survivedSeconds: 30,
}

const isComplete = validateCoreObjective(objective, gameSnapshot)
// true - score of 150 meets threshold of 100

// Calculate progress
const progress = calculateProgress(objective, gameSnapshot)
// { objectiveId: 1, currentValue: 150, threshold: 100, percentage: 100 }

// Format objective description
const description = formatObjectiveDescription(objective)
// "Reach a score of 100"

// Get objective icon
const icon = getObjectiveIcon("SCORE")
// "🎯"
```

### Extending BaseGameSnapshot

Games should extend the base snapshot with their own fields:

```typescript
import { BaseGameSnapshot } from '@tribally.games/game-base'

// For snakes-on-a-chain game
interface SnakeGameSnapshot extends BaseGameSnapshot {
  applesEaten: number
  potionsEaten: number
  jackpotTokensCollected: number
  jackpotEligible: boolean
  jackpotTier: string | null
  potentialJackpotReturn: number
  jackpotWon: boolean
}
```

### Payout Calculation

```typescript
import { calculateActualPayouts } from '@tribally.games/game-base'

const payouts = calculateActualPayouts(
  objectives,
  completedObjectiveIds,
  gameSnapshot,
  potentialJackpotReturn,
  jackpotTokenCollected,
  jackpotTier
)

// Returns:
// {
//   actualInstantWinReturn: number,
//   actualHighSkillReturn: number,
//   actualJackpotReturn: number,
// }
```

### Constants

```typescript
import {
  OBJECTIVE_TIERS,
  OBJECTIVE_OPERATORS,
} from '@tribally.games/game-base'

// Objective tiers
OBJECTIVE_TIERS.EASY    // "EASY"
OBJECTIVE_TIERS.MEDIUM  // "MEDIUM"
OBJECTIVE_TIERS.HARD    // "HARD"

// Core objective operators
OBJECTIVE_OPERATORS.SCORE    // "SCORE"
OBJECTIVE_OPERATORS.SURVIVE  // "SURVIVE"
OBJECTIVE_OPERATORS.COMBO    // "COMBO"
OBJECTIVE_OPERATORS.STREAK   // "STREAK"
```

## TypeScript Support

This package includes full TypeScript definitions. All exports are fully typed.

## CLI

This package includes a command-line interface for asset compression.

### Prerequisites

The CLI requires external tools to be installed:

- **cwebp**: For converting PNG/JPG images to WebP
- **opusenc**: For converting WAV audio to Opus

#### macOS
```bash
brew install webp opus-tools
```

#### Ubuntu/Debian
```bash
sudo apt-get install webp opus-tools
```

### compress command

Compress image and audio files using modern formats (WebP and Opus) with customizable quality settings.

```bash
game-base compress <pattern> -o <output-dir> [options]
```

#### Arguments

- `<pattern>`: Glob pattern to match files (e.g., `"assets/**/*.{png,jpg,wav}"`)

#### Options

- `-o, --output <dir>`: Output directory (required)
- `--webp-quality <number>`: WebP quality 0-100 (default: 25)
- `--opus-bitrate <number>`: Opus bitrate in kbps (default: 24)

#### Examples

Compress all PNG, JPG, and WAV files in the assets directory:
```bash
game-base compress "assets/**/*.{png,jpg,wav}" -o compressed/
```

Compress with custom quality settings:
```bash
game-base compress "assets/*.png" -o output/ --webp-quality 80
```

Compress audio with higher bitrate:
```bash
game-base compress "sounds/*.wav" -o audio/ --opus-bitrate 96
```

#### File Type Support

- **Images**: PNG, JPG, JPEG → WebP
- **Audio**: WAV → Opus

## Development

```bash
# Install dependencies
bun install

# Build the package
bun run build

# Watch mode
bun run build:watch

# Lint and format
bun run lint
bun run format
bun run check

# Type checking
bun run typecheck
```

## License

MIT
