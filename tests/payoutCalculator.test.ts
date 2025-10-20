import { describe, expect, test } from "bun:test"
import { GameState } from "@hiddentao/clockwork-engine"
import { OBJECTIVE_TIERS } from "../src/constants"
import type { GameModuleConfig } from "../src/createGameModule"
import type { BaseGameSnapshot, Objective } from "../src/objectives/types"
import { calculateActualPayouts } from "../src/objectives/payoutCalculator"

describe("Payout Calculator", () => {
  const minimalConfig: GameModuleConfig = {
    version: "1.0.0",
    objectiveDefinitions: [],
  }

  const createBaseSnapshot = (overrides?: Partial<BaseGameSnapshot>): BaseGameSnapshot => ({
    state: GameState.ENDED,
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

  const coreObjectives: Objective[] = [
    {
      id: 1,
      tier: OBJECTIVE_TIERS.EASY,
      operator: "SCORE",
      threshold: 50,
      prizeValue: 10,
      isComplete: false,
    },
    {
      id: 2,
      tier: OBJECTIVE_TIERS.MEDIUM,
      operator: "SCORE",
      threshold: 150,
      prizeValue: 25,
      isComplete: false,
    },
    {
      id: 3,
      tier: OBJECTIVE_TIERS.HARD,
      operator: "SURVIVE",
      threshold: 60,
      prizeValue: 50,
      isComplete: false,
    },
  ]

  describe("Core objectives validation", () => {
    test("should calculate payouts for completed core objectives", () => {
      const snapshot = createBaseSnapshot({ score: 100, survivedSeconds: 30 })
      const result = calculateActualPayouts(
        coreObjectives,
        [],
        snapshot,
        0,
        false,
        null,
        minimalConfig,
      )

      expect(result.actualInstantWinReturn).toBe(10)
      expect(result.actualHighSkillReturn).toBe(0)
      expect(result.actualJackpotReturn).toBe(0)
    })

    test("should not pay for uncompleted objectives", () => {
      const snapshot = createBaseSnapshot({ score: 40, survivedSeconds: 20 })
      const result = calculateActualPayouts(
        coreObjectives,
        [],
        snapshot,
        0,
        false,
        null,
        minimalConfig,
      )

      expect(result.actualInstantWinReturn).toBe(0)
      expect(result.actualHighSkillReturn).toBe(0)
    })

    test("should use completedObjectiveIds for pre-validated objectives", () => {
      const snapshot = createBaseSnapshot({ score: 40 })
      const result = calculateActualPayouts(
        coreObjectives,
        [1],
        snapshot,
        0,
        false,
        null,
        minimalConfig,
      )

      expect(result.actualInstantWinReturn).toBe(10)
    })

    test("should separate EASY/MEDIUM and HARD tier payouts", () => {
      const snapshot = createBaseSnapshot({ score: 200, survivedSeconds: 65 })
      const result = calculateActualPayouts(
        coreObjectives,
        [],
        snapshot,
        0,
        false,
        null,
        minimalConfig,
      )

      expect(result.actualInstantWinReturn).toBe(35)
      expect(result.actualHighSkillReturn).toBe(50)
    })
  })

  describe("Custom objectives validation", () => {
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

    test("should validate custom objectives", () => {
      const customObjectives: Objective[] = [
        {
          id: 4,
          tier: OBJECTIVE_TIERS.EASY,
          operator: "APPLE",
          threshold: 5,
          prizeValue: 15,
          isComplete: false,
        },
        {
          id: 5,
          tier: OBJECTIVE_TIERS.MEDIUM,
          operator: "POTION",
          threshold: 3,
          prizeValue: 20,
          isComplete: false,
        },
      ]

      const snapshot = createBaseSnapshot()
      ;(snapshot as any).applesEaten = 10
      ;(snapshot as any).potionsEaten = 5

      const result = calculateActualPayouts(
        customObjectives,
        [],
        snapshot,
        0,
        false,
        null,
        config,
      )

      expect(result.actualInstantWinReturn).toBe(35)
    })

    test("should handle mix of core and custom objectives", () => {
      const mixedObjectives: Objective[] = [
        ...coreObjectives,
        {
          id: 4,
          tier: OBJECTIVE_TIERS.EASY,
          operator: "APPLE",
          threshold: 5,
          prizeValue: 12,
          isComplete: false,
        },
      ]

      const snapshot = createBaseSnapshot({ score: 100 })
      ;(snapshot as any).applesEaten = 8

      const result = calculateActualPayouts(
        mixedObjectives,
        [],
        snapshot,
        0,
        false,
        null,
        config,
      )

      expect(result.actualInstantWinReturn).toBe(22)
    })

    test("should not pay for uncompleted custom objectives", () => {
      const customObjectives: Objective[] = [
        {
          id: 4,
          tier: OBJECTIVE_TIERS.EASY,
          operator: "APPLE",
          threshold: 10,
          prizeValue: 15,
          isComplete: false,
        },
      ]

      const snapshot = createBaseSnapshot()
      ;(snapshot as any).applesEaten = 5

      const result = calculateActualPayouts(
        customObjectives,
        [],
        snapshot,
        0,
        false,
        null,
        config,
      )

      expect(result.actualInstantWinReturn).toBe(0)
    })
  })

  describe("Jackpot payouts", () => {
    test("should pay jackpot when all conditions met", () => {
      const snapshot = createBaseSnapshot({
        jackpotTokensCollected: 3,
        jackpotEligible: true,
        jackpotTier: "RARE",
        potentialJackpotReturn: 1000,
        jackpotWon: true,
      })

      const result = calculateActualPayouts(
        [],
        [],
        snapshot,
        1000,
        true,
        "RARE",
        minimalConfig,
      )

      expect(result.actualJackpotReturn).toBe(1000)
    })

    test("should not pay jackpot if token not collected", () => {
      const snapshot = createBaseSnapshot()
      const result = calculateActualPayouts(
        [],
        [],
        snapshot,
        1000,
        false,
        "RARE",
        minimalConfig,
      )

      expect(result.actualJackpotReturn).toBe(0)
    })

    test("should not pay jackpot if tier is null", () => {
      const snapshot = createBaseSnapshot()
      const result = calculateActualPayouts(
        [],
        [],
        snapshot,
        1000,
        true,
        null,
        minimalConfig,
      )

      expect(result.actualJackpotReturn).toBe(0)
    })

    test("should not pay jackpot if return is zero", () => {
      const snapshot = createBaseSnapshot()
      const result = calculateActualPayouts(
        [],
        [],
        snapshot,
        0,
        true,
        "RARE",
        minimalConfig,
      )

      expect(result.actualJackpotReturn).toBe(0)
    })
  })

  describe("Edge cases", () => {
    test("should handle null snapshot", () => {
      const result = calculateActualPayouts(
        coreObjectives,
        [],
        null,
        0,
        false,
        null,
        minimalConfig,
      )

      expect(result.actualInstantWinReturn).toBe(0)
      expect(result.actualHighSkillReturn).toBe(0)
      expect(result.actualJackpotReturn).toBe(0)
    })

    test("should skip objectives with missing fields", () => {
      const invalidObjectives: Objective[] = [
        {
          id: 1,
          tier: "" as any,
          operator: "SCORE",
          threshold: 50,
          prizeValue: 10,
          isComplete: false,
        },
        {
          id: 2,
          tier: OBJECTIVE_TIERS.EASY,
          operator: "",
          threshold: 50,
          prizeValue: 10,
          isComplete: false,
        },
      ]

      const snapshot = createBaseSnapshot({ score: 100 })
      const result = calculateActualPayouts(
        invalidObjectives,
        [],
        snapshot,
        0,
        false,
        null,
        minimalConfig,
      )

      expect(result.actualInstantWinReturn).toBe(0)
    })

    test("should handle empty objectives array", () => {
      const snapshot = createBaseSnapshot()
      const result = calculateActualPayouts(
        [],
        [],
        snapshot,
        0,
        false,
        null,
        minimalConfig,
      )

      expect(result.actualInstantWinReturn).toBe(0)
      expect(result.actualHighSkillReturn).toBe(0)
    })
  })
})
