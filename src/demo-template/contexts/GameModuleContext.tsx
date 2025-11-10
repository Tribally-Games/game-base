import { type ReactNode, createContext, useContext } from "react"
import type { IDemoFileSystemLoader } from "../types"

export interface GameModuleContextValue {
  GameEngine: any
  GameCanvas: any
  getGameModuleConfig: () => any
  DemoLoader: any
  fileSystemLoader: IDemoFileSystemLoader
  objectiveMetadata?: Record<string, any>
}

const GameModuleContext = createContext<GameModuleContextValue | null>(null)

export function GameModuleProvider({
  module,
  DemoLoader,
  fileSystemLoader,
  children,
}: {
  module: any
  DemoLoader: any
  fileSystemLoader: IDemoFileSystemLoader
  children: ReactNode
}) {
  const contextValue: GameModuleContextValue = {
    GameEngine: module.GameEngine,
    GameCanvas: module.GameCanvas,
    getGameModuleConfig: module.getGameModuleConfig,
    DemoLoader,
    fileSystemLoader,
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
