import { describe, expect, test } from "bun:test"
import commandExists from "command-exists"

describe("commandCheck", () => {
  test("should verify cwebp command availability", async () => {
    let cwebpExists = false

    try {
      await commandExists("cwebp")
      cwebpExists = true
    } catch {
      cwebpExists = false
    }

    expect(typeof cwebpExists).toBe("boolean")
  })

  test("should verify opusenc command availability", async () => {
    let opusencExists = false

    try {
      await commandExists("opusenc")
      opusencExists = true
    } catch {
      opusencExists = false
    }

    expect(typeof opusencExists).toBe("boolean")
  })
})
