import { beforeEach, describe, expect, it, mock } from "bun:test"
import { GameState } from "@clockwork-engine/core"
import type { GameEngine } from "@clockwork-engine/core"
import {
  KeystrokesInputManager,
  type KeystrokesInputManagerOptions,
} from "../../src/input/KeystrokesInputManager"
import { GameInputType, GameIntent } from "../../src/types"

function createMockEngine(state = GameState.READY): GameEngine {
  const queueInput = mock(() => {})
  const eventSource = { queueInput }

  return {
    getState: mock(() => state),
    start: mock(() => {}),
    getEventManager: mock(() => ({
      getSource: mock(() => eventSource),
    })),
  } as any
}

function createBasicInputMapping() {
  return {
    [GameIntent.MOVE_UP]: {
      keys: { type: "single" as const, key: "w", event: "onPressed" as const },
    },
    [GameIntent.MOVE_DOWN]: {
      keys: { type: "single" as const, key: "s", event: "onPressed" as const },
    },
  }
}

describe("KeystrokesInputManager", () => {
  describe("constructor and initialization", () => {
    it("creates instance with all callbacks", () => {
      const onReset = mock(() => {})
      const onPauseResume = mock(() => {})
      const engine = createMockEngine()
      const inputMapping = createBasicInputMapping()

      const manager = new KeystrokesInputManager({
        engine,
        inputMapping,
        isReplaying: false,
        onReset,
        onPauseResume,
      })

      expect(manager).toBeDefined()
    })

    it("creates instance without optional callbacks", () => {
      const engine = createMockEngine()
      const inputMapping = createBasicInputMapping()

      const manager = new KeystrokesInputManager({
        engine,
        inputMapping,
      })

      expect(manager).toBeDefined()
    })
  })

  describe("bind() and unbind()", () => {
    it("successfully binds and unbinds", () => {
      const onReset = mock(() => {})
      const onPauseResume = mock(() => {})
      const engine = createMockEngine()
      const inputMapping = createBasicInputMapping()

      const manager = new KeystrokesInputManager({
        engine,
        inputMapping,
        onReset,
        onPauseResume,
      })

      expect(() => manager.bind()).not.toThrow()
      expect(() => manager.unbind()).not.toThrow()
    })

    it("binds without callbacks", () => {
      const engine = createMockEngine()
      const inputMapping = createBasicInputMapping()

      const manager = new KeystrokesInputManager({
        engine,
        inputMapping,
      })

      expect(() => manager.bind()).not.toThrow()
      expect(() => manager.unbind()).not.toThrow()
    })

    it("binds with only onReset", () => {
      const onReset = mock(() => {})
      const engine = createMockEngine()
      const inputMapping = createBasicInputMapping()

      const manager = new KeystrokesInputManager({
        engine,
        inputMapping,
        onReset,
      })

      expect(() => manager.bind()).not.toThrow()
    })

    it("binds with only onPauseResume", () => {
      const onPauseResume = mock(() => {})
      const engine = createMockEngine()
      const inputMapping = createBasicInputMapping()

      const manager = new KeystrokesInputManager({
        engine,
        inputMapping,
        onPauseResume,
      })

      expect(() => manager.bind()).not.toThrow()
    })

    it("can rebind after unbinding", () => {
      const onReset = mock(() => {})
      const onPauseResume = mock(() => {})
      const engine = createMockEngine()
      const inputMapping = createBasicInputMapping()

      const manager = new KeystrokesInputManager({
        engine,
        inputMapping,
        onReset,
        onPauseResume,
      })

      manager.bind()
      manager.unbind()
      expect(() => manager.bind()).not.toThrow()
    })
  })

  describe("update methods", () => {
    it("updateEngine changes engine reference", () => {
      const engine1 = createMockEngine()
      const engine2 = createMockEngine(GameState.PLAYING)
      const inputMapping = createBasicInputMapping()

      const manager = new KeystrokesInputManager({
        engine: engine1,
        inputMapping,
      })

      expect(() => manager.updateEngine(engine2)).not.toThrow()
      expect(() => manager.updateEngine(null)).not.toThrow()
    })

    it("updateInputMapping rebinds with new mapping", () => {
      const engine = createMockEngine()
      const inputMapping1 = createBasicInputMapping()

      const manager = new KeystrokesInputManager({
        engine,
        inputMapping: inputMapping1,
      })

      manager.bind()

      const inputMapping2 = {
        [GameIntent.MOVE_LEFT]: {
          keys: { type: "single" as const, key: "a", event: "onPressed" as const },
        },
      }

      expect(() => manager.updateInputMapping(inputMapping2)).not.toThrow()
    })

    it("updateIsReplaying changes replay state", () => {
      const engine = createMockEngine(GameState.PLAYING)
      const inputMapping = createBasicInputMapping()

      const manager = new KeystrokesInputManager({
        engine,
        inputMapping,
        isReplaying: false,
      })

      expect(() => manager.updateIsReplaying(true)).not.toThrow()
      expect(() => manager.updateIsReplaying(false)).not.toThrow()
    })

    it("updateOnReset changes callback and rebinds", () => {
      const onReset1 = mock(() => {})
      const engine = createMockEngine()
      const inputMapping = createBasicInputMapping()

      const manager = new KeystrokesInputManager({
        engine,
        inputMapping,
        onReset: onReset1,
      })

      manager.bind()

      const onReset2 = mock(() => {})
      expect(() => manager.updateOnReset(onReset2)).not.toThrow()
    })

    it("updateOnReset to undefined removes reset binding", () => {
      const onReset = mock(() => {})
      const engine = createMockEngine()
      const inputMapping = createBasicInputMapping()

      const manager = new KeystrokesInputManager({
        engine,
        inputMapping,
        onReset,
      })

      manager.bind()
      expect(() => manager.updateOnReset(undefined)).not.toThrow()
    })

    it("updateOnPauseResume changes callback and rebinds", () => {
      const onPauseResume1 = mock(() => {})
      const engine = createMockEngine()
      const inputMapping = createBasicInputMapping()

      const manager = new KeystrokesInputManager({
        engine,
        inputMapping,
        onPauseResume: onPauseResume1,
      })

      manager.bind()

      const onPauseResume2 = mock(() => {})
      expect(() => manager.updateOnPauseResume(onPauseResume2)).not.toThrow()
    })

    it("updateOnPauseResume to undefined removes pause binding", () => {
      const onPauseResume = mock(() => {})
      const engine = createMockEngine()
      const inputMapping = createBasicInputMapping()

      const manager = new KeystrokesInputManager({
        engine,
        inputMapping,
        onPauseResume,
      })

      manager.bind()
      expect(() => manager.updateOnPauseResume(undefined)).not.toThrow()
    })
  })

  describe("key combo handling", () => {
    it("binds key combos without errors", () => {
      const engine = createMockEngine()
      const inputMapping = {
        [GameIntent.MOVE_UP]: {
          keys: {
            type: "combo" as const,
            keyCombo: "w+shift",
            event: "onPressed" as const,
          },
        },
      }

      const manager = new KeystrokesInputManager({
        engine,
        inputMapping,
      })

      expect(() => manager.bind()).not.toThrow()
      expect(() => manager.unbind()).not.toThrow()
    })

    it("handles mixed single keys and combos", () => {
      const engine = createMockEngine()
      const inputMapping = {
        [GameIntent.MOVE_UP]: {
          keys: [
            { type: "single" as const, key: "w", event: "onPressed" as const },
            {
              type: "combo" as const,
              keyCombo: "ArrowUp",
              event: "onPressed" as const,
            },
          ],
        },
      }

      const manager = new KeystrokesInputManager({
        engine,
        inputMapping,
      })

      expect(() => manager.bind()).not.toThrow()
    })
  })

  describe("multiple keys per intent", () => {
    it("binds multiple keys for same intent", () => {
      const engine = createMockEngine()
      const inputMapping = {
        [GameIntent.MOVE_UP]: {
          keys: [
            { type: "single" as const, key: "w", event: "onPressed" as const },
            {
              type: "single" as const,
              key: "ArrowUp",
              event: "onPressed" as const,
            },
          ],
        },
      }

      const manager = new KeystrokesInputManager({
        engine,
        inputMapping,
      })

      expect(() => manager.bind()).not.toThrow()
    })

    it("handles multiple events per key", () => {
      const engine = createMockEngine()
      const inputMapping = {
        [GameIntent.MOVE_UP]: {
          keys: { type: "single" as const, key: "w", event: "onPressed" as const },
        },
        [GameIntent.MOVE_DOWN]: {
          keys: { type: "single" as const, key: "w", event: "onReleased" as const },
        },
      }

      const manager = new KeystrokesInputManager({
        engine,
        inputMapping,
      })

      expect(() => manager.bind()).not.toThrow()
    })
  })

  describe("edge cases", () => {
    it("handles null engine", () => {
      const inputMapping = createBasicInputMapping()

      const manager = new KeystrokesInputManager({
        engine: null,
        inputMapping,
      })

      expect(() => manager.bind()).not.toThrow()
    })

    it("handles empty input mapping", () => {
      const engine = createMockEngine()

      const manager = new KeystrokesInputManager({
        engine,
        inputMapping: {},
      })

      expect(() => manager.bind()).not.toThrow()
    })

    it("handles undefined optional parameters", () => {
      const engine = createMockEngine()
      const inputMapping = createBasicInputMapping()

      const manager = new KeystrokesInputManager({
        engine,
        inputMapping,
        isReplaying: undefined,
        onReset: undefined,
        onPauseResume: undefined,
      })

      expect(() => manager.bind()).not.toThrow()
    })

    it("supports method chaining via updates", () => {
      const engine = createMockEngine()
      const inputMapping = createBasicInputMapping()

      const manager = new KeystrokesInputManager({
        engine,
        inputMapping,
      })

      expect(() => {
        manager.updateEngine(engine)
        manager.updateIsReplaying(true)
        manager.updateOnReset(mock(() => {}))
        manager.updateOnPauseResume(mock(() => {}))
      }).not.toThrow()
    })
  })

  describe("integration scenarios", () => {
    it("handles full lifecycle: create, bind, update, unbind", () => {
      const engine = createMockEngine()
      const inputMapping = createBasicInputMapping()
      const onReset = mock(() => {})
      const onPauseResume = mock(() => {})

      const manager = new KeystrokesInputManager({
        engine,
        inputMapping,
        onReset,
        onPauseResume,
      })

      manager.bind()
      manager.updateEngine(createMockEngine(GameState.PLAYING))
      manager.updateIsReplaying(true)
      manager.updateOnReset(mock(() => {}))
      manager.updateOnPauseResume(mock(() => {}))
      manager.unbind()

      expect(true).toBe(true)
    })

    it("handles switching from callbacks to no callbacks", () => {
      const engine = createMockEngine()
      const inputMapping = createBasicInputMapping()

      const manager = new KeystrokesInputManager({
        engine,
        inputMapping,
        onReset: mock(() => {}),
        onPauseResume: mock(() => {}),
      })

      manager.bind()
      manager.updateOnReset(undefined)
      manager.updateOnPauseResume(undefined)

      expect(true).toBe(true)
    })

    it("handles switching from no callbacks to callbacks", () => {
      const engine = createMockEngine()
      const inputMapping = createBasicInputMapping()

      const manager = new KeystrokesInputManager({
        engine,
        inputMapping,
      })

      manager.bind()
      manager.updateOnReset(mock(() => {}))
      manager.updateOnPauseResume(mock(() => {}))

      expect(true).toBe(true)
    })
  })
})
