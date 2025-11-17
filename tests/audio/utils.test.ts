import { describe, expect, test } from "bun:test"
import { dataUriToArrayBuffer } from "../../src/audio/utils"

describe("dataUriToArrayBuffer", () => {
  test("decodes valid data URI", () => {
    const testData = "Hello, World!"
    const base64 = btoa(testData)
    const dataUri = `data:text/plain;base64,${base64}`

    const arrayBuffer = dataUriToArrayBuffer(dataUri)
    const decoded = new TextDecoder().decode(arrayBuffer)

    expect(decoded).toBe(testData)
  })

  test("throws on invalid data URI format", () => {
    expect(() => dataUriToArrayBuffer("invalid")).toThrow("Invalid data URI format")
  })

  test("handles binary data", () => {
    const binaryData = new Uint8Array([0x00, 0x01, 0x02, 0x03, 0xFF])
    const binaryString = Array.from(binaryData)
      .map((byte) => String.fromCharCode(byte))
      .join("")
    const base64 = btoa(binaryString)
    const dataUri = `data:application/octet-stream;base64,${base64}`

    const arrayBuffer = dataUriToArrayBuffer(dataUri)
    const result = new Uint8Array(arrayBuffer)

    expect(result).toEqual(binaryData)
  })
})
