import { afterEach, beforeEach, describe, expect, test } from "bun:test"
import { existsSync } from "node:fs"
import { mkdtemp, readdir, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { compress } from "../../src/cli/compress"

describe("compress command", () => {
  let tempDir: string

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), "compress-test-"))
  })

  afterEach(async () => {
    if (existsSync(tempDir)) {
      await rm(tempDir, { recursive: true, force: true })
    }
  })

  test("should compress PNG files to WebP", async () => {
    const pattern = "tests/assets/*.png"

    await compress(pattern, {
      output: tempDir,
      webpQuality: "25",
      opusBitrate: "24",
    })

    const files = await readdir(tempDir)
    const webpFiles = files.filter((f) => f.endsWith(".webp"))
    expect(webpFiles.length).toBeGreaterThan(0)
  })

  test("should compress JPG files to WebP", async () => {
    const pattern = "tests/assets/*.jpg"

    await compress(pattern, {
      output: tempDir,
      webpQuality: "25",
      opusBitrate: "24",
    })

    const files = await readdir(tempDir)
    const webpFiles = files.filter((f) => f.endsWith(".webp"))
    expect(webpFiles.length).toBeGreaterThan(0)
  })

  test("should compress WAV files to Opus", async () => {
    const pattern = "tests/assets/*.wav"

    await compress(pattern, {
      output: tempDir,
      webpQuality: "25",
      opusBitrate: "24",
    })

    const files = await readdir(tempDir)
    const opusFiles = files.filter((f) => f.endsWith(".opus"))
    expect(opusFiles.length).toBeGreaterThan(0)
  })

  test("should compress multiple file types", async () => {
    const pattern = "tests/assets/*.{png,jpg,wav}"

    await compress(pattern, {
      output: tempDir,
      webpQuality: "50",
      opusBitrate: "48",
    })

    const files = await readdir(tempDir)
    const webpFiles = files.filter((f) => f.endsWith(".webp"))
    const opusFiles = files.filter((f) => f.endsWith(".opus"))
    expect(webpFiles.length).toBeGreaterThan(0)
    expect(opusFiles.length).toBeGreaterThan(0)
  })

  test("should respect custom WebP quality setting", async () => {
    const pattern = "tests/assets/chest-spritesheet.png"

    await compress(pattern, {
      output: tempDir,
      webpQuality: "80",
      opusBitrate: "24",
    })

    const files = await readdir(tempDir)
    const webpFiles = files.filter((f) => f.endsWith(".webp"))
    expect(webpFiles.length).toBe(1)
    expect(webpFiles[0]).toBe("chest-spritesheet.webp")
  })

  test("should respect custom Opus bitrate setting", async () => {
    const pattern = "tests/assets/enemy-death.wav"

    await compress(pattern, {
      output: tempDir,
      webpQuality: "25",
      opusBitrate: "96",
    })

    const files = await readdir(tempDir)
    const opusFiles = files.filter((f) => f.endsWith(".opus"))
    expect(opusFiles.length).toBe(1)
    expect(opusFiles[0]).toBe("enemy-death.opus")
  })

  test("should create output directory if it doesn't exist", async () => {
    const nonExistentDir = join(tempDir, "nested", "output")
    const pattern = "tests/assets/nonexistent.png"

    await compress(pattern, {
      output: nonExistentDir,
      webpQuality: "25",
      opusBitrate: "24",
    })

    expect(existsSync(nonExistentDir)).toBe(true)
  })

  test("should handle empty pattern gracefully", async () => {
    const pattern = "tests/assets/*.nonexistent"

    await compress(pattern, {
      output: tempDir,
      webpQuality: "25",
      opusBitrate: "24",
    })

    expect(existsSync(tempDir)).toBe(true)
  })
})
