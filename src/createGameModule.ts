import type { GameCanvas, GameEngine } from "@hiddentao/clockwork-engine"
import { registerGameModule } from "./gameModuleRegistry"
import type { OperatorMetadata } from "./objectives/types"

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

  customOperators?: readonly string[]

  objectiveDefinitions: ObjectiveDefinition[]

  operatorMetadata?: Record<string, OperatorMetadata>

  validateCustomObjective?: (
    objective: { operator: string; threshold: number },
    gameSnapshot: any,
  ) => boolean

  extractGameStats?: (gameSnapshot: any) => Record<string, number>

  formatGameStats?: (
    gameStats: Record<string, number>,
  ) => Array<{ label: string; value: number }>

  getProgressValue?: (operator: string, gameSnapshot: any) => number | null

  setupInitializationData?: () => Record<string, any>
}

/**
 * Standard game module exports that arcade expects
 */
export interface GameModuleExports {
  GameEngine: typeof GameEngine
  GameCanvas: typeof GameCanvas
  GameInputType: Record<string, string>
  GameIntent: Record<string, string>
  getVersion: () => string
}

/**
 * Factory function to create standardized game module exports
 * Games call this with their specific configuration
 */
export function createGameModule(
  GameEngineClass: typeof GameEngine,
  GameCanvasClass: typeof GameCanvas,
  GameInputType: Record<string, string>,
  GameIntent: Record<string, string>,
  config: GameModuleConfig,
): GameModuleExports {
  registerGameModule(config)

  return {
    GameEngine: GameEngineClass,
    GameCanvas: GameCanvasClass,
    GameInputType,
    GameIntent,
    getVersion: () => config.version,
  }
}

export type {
  GameEngine,
  GameCanvas,
} from "@hiddentao/clockwork-engine"
