import {
  type GameCanvas,
  type GameConfig,
  type GameRecording,
  GameState,
} from "@hiddentao/clockwork-engine"
import { type GameMetaConfigValues } from "@tribally.games/game-base"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import {
  ConfiguratorModal,
  type ObjectiveThresholds,
} from "../components/ConfiguratorModal"
import { GameControls } from "../components/GameControls"
import { GameInfo } from "../components/GameInfo"
import { GameRenderer } from "../components/GameRenderer"
import { ObjectivesDisplay } from "../components/ObjectivesDisplay"
import { RenderingStats } from "../components/RenderingStats"
import { ReplayControls } from "../components/ReplayControls"
import { SeedDisplay } from "../components/SeedDisplay"
import { useDemoSession } from "../contexts/DemoSessionContext"
import { useGameModule } from "../contexts/GameModuleContext"
import { useGameState } from "../contexts/GameStateContext"
import { useGameScoreTracking } from "../hooks/useGameScoreTracking"
import { useRenderingStats } from "../hooks/useRenderingStats"
import { useReplayManager } from "../hooks/useReplayManager"

export function DemoPage() {
  const { getGameModuleConfig } = useGameModule()
  const gameModuleConfig = getGameModuleConfig()
  const objectiveMetadata = gameModuleConfig.objectiveMetadata
  const { playEngine, replayEngine, activeEngine, gameState, setActiveEngine } =
    useGameState()

  const {
    metaConfig,
    currentSeed,
    isSeedManuallyConfigured,
    customObjectives,
    updateMetaConfig,
    updateSeed,
    persistSeed,
    updateObjectives,
  } = useDemoSession()

  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false)
  const [savedRecording, setSavedRecording] = useState<GameRecording | null>(
    null,
  )
  const [isRecording, setIsRecording] = useState(false)
  const [isReplaying, setIsReplaying] = useState(false)
  const [gameCanvas, setGameCanvas] = useState<GameCanvas | null>(null)
  const [objectiveProgress, setObjectiveProgress] = useState<
    Record<string, number>
  >({})
  const [completedObjectives, setCompletedObjectives] = useState<
    Record<string, boolean>
  >({})
  const completedObjectivesRef = useRef<Record<string, boolean>>({})

  const setCanvasEngine = useCallback(
    (engine: any) => {
      if (gameCanvas) {
        ;(gameCanvas as any).setGameEngine(engine)
      }
    },
    [gameCanvas],
  )

  const metaConfigSchema = gameModuleConfig.getMetaConfigSchema!()

  const gameConfig: GameConfig | null = useMemo(() => {
    if (!playEngine) return null

    const gameSpecific = gameModuleConfig.setupInitializationData!(metaConfig)
    const config: GameConfig = {
      prngSeed: currentSeed || undefined,
      gameSpecific,
    }

    return config
  }, [playEngine, metaConfig, currentSeed, gameModuleConfig])

  const stats = useGameScoreTracking(activeEngine)
  const renderingStats = useRenderingStats(gameCanvas)

  useEffect(() => {
    if (!activeEngine || !gameState) return

    const interval = setInterval(() => {
      const snapshot = activeEngine.getGameSnapshot()
      const newProgress: Record<string, number> = {}
      const newCompleted: Record<string, boolean> = {}

      Object.entries(customObjectives).forEach(([operator, threshold]) => {
        if (threshold > 0) {
          const progress =
            gameModuleConfig.getProgressValue(operator, snapshot) || 0
          newProgress[operator] = progress

          const isCompleted = gameModuleConfig.validateCustomObjective(
            { operator, threshold },
            snapshot,
          )
          newCompleted[operator] = isCompleted

          if (isCompleted && !completedObjectivesRef.current[operator]) {
            completedObjectivesRef.current[operator] = true
            const metadata = objectiveMetadata?.[operator]
            if (metadata) {
              toast.success(
                `${metadata.icon} ${metadata.description(threshold)} - Complete!`,
                {
                  position: "top-right",
                  autoClose: 3000,
                },
              )
            }
          }
        }
      })

      setObjectiveProgress(newProgress)
      setCompletedObjectives(newCompleted)
    }, 200)

    return () => clearInterval(interval)
  }, [
    activeEngine,
    gameState,
    customObjectives,
    gameModuleConfig,
    objectiveMetadata,
  ])

  useEffect(() => {
    if (gameState === GameState.READY) {
      completedObjectivesRef.current = {}
      setCompletedObjectives({})
    }
  }, [gameState])

  const handleReplayComplete = useCallback(() => {
    if (playEngine) {
      setActiveEngine(playEngine)
      setIsReplaying(false)
    }
  }, [playEngine, setActiveEngine])

  const replayManager = useReplayManager(replayEngine, {
    onReplayComplete: handleReplayComplete,
  })

  useEffect(() => {
    if (gameCanvas) {
      replayManager.setGameCanvas(gameCanvas)
    }
  }, [gameCanvas, replayManager])

  const handlePauseResume = useCallback(() => {
    if (!activeEngine) return

    const state = activeEngine.getState()
    if (state === GameState.PLAYING) {
      activeEngine.pause()
    } else if (state === GameState.PAUSED) {
      activeEngine.resume()
    }
  }, [activeEngine])

  const resetPlayEngine = useCallback(
    async (config: GameConfig) => {
      if (!playEngine) return

      setActiveEngine(playEngine)
      setSavedRecording(null)
      setIsRecording(false)
      setIsReplaying(false)
      replayManager.changeSpeed(1.0)

      setCanvasEngine(playEngine)

      await playEngine.reset(config)
    },
    [playEngine, setActiveEngine, replayManager, setCanvasEngine],
  )

  const createConfigAndReset = useCallback(
    async (values: GameMetaConfigValues, seed: string, isManual: boolean) => {
      const seedToUse = seed || `demo-seed-${Date.now()}`
      updateSeed(seedToUse, isManual)

      const gameSpecific = gameModuleConfig.setupInitializationData!(values)
      const newConfig: GameConfig = {
        prngSeed: seedToUse,
        gameSpecific,
      }

      await resetPlayEngine(newConfig)
    },
    [updateSeed, gameModuleConfig, resetPlayEngine],
  )

  const handleReset = useCallback(async () => {
    if (!playEngine || !gameConfig) return

    const seed = isSeedManuallyConfigured
      ? currentSeed
      : `demo-seed-${Date.now()}`
    await createConfigAndReset(metaConfig, seed, isSeedManuallyConfigured)
  }, [
    playEngine,
    gameConfig,
    metaConfig,
    currentSeed,
    isSeedManuallyConfigured,
    createConfigAndReset,
  ])

  const handleConfigure = useCallback(() => {
    setIsConfigModalOpen(true)
  }, [])

  const handleConfigSave = useCallback(
    async (
      values: GameMetaConfigValues,
      seed: string,
      objectives: ObjectiveThresholds,
    ) => {
      updateMetaConfig(values)
      updateObjectives(objectives)
      await createConfigAndReset(values, seed, seed !== "")
    },
    [updateMetaConfig, updateObjectives, createConfigAndReset],
  )

  const handleStartReplay = useCallback(async () => {
    if (!savedRecording || !replayManager.manager) return

    const actualReplayEngine = replayManager.manager.getReplayEngine() as any

    setActiveEngine(actualReplayEngine)
    setCanvasEngine(actualReplayEngine)
    setIsReplaying(true)

    await replayManager.startReplay(savedRecording)
  }, [savedRecording, replayManager, setActiveEngine, setCanvasEngine])

  const handleStopReplay = useCallback(() => {
    if (!playEngine) return

    replayManager.stopReplay()
    replayManager.changeSpeed(1.0)
    setActiveEngine(playEngine)
    setCanvasEngine(playEngine)
    setIsReplaying(false)
  }, [replayManager, playEngine, setActiveEngine, setCanvasEngine])

  const handleRecordingStart = useCallback(() => {
    setIsRecording(true)
  }, [])

  const handleRecordingSave = useCallback((recording: GameRecording) => {
    setIsRecording(false)
    setSavedRecording(recording)
  }, [])

  const handleKeyboardInput = useCallback(
    (key: string) => {
      if (key === "pause") {
        handlePauseResume()
      }
    },
    [handlePauseResume],
  )

  return (
    <>
      <div
        id="game-container"
        style={{
          display: "flex",
          gap: "20px",
          alignItems: "flex-start",
          flexWrap: "wrap",
        }}
      >
        <div>
          <GameRenderer
            playEngine={playEngine}
            activeEngine={activeEngine}
            gameConfig={gameConfig}
            isReplaying={isReplaying}
            disableKeyboardInput={isConfigModalOpen}
            onCanvasReady={setGameCanvas}
            onRecordingStart={handleRecordingStart}
            onRecordingSave={handleRecordingSave}
            onKeyboardInput={handleKeyboardInput}
          />
        </div>

        <div id="ui-container" style={{ flex: 1, minWidth: "300px" }}>
          <GameControls
            gameState={gameState}
            isReplaying={isReplaying}
            onPauseResume={handlePauseResume}
            onReset={handleReset}
            onConfigure={handleConfigure}
          />

          <ReplayControls
            hasRecording={savedRecording !== null}
            isReplaying={isReplaying}
            isPaused={gameState === GameState.PAUSED}
            gameState={gameState}
            replaySpeed={replayManager.replaySpeed}
            replayProgress={replayManager.replayProgress}
            onStartReplay={handleStartReplay}
            onStopReplay={handleStopReplay}
            onPauseResume={handlePauseResume}
            onChangeSpeed={replayManager.changeSpeed}
          />

          <GameInfo formattedInfo={stats.formattedInfo} />

          <ObjectivesDisplay
            objectives={customObjectives}
            currentProgress={objectiveProgress}
            completedObjectives={completedObjectives}
            objectiveMetadata={objectiveMetadata}
          />

          <RenderingStats
            tick={stats.tick}
            fps={renderingStats.fps}
            isRecording={isRecording}
            isReplaying={isReplaying}
          />

          <SeedDisplay
            currentSeed={currentSeed}
            isSeedManuallyConfigured={isSeedManuallyConfigured}
            onPersistSeed={persistSeed}
          />
        </div>
      </div>

      <ConfiguratorModal
        isOpen={isConfigModalOpen}
        schema={metaConfigSchema}
        currentValues={metaConfig}
        currentSeed={currentSeed}
        isSeedManuallyConfigured={isSeedManuallyConfigured}
        currentObjectives={customObjectives}
        objectiveMetadata={objectiveMetadata}
        onSave={handleConfigSave}
        onClose={() => setIsConfigModalOpen(false)}
      />

      <ToastContainer />
    </>
  )
}
