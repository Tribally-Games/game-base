import { createRoot } from "react-dom/client"
import { App } from "./App"
import { DemoFileSystemLoader } from "./DemoFileSystemLoader"
import { GameModuleProvider } from "./contexts/GameModuleContext"

const root = document.getElementById("root")

async function initializeApp() {
  if (!root) {
    throw new Error("Root element not found")
  }

  const gameModule = await import("@game")
  const { DemoLoader } = await import("@game/demo/DemoLoader")
  const fileSystemLoader = new DemoFileSystemLoader()

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
