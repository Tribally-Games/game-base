import type { GameRecording, PlatformLayer } from "@clockwork-engine/core"
import type { GameEngine } from "@clockwork-engine/core"
import { useCallback, useEffect, useRef, useState } from "react"
import { useGameModule } from "../contexts/GameModuleContext"

export interface UseReplayManagerOptions {
  onReplayComplete?: () => void
}

export interface UseReplayManagerReturn {
  replaySpeed: number
  replayProgress: number
  startReplay: (recording: GameRecording) => Promise<void>
  stopReplay: () => void
  changeSpeed: (speed: number) => void
  manager: InstanceType<
    ReturnType<typeof useGameModule>["ReplayManager"]
  > | null
}

export function useReplayManager(
  replayEngine: GameEngine | null,
  platform: PlatformLayer | null,
  options: UseReplayManagerOptions,
): UseReplayManagerReturn {
  const { ReplayManager } = useGameModule()
  const { onReplayComplete } = options
  const [replaySpeed, setReplaySpeed] = useState(1.0)
  const [replayProgress, setReplayProgress] = useState(0)

  const replayManagerRef = useRef<InstanceType<typeof ReplayManager> | null>(
    null,
  )
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const onReplayCompleteRef = useRef(onReplayComplete)

  useEffect(() => {
    onReplayCompleteRef.current = onReplayComplete
  }, [onReplayComplete])

  useEffect(() => {
    if (!replayEngine) return

    const manager = new ReplayManager(replayEngine)
    replayManagerRef.current = manager

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
        progressIntervalRef.current = null
      }
    }
  }, [replayEngine, ReplayManager])

  const startProgressTracking = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
    }

    progressIntervalRef.current = setInterval(() => {
      if (replayManagerRef.current) {
        const { progress, hasMoreTicks } =
          replayManagerRef.current.getReplayProgress()

        setReplayProgress(progress)

        if (!hasMoreTicks && progress >= 1.0) {
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current)
          }
          onReplayCompleteRef.current?.()
        }
      }
    }, 100)
  }, [])

  const startReplay = useCallback(
    async (recording: GameRecording) => {
      if (!replayManagerRef.current) {
        throw new Error("ReplayManager not initialized")
      }

      setReplayProgress(0)
      startProgressTracking()
      await replayManagerRef.current.replay(recording)
    },
    [startProgressTracking],
  )

  const stopReplay = useCallback(() => {
    if (replayManagerRef.current) {
      replayManagerRef.current.stopReplay()
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
      progressIntervalRef.current = null
    }
    setReplayProgress(0)
  }, [])

  const changeSpeed = useCallback(
    (speed: number) => {
      setReplaySpeed(speed)
      platform?.rendering.setTickerSpeed(speed)
    },
    [platform],
  )

  return {
    replaySpeed,
    replayProgress,
    startReplay,
    stopReplay,
    changeSpeed,
    manager: replayManagerRef.current,
  }
}
