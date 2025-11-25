import type { GameEngine } from "@hiddentao/clockwork-engine"
import { GameState } from "@hiddentao/clockwork-engine"
import {
  bindKey,
  bindKeyCombo,
  unbindKey,
  unbindKeyCombo,
} from "@rwh/keystrokes"
import { type GameInputMapping, GameInputType, GameIntent } from "../types"

export interface KeystrokesInputManagerOptions {
  engine: GameEngine | null
  inputMapping: GameInputMapping
  isReplaying?: boolean
  onPauseResume?: (key: string) => void | undefined
  onReset?: (() => void) | undefined
}

export class KeystrokesInputManager {
  private engine: GameEngine | null
  private inputMapping: GameInputMapping
  private isReplaying: boolean
  private onPauseResume?: ((key: string) => void) | undefined
  private onReset?: (() => void) | undefined
  private boundHandlers: Map<string, any> = new Map()

  constructor(options: KeystrokesInputManagerOptions) {
    this.engine = options.engine
    this.inputMapping = options.inputMapping
    this.isReplaying = options.isReplaying || false
    this.onPauseResume = options.onPauseResume
    this.onReset = options.onReset
  }

  bind(): void {
    this.unbind()

    this.bindResetHandler()
    this.bindPauseHandler()

    // Bind configured game inputs - combine handlers per key to avoid conflicts
    const keyHandlers = new Map<string, any>()
    const keyComboHandlers: Array<{
      keyCombo: string
      handler: any
      intent: GameIntent
      event: string
    }> = []

    for (const [intent, entry] of Object.entries(this.inputMapping)) {
      if (entry) {
        const gameIntent = intent as GameIntent
        const configArray = Array.isArray(entry.keys)
          ? entry.keys
          : [entry.keys]

        for (const config of configArray) {
          if (config) {
            if (config.type === "single") {
              const key = config.key

              if (!keyHandlers.has(key)) {
                keyHandlers.set(key, {})
              }

              const handlerObj = keyHandlers.get(key)
              const handler = this.createIntentHandler(gameIntent)

              handlerObj[config.event] = handler
            } else if (config.type === "combo") {
              const handler = this.createIntentHandler(gameIntent)
              const event = config.event || "onPressed"
              const handlerObj = {
                [event]: handler,
              }

              keyComboHandlers.push({
                keyCombo: config.keyCombo,
                handler: handlerObj,
                intent: gameIntent,
                event,
              })
            }
          }
        }
      }
    }

    // Bind combined single key handlers
    for (const [key, handlerObj] of keyHandlers) {
      bindKey(key, handlerObj)
      this.boundHandlers.set(`combined:${key}`, handlerObj)
    }

    // Bind key combo handlers
    for (const { keyCombo, handler, intent, event } of keyComboHandlers) {
      bindKeyCombo(keyCombo, handler)
      this.boundHandlers.set(`${intent}:combo:${keyCombo}:${event}`, handler)
    }
  }

  unbind(): void {
    // Unbind all registered handlers
    for (const [key, handler] of this.boundHandlers) {
      if (key.includes(":combo:")) {
        const keyCombo = key.split(":combo:")[1]
        if (keyCombo) {
          unbindKeyCombo(keyCombo, handler)
        }
      } else {
        const keyName = key.split(":")[1]
        if (keyName) {
          unbindKey(keyName, handler)
        }
      }
    }
    this.boundHandlers.clear()
  }

  private createIntentHandler(intent: GameIntent) {
    return (event: any) => {
      if (!this.engine) {
        return
      }

      // Prevent default for handled events
      if (event.originalEvent) {
        event.originalEvent.preventDefault()
      }

      // Don't process input during replays
      if (this.isReplaying) {
        return
      }

      const state = this.engine.getState()

      if (
        state !== GameState.PLAYING &&
        state !== GameState.PAUSED &&
        state !== GameState.READY
      ) {
        return
      }

      // Start game if in ready state
      if (state === GameState.READY) {
        this.engine.start()
      }

      // Queue the input
      const eventManager = this.engine.getEventManager()
      const eventSource = eventManager.getSource() as any

      if (typeof eventSource?.queueInput === "function") {
        eventSource.queueInput(GameInputType.INTENT, {
          intent,
        })
      }
    }
  }

  private createResetHandler() {
    return {
      onPressed: (event: any) => {
        // Only reset with R key without modifier keys
        const originalEvent = event.originalEvent as KeyboardEvent
        if (
          originalEvent &&
          (originalEvent.ctrlKey ||
            originalEvent.metaKey ||
            originalEvent.shiftKey ||
            originalEvent.altKey)
        ) {
          return
        }

        if (event.originalEvent) {
          event.originalEvent.preventDefault()
        }

        this.onReset?.()
      },
    }
  }

  private createPauseHandler() {
    return {
      onPressed: (event: any) => {
        if (event.originalEvent) {
          event.originalEvent.preventDefault()
        }

        this.onPauseResume?.("pause")
      },
    }
  }

  updateEngine(engine: GameEngine | null): void {
    this.engine = engine
  }

  updateInputMapping(inputMapping: GameInputMapping): void {
    const hasChanged =
      JSON.stringify(this.inputMapping) !== JSON.stringify(inputMapping)

    if (!hasChanged) {
      return
    }

    this.inputMapping = inputMapping
    this.bind() // Re-bind with new mapping
  }

  updateIsReplaying(isReplaying: boolean): void {
    this.isReplaying = isReplaying
  }

  updateOnReset(onReset: (() => void) | undefined): void {
    if (onReset === this.onReset) {
      return
    }
    this.onReset = onReset
  }

  updateOnPauseResume(
    onPauseResume: ((key: string) => void) | undefined,
  ): void {
    if (onPauseResume === this.onPauseResume) {
      return
    }
    this.onPauseResume = onPauseResume
  }

  bindResetHandler(): void {
    if (this.onReset) {
      const existingHandler = this.boundHandlers.get("pause:space")
      if (existingHandler) {
        unbindKey(" ", existingHandler)
      }
      const resetHandler = this.createResetHandler()
      bindKey("r", resetHandler)
      this.boundHandlers.set("reset:r", resetHandler)
    }
  }

  bindPauseHandler(): void {
    if (this.onPauseResume) {
      const existingHandler = this.boundHandlers.get("pause:p")
      if (existingHandler) {
        unbindKey("p", existingHandler)
      }
      const pauseHandler = this.createPauseHandler()
      bindKey("p", pauseHandler)
      this.boundHandlers.set("pause:p", pauseHandler)
    }
  }
}
