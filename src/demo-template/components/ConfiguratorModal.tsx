import {
  GameConfigFieldType,
  type GameMetaConfigSchema,
  type GameMetaConfigValues,
  mergeWithDefaults,
} from "@tribally.games/game-base"
import { type CSSProperties, type FormEvent, useEffect, useState } from "react"

export type ObjectiveThresholds = Record<string, number>

export interface ConfiguratorModalProps {
  isOpen: boolean
  schema: GameMetaConfigSchema
  currentValues: GameMetaConfigValues
  currentSeed: string
  isSeedManuallyConfigured: boolean
  currentObjectives: ObjectiveThresholds
  objectiveMetadata?: Record<string, any>
  onSave: (
    values: GameMetaConfigValues,
    seed: string,
    objectives: ObjectiveThresholds,
  ) => void
  onClose: () => void
}

export function ConfiguratorModal({
  isOpen,
  schema,
  currentValues,
  currentSeed,
  isSeedManuallyConfigured,
  currentObjectives,
  objectiveMetadata,
  onSave,
  onClose,
}: ConfiguratorModalProps) {
  const [activeTab, setActiveTab] = useState<"general" | "meta" | "objectives">(
    "general",
  )
  const [formValues, setFormValues] = useState<GameMetaConfigValues>(() => ({
    ...currentValues,
  }))
  const [seedValue, setSeedValue] = useState(currentSeed)
  const [objectiveThresholds, setObjectiveThresholds] =
    useState<ObjectiveThresholds>(currentObjectives)

  useEffect(() => {
    if (isOpen) {
      setFormValues({ ...currentValues })
      setSeedValue(isSeedManuallyConfigured ? currentSeed : "")
      setObjectiveThresholds(currentObjectives)
      setActiveTab("general")
    }
  }, [
    isOpen,
    currentValues,
    currentSeed,
    isSeedManuallyConfigured,
    currentObjectives,
  ])

  if (!isOpen) return null

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onSave(formValues, seedValue, objectiveThresholds)
    onClose()
  }

  const handleReset = () => {
    const defaults = mergeWithDefaults(schema, null)
    setFormValues(defaults)
    setSeedValue("")
    setObjectiveThresholds({})
  }

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormValues((prev) => ({
      ...prev,
      [fieldName]: value,
    }))
  }

  const renderField = (fieldName: string, fieldDef: any) => {
    const value = formValues[fieldName] ?? fieldDef.defaultValue

    switch (fieldDef.type) {
      case GameConfigFieldType.COLOR:
        return (
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <input
              type="color"
              value={value || fieldDef.defaultValue}
              onChange={(e) => handleFieldChange(fieldName, e.target.value)}
              style={{ width: "60px", height: "40px", cursor: "pointer" }}
            />
            <input
              type="text"
              value={value || fieldDef.defaultValue}
              onChange={(e) => handleFieldChange(fieldName, e.target.value)}
              placeholder="#RRGGBB"
              style={{ ...inputStyle, flex: 1 }}
            />
          </div>
        )

      case GameConfigFieldType.STRING_LIST: {
        const selectedIndex =
          value?.selectedIndex !== undefined
            ? value.selectedIndex
            : fieldDef.selectedIndex
        return (
          <select
            value={selectedIndex === null ? "random" : selectedIndex}
            onChange={(e) => {
              const newIndex =
                e.target.value === "random"
                  ? null
                  : parseInt(e.target.value, 10)
              handleFieldChange(fieldName, {
                items: fieldDef.items,
                selectedIndex: newIndex,
              })
            }}
            style={inputStyle}
          >
            <option value="random">Random</option>
            {fieldDef.items.map((item: string, idx: number) => (
              <option key={item} value={idx}>
                {item}
              </option>
            ))}
          </select>
        )
      }

      default:
        return <div>Unsupported field type</div>
    }
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "general":
        return (
          <div style={{ marginBottom: "20px" }}>
            <label style={labelStyle}>
              PRNG Seed (leave empty for auto-generate)
            </label>
            <input
              type="text"
              value={seedValue}
              onChange={(e) => setSeedValue(e.target.value)}
              placeholder="Auto-generate"
              style={inputStyle}
            />
          </div>
        )

      case "meta":
        return (
          <>
            {Object.entries(schema).map(([fieldName, fieldDef]) => (
              <div key={fieldName} style={{ marginBottom: "15px" }}>
                <label style={labelStyle}>
                  {fieldDef.label || fieldName}
                  {fieldDef.description && (
                    <span
                      style={{
                        fontSize: "12px",
                        color: "#aaa",
                        marginLeft: "8px",
                      }}
                    >
                      ({fieldDef.description})
                    </span>
                  )}
                </label>
                {renderField(fieldName, fieldDef)}
              </div>
            ))}
          </>
        )

      case "objectives":
        return (
          <>
            {objectiveMetadata &&
              Object.entries(objectiveMetadata).map(([operator, metadata]) => (
                <div key={operator} style={{ marginBottom: "15px" }}>
                  <label style={labelStyle}>
                    {metadata.icon} {metadata.name}
                    <span
                      style={{
                        fontSize: "12px",
                        color: "#aaa",
                        marginLeft: "8px",
                      }}
                    >
                      (leave empty or 0 to disable)
                    </span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={objectiveThresholds[operator] || ""}
                    onChange={(e) => {
                      const value =
                        e.target.value === "" ? 0 : parseInt(e.target.value, 10)
                      setObjectiveThresholds((prev) => ({
                        ...prev,
                        [operator]: value,
                      }))
                    }}
                    placeholder="0"
                    style={inputStyle}
                  />
                  {objectiveThresholds[operator] > 0 && (
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#aaa",
                        marginTop: "4px",
                      }}
                    >
                      {metadata.description(objectiveThresholds[operator])}
                    </div>
                  )}
                </div>
              ))}
            {!objectiveMetadata && (
              <div style={{ color: "#aaa", fontSize: "14px" }}>
                No objectives metadata provided by this game.
              </div>
            )}
          </>
        )
    }
  }

  return (
    <div
      style={overlayStyle}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div style={modalStyle}>
        <h2 style={{ margin: "0 0 20px 0", color: "#fff", fontSize: "24px" }}>
          Game Configuration
        </h2>

        <div style={tabContainerStyle}>
          <button
            type="button"
            onClick={() => setActiveTab("general")}
            style={activeTab === "general" ? activeTabStyle : tabStyle}
          >
            General
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("meta")}
            style={activeTab === "meta" ? activeTabStyle : tabStyle}
          >
            Meta
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("objectives")}
            style={activeTab === "objectives" ? activeTabStyle : tabStyle}
          >
            Objectives
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginTop: "20px" }}>{renderTabContent()}</div>

          <div
            style={{
              display: "flex",
              gap: "10px",
              marginTop: "24px",
              flexWrap: "wrap",
            }}
          >
            <button
              type="submit"
              style={{ ...buttonStyle, flex: 1, minWidth: "120px" }}
            >
              Save
            </button>
            <button
              type="button"
              onClick={handleReset}
              style={{
                ...buttonStyle,
                flex: 1,
                minWidth: "120px",
                backgroundColor: "#666",
              }}
            >
              Reset to Defaults
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                ...buttonStyle,
                flex: 1,
                minWidth: "120px",
                backgroundColor: "#d9534f",
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const overlayStyle: CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0, 0, 0, 0.7)",
  backdropFilter: "blur(5px)",
  zIndex: 10000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px",
  overflowY: "auto",
}

