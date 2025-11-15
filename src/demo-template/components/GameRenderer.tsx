import {
  type GameCanvasOptions,
  GameEngineEventType,
  GameRecorder,
  type GameRecording,
  GameState,
} from "@hiddentao/clockwork-engine"
import type { GameCanvas, GameEngine } from "@hiddentao/clockwork-engine"
import { useCallback, useEffect, useRef, useState } from "react"
import { KeystrokesInputManager } from "../../input/KeystrokesInputManager"
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
  onPauseResume?: (key: string) => void
  onReset?: () => void
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
  onPauseResume,
  onReset,
}: GameRendererProps) {
  const { GameCanvas: GameCanvasClass, getGameModuleConfig } = useGameModule()
  const containerRef = useRef<HTMLDivElement>(null)
  const [gameCanvas, setGameCanvas] = useState<GameCanvas | null>(null)
  const [canvasSize, setCanvasSize] = useState(() => calculateCanvasSize())
  const [isInitialized, setIsInitialized] = useState(false)
  const [creatingCanvas, setCreatingCanvas] = useState(false)
  const [showStartOverlay, setShowStartOverlay] = useState(false)
  const hasInitializedWithConfig = useRef(false)

  const activeEngineRef = useRef(activeEngine)
  const recorderRef = useRef<GameRecorder | null>(null)
  const isRecordingRef = useRef(false)

  const inputManagerRef = useRef<KeystrokesInputManager | null>(null)
  const canvasCleanupRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    activeEngineRef.current = activeEngine
  }, [activeEngine])

  useEffect(() => {
    if (!activeEngine) {
      setShowStartOverlay(false)
      return
    }

    const updateOverlayVisibility = () => {
      const state = activeEngine.getState()
      setShowStartOverlay(state === GameState.READY)
    }

    updateOverlayVisibility()

    const handleStateChange = (newState: GameState) => {
      setShowStartOverlay(newState === GameState.READY)
    }

    activeEngine.on(GameEngineEventType.STATE_CHANGE, handleStateChange)

    return () => {
      activeEngine.off(GameEngineEventType.STATE_CHANGE, handleStateChange)
    }
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
    const newInputMapping = getGameModuleConfig().getInputMapping()

    if (!inputManagerRef.current) {
      // Create new manager only if none exists
      inputManagerRef.current = new KeystrokesInputManager({
        engine: activeEngineRef.current,
        inputMapping: newInputMapping,
        isReplaying,
        onPauseResume,
        onReset,
      })
      inputManagerRef.current.bind()
    } else {
      // Always update engine reference and replay state (lightweight)
      inputManagerRef.current.updateInputMapping(newInputMapping)
      inputManagerRef.current.updateEngine(activeEngineRef.current)
      inputManagerRef.current.updateIsReplaying(isReplaying)
      inputManagerRef.current.updateOnReset(onReset)
      inputManagerRef.current.updateOnPauseResume(onPauseResume)
    }
  }, [gameConfig, disableKeyboardInput, isReplaying, onPauseResume, onReset])

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

  return (
    <div
      ref={containerRef}
      className="game-canvas-container"
      style={{
        position: "relative",
        width: canvasSize.width,
        height: canvasSize.height,
        background: "#000",
        outline: "2px solid #4a4a7e",
      }}
      tabIndex={0}
    >
      {showStartOverlay && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: "18px",
            fontFamily: "Arial, sans-serif",
            fontWeight: "500",
            textAlign: "center",
            pointerEvents: "none",
            zIndex: 1000,
          }}
        >
          Press a movement key to start playing
        </div>
      )}
    </div>
  )
}
