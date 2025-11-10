import { afterEach, beforeEach, describe, expect, test } from "bun:test"
import { existsSync } from "node:fs"
import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { convertToOpus, convertToWebP } from "../../../src/cli/utils/converters"

describe("converters", () => {
  let tempDir: string

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), "converters-test-"))
  })

  afterEach(async () => {
    if (existsSync(tempDir)) {
      await rm(tempDir, { recursive: true, force: true })
    }
  })

  describe("convertToWebP", () => {
    test("should convert PNG to WebP with default quality", async () => {
      const inputPath = join(
        process.cwd(),
        "tests/assets/chest-spritesheet.png",
      )
      const { outputPath, sizeInfo } = await convertToWebP(inputPath, tempDir, 25)

      expect(existsSync(outputPath)).toBe(true)
      expect(outputPath).toContain(".webp")
      expect(outputPath).toContain(tempDir)
      expect(sizeInfo.inputSize).toBeGreaterThan(0)
      expect(sizeInfo.outputSize).toBeGreaterThan(0)
      expect(sizeInfo.savings).toBeDefined()
      expect(sizeInfo.savingsPercent).toBeDefined()
    })

    test("should convert JPG to WebP with custom quality", async () => {
      const inputPath = join(process.cwd(), "tests/assets/level-bg-1.jpg")
      const { outputPath, sizeInfo } = await convertToWebP(inputPath, tempDir, 75)

      expect(existsSync(outputPath)).toBe(true)
      expect(outputPath).toContain(".webp")
      expect(sizeInfo.inputSize).toBeGreaterThan(0)
      expect(sizeInfo.outputSize).toBeGreaterThan(0)
    })

    test("should create output directory if it doesn't exist", async () => {
      const inputPath = join(
        process.cwd(),
        "tests/assets/fireball-spritesheet.png",
      )
      const nestedOutputDir = join(tempDir, "nested", "output")
      const { outputPath } = await convertToWebP(inputPath, nestedOutputDir, 25)

      expect(existsSync(outputPath)).toBe(true)
      expect(existsSync(nestedOutputDir)).toBe(true)
    })

    test("should replace image extension with .webp", async () => {
      const inputPath = join(process.cwd(), "tests/assets/level-bg-1.jpg")
      const { outputPath } = await convertToWebP(inputPath, tempDir, 25)

      expect(outputPath).toMatch(/level-bg-1\.webp$/)
    })
  })

  describe("convertToOpus", () => {
    test("should convert WAV to Opus with default bitrate", async () => {
      const inputPath = join(process.cwd(), "tests/assets/enemy-death.wav")
      const { outputPath, sizeInfo } = await convertToOpus(inputPath, tempDir, 24)

      expect(existsSync(outputPath)).toBe(true)
      expect(outputPath).toContain(".opus")
      expect(outputPath).toContain(tempDir)
      expect(sizeInfo.inputSize).toBeGreaterThan(0)
      expect(sizeInfo.outputSize).toBeGreaterThan(0)
      expect(sizeInfo.savings).toBeDefined()
      expect(sizeInfo.savingsPercent).toBeDefined()
    })

    test("should convert WAV to Opus with custom bitrate", async () => {
      const inputPath = join(process.cwd(), "tests/assets/enemy-death.wav")
      const { outputPath, sizeInfo } = await convertToOpus(inputPath, tempDir, 64)

      expect(existsSync(outputPath)).toBe(true)
      expect(outputPath).toContain(".opus")
      expect(sizeInfo.inputSize).toBeGreaterThan(0)
      expect(sizeInfo.outputSize).toBeGreaterThan(0)
    })

    test("should create output directory if it doesn't exist", async () => {
      const inputPath = join(process.cwd(), "tests/assets/enemy-death.wav")
      const nestedOutputDir = join(tempDir, "audio", "output")
      const { outputPath } = await convertToOpus(inputPath, nestedOutputDir, 24)

      expect(existsSync(outputPath)).toBe(true)
      expect(existsSync(nestedOutputDir)).toBe(true)
    })

    test("should replace .wav extension with .opus", async () => {
      const inputPath = join(process.cwd(), "tests/assets/enemy-death.wav")
      const { outputPath } = await convertToOpus(inputPath, tempDir, 24)

      expect(outputPath).toMatch(/enemy-death\.opus$/)
    })
  })
})
