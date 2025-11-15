import { afterEach, describe, expect, test } from "bun:test"
import { existsSync } from "node:fs"
import { rm } from "node:fs/promises"
import { resolve } from "node:path"
import { buildDemo } from "../../../src/cli/demo/builder"

describe("demo/builder", () => {
  const gamePath = resolve("tests/fixtures/demo/valid-game")
  const outputDir = "test-dist-demo"

  afterEach(async () => {
    const distPath = resolve(gamePath, outputDir)
    await rm(distPath, { recursive: true, force: true })
  })

  describe("buildDemo", () => {
    test("should build demo successfully", async () => {
      await buildDemo(gamePath, {
        port: "3000",
        host: "localhost",
        open: false,
        outDir: outputDir,
      })

      const distPath = resolve(gamePath, outputDir)
      expect(existsSync(distPath)).toBe(true)
      expect(existsSync(resolve(distPath, "index.html"))).toBe(true)
    })

    test("should build demo and copy assets when assetsDir is provided", async () => {
      await buildDemo(gamePath, {
        port: "3000",
        host: "localhost",
        open: false,
        outDir: outputDir,
        assetsDir: "assets",
      })

      const distPath = resolve(gamePath, outputDir)
      const gameAssetsPath = resolve(distPath, "game-assets")

      expect(existsSync(distPath)).toBe(true)
      expect(existsSync(resolve(distPath, "index.html"))).toBe(true)
      expect(existsSync(gameAssetsPath)).toBe(true)
      expect(existsSync(resolve(gameAssetsPath, "test.png"))).toBe(true)
      expect(existsSync(resolve(gameAssetsPath, "test.wav"))).toBe(true)
    })

    test("should build demo without copying assets when assetsDir is not provided", async () => {
      await buildDemo(gamePath, {
        port: "3000",
        host: "localhost",
        open: false,
        outDir: outputDir,
      })

      const distPath = resolve(gamePath, outputDir)
      const gameAssetsPath = resolve(distPath, "game-assets")

      expect(existsSync(distPath)).toBe(true)
      expect(existsSync(gameAssetsPath)).toBe(false)
    })

    test("should build demo without copying assets when assetsDir does not exist", async () => {
      await buildDemo(gamePath, {
        port: "3000",
        host: "localhost",
        open: false,
        outDir: outputDir,
        assetsDir: "non-existent-assets",
      })

      const distPath = resolve(gamePath, outputDir)
      const gameAssetsPath = resolve(distPath, "game-assets")

      expect(existsSync(distPath)).toBe(true)
      expect(existsSync(gameAssetsPath)).toBe(false)
    })

    test("should use custom output directory", async () => {
      const customOutDir = "custom-build-output"

      await buildDemo(gamePath, {
        port: "3000",
        host: "localhost",
        open: false,
        outDir: customOutDir,
      })

      const distPath = resolve(gamePath, customOutDir)
      expect(existsSync(distPath)).toBe(true)
      expect(existsSync(resolve(distPath, "index.html"))).toBe(true)

      await rm(distPath, { recursive: true, force: true })
    })
  })
})
