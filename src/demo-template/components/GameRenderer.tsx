import {
  type GameCanvasOptions,
  GameEngineEventType,
  GameRecorder,
  type GameRecording,
  GameState,
} from "@hiddentao/clockwork-engine"
import type { GameCanvas, GameEngine } from "@hiddentao/clockwork-engine"
import { GameInputType, GameIntent } from "@tribally.games/game-base"
import { useCallback, useEffect, useRef, useState } from "react"
import { useGameModule } from "../contexts/GameModuleContext"
import { calculateCanvasSize } from "../hooks/useResponsiveCanvas"

export interface GameRendererProps {
  playEngine: GameEngine | null
  activeEngine: GameEngine | null
  gameConfig: any
  isReplaying: boolean
  disableKeyboardInput?: boolean
  onCanvasReady?: (canvas: GameCanvas) => void
  onRecordingStart?: () => void
  onRecordingSave?: (recording: GameRecording) => void
  onKeyboardInput?: (key: string) => void
}

export function GameRenderer({
  playEngine,
  activeEngine,
  gameConfig,
  isReplaying,
  disableKeyboardInput,
  onCanvasReady,
  onRecordingStart,
  onRecordingSave,
  onKeyboardInput,
}: GameRendererProps) {
  const { GameCanvas: GameCanvasClass } = useGameModule()
  const containerRef = useRef<HTMLDivElement>(null)
  const [gameCanvas, setGameCanvas] = useState<GameCanvas | null>(null)
  const [canvasSize, setCanvasSize] = useState(() => calculateCanvasSize())
  const [isInitialized, setIsInitialized] = useState(false)
  const [creatingCanvas, setCreatingCanvas] = useState(false)
  const hasInitializedWithConfig = useRef(false)

  const activeEngineRef = useRef(activeEngine)
  const recorderRef = useRef<GameRecorder | null>(null)
  const isRecordingRef = useRef(false)

  const inputCleanupRef = useRef<(() => void) | null>(null)
  const canvasCleanupRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    activeEngineRef.current = activeEngine
  }, [activeEngine])

  const initializeCanvas = useCallback(async () => {
    if (!containerRef.current || !activeEngineRef.current || !gameConfig) {
      return
    }

    if (isInitialized || creatingCanvas || hasInitializedWithConfig.current) {
      return
    }

    setCreatingCanvas(true)
    hasInitializedWithConfig.current = true

    try {
      await activeEngineRef.current.reset(gameConfig)

      const size = calculateCanvasSize()
      setCanvasSize(size)

      const canvasOptions: GameCanvasOptions = {
        width: size.width,
        height: size.height,
        worldWidth: size.width,
        worldHeight: size.height,
        backgroundColor: 0x000000,
      }

      const canvas = await (GameCanvasClass as any).create(
        containerRef.current,
        canvasOptions,
      )

      canvas.setGameEngine(activeEngineRef.current)

      setGameCanvas(canvas)
      setIsInitialized(true)
      onCanvasReady?.(canvas)

      canvasCleanupRef.current = () => {
        canvas.destroy()
      }
    } finally {
      setCreatingCanvas(false)
    }
  }, [
    GameCanvasClass,
    gameConfig,
    isInitialized,
    creatingCanvas,
    onCanvasReady,
  ])

  useEffect(() => {
    if (gameConfig && !isInitialized && !creatingCanvas) {
      initializeCanvas()
    }
  }, [gameConfig, isInitialized, creatingCanvas, initializeCanvas])

  useEffect(() => {
    if (!playEngine) return

    if (!recorderRef.current) {
      recorderRef.current = new GameRecorder()
    }
    playEngine.setGameRecorder(recorderRef.current)

    const handleStateChange = (newState: GameState, _oldState: GameState) => {
      if (newState === GameState.READY) {
        recorderRef.current!.reset()
        playEngine.setGameRecorder(recorderRef.current!)
        isRecordingRef.current = false
      }

      if (newState === GameState.PLAYING && !isRecordingRef.current) {
        isRecordingRef.current = true
        recorderRef.current!.startRecording(
          playEngine.getEventManager(),
          playEngine.getGameConfig(),
          `Session ${Date.now()}`,
        )
        onRecordingStart?.()
      }

      if (newState === GameState.ENDED && isRecordingRef.current) {
        isRecordingRef.current = false
        recorderRef.current!.stopRecording()
        const recording = recorderRef.current!.getCurrentRecording()
        if (recording) {
          onRecordingSave?.(recording)
        }
      }
    }

    playEngine.on(GameEngineEventType.STATE_CHANGE, handleStateChange)

    return () => {
      playEngine.off(GameEngineEventType.STATE_CHANGE, handleStateChange)
    }
  }, [playEngine, onRecordingStart, onRecordingSave])

  useEffect(() => {
    if (!activeEngineRef.current || disableKeyboardInput) return

    const handleKeyDown = (event: KeyboardEvent) => {
      const engine = activeEngineRef.current
      if (!engine) return

      const state = engine.getState()
      if (
        state !== GameState.PLAYING &&
        state !== GameState.PAUSED &&
        state !== GameState.READY
      ) {
        return
      }

      if (event.code === "Space") {
        event.preventDefault()
        onKeyboardInput?.("pause")
        return
      }

      let intent: GameIntent | null = null

      switch (event.code) {
        case "ArrowUp":
        case "KeyW":
          intent = GameIntent.UP
          break
        case "ArrowDown":
        case "KeyS":
          intent = GameIntent.DOWN
          break
        case "ArrowLeft":
        case "KeyA":
          intent = GameIntent.LEFT
          break
        case "ArrowRight":
        case "KeyD":
          intent = GameIntent.RIGHT
          break
        case "KeyQ":
          intent = GameIntent.COUNTER_CLOCKWISE
          break
        case "KeyE":
          intent = GameIntent.CLOCKWISE
          break
        case "KeyR":
          intent = GameIntent.RESET
          break
      }

      if (intent !== null) {
        event.preventDefault()

        if (intent === GameIntent.RESET) {
          engine.reset(gameConfig)
          return
        }

        if (isReplaying) return

        const state = engine.getState()
        if (state === GameState.READY) {
          engine.start()
        }

        const eventManager = engine.getEventManager()
        const eventSource = eventManager.getSource() as any

        if (typeof eventSource?.queueInput === "function") {
          eventSource.queueInput(GameInputType.INTENT, {
            intent,
          })
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)

    inputCleanupRef.current = () => {
      document.removeEventListener("keydown", handleKeyDown)
    }

    return () => {
      inputCleanupRef.current?.()
    }
  }, [isReplaying, onKeyboardInput, disableKeyboardInput, gameConfig])

  useEffect(() => {
    if (!gameCanvas) return

    const handleResize = () => {
      const newSize = calculateCanvasSize()
      setCanvasSize(newSize)

      if (typeof (gameCanvas as any).resize === "function") {
        const min = Math.min(newSize.width, newSize.height)
        ;(gameCanvas as any).resize(min, min)
      }
    }

    let resizeTimeout: NodeJS.Timeout
    const debouncedResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(handleResize, 100)
    }

    window.addEventListener("resize", debouncedResize)
    return () => {
      clearTimeout(resizeTimeout)
      window.removeEventListener("resize", debouncedResize)
    }
  }, [gameCanvas])

  useEffect(() => {
    return () => {
      inputCleanupRef.current?.()
      canvasCleanupRef.current?.()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="game-canvas-container"
      style={{
        width: canvasSize.width,
        height: canvasSize.height,
        background: "#000",
        outline: "2px solid #4a4a7e",
      }}
      tabIndex={0}
    />
  )
}
