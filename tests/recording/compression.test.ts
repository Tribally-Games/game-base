import { beforeAll, describe, expect, test } from "bun:test"
import type { GameRecording } from "@clockwork-engine/core"
import { compressString } from "lzma1"
import {
  compress,
  compressRecording,
  decompress,
  decompressRecording,
  isCompressed,
} from "../../src/recording/compression"
import {
  RecordingCompressionError,
  RecordingDecompressionError,
} from "../../src/recording/types"
import { uint8ArrayToBase64 } from "../../src/recording/utils"
import { recording as sampleRecordingJson } from "../data/recording"

describe("Recording Compression", () => {
  let sampleRecording: GameRecording

  beforeAll(() => {
    sampleRecording = JSON.parse(sampleRecordingJson)
  })

  describe("compressRecording", () => {
    test("should compress a valid recording", async () => {
      const result = await compressRecording(sampleRecording)

      expect(result.compressed.dataType).toBe("recording")
      expect(result.compressed.compression).toBe("lzma")
      expect(result.compressed.version).toBe(1)
      expect(typeof result.compressed.data).toBe("string")
      expect(result.compressed.data.length).toBeGreaterThan(0)
    })

    test("should return compression metrics", async () => {
      const result = await compressRecording(sampleRecording)

      expect(result.metrics.originalSize).toBeGreaterThan(0)
      expect(result.metrics.compressedSize).toBeGreaterThan(0)
      expect(result.metrics.compressionRatio).toBeGreaterThan(1)
      expect(result.metrics.compressionTimeMs).toBeGreaterThan(0)

      console.log("\n=== Compression Metrics ===")
      console.log(`  Original size:     ${result.metrics.originalSize} bytes`)
      console.log(`  Compressed size:   ${result.metrics.compressedSize} bytes`)
      console.log(`  Compression ratio: ${result.metrics.compressionRatio.toFixed(2)}x`)
      console.log(`  Time:              ${result.metrics.compressionTimeMs.toFixed(2)}ms`)
    })

    test("should achieve significant compression on repetitive data", async () => {
      const result = await compressRecording(sampleRecording)
      expect(result.metrics.compressionRatio).toBeGreaterThan(2)
    })

    test("should throw on invalid recording", async () => {
      const invalidRecording = { foo: "bar" } as unknown as GameRecording
      await expect(compressRecording(invalidRecording)).rejects.toThrow(
        RecordingCompressionError,
      )
    })

    test("should respect quality option", async () => {
      const lowQuality = await compressRecording(sampleRecording, { quality: 1 })
      const highQuality = await compressRecording(sampleRecording, { quality: 9 })

      expect(highQuality.metrics.compressedSize).toBeLessThanOrEqual(
        lowQuality.metrics.compressedSize,
      )
    })
  })

  describe("decompressRecording", () => {
    test("should decompress a compressed recording", async () => {
      const compressed = await compress(sampleRecording)
      const result = await decompressRecording(compressed)

      expect(result.recording).toEqual(sampleRecording)
      expect(result.metrics.wasCompressed).toBe(true)
    })

    test("should return decompression metrics", async () => {
      const compressed = await compress(sampleRecording)
      const result = await decompressRecording(compressed)

      expect(result.metrics.decompressedSize).toBeGreaterThan(0)
      expect(result.metrics.decompressionTimeMs).toBeGreaterThan(0)
      expect(result.metrics.wasCompressed).toBe(true)

      console.log("\n=== Decompression Metrics ===")
      console.log(`  Compressed size:   ${result.metrics.compressedSize} bytes`)
      console.log(`  Decompressed size: ${result.metrics.decompressedSize} bytes`)
      console.log(`  Time:              ${result.metrics.decompressionTimeMs.toFixed(2)}ms`)
    })

    test("should handle legacy uncompressed recordings", async () => {
      const result = await decompressRecording(sampleRecording)

      expect(result.recording).toEqual(sampleRecording)
      expect(result.metrics.wasCompressed).toBe(false)
    })

    test("should throw on corrupted compressed data", async () => {
      const corrupted = {
        dataType: "recording" as const,
        compression: "lzma" as const,
        version: 1,
        data: "invalid-base64-data!!!",
      }

      await expect(decompressRecording(corrupted)).rejects.toThrow(
        RecordingDecompressionError,
      )
    })

    test("should throw when decompressed data is not valid recording", async () => {
      const invalidData = { foo: "bar" }
      const jsonString = JSON.stringify(invalidData)
      const compressedData = compressString(jsonString, 1)
      const base64Data = uint8ArrayToBase64(compressedData)

      const fakeCompressed = {
        dataType: "recording" as const,
        compression: "lzma" as const,
        version: 1,
        data: base64Data,
      }

      await expect(decompressRecording(fakeCompressed)).rejects.toThrow(
        RecordingDecompressionError,
      )
    })
  })

  describe("compress/decompress roundtrip", () => {
    test("should preserve all recording data", async () => {
      const compressed = await compress(sampleRecording)
      const decompressed = await decompress(compressed)

      expect(decompressed.gameConfig).toEqual(sampleRecording.gameConfig)
      expect(decompressed.events).toEqual(sampleRecording.events)
      expect(decompressed.deltaTicks).toEqual(sampleRecording.deltaTicks)
      expect(decompressed.totalTicks).toBe(sampleRecording.totalTicks)
      expect(decompressed.metadata).toEqual(sampleRecording.metadata)
    })

    test("should handle recording with minimal data", async () => {
      const minimalRecording: GameRecording = {
        gameConfig: {},
        events: [],
        deltaTicks: [],
        totalTicks: 0,
      }

      const compressed = await compress(minimalRecording)
      const decompressed = await decompress(compressed)

      expect(decompressed).toEqual(minimalRecording)
    })

    test("should handle recording with large events array", async () => {
      const largeRecording: GameRecording = {
        gameConfig: { prngSeed: "test" },
        events: Array.from({ length: 1000 }, (_, i) => ({
          type: "USER_INPUT" as any,
          tick: i * 100,
          inputType: "intent",
          params: { intent: i % 2 === 0 ? "up" : "down" },
        })),
        deltaTicks: Array.from({ length: 1000 }, () => 100),
        totalTicks: 100000,
      }

      const compressed = await compress(largeRecording)
      const decompressed = await decompress(compressed)

      expect(decompressed.events.length).toBe(1000)
      expect(decompressed.deltaTicks.length).toBe(1000)
    })
  })

  describe("isCompressed", () => {
    test("should return true for compressed recording", async () => {
      const compressed = await compress(sampleRecording)
      expect(isCompressed(compressed)).toBe(true)
    })

    test("should return false for uncompressed recording", () => {
      expect(isCompressed(sampleRecording)).toBe(false)
    })

    test("should return false for invalid objects", () => {
      expect(isCompressed({} as any)).toBe(false)
      expect(isCompressed({ dataType: "recording" } as any)).toBe(false)
      expect(isCompressed({ data: "abc" } as any)).toBe(false)
    })
  })

  describe("performance benchmarks", () => {
    test("should benchmark compression performance", async () => {
      const iterations = 10
      const times: number[] = []

      for (let i = 0; i < iterations; i++) {
        const start = performance.now()
        await compress(sampleRecording)
        times.push(performance.now() - start)
      }

      const avgTime = times.reduce((a, b) => a + b, 0) / iterations
      const minTime = Math.min(...times)
      const maxTime = Math.max(...times)

      console.log(`\n=== Compression Benchmark (${iterations} iterations) ===`)
      console.log(`  Average: ${avgTime.toFixed(2)}ms`)
      console.log(`  Min:     ${minTime.toFixed(2)}ms`)
      console.log(`  Max:     ${maxTime.toFixed(2)}ms`)

      expect(avgTime).toBeLessThan(500)
    })

    test("should benchmark decompression performance", async () => {
      const compressed = await compress(sampleRecording)
      const iterations = 10
      const times: number[] = []

      for (let i = 0; i < iterations; i++) {
        const start = performance.now()
        await decompress(compressed)
        times.push(performance.now() - start)
      }

      const avgTime = times.reduce((a, b) => a + b, 0) / iterations
      const minTime = Math.min(...times)
      const maxTime = Math.max(...times)

      console.log(`\n=== Decompression Benchmark (${iterations} iterations) ===`)
      console.log(`  Average: ${avgTime.toFixed(2)}ms`)
      console.log(`  Min:     ${minTime.toFixed(2)}ms`)
      console.log(`  Max:     ${maxTime.toFixed(2)}ms`)

      expect(avgTime).toBeLessThan(100)
    })
  })
})
