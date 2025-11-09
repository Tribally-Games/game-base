import type { CSSProperties } from "react"
import type { ObjectiveThresholds } from "./ConfiguratorModal"

export interface ObjectivesDisplayProps {
  objectives: ObjectiveThresholds
  currentProgress: Record<string, number>
  completedObjectives: Record<string, boolean>
  objectiveMetadata?: Record<string, any>
}

export function ObjectivesDisplay({
  objectives,
  currentProgress,
  completedObjectives,
  objectiveMetadata,
}: ObjectivesDisplayProps) {
  const activeObjectives = Object.entries(objectives).filter(
    ([_, threshold]) => threshold > 0,
  )

  if (activeObjectives.length === 0) {
    return null
  }

  return (
    <div style={containerStyle}>
      <h3 style={headerStyle}>Objectives</h3>
      <div style={objectivesListStyle}>
        {activeObjectives.map(([operator, threshold]) => {
          const metadata = objectiveMetadata?.[operator]
          const progress = currentProgress[operator] || 0
          const isCompleted = completedObjectives[operator] || false

          if (!metadata) {
            return null
          }

          return (
            <div key={operator} style={objectiveItemStyle}>
              <div style={objectiveHeaderStyle}>
                <span>{metadata.icon}</span>
                <span style={{ flex: 1 }}>
                  {metadata.description(threshold)}
                </span>
                <span style={{ fontSize: "12px" }}>
                  {progress} / {threshold}
                </span>
                {isCompleted && <span style={checkmarkStyle}>✓</span>}
              </div>
              <div style={progressBarContainerStyle}>
                <div
                  style={{
                    ...progressBarFillStyle,
                    width: `${Math.min((progress / threshold) * 100, 100)}%`,
                    backgroundColor: isCompleted ? "#4a7c59" : "#4a7c9e",
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const containerStyle: CSSProperties = {
  marginBottom: "15px",
}

const headerStyle: CSSProperties = {
  marginBottom: "10px",
}

const objectivesListStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
}

const objectiveItemStyle: CSSProperties = {
  fontSize: "14px",
}

const objectiveHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  marginBottom: "4px",
}

const checkmarkStyle: CSSProperties = {
  color: "#4a7c59",
}

const progressBarContainerStyle: CSSProperties = {
  width: "100%",
  height: "4px",
  backgroundColor: "#333",
  borderRadius: "2px",
  overflow: "hidden",
}

const progressBarFillStyle: CSSProperties = {
  height: "100%",
  transition: "width 0.3s ease",
}
