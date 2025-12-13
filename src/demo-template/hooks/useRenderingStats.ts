import type { GameCanvas } from "@clockwork-engine/core"
import { useEffect, useState } from "react"

export interface RenderingStats {
  fps: number
}

const EMPTY_STATS: RenderingStats = {
  fps: 60,
}

export function useRenderingStats(
  gameCanvas: GameCanvas | null,
): RenderingStats {
  const [stats, setStats] = useState<RenderingStats>(EMPTY_STATS)

  useEffect(() => {
    if (!gameCanvas) {
      setStats(EMPTY_STATS)
      return
    }

    const updateStats = () => {
      const app = (gameCanvas as any).getApp?.()
      if (app?.ticker?.FPS !== undefined) {
        setStats({
          fps: Math.round(app.ticker.FPS),
        })
      }
    }

    const interval = setInterval(updateStats, 200)
    return () => clearInterval(interval)
  }, [gameCanvas])

  return stats
}
