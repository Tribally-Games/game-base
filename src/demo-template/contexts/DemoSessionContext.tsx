import {
  type GameMetaConfigValues,
  mergeWithDefaults,
} from "@tribally.games/game-base"
import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react"
import type { ObjectiveThresholds } from "../components/ConfiguratorModal"
import { useGameModule } from "./GameModuleContext"

export interface DemoSessionContextValue {
  metaConfig: GameMetaConfigValues
  currentSeed: string
  isSeedManuallyConfigured: boolean
  customObjectives: ObjectiveThresholds
  updateMetaConfig: (config: GameMetaConfigValues) => void
  updateSeed: (seed: string, isManual?: boolean) => void
  persistSeed: () => void
  updateObjectives: (objectives: ObjectiveThresholds) => void
}

const DemoSessionContext = createContext<DemoSessionContextValue | null>(null)

export function DemoSessionProvider({ children }: { children: ReactNode }) {
  const { getGameModuleConfig } = useGameModule()
  const gameModuleConfig = getGameModuleConfig()
  const metaConfigSchema = gameModuleConfig.getMetaConfigSchema!()

  const [metaConfig, setMetaConfig] = useState<GameMetaConfigValues>(() =>
    mergeWithDefaults(metaConfigSchema, null),
  )

  const [currentSeed, setCurrentSeed] = useState<string>(() => {
    return `demo-seed-${Date.now()}`
  })

  const [isSeedManuallyConfigured, setIsSeedManuallyConfigured] =
    useState(false)

  const [customObjectives, setCustomObjectives] = useState<ObjectiveThresholds>(
    {},
  )

  const updateMetaConfig = useCallback((config: GameMetaConfigValues) => {
    setMetaConfig(config)
  }, [])

  const updateSeed = useCallback((seed: string, isManual = false) => {
    setCurrentSeed(seed)
    setIsSeedManuallyConfigured(isManual)
  }, [])

  const persistSeed = useCallback(() => {
    if (currentSeed) {
      setIsSeedManuallyConfigured(true)
    }
  }, [currentSeed])

  const updateObjectives = useCallback((objectives: ObjectiveThresholds) => {
    setCustomObjectives(objectives)
  }, [])

  const contextValue = useMemo(
    () => ({
      metaConfig,
      currentSeed,
      isSeedManuallyConfigured,
      customObjectives,
      updateMetaConfig,
      updateSeed,
      persistSeed,
      updateObjectives,
    }),
    [
      metaConfig,
      currentSeed,
      isSeedManuallyConfigured,
      customObjectives,
      updateMetaConfig,
      updateSeed,
      persistSeed,
      updateObjectives,
    ],
  )

  return (
    <DemoSessionContext.Provider value={contextValue}>
      {children}
    </DemoSessionContext.Provider>
  )
}

export function useDemoSession() {
  const context = useContext(DemoSessionContext)
  if (!context) {
    throw new Error("useDemoSession must be used within DemoSessionProvider")
  }
  return context
}
