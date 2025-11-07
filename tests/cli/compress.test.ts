import { afterEach, beforeEach, describe, expect, test } from "bun:test"
import { existsSync } from "node:fs"
import { mkdtemp, readdir, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { execa } from "execa"

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

    await execa("./bin/game-base.js", [
      "compress",
      pattern,
      "-o",
      tempDir,
      "--webp-quality",
      "25",
      "--opus-bitrate",
      "24",
    ])

    const files = await readdir(tempDir)
    const webpFiles = files.filter((f) => f.endsWith(".webp"))
    expect(webpFiles.length).toBeGreaterThan(0)
  })

  test("should compress JPG files to WebP", async () => {
    const pattern = "tests/assets/*.jpg"

    await execa("./bin/game-base.js", [
      "compress",
      pattern,
      "-o",
      tempDir,
      "--webp-quality",
      "25",
      "--opus-bitrate",
      "24",
    ])

    const files = await readdir(tempDir)
    const webpFiles = files.filter((f) => f.endsWith(".webp"))
    expect(webpFiles.length).toBeGreaterThan(0)
  })

  test("should compress WAV files to Opus", async () => {
    const pattern = "tests/assets/*.wav"

    await execa("./bin/game-base.js", [
      "compress",
      pattern,
      "-o",
      tempDir,
      "--webp-quality",
      "25",
      "--opus-bitrate",
      "24",
    ])

    const files = await readdir(tempDir)
    const opusFiles = files.filter((f) => f.endsWith(".opus"))
    expect(opusFiles.length).toBeGreaterThan(0)
  })

  test("should compress multiple file types", async () => {
    const pattern = "tests/assets/*.{png,jpg,wav}"

    await execa("./bin/game-base.js", [
      "compress",
      pattern,
      "-o",
      tempDir,
      "--webp-quality",
      "50",
      "--opus-bitrate",
      "48",
    ])

    const files = await readdir(tempDir)
    const webpFiles = files.filter((f) => f.endsWith(".webp"))
    const opusFiles = files.filter((f) => f.endsWith(".opus"))

    expect(webpFiles.length).toBe(3)
    expect(opusFiles.length).toBe(1)

    expect(files).toContain("chest-spritesheet.webp")
    expect(files).toContain("fireball-spritesheet.webp")
    expect(files).toContain("level-bg-1.webp")
    expect(files).toContain("enemy-death.opus")
  })

  test("should respect custom WebP quality setting", async () => {
    const pattern = "tests/assets/chest-spritesheet.png"

    await execa("./bin/game-base.js", [
      "compress",
      pattern,
      "-o",
      tempDir,
      "--webp-quality",
      "80",
      "--opus-bitrate",
      "24",
    ])

    const files = await readdir(tempDir)
    const webpFiles = files.filter((f) => f.endsWith(".webp"))
    expect(webpFiles.length).toBe(1)
    expect(webpFiles[0]).toBe("chest-spritesheet.webp")
  })

  test("should respect custom Opus bitrate setting", async () => {
    const pattern = "tests/assets/enemy-death.wav"

    await execa("./bin/game-base.js", [
      "compress",
      pattern,
      "-o",
      tempDir,
      "--webp-quality",
      "25",
      "--opus-bitrate",
      "96",
    ])

    const files = await readdir(tempDir)
    const opusFiles = files.filter((f) => f.endsWith(".opus"))
    expect(opusFiles.length).toBe(1)
    expect(opusFiles[0]).toBe("enemy-death.opus")
  })

  test("should create output directory if it doesn't exist", async () => {
    const nonExistentDir = join(tempDir, "nested", "output")
    const pattern = "tests/assets/nonexistent.png"

    await execa("./bin/game-base.js", [
      "compress",
      pattern,
      "-o",
      nonExistentDir,
      "--webp-quality",
      "25",
      "--opus-bitrate",
      "24",
    ])

    expect(existsSync(nonExistentDir)).toBe(true)
  })

  test("should handle empty pattern gracefully", async () => {
    const pattern = "tests/assets/*.nonexistent"

    await execa("./bin/game-base.js", [
      "compress",
      pattern,
      "-o",
      tempDir,
      "--webp-quality",
      "25",
      "--opus-bitrate",
      "24",
    ])

    expect(existsSync(tempDir)).toBe(true)
  })
})
