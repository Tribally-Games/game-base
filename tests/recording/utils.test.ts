import { describe, expect, test } from "bun:test"
import type { GameRecording } from "@clockwork-engine/core"
import {
  base64ToUint8Array,
  isCompressedRecording,
  isGameRecording,
  uint8ArrayToBase64,
} from "../../src/recording/utils"

describe("Recording Utils", () => {
  describe("uint8ArrayToBase64", () => {
    test("should encode empty array", () => {
      const result = uint8ArrayToBase64(new Uint8Array([]))
      expect(result).toBe("")
    })

    test("should encode simple data", () => {
      const data = new TextEncoder().encode("hello")
      const result = uint8ArrayToBase64(data)
      expect(result).toBe("aGVsbG8=")
    })

    test("should encode binary data", () => {
      const data = new Uint8Array([0, 127, 255])
      const result = uint8ArrayToBase64(data)
      expect(typeof result).toBe("string")
    })
  })

  describe("base64ToUint8Array", () => {
    test("should decode empty string", () => {
      const result = base64ToUint8Array("")
      expect(result.length).toBe(0)
    })

    test("should decode simple data", () => {
      const result = base64ToUint8Array("aGVsbG8=")
      expect(new TextDecoder().decode(result)).toBe("hello")
    })

    test("should be reversible with uint8ArrayToBase64", () => {
      const original = new Uint8Array([1, 2, 3, 100, 200, 255])
      const base64 = uint8ArrayToBase64(original)
      const decoded = base64ToUint8Array(base64)
      expect(decoded).toEqual(original)
    })
  })

  describe("isCompressedRecording", () => {
    test("should return true for valid compressed recording", () => {
      const recording = {
        dataType: "recording" as const,
        compression: "lzma" as const,
        version: 1,
        data: "abc123",
      }
      expect(isCompressedRecording(recording)).toBe(true)
    })

    test("should return false for missing dataType", () => {
      expect(
        isCompressedRecording({
          compression: "lzma",
          version: 1,
          data: "abc",
        } as any),
      ).toBe(false)
    })

    test("should return false for wrong dataType", () => {
      expect(
        isCompressedRecording({
          dataType: "other",
          compression: "lzma",
          version: 1,
          data: "abc",
        } as any),
      ).toBe(false)
    })

    test("should return false for wrong compression", () => {
      expect(
        isCompressedRecording({
          dataType: "recording",
          compression: "gzip",
          version: 1,
          data: "abc",
        } as any),
      ).toBe(false)
    })

    test("should return false for missing version", () => {
      expect(
        isCompressedRecording({
          dataType: "recording",
          compression: "lzma",
          data: "abc",
        } as any),
      ).toBe(false)
    })

    test("should return false for non-number version", () => {
      expect(
        isCompressedRecording({
          dataType: "recording",
          compression: "lzma",
          version: "1",
          data: "abc",
        } as any),
      ).toBe(false)
    })

    test("should return false for missing data", () => {
      expect(
        isCompressedRecording({
          dataType: "recording",
          compression: "lzma",
          version: 1,
        } as any),
      ).toBe(false)
    })

    test("should return false for non-string data", () => {
      expect(
        isCompressedRecording({
          dataType: "recording",
          compression: "lzma",
          version: 1,
          data: 123,
        } as any),
      ).toBe(false)
    })

    test("should return false for null", () => {
      expect(isCompressedRecording(null as any)).toBe(false)
    })
  })

  describe("isGameRecording", () => {
    test("should return true for valid recording", () => {
      const recording: GameRecording = {
        gameConfig: {},
        events: [],
        deltaTicks: [],
        totalTicks: 0,
      }
      expect(isGameRecording(recording)).toBe(true)
    })

    test("should return true for recording with optional metadata", () => {
      const recording: GameRecording = {
        gameConfig: { prngSeed: "test" },
        events: [],
        deltaTicks: [100],
        totalTicks: 100,
        metadata: { createdAt: Date.now() },
      }
      expect(isGameRecording(recording)).toBe(true)
    })

    test("should return false for missing gameConfig", () => {
      expect(
        isGameRecording({ events: [], deltaTicks: [], totalTicks: 0 } as any),
      ).toBe(false)
    })

    test("should return false for missing events", () => {
      expect(
        isGameRecording({ gameConfig: {}, deltaTicks: [], totalTicks: 0 } as any),
      ).toBe(false)
    })

    test("should return false for non-array events", () => {
      expect(
        isGameRecording({
          gameConfig: {},
          events: "not-array",
          deltaTicks: [],
          totalTicks: 0,
        } as any),
      ).toBe(false)
    })

    test("should return false for missing deltaTicks", () => {
      expect(
        isGameRecording({ gameConfig: {}, events: [], totalTicks: 0 } as any),
      ).toBe(false)
    })

    test("should return false for non-array deltaTicks", () => {
      expect(
        isGameRecording({
          gameConfig: {},
          events: [],
          deltaTicks: {},
          totalTicks: 0,
        } as any),
      ).toBe(false)
    })

    test("should return false for missing totalTicks", () => {
      expect(
        isGameRecording({ gameConfig: {}, events: [], deltaTicks: [] } as any),
      ).toBe(false)
    })

    test("should return false for non-number totalTicks", () => {
      expect(
        isGameRecording({
          gameConfig: {},
          events: [],
          deltaTicks: [],
          totalTicks: "100",
        } as any),
      ).toBe(false)
    })

    test("should return false for null", () => {
      expect(isGameRecording(null)).toBe(false)
    })

    test("should return false for undefined", () => {
      expect(isGameRecording(undefined)).toBe(false)
    })
  })
})
