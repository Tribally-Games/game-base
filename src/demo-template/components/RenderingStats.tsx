export interface RenderingStatsProps {
  tick: number
  fps: number
  isRecording: boolean
  isReplaying: boolean
}

export function RenderingStats({
  tick,
  fps,
  isRecording,
  isReplaying,
}: RenderingStatsProps) {
  return (
    <div style={{ marginBottom: "15px" }}>
      <h3 style={{ marginBottom: "10px" }}>Rendering</h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "8px",
          fontSize: "14px",
        }}
      >
        <div>
          <strong>FPS:</strong> {fps}
        </div>
        <div>
          <strong>Tick:</strong> {tick}
        </div>
        <div>
          <strong>Recording:</strong> {isRecording ? "🔴 Yes" : "No"}
        </div>
        <div>
          <strong>Replaying:</strong> {isReplaying ? "▶️ Yes" : "No"}
        </div>
      </div>
    </div>
  )
}
