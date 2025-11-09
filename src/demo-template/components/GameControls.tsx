import { GameState } from "@hiddentao/clockwork-engine"

export interface GameControlsProps {
  gameState: GameState | null
  isReplaying: boolean
  onPauseResume: () => void
  onReset: () => void
  onConfigure: () => void
}

export function GameControls({
  gameState,
  isReplaying,
  onPauseResume,
  onReset,
  onConfigure,
}: GameControlsProps) {
  const isPaused = gameState === GameState.PAUSED
  const isPlaying = gameState === GameState.PLAYING
  const canPause = (isPlaying || isPaused) && !isReplaying
  const canReset = gameState !== null

  return (
    <div style={{ marginBottom: "15px" }}>
      <h3 style={{ marginBottom: "10px" }}>Controls</h3>
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <button
          onClick={onPauseResume}
          disabled={!canPause}
          style={{
            padding: "10px 20px",
            fontSize: "14px",
            backgroundColor: canPause ? "#4a7c59" : "#666",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: canPause ? "pointer" : "not-allowed",
            opacity: canPause ? 1 : 0.6,
          }}
        >
          {!isReplaying && isPaused ? "▶ Resume" : "⏸ Pause"}
        </button>

        <button
          onClick={onReset}
          disabled={!canReset}
          style={{
            padding: "10px 20px",
            fontSize: "14px",
            backgroundColor: canReset ? "#4a7c59" : "#666",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: canReset ? "pointer" : "not-allowed",
            opacity: canReset ? 1 : 0.6,
          }}
        >
          🔄 Reset
        </button>

        <button
          onClick={onConfigure}
          disabled={isReplaying}
          style={{
            padding: "10px 20px",
            fontSize: "14px",
            backgroundColor: !isReplaying ? "#5b7c99" : "#666",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: !isReplaying ? "pointer" : "not-allowed",
            opacity: !isReplaying ? 1 : 0.6,
          }}
        >
          ⚙️ Configure
        </button>
      </div>

      <div style={{ marginTop: "10px", fontSize: "12px", color: "#aaa" }}>
        <div>Keyboard: WASD or Arrows = Move</div>
        <div>Q/E = Rotate, Space = Pause/Resume</div>
      </div>
    </div>
  )
}
