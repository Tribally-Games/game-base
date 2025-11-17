import { ReplayManager } from "@hiddentao/clockwork-engine"
import type {
  GameCanvas,
  GameEngine,
  Loader,
} from "@hiddentao/clockwork-engine"
import type { AudioManager } from "./audio/types"
import type { GameMetaConfigSchema, GameMetaConfigValues } from "./metaConfig"
import type { OperatorMetadata } from "./objectives/types"
import { type GameInputMapping, GameInputType, GameIntent } from "./types"

/**
 * Game engine constructor that accepts loader and audio manager
 */
export type GameEngineConstructor = new (
  loader: Loader,
  audioManager: AudioManager,
) => GameEngine

/**
 * Game canvas constructor
 */
export type GameCanvasConstructor = new (...args: any[]) => GameCanvas

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
 * 1. Extends BaseGameEngine from @hiddentao/clockwork-engine
 * 2. Accepts `(loader: Loader, audioManager: AudioManager)` as constructor parameters
 *
 * @example
 * ```typescript
 * import { BaseGameEngine, Loader } from '@hiddentao/clockwork-engine'
 * import { AudioManager } from '@tribally.games/game-base'
 *
 * class MyGameEngine extends BaseGameEngine {
 *   private audioManager: AudioManager
 *
 *   constructor(loader: Loader, audioManager: AudioManager) {
 *     super(loader)
 *     this.audioManager = audioManager
 *   }
 *
 *   someMethod() {
 *     // Use audioManager instead of DOM APIs
 *     this.audioManager.playSound('jump', 0.8)
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
