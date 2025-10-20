import { OBJECTIVE_OPERATORS } from "../constants"
import { getRegisteredConfig } from "../gameModuleRegistry"
import { CORE_OBJECTIVE_METADATA } from "./constants"
import type { Objective, ObjectiveProgress } from "./types"

export function formatObjectiveDescription(
  objective: Objective,
): string {
  const coreMetadata = CORE_OBJECTIVE_METADATA[objective.operator]
  if (coreMetadata) {
    return coreMetadata.description(objective.threshold)
  }

  const config = getRegisteredConfig()
  const customMetadata = config?.operatorMetadata?.[objective.operator]
  if (customMetadata) {
    return customMetadata.description(objective.threshold)
  }

  return `${objective.operator} ${objective.threshold}+`
}

export function getObjectiveIcon(operator: string): string {
  const coreMetadata = CORE_OBJECTIVE_METADATA[operator]
  if (coreMetadata) {
    return coreMetadata.icon
  }

  const config = getRegisteredConfig()
  const customMetadata = config?.operatorMetadata?.[operator]
  if (customMetadata) {
    return customMetadata.icon
  }

  return "❓"
}

export function formatProgress(progress: ObjectiveProgress): string {
  return `${progress.currentValue}/${progress.threshold}`
}

export function calculateProgress(
  objective: Objective,
  snapshot: any,
): ObjectiveProgress {
  let currentValue = 0

  switch (objective.operator) {
    case OBJECTIVE_OPERATORS.SCORE:
      currentValue = snapshot.score || 0
      break
    case OBJECTIVE_OPERATORS.SURVIVE:
      currentValue = snapshot.survivedSeconds || 0
      break
    case OBJECTIVE_OPERATORS.COMBO:
      currentValue = snapshot.combos || 0
      break
    case OBJECTIVE_OPERATORS.STREAK:
      currentValue = snapshot.streak || 0
      break
    default: {
      const config = getRegisteredConfig()
      if (config?.getProgressValue) {
        const value = config.getProgressValue(objective.operator, snapshot)
        if (value !== null) {
          currentValue = value
          break
        }
      }
      currentValue = snapshot[objective.operator.toLowerCase()] || 0
    }
  }

  return {
    objectiveId: objective.id,
    currentValue,
    threshold: objective.threshold,
    percentage: Math.min(100, (currentValue / objective.threshold) * 100),
  }
}
