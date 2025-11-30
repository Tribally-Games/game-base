import type { ValidationResult } from "../hooks/useHeadlessValidation"

interface ValidationStatusProps {
  isValidating: boolean
  validationResult: ValidationResult | null
  onShowDetails: () => void
}

export function ValidationStatus({
  isValidating,
  validationResult,
  onShowDetails,
}: ValidationStatusProps) {
  if (!isValidating && !validationResult) return null

  return (
    <div style={{ marginBottom: "15px" }}>
      <h3 style={{ marginBottom: "10px" }}>Validation</h3>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "8px 12px",
          backgroundColor: "#333",
          borderRadius: "4px",
        }}
      >
        {isValidating ? (
          <span style={{ color: "#888" }}>Validating...</span>
        ) : validationResult ? (
          <>
            <span
              style={{
                color: validationResult.success ? "#4a7c59" : "#d9534f",
                fontWeight: "bold",
              }}
            >
              {validationResult.success
                ? "✓ Validation Passed"
                : "✗ Validation Failed"}
            </span>
            <button
              onClick={onShowDetails}
              style={{
                padding: "4px 12px",
                fontSize: "12px",
                backgroundColor: "#5b7c99",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Details
            </button>
          </>
        ) : null}
      </div>
    </div>
  )
}
