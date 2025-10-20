import type { GameModuleConfig } from "./createGameModule"

let registeredConfig: GameModuleConfig | null = null

export function registerGameModule(config: GameModuleConfig): void {
  registeredConfig = config
}

export function getRegisteredConfig(): GameModuleConfig | null {
  return registeredConfig
}
