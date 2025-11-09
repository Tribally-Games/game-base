import type { PowerUpEffect } from "@game/types/game"

export interface GameInfoProps {
  formattedInfo: Array<{ label: string; value: any }>
}

export function GameInfo({ formattedInfo }: GameInfoProps) {
  const renderValue = (value: any) => {
    if (Array.isArray(value)) {
      if (value.length === 0) return null

      const activeEffects = value as PowerUpEffect[]
      return (
        <div style={{ gridColumn: "1 / -1", marginTop: "5px" }}>
          {activeEffects.map((effect, idx) => (
            <div
              key={idx}
              style={{
                padding: "4px 8px",
                marginBottom: "4px",
                backgroundColor: effect.isHelpful ? "#2a4a2e" : "#4a2a2e",
                borderRadius: "4px",
                fontSize: "12px",
              }}
            >
              {effect.isHelpful ? "✅" : "❌"} {effect.name} (
              {effect.ticksRemaining} ticks)
            </div>
          ))}
        </div>
      )
    }

    if (
      value === "Yes" &&
      (value === "Jackpot Eligible" || value === "Jackpot Won")
    ) {
      return (
        <span
          style={{ color: value === "Jackpot Won" ? "#ffd700" : "#4a7c59" }}
        >
          {value === "Jackpot Won" ? "🎊 Yes 🎊" : "✨ Yes"}
        </span>
      )
    }

    return String(value)
  }

  return (
    <div style={{ marginBottom: "15px" }}>
      <h3 style={{ marginBottom: "10px" }}>Game Info</h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "8px",
          fontSize: "14px",
        }}
      >
        {formattedInfo.map(({ label, value }) => {
          const renderedValue = renderValue(value)

          if (renderedValue === null) return null

          if (label === "Active Effects") {
            return (
              <div key={label} style={{ gridColumn: "1 / -1" }}>
                <strong style={{ display: "block", marginBottom: "5px" }}>
                  {label}:
                </strong>
                {renderedValue}
              </div>
            )
          }

          return (
            <div key={label}>
              <strong>{label}:</strong> {renderedValue}
            </div>
          )
        })}
      </div>
    </div>
  )
}
