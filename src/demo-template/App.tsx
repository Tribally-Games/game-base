import { DemoSessionProvider } from "./contexts/DemoSessionContext"
import { GameStateProvider } from "./contexts/GameStateContext"
import { DemoPage } from "./pages/DemoPage"

export function App() {
  return (
    <GameStateProvider>
      <DemoSessionProvider>
        <DemoPage />
      </DemoSessionProvider>
    </GameStateProvider>
  )
}
