import { describe, expect, test, beforeEach } from "bun:test"
import {
  registerGameModule,
  getRegisteredConfig,
} from "../src/gameModuleRegistry"
import type { GameModuleConfig } from "../src/createGameModule"

describe("Game Module Registry", () => {
  const mockConfig: GameModuleConfig = {
    version: "1.0.0",
    customOperators: ["APPLE", "POTION"],
    objectiveDefinitions: [
      { tier: "EASY", operator: "APPLE", threshold: 5 },
    ],
    operatorMetadata: {
      APPLE: {
        name: "Apples",
        icon: "🍎",
        description: (threshold: number) => `Eat ${threshold} apples`,
      },
    },
    validateCustomObjective: (objective, snapshot) =>
      snapshot.applesEaten >= objective.threshold,
    getProgressValue: (operator, snapshot) =>
      operator === "APPLE" ? snapshot.applesEaten : null,
  }

  beforeEach(() => {
    registerGameModule(mockConfig)
  })

  test("should register and retrieve config", () => {
    const config = getRegisteredConfig()
    expect(config).toEqual(mockConfig)
  })

  test("should retrieve custom operators", () => {
    const config = getRegisteredConfig()
    expect(config?.customOperators).toEqual(["APPLE", "POTION"])
  })

  test("should retrieve operator metadata", () => {
    const config = getRegisteredConfig()
    expect(config?.operatorMetadata?.APPLE).toBeDefined()
    expect(config?.operatorMetadata?.APPLE.icon).toBe("🍎")
    expect(config?.operatorMetadata?.APPLE.description(5)).toBe("Eat 5 apples")
  })

  test("should retrieve validation function", () => {
    const config = getRegisteredConfig()
    expect(config?.validateCustomObjective).toBeDefined()
    const isValid = config?.validateCustomObjective?.(
      { operator: "APPLE", threshold: 5 },
      { applesEaten: 10 },
    )
    expect(isValid).toBe(true)
  })

  test("should retrieve progress value function", () => {
    const config = getRegisteredConfig()
    expect(config?.getProgressValue).toBeDefined()
    const value = config?.getProgressValue?.(
      "APPLE",
      { applesEaten: 7 },
    )
    expect(value).toBe(7)
  })
})
