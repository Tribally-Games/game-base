# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`@tribally.games/game-base` is a core dependency package for Tribally arcade games, providing standardized game module structure, objectives handling, and shared utilities. It acts as a framework that individual games extend.

## Development Commands

### Building
```bash
bun run build              # Full build (ESM + CJS + types + CLI)
bun run build:watch        # Watch mode with automatic rebuilds
```

The build process creates:
- `dist/esm/` - ES modules
- `dist/cjs/` - CommonJS modules
- `dist/types/` - TypeScript declarations
- `bin/` - CLI executable with shebang

Build is implemented in [scripts/build.ts](scripts/build.ts) using Bun's native bundler, building all formats in parallel.

### Testing
```bash
bun test                   # Run all tests
bun test:watch             # Watch mode
bun test:coverage          # Run with coverage report
bun test <pattern>         # Run specific test files (e.g., bun test validators)
```

Tests are in [tests/](tests/) directory and use Bun's built-in test runner.

### Linting & Type Checking
```bash
bun run lint               # Lint and auto-fix with Biome
bun run format             # Format code with Biome
bun run check              # Check without fixing
bun run typecheck          # TypeScript type checking
```

Configuration in [biome.json](biome.json) - semicolons are "asNeeded", indent is 2 spaces.

### Release
```bash
bun run commit             # Interactive conventional commit (commitizen)
bun run release            # Create release (auto-bumps patch version)
bun run release:minor      # Bump minor version
bun run release:major      # Bump major version
```

Uses conventional commits with commitlint validation via Husky hooks ([.husky/commit-msg](.husky/commit-msg)). Pre-commit hook runs `bun run check`.

## Architecture

### Core Concept: Game Module Factory

The central pattern is `createGameModule()` ([src/createGameModule.ts](src/createGameModule.ts)) - a factory that generates standardized exports expected by the Tribally arcade platform. Games call this with their engine, canvas, and configuration.

**Required game exports:**
- `GameEngine` - Game engine class (from @hiddentao/clockwork-engine)
- `GameCanvas` - Canvas rendering class
- `GameInputType` - Input type enum
- `GameIntent` - Game intent enum
- `getVersion()` - Returns version string
- `getGameModuleConfig()` - Returns configuration

### Objectives System

Located in [src/objectives/](src/objectives/) - the core feature this package provides:

- **Core operators** ([constants.ts](src/objectives/constants.ts)): SCORE, SURVIVE, COMBO, STREAK
- **Validation** ([validators.ts](src/objectives/validators.ts)): `validateCoreObjective()` for built-in operators, `validateObjective()` dispatches to custom validators
- **Formatters** ([formatters.ts](src/objectives/formatters.ts)): Human-readable descriptions and icons
- **Progress calculation** ([validators.ts](src/objectives/validators.ts)): Maps objectives to current game state
- **Payout calculator** ([payoutCalculator.ts](src/objectives/payoutCalculator.ts)): Calculates instant win, high skill, and jackpot returns

Games extend with **custom operators** by providing:
- `customOperators` array in config
- `validateCustomObjective()` function
- `operatorMetadata` with name/icon/description
- `getProgressValue()` to extract progress from game snapshot

### Meta Configuration System

[src/metaConfig.ts](src/metaConfig.ts) provides runtime game configuration schema/validation:

- **Field types**: COLOR, STRING, STRING_LIST
- **Validation**: Type checking, min/max length, patterns, allowed values
- **Default merging**: `mergeWithDefaults()` combines user input with schema defaults
- Games define schema via `getMetaConfigSchema()` in config
- Used by `setupInitializationData()` to configure game instances

### Base Types

[src/types.ts](src/types.ts) defines standard enums (GameInputType, GameIntent).

[src/objectives/types.ts](src/objectives/types.ts) defines:
- `BaseGameSnapshot` - Base interface all games extend with their state
- `Objective` - Objective structure (tier, operator, threshold, etc.)
- `ObjectiveProgress` - Current progress tracking

### CLI Tool

[src/cli/](src/cli/) provides asset compression command:

```bash
game-base compress "assets/**/*.{png,jpg,wav}" -o compressed/
```

Requires external tools: `cwebp` (WebP conversion) and `opusenc` (Opus audio). Implemented in [compress.ts](src/cli/compress.ts) with quality/bitrate options.

## Key Dependencies

- **@hiddentao/clockwork-engine** (peer dependency) - Game engine framework that games build on
- **Bun** - Primary runtime (Node.js 22+ required for production)
- **Biome** - Linting and formatting
- **TypeScript** - Strict mode enabled with exactOptionalPropertyTypes

## Testing Strategy

Tests mirror source structure:
- Test each module independently
- Comprehensive coverage for objectives system (validators, formatters, payout calculator)
- Meta config validation edge cases
- CLI commands in [tests/cli/](tests/cli/)

Coverage reports required for publishing (`prepublishOnly` runs `test:coverage`).

## Publishing

Package is published to npm as `@tribally.games/game-base`. Dual ESM/CJS exports configured in package.json `exports` field. Files allowlist includes `dist`, `bin`, `src` for source maps.