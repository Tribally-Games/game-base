import { describe, test, expect, beforeEach, afterEach } from "bun:test"
import { DemoLoader } from "../../src/demo-template/DemoLoader"

// Mock FileReader for testing environment
class MockFileReader {
  onload: ((event: any) => void) | null = null
  onloadend: ((event: any) => void) | null = null
  onerror: ((event: any) => void) | null = null
  result: string | null = null

  readAsDataURL(blob: Blob) {
    setTimeout(async () => {
      const buffer = await blob.arrayBuffer()
      const base64 = Buffer.from(buffer).toString("base64")
      const type = blob.type || "application/octet-stream"
      this.result = `data:${type};base64,${base64}`
      if (this.onloadend) {
        this.onloadend({ target: this })
      }
    }, 0)
  }
}

// @ts-ignore
globalThis.FileReader = MockFileReader

describe("DemoLoader", () => {
  let loader: DemoLoader

  beforeEach(() => {
    loader = new DemoLoader()
  })

  afterEach(() => {
    // Clean up any fetch mocks
    ;(globalThis as any).fetch = fetch
  })

  describe("URL handling", () => {
    test("passes through full HTTP URLs", async () => {
      const mockResponse = {
        ok: true,
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => '{"test": "data"}',
      }

      const mockFetch = async (url: string) => {
        expect(url).toBe("http://example.com/asset.json")
        return mockResponse
      }

      ;(globalThis as any).fetch = mockFetch

      const result = await loader.fetchData("http://example.com/asset.json")
      expect(result).toBe('{"test": "data"}')
    })

    test("passes through full HTTPS URLs", async () => {
      const mockResponse = {
        ok: true,
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => '{"test": "data"}',
      }

      const mockFetch = async (url: string) => {
        expect(url).toBe("https://example.com/asset.json")
        return mockResponse
      }

      ;(globalThis as any).fetch = mockFetch

      const result = await loader.fetchData("https://example.com/asset.json")
      expect(result).toBe('{"test": "data"}')
    })

    test("passes through data URLs", async () => {
      const mockResponse = {
        ok: true,
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => '{"test": "data"}',
      }

      const mockFetch = async (url: string) => {
        expect(url).toBe("data:application/json;base64,eyJ0ZXN0IjoiZGF0YSJ9")
        return mockResponse
      }

      ;(globalThis as any).fetch = mockFetch

      const result = await loader.fetchData("data:application/json;base64,eyJ0ZXN0IjoiZGF0YSJ9")
      expect(result).toBe('{"test": "data"}')
    })

    test("prefixes relative paths with /game-assets/", async () => {
      const mockResponse = {
        ok: true,
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => '{"test": "data"}',
      }

      const mockFetch = async (url: string) => {
        expect(url).toBe("/game-assets/sprites/player.json")
        return mockResponse
      }

      ;(globalThis as any).fetch = mockFetch

      const result = await loader.fetchData("sprites/player.json")
      expect(result).toBe('{"test": "data"}')
    })
  })

  describe("content type handling", () => {
    test("returns text for JSON content type", async () => {
      const mockResponse = {
        ok: true,
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => '{"sprite": "data"}',
      }

      const mockFetch = async () => mockResponse

      ;(globalThis as any).fetch = mockFetch

      const result = await loader.fetchData("test.json")
      expect(result).toBe('{"sprite": "data"}')
    })

    test("returns text for JavaScript content type", async () => {
      const mockResponse = {
        ok: true,
        headers: new Headers({ "content-type": "text/javascript" }),
        text: async () => "console.log('test')",
      }

      const mockFetch = async () => mockResponse

      ;(globalThis as any).fetch = mockFetch

      const result = await loader.fetchData("test.js")
      expect(result).toBe("console.log('test')")
    })

    test("converts binary content to Data URL", async () => {
      const mockBlob = new Blob(["fake image data"], { type: "image/png" })
      const mockResponse = {
        ok: true,
        headers: new Headers({ "content-type": "image/png" }),
        blob: async () => mockBlob,
      }

      const mockFetch = async () => mockResponse

      ;(globalThis as any).fetch = mockFetch

      const result = await loader.fetchData("test.png")
      expect(result).toStartWith("data:")
    })

    test("handles missing content-type header", async () => {
      const mockBlob = new Blob(["unknown data"])
      const mockResponse = {
        ok: true,
        headers: new Headers(),
        blob: async () => mockBlob,
      }

      const mockFetch = async () => mockResponse

      ;(globalThis as any).fetch = mockFetch

      const result = await loader.fetchData("test.unknown")
      expect(result).toStartWith("data:")
    })
  })

  describe("error handling", () => {
    test("throws error on HTTP failure", async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: "Not Found",
      }

      const mockFetch = async () => mockResponse

      ;(globalThis as any).fetch = mockFetch

      await expect(loader.fetchData("missing.json")).rejects.toThrow(
        "Failed to fetch /game-assets/missing.json: 404 Not Found",
      )
    })

    test("throws error on network failure", async () => {
      const mockFetch = async () => {
        throw new Error("Network error")
      }

      ;(globalThis as any).fetch = mockFetch

      await expect(loader.fetchData("test.json")).rejects.toThrow(
        'DemoLoader failed to load asset "test.json": Network error',
      )
    })

    test("throws error on FileReader failure", async () => {
      const mockBlob = new Blob(["test"], { type: "image/png" })
      const mockResponse = {
        ok: true,
        headers: new Headers({ "content-type": "image/png" }),
        blob: async () => mockBlob,
      }

      const mockFetch = async () => mockResponse

      const originalFileReader = globalThis.FileReader
      globalThis.FileReader = class {
        onload: ((event: any) => void) | null = null
        onerror: ((event: any) => void) | null = null
        result: string | null = null

        readAsDataURL() {
          setTimeout(() => {
            if (this.onerror) {
              this.onerror(new Event("error"))
            }
          }, 0)
        }
      } as any

      ;(globalThis as any).fetch = mockFetch

      try {
        await expect(loader.fetchData("test.png")).rejects.toThrow()
      } finally {
        globalThis.FileReader = originalFileReader
      }
    })
  })

  describe("integration scenarios", () => {
    test("loads sprite JSON successfully", async () => {
      const spriteData = {
        frames: [
          { x: 0, y: 0, w: 32, h: 32 },
          { x: 32, y: 0, w: 32, h: 32 },
        ],
      }

      const mockResponse = {
        ok: true,
        headers: new Headers({ "content-type": "application/json" }),
        text: async () => JSON.stringify(spriteData),
      }

      const mockFetch = async () => mockResponse

      ;(globalThis as any).fetch = mockFetch

      const result = await loader.fetchData("sprites/player.json")
      expect(JSON.parse(result)).toEqual(spriteData)
    })

    test("loads audio file as Data URL", async () => {
      const mockBlob = new Blob(["fake audio data"], { type: "audio/wav" })
      const mockResponse = {
        ok: true,
        headers: new Headers({ "content-type": "audio/wav" }),
        blob: async () => mockBlob,
      }

      const mockFetch = async () => mockResponse

      ;(globalThis as any).fetch = mockFetch

      const result = await loader.fetchData("sounds/jump.wav")
      expect(result).toStartWith("data:audio/wav")
    })
  })
})
