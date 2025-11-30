import type { ValidationResult } from "../hooks/useHeadlessValidation"

interface ValidationDetailsDialogProps {
  isOpen: boolean
  result: ValidationResult | null
  onClose: () => void
}

export function ValidationDetailsDialog({
  isOpen,
  result,
  onClose,
}: ValidationDetailsDialogProps) {
  if (!isOpen || !result) return null

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
      }}
    >
      <div
        style={{
          backgroundColor: "#2a2a2a",
          borderRadius: "8px",
          padding: "20px",
          maxWidth: "800px",
          maxHeight: "80vh",
          overflow: "auto",
          border: result.success ? "2px solid #4a7c59" : "2px solid #d9534f",
        }}
      >
        <h2
          style={{
            color: result.success ? "#4a7c59" : "#d9534f",
            marginTop: 0,
          }}
        >
          {result.success ? "Validation Passed" : "Validation Failed"}
        </h2>
        <p>{result.message}</p>

        {result.differences && result.differences.length > 0 && (
          <div>
            <h3>Differences:</h3>
            <ul
              style={{
                fontSize: "12px",
                maxHeight: "200px",
                overflowY: "auto",
              }}
            >
              {result.differences.map((diff, i) => (
                <li
                  key={i}
                  style={{ marginBottom: "4px", fontFamily: "monospace" }}
                >
                  {diff}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
          <div style={{ flex: 1 }}>
            <h4>Expected (from gameplay):</h4>
            <pre
              style={{
                fontSize: "10px",
                maxHeight: "200px",
                overflowY: "auto",
                backgroundColor: "#1a1a1a",
                padding: "10px",
                borderRadius: "4px",
              }}
            >
              {JSON.stringify(result.expectedSnapshot, null, 2)}
            </pre>
          </div>
          <div style={{ flex: 1 }}>
            <h4>Actual (from validation):</h4>
            <pre
              style={{
                fontSize: "10px",
                maxHeight: "200px",
                overflowY: "auto",
                backgroundColor: "#1a1a1a",
                padding: "10px",
                borderRadius: "4px",
              }}
            >
              {JSON.stringify(result.actualSnapshot, null, 2)}
            </pre>
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            marginTop: "20px",
            padding: "10px 30px",
            backgroundColor: "#5b7c99",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Close
        </button>
      </div>
    </div>
  )
}
