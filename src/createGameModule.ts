import { ReplayManager } from "@hiddentao/clockwork-engine"
import type {
  GameCanvas,
  GameCanvasOptions,
  GameEngine,
  GameEngineOptions,
  PlatformLayer,
} from "@hiddentao/clockwork-engine"
import type { GameMetaConfigSchema, GameMetaConfigValues } from "./metaConfig"
import type { OperatorMetadata } from "./objectives/types"
import { type GameInputMapping, GameInputType, GameIntent } from "./types"

/**
 * Game engine constructor that accepts engine options with loader and platform
 */
export type GameEngineConstructor = new (
  options: GameEngineOptions,
) => GameEngine

/**
 * Game canvas constructor that accepts options and platform
 */
export type GameCanvasConstructor = new (
  options: GameCanvasOptions,
  platform: PlatformLayer,
) => GameCanvas

/**
 * Definition of a single objective
 */
export interface ObjectiveDefinition {
  tier: "EASY" | "MEDIUM" | "HARD"
  operator: string
  threshold: number
}

/**
 * Configuration for game module creation
 *
 * @remarks
 * Games extending this framework must provide a GameEngine class that:
 * 1. Extends GameEngine from @hiddentao/clockwork-engine
 * 2. Accepts `GameEngineOptions` ({ loader, platform }) as constructor parameter
 *
 * @example
 * ```typescript
 * import { GameEngine, GameEngineOptions } from '@hiddentao/clockwork-engine'
 *
 * class MyGameEngine extends GameEngine {
 *   constructor(options: GameEngineOptions) {
 *     super(options)
 *   }
 *
 *   someMethod() {
 *     // Use platform.audio for sound playback
 *     this.platform.audio.playSound('jump', 0.8)
 *   }
 * }
 * ```
 */
export interface GameModuleConfig {
  version: string

  customOperators: readonly string[]

  objectiveDefinitions: ObjectiveDefinition[]

  objectiveMetadata: Record<string, OperatorMetadata>

  validateCustomObjective: (
    objective: { operator: string; threshold: number },
    gameSnapshot: any,
  ) => boolean

  getProgressValue: (operator: string, gameSnapshot: any) => number | null

  setupInitializationData: (
    metaConfig?: GameMetaConfigValues,
  ) => Record<string, any>

  getMetaConfigSchema: () => GameMetaConfigSchema

  extractGameSnapshotInfo: (gameSnapshot: any) => Record<string, any>

  formatGameSnapshotInfo: (
    gameSnapshotInfo: Record<string, any>,
  ) => Array<{ label: string; value: any }>

  getInputMapping: () => GameInputMapping
}

/**
 * Standard game module exports that arcade expects
 */
export interface GameModuleExports {
  GameEngine: GameEngineConstructor
  GameCanvas: GameCanvasConstructor
  ReplayManager: typeof ReplayManager
  GameInputType: Record<string, string>
  GameIntent: Record<string, string>
  getVersion: () => string
  getGameModuleConfig: () => GameModuleConfig
}

/**
 * Factory function to create standardized game module exports
 * Games call this with their specific configuration
 */
export function createGameModule(
  GameEngineClass: GameEngineConstructor,
  GameCanvasClass: GameCanvasConstructor,
  config: GameModuleConfig,
): GameModuleExports {
  return {
    GameEngine: GameEngineClass,
    GameCanvas: GameCanvasClass,
    ReplayManager,
    GameInputType,
    GameIntent,
    getVersion: () => config.version,
    getGameModuleConfig: () => config,
  }
}

export type {
  GameEngine,
  GameCanvas,
  ReplayManager,
} from "@hiddentao/clockwork-engine"
