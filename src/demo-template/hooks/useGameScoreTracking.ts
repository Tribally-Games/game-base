import { GameState } from "@clockwork-engine/core"
import type { GameEngine } from "@clockwork-engine/core"
import { useEffect, useState } from "react"
import { useGameModule } from "../contexts/GameModuleContext"

export interface GameInfo {
  formattedInfo: Array<{ label: string; value: any }>
  tick: number
}

const EMPTY_INFO: GameInfo = {
  formattedInfo: [],
  tick: 0,
}

export function useGameScoreTracking(gameEngine: GameEngine | null): GameInfo {
  const { getGameModuleConfig } = useGameModule()
  const [info, setInfo] = useState<GameInfo>(EMPTY_INFO)

  useEffect(() => {
    if (!gameEngine) {
      setInfo(EMPTY_INFO)
      return
    }

    const gameModuleConfig = getGameModuleConfig()

    const updateInfo = () => {
      const state = gameEngine.getState()

      if (state === GameState.PLAYING || state === GameState.PAUSED) {
        const snapshot = gameEngine.getGameSnapshot()
        const extractedInfo = gameModuleConfig.extractGameSnapshotInfo(snapshot)
        const formattedInfo =
          gameModuleConfig.formatGameSnapshotInfo(extractedInfo)

        setInfo({
          formattedInfo,
          tick: gameEngine.getTotalTicks(),
        })
      } else {
        setInfo((prev) => ({
          ...prev,
          tick: gameEngine.getTotalTicks(),
        }))
      }
    }

    const interval = setInterval(updateInfo, 200)
    return () => clearInterval(interval)
  }, [gameEngine, getGameModuleConfig])

  return info
}
