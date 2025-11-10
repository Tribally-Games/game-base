import { createRoot } from "react-dom/client"
import { App } from "./App"
import { DemoFileSystemLoader } from "./DemoFileSystemLoader"
import { GameModuleProvider } from "./contexts/GameModuleContext"

const root = document.getElementById("root")

async function initializeApp() {
  if (!root) {
    throw new Error("Root element not found")
  }

  const gameModule = await import("@game-module")
  const { DemoLoader } = await import("@game-demo/DemoLoader")

  // Use Vite's /@fs/ prefix with the injected project root path
  const baseUrl = `/@fs/${__GAME_PROJECT_ROOT__}/`
  const fileSystemLoader = new DemoFileSystemLoader(baseUrl)

  createRoot(root).render(
    <GameModuleProvider
      module={gameModule}
      DemoLoader={DemoLoader}
      fileSystemLoader={fileSystemLoader}
    >
      <App />
    </GameModuleProvider>,
  )
}

initializeApp().catch((error) => {
  console.error("Failed to initialize app:", error)
})
