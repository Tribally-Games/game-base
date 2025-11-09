export interface SeedDisplayProps {
  currentSeed: string
  isSeedManuallyConfigured: boolean
  onPersistSeed: () => void
}

export function SeedDisplay({
  currentSeed,
  isSeedManuallyConfigured,
  onPersistSeed,
}: SeedDisplayProps) {
  return (
    <div style={{ marginBottom: "15px" }}>
      <h3 style={{ marginBottom: "10px" }}>PRNG Seed</h3>

      <div
        style={{
          padding: "8px",
          backgroundColor: "#2a2a4e",
          borderRadius: "4px",
          fontFamily: "monospace",
          fontSize: "12px",
          wordBreak: "break-all",
          marginBottom: "8px",
        }}
      >
        {currentSeed || "No seed yet"}
        {currentSeed && !isSeedManuallyConfigured && (
          <span style={{ color: "#aaa", marginLeft: "8px" }}>(random)</span>
        )}
      </div>

      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        {!isSeedManuallyConfigured && currentSeed && (
          <button
            onClick={onPersistSeed}
            style={{
              padding: "8px 16px",
              fontSize: "12px",
              backgroundColor: "#5b7c99",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            🔄 Re-use Seed
          </button>
        )}

        {isSeedManuallyConfigured && (
          <span style={{ fontSize: "12px", color: "#4a7c59" }}>✅ Re-used</span>
        )}
      </div>

      <div style={{ marginTop: "8px", fontSize: "11px", color: "#aaa" }}>
        {isSeedManuallyConfigured
          ? "This seed will be re-used for new games"
          : "Auto-generated seed - click to re-use"}
      </div>
    </div>
  )
}
