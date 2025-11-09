import type { GameCanvas } from "@hiddentao/clockwork-engine"
import { useEffect, useState } from "react"

export interface CanvasSize {
  width: number
  height: number
}

export function useResponsiveCanvas(gameCanvas: GameCanvas | null) {
  const [canvasSize, setCanvasSize] = useState<CanvasSize>(() =>
    calculateCanvasSize(),
  )

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

  return canvasSize
}

export function calculateCanvasSize(): CanvasSize {
  const isMobile = window.innerWidth <= 768
  const isTablet = window.innerWidth <= 1024 && window.innerWidth > 768

  if (isMobile) {
    const maxWidth = Math.min(window.innerWidth - 40, 400)
    return { width: maxWidth, height: maxWidth }
  }

  if (isTablet) {
    const maxWidth = Math.min(window.innerWidth - 80, 600)
    return { width: maxWidth, height: maxWidth }
  }

  return { width: 600, height: 600 }
}
