import { describe, expect, test } from "bun:test"
import { resolve } from "node:path"
import { getTemplatePath, validateGamePath } from "../../../src/cli/demo/utils"

describe("demo/utils", () => {
  describe("validateGamePath", () => {
    test("should validate a correct game structure", async () => {
      const gamePath = resolve("tests/fixtures/demo/valid-game")
      await expect(validateGamePath(gamePath)).resolves.toBeUndefined()
    })

    test("should throw error for non-existent path", async () => {
      const gamePath = resolve("tests/fixtures/demo/does-not-exist")
      await expect(validateGamePath(gamePath)).rejects.toThrow(
        "Game path does not exist",
      )
    })

    test("should throw error for file instead of directory", async () => {
      const gamePath = resolve("tests/fixtures/demo/valid-game/package.json")
      await expect(validateGamePath(gamePath)).rejects.toThrow(
        "Game path is not a directory",
      )
    })

    test("should throw error when package.json is missing", async () => {
      const gamePath = resolve("tests/fixtures/demo/no-package-json")
      await expect(validateGamePath(gamePath)).rejects.toThrow(
        "No package.json found in game directory",
      )
    })

    test("should throw error when src/index.ts is missing", async () => {
      const gamePath = resolve("tests/fixtures/demo/no-src-index")
      await expect(validateGamePath(gamePath)).rejects.toThrow(
        "No src/index.ts found in game directory",
      )
    })

    test("should not throw error when src/demo/DemoLoader.ts is missing (optional)", async () => {
      const gamePath = resolve("tests/fixtures/demo/no-demo-loader")
      await expect(validateGamePath(gamePath)).resolves.toBeUndefined()
    })

    test("should resolve relative paths", async () => {
      await expect(
        validateGamePath("tests/fixtures/demo/valid-game"),
      ).resolves.toBeUndefined()
    })
  })

  describe("getTemplatePath", () => {
    test("should return a valid path to demo-template", () => {
      const templatePath = getTemplatePath()
      expect(templatePath).toContain("demo-template")
      expect(templatePath.endsWith("src/demo-template")).toBe(true)
    })

    test("should return an absolute path", () => {
      const templatePath = getTemplatePath()
      expect(templatePath).toBe(resolve(templatePath))
    })
  })
})
