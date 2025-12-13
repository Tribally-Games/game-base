import type { GameState } from "@clockwork-engine/core"

export interface Objective {
  id: number
  tier: "EASY" | "MEDIUM" | "HARD"
  operator: string
  threshold: number
  prizeValue: number
  isComplete: boolean
}

export interface ObjectiveProgress {
  objectiveId: number
  currentValue: number
  threshold: number
  percentage: number
}

export interface BaseGameSnapshot {
  state: GameState
  score: number
  survivedSeconds?: number
  combos?: number
  streak?: number
  [key: string]: any
}

export interface OperatorMetadata {
  name: string
  icon: string
  description: (threshold: number) => string
}
