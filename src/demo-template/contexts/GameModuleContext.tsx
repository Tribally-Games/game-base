import { type ReactNode, createContext, useContext } from "react"

export interface GameModuleContextValue {
  GameEngine: any
  GameCanvas: any
  getGameModuleConfig: () => any
  DemoLoader: any
  objectiveMetadata?: Record<string, any>
}

const GameModuleContext = createContext<GameModuleContextValue | null>(null)

export function GameModuleProvider({
  module,
  DemoLoader,
  children,
}: {
  module: any
  DemoLoader: any
  children: ReactNode
}) {
  const contextValue: GameModuleContextValue = {
    GameEngine: module.GameEngine,
    GameCanvas: module.GameCanvas,
    getGameModuleConfig: module.getGameModuleConfig,
    DemoLoader,
    objectiveMetadata: module.objectiveMetadata,
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
