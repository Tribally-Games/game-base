import { OBJECTIVE_TIERS } from "../constants"
import type { BaseGameSnapshot, Objective } from "./types"
import { validateObjective } from "./validators"

export interface PayoutCalculationResult {
  actualInstantWinReturn: number
  actualHighSkillReturn: number
  actualJackpotReturn: number
}

/**
 * Calculate actual payouts based on completed objectives
 *
 * Payout distribution by tier:
 * - EASY/MEDIUM objectives → Instant Win return
 * - HARD objectives → High Skill return
 * - Jackpot → Separate logic (token collection + valid tier required)
 */
export function calculateActualPayouts(
  objectives: Objective[],
  completedObjectiveIds: number[],
  gameSnapshot: BaseGameSnapshot | null,
  potentialJackpotReturn: number,
  jackpotTokenCollected = false,
  jackpotTier: string | null = null,
): PayoutCalculationResult {
  let actualInstantWinReturn = 0
  let actualHighSkillReturn = 0
  let actualJackpotReturn = 0

  if (!gameSnapshot) {
    return {
      actualInstantWinReturn,
      actualHighSkillReturn,
      actualJackpotReturn,
    }
  }

  const completedSet = new Set(completedObjectiveIds)

  for (const objective of objectives) {
    if (
      !objective.tier ||
      !objective.operator ||
      objective.threshold === null
    ) {
      continue
    }

    let isCompleted = false

    if (completedSet.has(objective.id)) {
      isCompleted = true
    } else {
      isCompleted = validateObjective(objective, gameSnapshot)
    }

    if (isCompleted) {
      switch (objective.tier) {
        case OBJECTIVE_TIERS.EASY:
        case OBJECTIVE_TIERS.MEDIUM:
          actualInstantWinReturn += objective.prizeValue
          break
        case OBJECTIVE_TIERS.HARD:
          actualHighSkillReturn += objective.prizeValue
          break
      }
    }
  }

  if (jackpotTokenCollected && jackpotTier && potentialJackpotReturn > 0) {
    actualJackpotReturn = potentialJackpotReturn
  }

  return {
    actualInstantWinReturn,
    actualHighSkillReturn,
    actualJackpotReturn,
  }
}
