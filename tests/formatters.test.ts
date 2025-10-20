import { describe, expect, test, beforeEach } from "bun:test"
import { GameState } from "@hiddentao/clockwork-engine"
import { OBJECTIVE_OPERATORS } from "../src/constants"
import { registerGameModule } from "../src/gameModuleRegistry"
import type { BaseGameSnapshot, Objective } from "../src/objectives/types"
import {
  formatObjectiveDescription,
  getObjectiveIcon,
  calculateProgress,
  formatProgress,
} from "../src/objectives/formatters"

describe("Objective Formatters", () => {
  const createBaseSnapshot = (overrides?: Partial<BaseGameSnapshot>): BaseGameSnapshot => ({
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
      expect(formatObjectiveDescription(objective)).toBe("Reach a score of 100")
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
      expect(formatObjectiveDescription(objective)).toBe("Survive for 60 seconds")
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
      expect(formatObjectiveDescription(objective)).toBe("Achieve 5 combos")
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
      expect(formatObjectiveDescription(objective)).toBe("Reach 10 streak")
    })
  })

  describe("formatObjectiveDescription - custom operators", () => {
    beforeEach(() => {
      registerGameModule({
        version: "1.0.0",
        objectiveDefinitions: [],
        operatorMetadata: {
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
        },
      })
    })

    test("should format custom APPLE objective", () => {
      const objective: Objective = {
        id: 5,
        tier: "EASY",
        operator: "APPLE",
        threshold: 5,
        prizeValue: 10,
        isComplete: false,
      }
      expect(formatObjectiveDescription(objective)).toBe("Eat 5 apples")
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
      expect(formatObjectiveDescription(objective)).toBe("Eat 1 apple")
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
      expect(formatObjectiveDescription(objective)).toBe("Collect 3 potions")
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
      expect(formatObjectiveDescription(objective)).toBe("UNKNOWN 10+")
    })
  })

  describe("getObjectiveIcon", () => {
    test("should return core operator icons", () => {
      expect(getObjectiveIcon(OBJECTIVE_OPERATORS.SCORE)).toBe("🎯")
      expect(getObjectiveIcon(OBJECTIVE_OPERATORS.SURVIVE)).toBe("💪")
      expect(getObjectiveIcon(OBJECTIVE_OPERATORS.COMBO)).toBe("🔥")
      expect(getObjectiveIcon(OBJECTIVE_OPERATORS.STREAK)).toBe("⚡")
    })

    test("should return custom operator icons", () => {
      registerGameModule({
        version: "1.0.0",
        objectiveDefinitions: [],
        operatorMetadata: {
          APPLE: {
            name: "Apples",
            icon: "🍎",
            description: (threshold) => `Eat ${threshold} apples`,
          },
        },
      })
      expect(getObjectiveIcon("APPLE")).toBe("🍎")
    })

    test("should return fallback icon for unknown operator", () => {
      expect(getObjectiveIcon("UNKNOWN")).toBe("❓")
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
      const progress = calculateProgress(objective, snapshot)

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
      const progress = calculateProgress(objective, snapshot)

      expect(progress).toEqual({
        objectiveId: 2,
        currentValue: 45,
        threshold: 60,
        percentage: 75,
      })
    })

    test("should cap percentage at 100", () => {
      const objective: Objective = {
        id: 3,
        tier: "EASY",
        operator: OBJECTIVE_OPERATORS.SCORE,
        threshold: 50,
        prizeValue: 10,
        isComplete: false,
      }
      const snapshot = createBaseSnapshot({ score: 150 })
      const progress = calculateProgress(objective, snapshot)

      expect(progress.percentage).toBe(100)
    })
  })

  describe("calculateProgress - custom operators", () => {
    beforeEach(() => {
      registerGameModule({
        version: "1.0.0",
        objectiveDefinitions: [],
        getProgressValue: (operator, snapshot) => {
          if (operator === "APPLE") return snapshot.applesEaten ?? null
          if (operator === "POTION") return snapshot.potionsEaten ?? null
          return null
        },
      })
    })

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
      const progress = calculateProgress(objective, snapshot)

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
      const progress = calculateProgress(objective, snapshot)

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
      const progress = calculateProgress(objective, snapshot)

      expect(progress.currentValue).toBe(4)
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
