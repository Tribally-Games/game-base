import { GameState } from "@hiddentao/clockwork-engine"
import type { GameEngine } from "@hiddentao/clockwork-engine"
import { useState } from "react"

export enum GameLifecycleState {
  CONFIGURING = "CONFIGURING",
  INITIALIZING = "INITIALIZING",
  READY = "READY",
  ERROR = "ERROR",
}

export interface GameLifecycleHook {
  lifecycleState: GameLifecycleState
  error: Error | null
  initializeGame: (engine: GameEngine, config: any) => Promise<void>
}

export function useGameLifecycle(): GameLifecycleHook {
  const [lifecycleState, setLifecycleState] = useState<GameLifecycleState>(
    GameLifecycleState.CONFIGURING,
  )
  const [error, setError] = useState<Error | null>(null)

  const initializeGame = async (engine: GameEngine, config: any) => {
    try {
      setLifecycleState(GameLifecycleState.INITIALIZING)
      setError(null)

      await engine.reset(config)

      const state = engine.getState()
      if (state === GameState.READY || state === GameState.PLAYING) {
        setLifecycleState(GameLifecycleState.READY)
      } else {
        throw new Error(`Unexpected game state after reset: ${state}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)))
      setLifecycleState(GameLifecycleState.ERROR)
    }
  }

  return {
    lifecycleState,
    error,
    initializeGame,
  }
}