const modalStyle: CSSProperties = {
  background: "#2a2a4e",
  border: "2px solid #4a4a7e",
  borderRadius: "12px",
  padding: "24px",
  maxWidth: "600px",
  width: "100%",
  maxHeight: "90vh",
  overflowY: "auto",
  fontFamily: "monospace",
  color: "#eee",
}

const labelStyle: CSSProperties = {
  display: "block",
  marginBottom: "8px",
  fontSize: "14px",
  color: "#ccc",
}

const inputStyle: CSSProperties = {
  width: "100%",
  padding: "8px 12px",
  fontSize: "14px",
  background: "#1a1a2e",
  border: "1px solid #4a4a7e",
  borderRadius: "4px",
  color: "#eee",
  fontFamily: "monospace",
}

const buttonStyle: CSSProperties = {
  padding: "10px 20px",
  fontSize: "14px",
  backgroundColor: "#4a7c59",
  color: "#fff",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontFamily: "monospace",
}

const tabContainerStyle: CSSProperties = {
  display: "flex",
  gap: "0",
  borderBottom: "2px solid #4a4a7e",
  marginBottom: "20px",
}

const tabStyle: CSSProperties = {
  padding: "10px 20px",
  fontSize: "14px",
  backgroundColor: "transparent",
  color: "#aaa",
  border: "none",
  borderBottom: "2px solid transparent",
  cursor: "pointer",
  fontFamily: "monospace",
  transition: "all 0.2s",
  marginBottom: "-2px",
}

const activeTabStyle: CSSProperties = {
  ...tabStyle,
  color: "#fff",
  borderBottom: "2px solid #4a7c59",
}
