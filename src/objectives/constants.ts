import type { OperatorMetadata } from "./types"

export const CORE_OBJECTIVE_METADATA: Record<string, OperatorMetadata> = {
  SCORE: {
    name: "Score",
    icon: "🎯",
    description: (threshold: number) => `Reach a score of ${threshold}`,
  },
  SURVIVE: {
    name: "Survival",
    icon: "💪",
    description: (threshold: number) => `Survive for ${threshold} seconds`,
  },
  COMBO: {
    name: "Combo",
    icon: "🔥",
    description: (threshold: number) =>
      `Achieve ${threshold} combo${threshold > 1 ? "s" : ""}`,
  },
  STREAK: {
    name: "Streak",
    icon: "⚡",
    description: (threshold: number) => `Reach ${threshold} streak`,
  },
}
