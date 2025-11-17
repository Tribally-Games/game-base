import {
  type GameEngine,
  GameEngineEventType,
  GameState,
} from "@hiddentao/clockwork-engine"
import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import { RealAudioManager } from "../../audio"
import { useGameModule } from "./GameModuleContext"

export interface GameStateContextValue {
  playEngine: GameEngine | null
  replayEngine: GameEngine | null
  activeEngine: GameEngine | null
  gameState: GameState | null
  setActiveEngine: (engine: GameEngine) => void
}

const GameStateContext = createContext<GameStateContextValue | null>(null)

export function GameStateProvider({ children }: { children: ReactNode }) {
  const { GameEngine: GameEngineClass, DemoLoader } = useGameModule()
  const [playEngine, setPlayEngine] = useState<GameEngine | null>(null)
  const [replayEngine, setReplayEngine] = useState<GameEngine | null>(null)
  const [activeEngine, setActiveEngine] = useState<GameEngine | null>(null)
  const [gameState, setGameState] = useState<GameState | null>(null)

  useEffect(() => {
    const loader = new DemoLoader()
    const playAudioManager = new RealAudioManager()
    const replayAudioManager = new RealAudioManager()
    const play = new GameEngineClass(loader, playAudioManager)
    const replay = new GameEngineClass(loader, replayAudioManager)

    setPlayEngine(play)
    setReplayEngine(replay)
    setActiveEngine(play)

    return () => {
      const playState = play.getState()
      if (playState === GameState.PLAYING || playState === GameState.PAUSED) {
        play.end()
      }
      playAudioManager.close()

      const replayState = replay.getState()
      if (
        replayState === GameState.PLAYING ||
        replayState === GameState.PAUSED
      ) {
        replay.end()
      }
      replayAudioManager.close()
    }
  }, [GameEngineClass, DemoLoader])

  useEffect(() => {
    if (!activeEngine) return

    setGameState(activeEngine.getState())

    const handleStateChange = (newState: GameState) => {
      setGameState(newState)
    }

    activeEngine.on(GameEngineEventType.STATE_CHANGE, handleStateChange)

    return () => {
      activeEngine.off(GameEngineEventType.STATE_CHANGE, handleStateChange)
    }
  }, [activeEngine])

  const contextValue = useMemo(
    () => ({
      playEngine,
      replayEngine,
      activeEngine,
      gameState,
      setActiveEngine,
    }),
    [playEngine, replayEngine, activeEngine, gameState],
  )

  return (
    <GameStateContext.Provider value={contextValue}>
      {children}
    </GameStateContext.Provider>
  )
}

export function useGameState() {
  const context = useContext(GameStateContext)
  if (!context) {
    throw new Error("useGameState must be used within GameStateProvider")
  }
  return context
}
