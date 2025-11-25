import { describe, expect, test } from "bun:test"
import { getInputInstructions } from "../../src/input/getInputInstructions"
import { GameIntent, type GameInputMapping } from "../../src/types"

describe("getInputInstructions", () => {
  test("should generate instructions for intents with displayText", () => {
    const inputMapping: GameInputMapping = {
      [GameIntent.UP]: {
        keys: { type: 'single', key: 'w', event: 'onPressed' },
        displayText: 'Move Up'
      },
      [GameIntent.LEFT]: {
        keys: { type: 'single', key: 'a', event: 'onPressed' },
        displayText: 'Move Left'
      },
    }

    const instructions = getInputInstructions(inputMapping)
    
    expect(instructions).toContain('W = Move Up')
    expect(instructions).toContain('A = Move Left')
    expect(instructions).toContain('P = Pause/Resume')
    expect(instructions).toContain('R = Reset')
  })

  test("should skip intents with empty displayText", () => {
    const inputMapping: GameInputMapping = {
      [GameIntent.UP]: {
        keys: { type: 'single', key: 'w', event: 'onPressed' },
        displayText: 'Move Up'
      },
      [GameIntent.STOP_MOVING_LEFT]: {
        keys: { type: 'single', key: 'a', event: 'onReleased' },
        displayText: ''  // Empty text - should be hidden
      },
    }

    const instructions = getInputInstructions(inputMapping)
    
    expect(instructions).toContain('W = Move Up')
    expect(instructions.some(inst => inst.includes('STOP_MOVING_LEFT'))).toBe(false)
    expect(instructions.some(inst => inst.includes('Stop Moving Left'))).toBe(false)
  })

  test("should skip intents without displayText", () => {
    const inputMapping: GameInputMapping = {
      [GameIntent.UP]: {
        keys: { type: 'single', key: 'w', event: 'onPressed' },
        displayText: 'Move Up'
      },
      [GameIntent.ACTION]: {
        keys: { type: 'single', key: 'space', event: 'onPressed' },
        // No displayText
      },
    }

    const instructions = getInputInstructions(inputMapping)
    
    expect(instructions).toContain('W = Move Up')
    expect(instructions.some(inst => inst.includes('Action'))).toBe(false)
  })

  test("should format multiple keys correctly", () => {
    const inputMapping: GameInputMapping = {
      [GameIntent.UP]: {
        keys: [
          { type: 'single', key: 'w', event: 'onPressed' },
          { type: 'single', key: 'ArrowUp', event: 'onPressed' }
        ],
        displayText: 'Move Up'
      },
    }

    const instructions = getInputInstructions(inputMapping)
    expect(instructions).toContain('W/↑ = Move Up')
  })

  test("should format key combos correctly", () => {
    const inputMapping: GameInputMapping = {
      [GameIntent.ACTION]: {
        keys: { type: 'combo', keyCombo: 'ctrl + space' },
        displayText: 'Special Action'
      },
    }

    const instructions = getInputInstructions(inputMapping)
    expect(instructions).toContain('CTRL+Space = Special Action')
  })
})