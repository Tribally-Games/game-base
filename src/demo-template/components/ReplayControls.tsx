import { GameState } from "@clockwork-engine/core"

export interface ReplayControlsProps {
  hasRecording: boolean
  isReplaying: boolean
  isPaused: boolean
  gameState: GameState | null
  replaySpeed: number
  replayProgress: number
  onStartReplay: () => void
  onStopReplay: () => void
  onPauseResume: () => void
  onChangeSpeed: (speed: number) => void
}

export function ReplayControls({
  hasRecording,
  isReplaying,
  isPaused,
  gameState,
  replaySpeed,
  replayProgress,
  onStartReplay,
  onStopReplay,
  onPauseResume,
  onChangeSpeed,
}: ReplayControlsProps) {
  const speeds = [0.5, 1.0, 2.0, 4.0]

  return (
    <div style={{ marginBottom: "15px" }}>
      <h3 style={{ marginBottom: "10px" }}>Replay</h3>

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "10px",
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={onStartReplay}
          disabled={
            !hasRecording || isReplaying || gameState === GameState.PLAYING
          }
          style={{
            padding: "10px 20px",
            fontSize: "14px",
            backgroundColor:
              hasRecording && !isReplaying && gameState !== GameState.PLAYING
                ? "#4a7c59"
                : "#666",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor:
              hasRecording && !isReplaying && gameState !== GameState.PLAYING
                ? "pointer"
                : "not-allowed",
            opacity:
              hasRecording && !isReplaying && gameState !== GameState.PLAYING
                ? 1
                : 0.6,
          }}
        >
          ▶ Start Replay
        </button>

        <button
          onClick={onStopReplay}
          disabled={!isReplaying}
          style={{
            padding: "10px 20px",
            fontSize: "14px",
            backgroundColor: isReplaying ? "#d9534f" : "#666",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: isReplaying ? "pointer" : "not-allowed",
            opacity: isReplaying ? 1 : 0.6,
          }}
        >
          ⏹ Stop Replay
        </button>
      </div>

      {isReplaying && (
        <>
          <div style={{ marginBottom: "10px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontSize: "12px",
              }}
            >
              Speed: {replaySpeed}x
            </label>
            <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
              <button
                onClick={onPauseResume}
                style={{
                  padding: "5px 10px",
                  fontSize: "12px",
                  backgroundColor: "#4a7c59",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                {isPaused ? "▶" : "⏸"}
              </button>
              {speeds.map((speed) => (
                <button
                  key={speed}
                  onClick={() => onChangeSpeed(speed)}
                  style={{
                    padding: "5px 10px",
                    fontSize: "12px",
                    backgroundColor: replaySpeed === speed ? "#5b7c99" : "#444",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontSize: "12px",
              }}
            >
              Progress: {Math.round(replayProgress * 100)}%
            </label>
            <div
              style={{
                width: "100%",
                height: "8px",
                backgroundColor: "#333",
                borderRadius: "4px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${replayProgress * 100}%`,
                  height: "100%",
                  backgroundColor: "#4a7c59",
                  transition: "width 0.1s linear",
                }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
