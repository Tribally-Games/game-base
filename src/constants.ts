/**
 * Objective difficulty tiers
 */
export const OBJECTIVE_TIERS = {
  EASY: "EASY",
  MEDIUM: "MEDIUM",
  HARD: "HARD",
} as const

/**
 * Core objective operators (universal across all games)
 */
export const OBJECTIVE_OPERATORS = {
  SCORE: "SCORE",
  SURVIVE: "SURVIVE",
  COMBO: "COMBO",
  STREAK: "STREAK",
} as const

/**
 * Type helpers for better TypeScript inference
 */
export type ObjectiveTier =
  (typeof OBJECTIVE_TIERS)[keyof typeof OBJECTIVE_TIERS]
export type ObjectiveOperator =
  (typeof OBJECTIVE_OPERATORS)[keyof typeof OBJECTIVE_OPERATORS]
