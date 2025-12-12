import {
  type GameRecording,
  HeadlessLoader,
  ReplayManager,
} from "@clockwork-engine/core"
import { MemoryPlatformLayer } from "@clockwork-engine/platform-memory"
import { useCallback, useState } from "react"

export interface ValidationResult {
  success: boolean
  message: string
  expectedSnapshot?: any
  actualSnapshot?: any
  differences?: string[]
}

function compareSnapshots(expected: any, actual: any): ValidationResult {
  const differences: string[] = []

  for (const key of Object.keys(expected)) {
    const expectedVal = JSON.stringify(expected[key])
    const actualVal = JSON.stringify(actual[key])
    if (expectedVal !== actualVal) {
      differences.push(`${key}: expected ${expectedVal}, got ${actualVal}`)
    }
  }

  for (const key of Object.keys(actual)) {
    if (!(key in expected)) {
      differences.push(
        `${key}: unexpected key in actual (value: ${JSON.stringify(actual[key])})`,
      )
    }
  }

  return {
    success: differences.length === 0,
    message:
      differences.length === 0
        ? "Validation passed"
        : "State mismatch detected",
    expectedSnapshot: expected,
    actualSnapshot: actual,
    differences,
  }
}

export function useHeadlessValidation(
  GameEngineClass: any,
  DemoLoader: any,
  extractGameSnapshotInfo: (snapshot: any) => Record<string, any>,
) {
  const [isValidating, setIsValidating] = useState(false)
  const [validationResult, setValidationResult] =
    useState<ValidationResult | null>(null)

  const validate = useCallback(
    async (
      recording: GameRecording,
      expectedSnapshot: any,
    ): Promise<ValidationResult> => {
      setIsValidating(true)
      setValidationResult(null)

      try {
        const demoLoader = new DemoLoader()
        const loader = new HeadlessLoader(demoLoader)
        const platform = new MemoryPlatformLayer()
        const engine = new GameEngineClass({ loader, platform })
        const replayManager = new ReplayManager(engine)

        await replayManager.replay(recording)
        const replayEngine = replayManager.getReplayEngine()

        const TIMEOUT_MS = 10000
        const startTime = Date.now()

        while (replayManager.getReplayProgress().progress < 1.0) {
          if (Date.now() - startTime > TIMEOUT_MS) {
            throw new Error("Validation timeout exceeded")
          }
          replayEngine.update(recording.totalTicks)
          await new Promise((resolve) => setTimeout(resolve, 0))
        }

        const actualSnapshot = engine.getGameSnapshot()
        const extractedExpected = extractGameSnapshotInfo(expectedSnapshot)
        const extractedActual = extractGameSnapshotInfo(actualSnapshot)
        const result = compareSnapshots(extractedExpected, extractedActual)
        setValidationResult(result)
        return result
      } catch (error: any) {
        const result: ValidationResult = {
          success: false,
          message: `Validation error: ${error.message}`,
        }
        setValidationResult(result)
        return result
      } finally {
        setIsValidating(false)
      }
    },
    [GameEngineClass, DemoLoader, extractGameSnapshotInfo],
  )

  const clearResult = useCallback(() => {
    setValidationResult(null)
  }, [])

  return { validate, isValidating, validationResult, clearResult }
}
