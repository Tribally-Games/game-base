import { ReplayManager } from "@hiddentao/clockwork-engine"
import type { GameCanvas, GameEngine } from "@hiddentao/clockwork-engine"
import type { GameMetaConfigSchema, GameMetaConfigValues } from "./metaConfig"
import type { OperatorMetadata } from "./objectives/types"
import { type GameInputMapping, GameInputType, GameIntent } from "./types"

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
  GameEngine: typeof GameEngine
  GameCanvas: typeof GameCanvas
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
  GameEngineClass: typeof GameEngine,
  GameCanvasClass: typeof GameCanvas,
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
