import { createRoot } from "react-dom/client"
import { App } from "./App"
import { GameModuleProvider } from "./contexts/GameModuleContext"

const root = document.getElementById("root")

async function initializeApp() {
  if (!root) {
    throw new Error("Root element not found")
  }

  const gameModule = await import("@game-module")
  const { DemoLoader } = await import("@game-demo/DemoLoader")

  createRoot(root).render(
    <GameModuleProvider module={gameModule} DemoLoader={DemoLoader}>
      <App />
    </GameModuleProvider>,
  )
}

initializeApp().catch((error) => {
  console.error("Failed to initialize app:", error)
})
