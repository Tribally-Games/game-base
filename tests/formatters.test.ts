import { describe, expect, test } from "bun:test"
import { GameState } from "@hiddentao/clockwork-engine"
import { OBJECTIVE_OPERATORS } from "../src/constants"
import type { GameModuleConfig } from "../src/createGameModule"
import {
  calculateProgress,
  formatObjectiveDescription,
  formatProgress,
  getObjectiveIcon,
} from "../src/objectives/formatters"
import type { BaseGameSnapshot, Objective } from "../src/objectives/types"

describe("Objective Formatters", () => {
  const minimalConfig: GameModuleConfig = {
    version: "1.0.0",
    objectiveDefinitions: [],
  }

  const createBaseSnapshot = (
    overrides?: Partial<BaseGameSnapshot>,
  ): BaseGameSnapshot => ({
    state: GameState.PLAYING,
    score: 100,
    survivedSeconds: 30,
    combos: 5,
    streak: 3,
    jackpotTokensCollected: 0,
    jackpotEligible: false,
    jackpotTier: null,
    potentialJackpotReturn: 0,
    jackpotWon: false,
    ...overrides,
  })

  describe("formatObjectiveDescription - core operators", () => {
    test("should format SCORE objective", () => {
      const objective: Objective = {
        id: 1,
        tier: "EASY",
        operator: OBJECTIVE_OPERATORS.SCORE,
        threshold: 100,
        prizeValue: 10,
        isComplete: false,
      }
      expect(formatObjectiveDescription(objective, minimalConfig)).toBe(
        "Reach a score of 100",
      )
    })

    test("should format SURVIVE objective", () => {
      const objective: Objective = {
        id: 2,
        tier: "MEDIUM",
        operator: OBJECTIVE_OPERATORS.SURVIVE,
        threshold: 60,
        prizeValue: 20,
        isComplete: false,
      }
      expect(formatObjectiveDescription(objective, minimalConfig)).toBe(
        "Survive for 60 seconds",
      )
    })

    test("should format COMBO objective", () => {
      const objective: Objective = {
        id: 3,
        tier: "MEDIUM",
        operator: OBJECTIVE_OPERATORS.COMBO,
        threshold: 5,
        prizeValue: 15,
        isComplete: false,
      }
      expect(formatObjectiveDescription(objective, minimalConfig)).toBe(
        "Achieve 5 combos",
      )
    })

    test("should format STREAK objective", () => {
      const objective: Objective = {
        id: 4,
        tier: "HARD",
        operator: OBJECTIVE_OPERATORS.STREAK,
        threshold: 10,
        prizeValue: 30,
        isComplete: false,
      }
      expect(formatObjectiveDescription(objective, minimalConfig)).toBe(
        "Reach 10 streak",
      )
    })
  })

  describe("formatObjectiveDescription - custom operators", () => {
    const config: GameModuleConfig = {
      version: "1.0.0",
      objectiveDefinitions: [],
      objectiveMetadata: {
        APPLE: {
          name: "Apples",
          icon: "🍎",
          description: (threshold: number) =>
            `Eat ${threshold} apple${threshold > 1 ? "s" : ""}`,
        },
        POTION: {
          name: "Potions",
          icon: "🧪",
          description: (threshold: number) =>
            `Collect ${threshold} potion${threshold > 1 ? "s" : ""}`,
        },
      },
    }

    test("should format custom APPLE objective", () => {
      const objective: Objective = {
        id: 5,
        tier: "EASY",
        operator: "APPLE",
        threshold: 5,
        prizeValue: 10,
        isComplete: false,
      }
      expect(formatObjectiveDescription(objective, config)).toBe("Eat 5 apples")
    })

    test("should format custom APPLE objective (singular)", () => {
      const objective: Objective = {
        id: 6,
        tier: "EASY",
        operator: "APPLE",
        threshold: 1,
        prizeValue: 5,
        isComplete: false,
      }
      expect(formatObjectiveDescription(objective, config)).toBe("Eat 1 apple")
    })

    test("should format custom POTION objective", () => {
      const objective: Objective = {
        id: 7,
        tier: "MEDIUM",
        operator: "POTION",
        threshold: 3,
        prizeValue: 15,
        isComplete: false,
      }
      expect(formatObjectiveDescription(objective, config)).toBe(
        "Collect 3 potions",
      )
    })

    test("should use fallback for unknown operator", () => {
      const objective: Objective = {
        id: 8,
        tier: "EASY",
        operator: "UNKNOWN",
        threshold: 10,
        prizeValue: 5,
        isComplete: false,
      }
      expect(formatObjectiveDescription(objective, config)).toBe("UNKNOWN 10+")
    })
  })

  describe("getObjectiveIcon", () => {
    test("should return core operator icons", () => {
      expect(getObjectiveIcon(OBJECTIVE_OPERATORS.SCORE, minimalConfig)).toBe(
        "🎯",
      )
      expect(getObjectiveIcon(OBJECTIVE_OPERATORS.SURVIVE, minimalConfig)).toBe(
        "💪",
      )
      expect(getObjectiveIcon(OBJECTIVE_OPERATORS.COMBO, minimalConfig)).toBe(
        "🔥",
      )
      expect(getObjectiveIcon(OBJECTIVE_OPERATORS.STREAK, minimalConfig)).toBe(
        "⚡",
      )
    })

    test("should return custom operator icons", () => {
      const config: GameModuleConfig = {
        version: "1.0.0",
        objectiveDefinitions: [],
        objectiveMetadata: {
          APPLE: {
            name: "Apples",
            icon: "🍎",
            description: (threshold) => `Eat ${threshold} apples`,
          },
        },
      }
      expect(getObjectiveIcon("APPLE", config)).toBe("🍎")
    })

    test("should return fallback icon for unknown operator", () => {
      expect(getObjectiveIcon("UNKNOWN", minimalConfig)).toBe("❓")
    })
  })

  describe("calculateProgress - core operators", () => {
    test("should calculate SCORE progress", () => {
      const objective: Objective = {
        id: 1,
        tier: "EASY",
        operator: OBJECTIVE_OPERATORS.SCORE,
        threshold: 200,
        prizeValue: 10,
        isComplete: false,
      }
      const snapshot = createBaseSnapshot({ score: 100 })
      const progress = calculateProgress(objective, snapshot, minimalConfig)

      expect(progress).toEqual({
        objectiveId: 1,
        currentValue: 100,
        threshold: 200,
        percentage: 50,
      })
    })

    test("should calculate SURVIVE progress", () => {
      const objective: Objective = {
        id: 2,
        tier: "MEDIUM",
        operator: OBJECTIVE_OPERATORS.SURVIVE,
        threshold: 60,
        prizeValue: 20,
        isComplete: false,
      }
      const snapshot = createBaseSnapshot({ survivedSeconds: 45 })
      const progress = calculateProgress(objective, snapshot, minimalConfig)

      expect(progress).toEqual({
        objectiveId: 2,
        currentValue: 45,
        threshold: 60,
        percentage: 75,
      })
    })

    test("should calculate COMBO progress", () => {
      const objective: Objective = {
        id: 3,
        tier: "MEDIUM",
        operator: OBJECTIVE_OPERATORS.COMBO,
        threshold: 10,
        prizeValue: 15,
        isComplete: false,
      }
      const snapshot = createBaseSnapshot({ combos: 7 })
      const progress = calculateProgress(objective, snapshot, minimalConfig)

      expect(progress).toEqual({
        objectiveId: 3,
        currentValue: 7,
        threshold: 10,
        percentage: 70,
      })
    })

    test("should calculate STREAK progress", () => {
      const objective: Objective = {
        id: 4,
        tier: "HARD",
        operator: OBJECTIVE_OPERATORS.STREAK,
        threshold: 20,
        prizeValue: 30,
        isComplete: false,
      }
      const snapshot = createBaseSnapshot({ streak: 15 })
      const progress = calculateProgress(objective, snapshot, minimalConfig)

      expect(progress).toEqual({
        objectiveId: 4,
        currentValue: 15,
        threshold: 20,
        percentage: 75,
      })
    })

    test("should cap percentage at 100", () => {
      const objective: Objective = {
        id: 5,
        tier: "EASY",
        operator: OBJECTIVE_OPERATORS.SCORE,
        threshold: 50,
        prizeValue: 10,
        isComplete: false,
      }
      const snapshot = createBaseSnapshot({ score: 150 })
      const progress = calculateProgress(objective, snapshot, minimalConfig)

      expect(progress.percentage).toBe(100)
    })
  })

  describe("calculateProgress - custom operators", () => {
    const config: GameModuleConfig = {
      version: "1.0.0",
      objectiveDefinitions: [],
      getProgressValue: (operator, snapshot) => {
        if (operator === "APPLE") return snapshot.applesEaten ?? null
        if (operator === "POTION") return snapshot.potionsEaten ?? null
        return null
      },
    }

    test("should calculate custom APPLE progress", () => {
      const objective: Objective = {
        id: 5,
        tier: "EASY",
        operator: "APPLE",
        threshold: 10,
        prizeValue: 10,
        isComplete: false,
      }
      const snapshot = createBaseSnapshot()
      ;(snapshot as any).applesEaten = 7
      const progress = calculateProgress(objective, snapshot, config)

      expect(progress).toEqual({
        objectiveId: 5,
        currentValue: 7,
        threshold: 10,
        percentage: 70,
      })
    })

    test("should calculate custom POTION progress", () => {
      const objective: Objective = {
        id: 6,
        tier: "MEDIUM",
        operator: "POTION",
        threshold: 5,
        prizeValue: 15,
        isComplete: false,
      }
      const snapshot = createBaseSnapshot()
      ;(snapshot as any).potionsEaten = 3
      const progress = calculateProgress(objective, snapshot, config)

      expect(progress).toEqual({
        objectiveId: 6,
        currentValue: 3,
        threshold: 5,
        percentage: 60,
      })
    })

    test("should fallback to lowercase property for unknown operators", () => {
      const objective: Objective = {
        id: 7,
        tier: "EASY",
        operator: "CUSTOM",
        threshold: 10,
        prizeValue: 5,
        isComplete: false,
      }
      const snapshot = createBaseSnapshot()
      ;(snapshot as any).custom = 4
      const progress = calculateProgress(objective, snapshot, config)

      expect(progress.currentValue).toBe(4)
    })

    test("should fallback to lowercase property when getProgressValue not registered", () => {
      const simpleConfig: GameModuleConfig = {
        version: "1.0.0",
        objectiveDefinitions: [],
      }

      const objective: Objective = {
        id: 8,
        tier: "EASY",
        operator: "GEMS",
        threshold: 15,
        prizeValue: 10,
        isComplete: false,
      }
      const snapshot = createBaseSnapshot()
      ;(snapshot as any).gems = 12
      const progress = calculateProgress(objective, snapshot, simpleConfig)

      expect(progress).toEqual({
        objectiveId: 8,
        currentValue: 12,
        threshold: 15,
        percentage: 80,
      })
    })

    test("should return 0 for unknown operator without matching snapshot property", () => {
      const simpleConfig: GameModuleConfig = {
        version: "1.0.0",
        objectiveDefinitions: [],
      }

      const objective: Objective = {
        id: 9,
        tier: "EASY",
        operator: "UNKNOWN_OP",
        threshold: 10,
        prizeValue: 5,
        isComplete: false,
      }
      const snapshot = createBaseSnapshot()
      const progress = calculateProgress(objective, snapshot, simpleConfig)

      expect(progress.currentValue).toBe(0)
      expect(progress.percentage).toBe(0)
    })
  })

  describe("formatProgress", () => {
    test("should format progress as fraction", () => {
      const progress = {
        objectiveId: 1,
        currentValue: 50,
        threshold: 100,
        percentage: 50,
      }
      expect(formatProgress(progress)).toBe("50/100")
    })
  })
})
