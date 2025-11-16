import { createRoot } from "react-dom/client"
import { App } from "./App"
import { DemoLoader as GameBaseDemoLoader } from "./DemoLoader"
import { GameModuleProvider } from "./contexts/GameModuleContext"

declare const __HAS_GAME_DEMO__: boolean

const root = document.getElementById("root")

async function loadDemoLoader() {
  if (!__HAS_GAME_DEMO__) {
    return GameBaseDemoLoader
  }

  const path = "@game-demo/DemoLoader"
  const module = await import(/* @vite-ignore */ path)
  return module.DemoLoader
}

async function initializeApp() {
  if (!root) {
    throw new Error("Root element not found")
  }

  const gameModule = await import("@game-module")
  const DemoLoader = await loadDemoLoader()

  createRoot(root).render(
    <GameModuleProvider module={gameModule} DemoLoader={DemoLoader}>
      <App />
    </GameModuleProvider>,
  )
}

initializeApp().catch((error) => {
  console.error("Failed to initialize app:", error)
})
