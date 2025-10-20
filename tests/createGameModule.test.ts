import { describe, expect, test } from "bun:test"
import { GameState } from "@hiddentao/clockwork-engine"
import {
  createGameModule,
  type GameModuleConfig,
} from "../src/createGameModule"
import { getRegisteredConfig } from "../src/gameModuleRegistry"
import {
  validateObjective,
  formatObjectiveDescription,
  getObjectiveIcon,
  calculateProgress,
} from "../src/objectives"
import type { Objective } from "../src/objectives/types"

describe("createGameModule Integration", () => {
  class MockGameEngine {}
  class MockGameCanvas {}
  const MockGameInputType = { INTENT: "intent" }
  const MockGameIntent = {
    UP: "up",
    DOWN: "down",
    LEFT: "left",
    RIGHT: "right",
  }

  test("should create game module with all required exports", () => {
    const config: GameModuleConfig = {
      version: "1.0.0",
      objectiveDefinitions: [],
    }

    const module = createGameModule(
      MockGameEngine as any,
      MockGameCanvas as any,
      MockGameInputType,
      MockGameIntent,
      config,
    )

    expect(module.GameEngine).toBe(MockGameEngine)
    expect(module.GameCanvas).toBe(MockGameCanvas)
    expect(module.GameInputType).toEqual(MockGameInputType)
    expect(module.GameIntent).toEqual(MockGameIntent)
    expect(module.getVersion()).toBe("1.0.0")
  })

  test("should register config automatically", () => {
    const config: GameModuleConfig = {
      version: "2.0.0",
      customOperators: ["APPLE"],
      objectiveDefinitions: [
        { tier: "EASY", operator: "APPLE", threshold: 5 },
      ],
      operatorMetadata: {
        APPLE: {
          name: "Apples",
          icon: "🍎",
          description: (threshold) => `Eat ${threshold} apples`,
        },
      },
    }

    createGameModule(
      MockGameEngine as any,
      MockGameCanvas as any,
      MockGameInputType,
      MockGameIntent,
      config,
    )

    const registered = getRegisteredConfig()
    expect(registered?.version).toBe("2.0.0")
    expect(registered?.customOperators).toEqual(["APPLE"])
  })

  test("should enable custom validation after registration", () => {
    const config: GameModuleConfig = {
      version: "1.0.0",
      customOperators: ["APPLE"],
      objectiveDefinitions: [],
      validateCustomObjective: (objective, snapshot) =>
        (snapshot.applesEaten || 0) >= objective.threshold,
    }

    createGameModule(
      MockGameEngine as any,
      MockGameCanvas as any,
      MockGameInputType,
      MockGameIntent,
      config,
    )

    const objective: Objective = {
      id: 1,
      tier: "EASY",
      operator: "APPLE",
      threshold: 5,
      prizeValue: 10,
      isComplete: false,
    }

    const snapshot = {
      state: GameState.PLAYING,
      score: 0,
      jackpotTokensCollected: 0,
      jackpotEligible: false,
      jackpotTier: null,
      potentialJackpotReturn: 0,
      jackpotWon: false,
      applesEaten: 10,
    }

    expect(validateObjective(objective, snapshot)).toBe(true)
  })

  test("should enable custom metadata after registration", () => {
    const config: GameModuleConfig = {
      version: "1.0.0",
      objectiveDefinitions: [],
      operatorMetadata: {
        POTION: {
          name: "Potions",
          icon: "🧪",
          description: (threshold) => `Collect ${threshold} potions`,
        },
      },
    }

    createGameModule(
      MockGameEngine as any,
      MockGameCanvas as any,
      MockGameInputType,
      MockGameIntent,
      config,
    )

    expect(getObjectiveIcon("POTION")).toBe("🧪")

    const objective: Objective = {
      id: 1,
      tier: "EASY",
      operator: "POTION",
      threshold: 3,
      prizeValue: 10,
      isComplete: false,
    }
    expect(formatObjectiveDescription(objective)).toBe("Collect 3 potions")
  })

  test("should enable custom progress calculation after registration", () => {
    const config: GameModuleConfig = {
      version: "1.0.0",
      objectiveDefinitions: [],
      getProgressValue: (operator, snapshot) => {
        if (operator === "APPLE") return snapshot.applesEaten ?? null
        return null
      },
    }

    createGameModule(
      MockGameEngine as any,
      MockGameCanvas as any,
      MockGameInputType,
      MockGameIntent,
      config,
    )

    const objective: Objective = {
      id: 1,
      tier: "EASY",
      operator: "APPLE",
      threshold: 10,
      prizeValue: 10,
      isComplete: false,
    }

    const snapshot = {
      state: GameState.PLAYING,
      score: 0,
      jackpotTokensCollected: 0,
      jackpotEligible: false,
      jackpotTier: null,
      potentialJackpotReturn: 0,
      jackpotWon: false,
      applesEaten: 7,
    }

    const progress = calculateProgress(objective, snapshot)
    expect(progress.currentValue).toBe(7)
    expect(progress.threshold).toBe(10)
    expect(progress.percentage).toBe(70)
  })

  test("should support full game configuration", () => {
    const config: GameModuleConfig = {
      version: "1.5.0",
      customOperators: ["APPLE", "POTION"],
      objectiveDefinitions: [
        { tier: "EASY", operator: "APPLE", threshold: 1 },
        { tier: "EASY", operator: "APPLE", threshold: 3 },
        { tier: "MEDIUM", operator: "POTION", threshold: 2 },
      ],
      operatorMetadata: {
        APPLE: {
          name: "Apples",
          icon: "🍎",
          description: (threshold) =>
            `Eat ${threshold} apple${threshold > 1 ? "s" : ""}`,
        },
        POTION: {
          name: "Potions",
          icon: "🧪",
          description: (threshold) =>
            `Collect ${threshold} potion${threshold > 1 ? "s" : ""}`,
        },
      },
      validateCustomObjective: (objective, snapshot) => {
        if (objective.operator === "APPLE") {
          return (snapshot.applesEaten || 0) >= objective.threshold
        }
        if (objective.operator === "POTION") {
          return (snapshot.potionsEaten || 0) >= objective.threshold
        }
        return false
      },
      extractGameStats: (snapshot) => ({
        applesEaten: snapshot.applesEaten || 0,
        potionsEaten: snapshot.potionsEaten || 0,
      }),
      getProgressValue: (operator, snapshot) => {
        if (operator === "APPLE") return snapshot.applesEaten ?? null
        if (operator === "POTION") return snapshot.potionsEaten ?? null
        return null
      },
      setupInitializationData: () => ({
        mapName: "base_map",
      }),
    }

    const module = createGameModule(
      MockGameEngine as any,
      MockGameCanvas as any,
      MockGameInputType,
      MockGameIntent,
      config,
    )

    expect(module.getVersion()).toBe("1.5.0")

    const registered = getRegisteredConfig()
    expect(registered?.customOperators).toEqual(["APPLE", "POTION"])
    expect(registered?.objectiveDefinitions.length).toBe(3)
    expect(registered?.setupInitializationData?.()).toEqual({ mapName: "base_map" })

    const stats = registered?.extractGameStats?.({ applesEaten: 5, potionsEaten: 3 })
    expect(stats).toEqual({ applesEaten: 5, potionsEaten: 3 })
  })

  test("should support formatGameStats configuration", () => {
    const config: GameModuleConfig = {
      version: "1.0.0",
      objectiveDefinitions: [],
      extractGameStats: (snapshot) => ({
        applesEaten: snapshot.applesEaten || 0,
        potionsCollected: snapshot.potionsCollected || 0,
        enemiesDefeated: snapshot.enemiesDefeated || 0,
      }),
      formatGameStats: (gameStats) => [
        { label: "Apples", value: gameStats.applesEaten },
        { label: "Potions", value: gameStats.potionsCollected },
        { label: "Enemies", value: gameStats.enemiesDefeated },
      ],
    }

    createGameModule(
      MockGameEngine as any,
      MockGameCanvas as any,
      MockGameInputType,
      MockGameIntent,
      config,
    )

    const registered = getRegisteredConfig()
    expect(registered?.formatGameStats).toBeDefined()

    const rawStats = { applesEaten: 10, potionsCollected: 5, enemiesDefeated: 20 }
    const formatted = registered?.formatGameStats?.(rawStats)

    expect(formatted).toEqual([
      { label: "Apples", value: 10 },
      { label: "Potions", value: 5 },
      { label: "Enemies", value: 20 },
    ])
  })

  test("should work without formatGameStats when not provided", () => {
    const config: GameModuleConfig = {
      version: "1.0.0",
      objectiveDefinitions: [],
      extractGameStats: (snapshot) => ({
        score: snapshot.score || 0,
      }),
    }

    createGameModule(
      MockGameEngine as any,
      MockGameCanvas as any,
      MockGameInputType,
      MockGameIntent,
      config,
    )

    const registered = getRegisteredConfig()
    expect(registered?.formatGameStats).toBeUndefined()
  })
})
