import {
  type GameEngine,
  GameEngineEventType,
  GameState,
  type PlatformLayer,
} from "@clockwork-engine/core"
import { WebPlatformLayer } from "@clockwork-engine/platform-web-pixi"
import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { calculateCanvasSize } from "../hooks/useResponsiveCanvas"
import { useGameModule } from "./GameModuleContext"

export interface GameStateContextValue {
  platform: PlatformLayer | null
  platformContainer: HTMLDivElement | null
  playEngine: GameEngine | null
  replayEngine: GameEngine | null
  activeEngine: GameEngine | null
  gameState: GameState | null
  setActiveEngine: (engine: GameEngine) => void
}

const GameStateContext = createContext<GameStateContextValue | null>(null)

export function GameStateProvider({ children }: { children: ReactNode }) {
  const { GameEngine: GameEngineClass, DemoLoader } = useGameModule()
  const [platform, setPlatform] = useState<PlatformLayer | null>(null)
  const [playEngine, setPlayEngine] = useState<GameEngine | null>(null)
  const [replayEngine, setReplayEngine] = useState<GameEngine | null>(null)
  const [activeEngine, setActiveEngine] = useState<GameEngine | null>(null)
  const [gameState, setGameState] = useState<GameState | null>(null)
  const platformContainerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let mounted = true
    let platformInstance: WebPlatformLayer | null = null
    let playEngineInstance: GameEngine | null = null
    let replayEngineInstance: GameEngine | null = null

    const init = async () => {
      const container = document.createElement("div")
      container.style.width = "100%"
      container.style.height = "100%"
      platformContainerRef.current = container

      const canvasSize = calculateCanvasSize()
      platformInstance = new WebPlatformLayer(container, {
        screenWidth: canvasSize.width,
        screenHeight: canvasSize.height,
        worldWidth: canvasSize.width,
        worldHeight: canvasSize.height,
        backgroundColor: 0x000000,
      })
      await platformInstance.init()

      if (!mounted) return

      const loader = new DemoLoader()
      playEngineInstance = new GameEngineClass({
        loader,
        platform: platformInstance,
      })
      replayEngineInstance = new GameEngineClass({
        loader,
        platform: platformInstance,
      })

      if (!mounted) return

      setPlatform(platformInstance)
      setPlayEngine(playEngineInstance)
      setReplayEngine(replayEngineInstance)
      setActiveEngine(playEngineInstance)
    }

    init()

    return () => {
      mounted = false
      if (playEngineInstance) {
        const playState = playEngineInstance.getState()
        if (playState === GameState.PLAYING || playState === GameState.PAUSED) {
          playEngineInstance.end()
        }
      }
      if (replayEngineInstance) {
        const replayState = replayEngineInstance.getState()
        if (
          replayState === GameState.PLAYING ||
          replayState === GameState.PAUSED
        ) {
          replayEngineInstance.end()
        }
      }
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
      platform,
      platformContainer: platformContainerRef.current,
      playEngine,
      replayEngine,
      activeEngine,
      gameState,
      setActiveEngine,
    }),
    [platform, playEngine, replayEngine, activeEngine, gameState],
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
