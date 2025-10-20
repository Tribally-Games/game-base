import { OBJECTIVE_OPERATORS } from "../constants"
import { getRegisteredConfig } from "../gameModuleRegistry"
import type { Objective } from "./types"

export function validateCoreObjective(
  objective: Objective,
  snapshot: any,
): boolean {
  switch (objective.operator) {
    case OBJECTIVE_OPERATORS.SCORE:
      return snapshot.score >= objective.threshold

    case OBJECTIVE_OPERATORS.SURVIVE:
      return (snapshot.survivedSeconds || 0) >= objective.threshold

    case OBJECTIVE_OPERATORS.COMBO:
      return (snapshot.combos || 0) >= objective.threshold

    case OBJECTIVE_OPERATORS.STREAK:
      return (snapshot.streak || 0) >= objective.threshold

    default:
      return false
  }
}

export function validateObjective(
  objective: Objective,
  snapshot: any,
): boolean {
  if (
    Object.values(OBJECTIVE_OPERATORS).includes(objective.operator as any)
  ) {
    return validateCoreObjective(objective, snapshot)
  }

  const config = getRegisteredConfig()
  if (config?.validateCustomObjective) {
    return config.validateCustomObjective(
      {
        operator: objective.operator,
        threshold: objective.threshold,
      },
      snapshot,
    )
  }

  return false
}
