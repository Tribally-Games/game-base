import { describe, expect, test } from "bun:test"
import { GameInputType, GameIntent } from "../src/types"

describe("Types - GameInputType", () => {
  test("should have INTENT enum value", () => {
    expect(GameInputType.INTENT).toBe("intent")
  })

  test("should only have one enum value", () => {
    const values = Object.values(GameInputType)
    expect(values).toHaveLength(1)
    expect(values).toContain("intent")
  })
})

describe("Types - GameIntent", () => {
  test("should have UP intent", () => {
    expect(GameIntent.UP).toBe("up")
  })

  test("should have DOWN intent", () => {
    expect(GameIntent.DOWN).toBe("down")
  })

  test("should have LEFT intent", () => {
    expect(GameIntent.LEFT).toBe("left")
  })

  test("should have RIGHT intent", () => {
    expect(GameIntent.RIGHT).toBe("right")
  })

  test("should have CLOCKWISE intent", () => {
    expect(GameIntent.CLOCKWISE).toBe("clockwise")
  })

  test("should have COUNTER_CLOCKWISE intent", () => {
    expect(GameIntent.COUNTER_CLOCKWISE).toBe("counter_clockwise")
  })

  test("should have ACTION intent", () => {
    expect(GameIntent.ACTION).toBe("action")
  })

  test("should have PAUSE intent", () => {
    expect(GameIntent.PAUSE).toBe("pause")
  })

  test("should have RESUME intent", () => {
    expect(GameIntent.RESUME).toBe("resume")
  })

  test("should have START intent", () => {
    expect(GameIntent.START).toBe("start")
  })

  test("should have RESET intent", () => {
    expect(GameIntent.RESET).toBe("reset")
  })

  test("should have exactly 11 enum values", () => {
    const values = Object.values(GameIntent)
    expect(values).toHaveLength(11)
  })

  test("should have all unique string values", () => {
    const values = Object.values(GameIntent)
    const uniqueValues = new Set(values)
    expect(uniqueValues.size).toBe(values.length)
  })
})

describe("Types - Enum key-value consistency", () => {
  test("GameInputType keys should match expected pattern", () => {
    expect(GameInputType).toHaveProperty("INTENT")
  })

  test("GameIntent keys should match expected pattern", () => {
    expect(GameIntent).toHaveProperty("UP")
    expect(GameIntent).toHaveProperty("DOWN")
    expect(GameIntent).toHaveProperty("LEFT")
    expect(GameIntent).toHaveProperty("RIGHT")
    expect(GameIntent).toHaveProperty("CLOCKWISE")
    expect(GameIntent).toHaveProperty("COUNTER_CLOCKWISE")
    expect(GameIntent).toHaveProperty("ACTION")
    expect(GameIntent).toHaveProperty("PAUSE")
    expect(GameIntent).toHaveProperty("RESUME")
    expect(GameIntent).toHaveProperty("START")
    expect(GameIntent).toHaveProperty("RESET")
  })
})
