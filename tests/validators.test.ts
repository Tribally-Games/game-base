import { describe, expect, test } from "bun:test"
import { GameState } from "@clockwork-engine/core"
import { OBJECTIVE_OPERATORS } from "../src/constants"
import type { GameModuleConfig } from "../src/createGameModule"
import type { BaseGameSnapshot, Objective } from "../src/objectives/types"
import {
  validateCoreObjective,
  validateObjective,
} from "../src/objectives/validators"

describe("Objective Validators", () => {
  const createBaseSnapshot = (
    overrides?: Partial<BaseGameSnapshot>,
  ): BaseGameSnapshot => ({
    state: GameState.PLAYING,
    score: 100,
    survivedSeconds: 30,
    combos: 5,
    streak: 3,
    ...overrides,
  })

  describe("validateCoreObjective", () => {
    test("should validate SCORE objective", () => {
      const objective: Objective = {
        id: 1,
        tier: "EASY",
        operator: OBJECTIVE_OPERATORS.SCORE,
        threshold: 50,
        prizeValue: 10,
        isComplete: false,
      }
      const snapshot = createBaseSnapshot({ score: 100 })
      expect(validateCoreObjective(objective, snapshot)).toBe(true)
    })

    test("should fail SCORE objective when below threshold", () => {
      const objective: Objective = {
        id: 1,
        tier: "EASY",
        operator: OBJECTIVE_OPERATORS.SCORE,
        threshold: 150,
        prizeValue: 10,
        isComplete: false,
      }
      const snapshot = createBaseSnapshot({ score: 100 })
      expect(validateCoreObjective(objective, snapshot)).toBe(false)
    })

    test("should validate SURVIVE objective", () => {
      const objective: Objective = {
        id: 2,
        tier: "MEDIUM",
        operator: OBJECTIVE_OPERATORS.SURVIVE,
        threshold: 20,
        prizeValue: 20,
        isComplete: false,
      }
      const snapshot = createBaseSnapshot({ survivedSeconds: 30 })
      expect(validateCoreObjective(objective, snapshot)).toBe(true)
    })

    test("should validate COMBO objective", () => {
      const objective: Objective = {
        id: 3,
        tier: "MEDIUM",
        operator: OBJECTIVE_OPERATORS.COMBO,
        threshold: 3,
        prizeValue: 15,
        isComplete: false,
      }
      const snapshot = createBaseSnapshot({ combos: 5 })
      expect(validateCoreObjective(objective, snapshot)).toBe(true)
    })

    test("should validate STREAK objective", () => {
      const objective: Objective = {
        id: 4,
        tier: "HARD",
        operator: OBJECTIVE_OPERATORS.STREAK,
        threshold: 2,
        prizeValue: 30,
        isComplete: false,
      }
      const snapshot = createBaseSnapshot({ streak: 3 })
      expect(validateCoreObjective(objective, snapshot)).toBe(true)
    })

    test("should return false for unknown operators", () => {
      const objective: Objective = {
        id: 5,
        tier: "EASY",
        operator: "UNKNOWN",
        threshold: 10,
        prizeValue: 5,
        isComplete: false,
      }
      const snapshot = createBaseSnapshot()
      expect(validateCoreObjective(objective, snapshot)).toBe(false)
    })
  })

  describe("validateObjective with custom operators", () => {
    const config: GameModuleConfig = {
      version: "1.0.0",
      objectiveDefinitions: [],
      validateCustomObjective: (objective, snapshot) => {
        if (objective.operator === "APPLE") {
          return (snapshot.applesEaten || 0) >= objective.threshold
        }
        if (objective.operator === "POTION") {
          return (snapshot.potionsEaten || 0) >= objective.threshold
        }
        return false
      },
    }

    test("should validate core operators", () => {
      const objective: Objective = {
        id: 1,
        tier: "EASY",
        operator: OBJECTIVE_OPERATORS.SCORE,
        threshold: 50,
        prizeValue: 10,
        isComplete: false,
      }
      const snapshot = createBaseSnapshot({ score: 100 })
      expect(validateObjective(objective, snapshot, config)).toBe(true)
    })

    test("should validate custom APPLE operator", () => {
      const objective: Objective = {
        id: 6,
        tier: "EASY",
        operator: "APPLE",
        threshold: 5,
        prizeValue: 10,
        isComplete: false,
      }
      const snapshot = createBaseSnapshot()
      ;(snapshot as any).applesEaten = 10
      expect(validateObjective(objective, snapshot, config)).toBe(true)
    })

    test("should fail custom APPLE operator when below threshold", () => {
      const objective: Objective = {
        id: 6,
        tier: "EASY",
        operator: "APPLE",
        threshold: 15,
        prizeValue: 10,
        isComplete: false,
      }
      const snapshot = createBaseSnapshot()
      ;(snapshot as any).applesEaten = 10
      expect(validateObjective(objective, snapshot, config)).toBe(false)
    })

    test("should validate custom POTION operator", () => {
      const objective: Objective = {
        id: 7,
        tier: "MEDIUM",
        operator: "POTION",
        threshold: 3,
        prizeValue: 15,
        isComplete: false,
      }
      const snapshot = createBaseSnapshot()
      ;(snapshot as any).potionsEaten = 5
      expect(validateObjective(objective, snapshot, config)).toBe(true)
    })

    test("should return false for unknown custom operator", () => {
      const objective: Objective = {
        id: 8,
        tier: "EASY",
        operator: "UNKNOWN",
        threshold: 10,
        prizeValue: 5,
        isComplete: false,
      }
      const snapshot = createBaseSnapshot()
      expect(validateObjective(objective, snapshot, config)).toBe(false)
    })
  })

  describe("validateObjective without custom validator", () => {
    const config: GameModuleConfig = {
      version: "1.0.0",
      objectiveDefinitions: [],
    }

    test("should validate core operators", () => {
      const objective: Objective = {
        id: 1,
        tier: "EASY",
        operator: OBJECTIVE_OPERATORS.SCORE,
        threshold: 50,
        prizeValue: 10,
        isComplete: false,
      }
      const snapshot = createBaseSnapshot({ score: 100 })
      expect(validateObjective(objective, snapshot, config)).toBe(true)
    })

    test("should return false for custom operators when validateCustomObjective not provided", () => {
      const objective: Objective = {
        id: 9,
        tier: "EASY",
        operator: "DIAMOND",
        threshold: 5,
        prizeValue: 15,
        isComplete: false,
      }
      const snapshot = createBaseSnapshot()
      ;(snapshot as any).diamonds = 10

      expect(validateObjective(objective, snapshot, config)).toBe(false)
    })
  })
})
