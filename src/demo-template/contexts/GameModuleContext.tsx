import { type ReactNode, createContext, useContext } from "react"
import type { GameModuleExports } from "../../createGameModule"

export interface GameModuleContextValue extends GameModuleExports {
  DemoLoader: any
}

const GameModuleContext = createContext<GameModuleContextValue | null>(null)

export function GameModuleProvider({
  module,
  DemoLoader,
  children,
}: {
  module: GameModuleExports
  DemoLoader: any
  children: ReactNode
}) {
  const contextValue: GameModuleContextValue = {
    ...module,
    DemoLoader,
  }

  return (
    <GameModuleContext.Provider value={contextValue}>
      {children}
    </GameModuleContext.Provider>
  )
}

export function useGameModule() {
  const context = useContext(GameModuleContext)
  if (!context) {
    throw new Error("useGameModule must be used within GameModuleProvider")
  }
  return context
}
