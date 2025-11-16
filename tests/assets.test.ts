import { beforeEach, describe, expect, it, mock } from "bun:test"
import { PIXI } from "@hiddentao/clockwork-engine"
import {
  AssetType,
  BaseAssetLoader,
  Spritesheet,
  type AssetLoaderHooks,
} from "../src/assets"

// Mock Audio API for testing environment
class MockAudio {
  private listeners: Map<string, Array<(e?: any) => void>> = new Map()

  constructor(public src: string) {
    setTimeout(() => {
      const canplaythroughListeners = this.listeners.get("canplaythrough") || []
      for (const listener of canplaythroughListeners) {
        listener()
      }
    }, 0)
  }

  addEventListener(event: string, handler: (e?: any) => void, options?: any) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(handler)
  }
}

// @ts-ignore
globalThis.Audio = MockAudio

// Mock Loader for testing
class MockLoader {
  private mockData: Map<string, string> = new Map()

  setMockData(filename: string, data: string) {
    this.mockData.set(filename, data)
  }

  async fetchData(filename: string): Promise<string> {
    const data = this.mockData.get(filename)
    if (!data) {
      throw new Error(`Mock data not found for ${filename}`)
    }
    return data
  }
}

// Test asset enums
enum TestSpritesheets {
  PLAYER = "player.png",
  ENEMY = "enemy.png",
}

enum TestImages {
  BACKGROUND = "background.png",
}

enum TestSounds {
  JUMP = "jump.opus",
}

// Concrete implementation for testing
class TestAssetLoader extends BaseAssetLoader<
  TestSpritesheets,
  TestImages,
  TestSounds
> {
  protected getSpritesheetsList(): readonly TestSpritesheets[] {
    return Object.values(TestSpritesheets)
  }

  protected getStaticImagesList(): readonly TestImages[] {
    return Object.values(TestImages)
  }

  protected getSoundsList(): readonly TestSounds[] {
    return Object.values(TestSounds)
  }
}

describe("Assets System", () => {
  describe("BaseAssetLoader", () => {
    let loader: MockLoader
    let assetLoader: TestAssetLoader

    beforeEach(() => {
      loader = new MockLoader()
      assetLoader = new TestAssetLoader(loader as any)
    })

    it("should cache loaded assets", async () => {
      const imageUrl = "data:image/png;base64,test"
      loader.setMockData("background.png", imageUrl)

      const mockTexture = { test: "texture" } as any
      mock.module("@hiddentao/clockwork-engine", () => ({
        PIXI: {
          Assets: {
            load: async () => mockTexture,
          },
        },
      }))

      const asset1 = await assetLoader.loadAsset(
        AssetType.STATIC_IMAGE,
        TestImages.BACKGROUND,
      )
      const asset2 = await assetLoader.loadAsset(
        AssetType.STATIC_IMAGE,
        TestImages.BACKGROUND,
      )

      expect(asset1).toBe(asset2)
    })

    it("should execute beforePreload hook", async () => {
      loader.setMockData("background.png", "data:image/png;base64,bg")
      loader.setMockData("jump.opus", "data:audio/opus;base64,audio")
      loader.setMockData("player.png", "data:image/png;base64,player")
      loader.setMockData("player.json", JSON.stringify({
        frames: { frame1: { frame: { x: 0, y: 0, w: 32, h: 32 } } },
        meta: { image: "player.png" },
      }))
      loader.setMockData("enemy.png", "data:image/png;base64,enemy")
      loader.setMockData("enemy.json", JSON.stringify({
        frames: { frame1: { frame: { x: 0, y: 0, w: 32, h: 32 } } },
        meta: { image: "enemy.png" },
      }))

      const mockTexture = { baseTexture: { valid: true } } as any
      const mockSpritesheet = {
        textures: { frame1: { test: "texture1" } as any },
        parse: async () => {},
      } as any

      mock.module("@hiddentao/clockwork-engine", () => ({
        PIXI: {
          Assets: {
            load: async () => mockTexture,
          },
          Spritesheet: class {
            textures = mockSpritesheet.textures
            async parse() {
              await mockSpritesheet.parse()
            }
          },
        },
      }))

      let hookExecuted = false
      const hooks: AssetLoaderHooks<TestAssetLoader> = {
        beforePreload: async () => {
          hookExecuted = true
        },
      }

      const loaderWithHooks = new TestAssetLoader(loader as any, hooks)

      await loaderWithHooks.preloadAssets()

      expect(hookExecuted).toBe(true)
    })

    it("should execute afterPreload hook", async () => {
      loader.setMockData("background.png", "data:image/png;base64,bg")
      loader.setMockData("jump.opus", "data:audio/opus;base64,audio")
      loader.setMockData("player.png", "data:image/png;base64,player")
      loader.setMockData("player.json", JSON.stringify({
        frames: { frame1: { frame: { x: 0, y: 0, w: 32, h: 32 } } },
        meta: { image: "player.png" },
      }))
      loader.setMockData("enemy.png", "data:image/png;base64,enemy")
      loader.setMockData("enemy.json", JSON.stringify({
        frames: { frame1: { frame: { x: 0, y: 0, w: 32, h: 32 } } },
        meta: { image: "enemy.png" },
      }))

      const mockTexture = { baseTexture: { valid: true } } as any
      const mockSpritesheet = {
        textures: { frame1: { test: "texture1" } as any },
        parse: async () => {},
      } as any

      mock.module("@hiddentao/clockwork-engine", () => ({
        PIXI: {
          Assets: {
            load: async () => mockTexture,
          },
          Spritesheet: class {
            textures = mockSpritesheet.textures
            async parse() {
              await mockSpritesheet.parse()
            }
          },
        },
      }))

      let hookExecuted = false
      const hooks: AssetLoaderHooks<TestAssetLoader> = {
        afterPreload: async () => {
          hookExecuted = true
        },
      }

      const loaderWithHooks = new TestAssetLoader(loader as any, hooks)

      await loaderWithHooks.preloadAssets()

      expect(hookExecuted).toBe(true)
    })

    it("should call progress callback during preload", async () => {
      loader.setMockData("background.png", "data:image/png;base64,bg")
      loader.setMockData("jump.opus", "data:audio/opus;base64,audio")
      loader.setMockData("player.png", "data:image/png;base64,player")
      loader.setMockData("player.json", JSON.stringify({
        frames: { frame1: { frame: { x: 0, y: 0, w: 32, h: 32 } } },
        meta: { image: "player.png" },
      }))
      loader.setMockData("enemy.png", "data:image/png;base64,enemy")
      loader.setMockData("enemy.json", JSON.stringify({
        frames: { frame1: { frame: { x: 0, y: 0, w: 32, h: 32 } } },
        meta: { image: "enemy.png" },
      }))

      const mockTexture = { baseTexture: { valid: true } } as any
      const mockSpritesheet = {
        textures: { frame1: { test: "texture1" } as any },
        parse: async () => {},
      } as any

      mock.module("@hiddentao/clockwork-engine", () => ({
        PIXI: {
          Assets: {
            load: async () => mockTexture,
          },
          Spritesheet: class {
            textures = mockSpritesheet.textures
            async parse() {
              await mockSpritesheet.parse()
            }
          },
        },
      }))

      const progressUpdates: Array<{ loaded: number; total: number }> = []

      await assetLoader.preloadAssets((loaded, total) => {
        progressUpdates.push({ loaded, total })
      })

      expect(progressUpdates.length).toBeGreaterThan(0)
      const lastUpdate = progressUpdates[progressUpdates.length - 1]
      expect(lastUpdate.loaded).toBe(lastUpdate.total)
    })

    it("should clear cache", async () => {
      const imageUrl = "data:image/png;base64,test"
      loader.setMockData("background.png", imageUrl)

      const mockTexture = { test: "texture" } as any
      mock.module("@hiddentao/clockwork-engine", () => ({
        PIXI: {
          Assets: {
            load: async () => mockTexture,
          },
        },
      }))

      await assetLoader.loadAsset(AssetType.STATIC_IMAGE, TestImages.BACKGROUND)

      assetLoader.clearCache()

      expect((assetLoader as any).assetCache.size).toBe(0)
      expect((assetLoader as any).spritesheets.size).toBe(0)
    })

    it("should return loader instance", () => {
      expect(assetLoader.getLoader()).toBe(loader)
    })

    it("should handle load failures gracefully in preload", async () => {
      const consoleWarnSpy = mock(() => {})
      const originalWarn = console.warn
      console.warn = consoleWarnSpy

      const progressUpdates: Array<{ loaded: number; total: number }> = []

      await assetLoader.preloadAssets((loaded, total) => {
        progressUpdates.push({ loaded, total })
      })

      console.warn = originalWarn

      expect(progressUpdates.length).toBeGreaterThan(0)
      const lastUpdate = progressUpdates[progressUpdates.length - 1]
      expect(lastUpdate.loaded).toBe(lastUpdate.total)
      expect(lastUpdate.total).toBe(4)
    })
  })

  describe("AssetType enum", () => {
    it("should have correct values", () => {
      expect(AssetType.SPRITESHEET).toBe("SPRITESHEET")
      expect(AssetType.STATIC_IMAGE).toBe("STATIC_IMAGE")
      expect(AssetType.SOUND).toBe("SOUND")
    })
  })

  describe("Type Safety", () => {
    it("should enforce correct asset types at compile time", async () => {
      const loader = new MockLoader()
      const assetLoader = new TestAssetLoader(loader as any)

      const spritesheetPromise = assetLoader
        .loadAsset(AssetType.SPRITESHEET, TestSpritesheets.PLAYER)
        .catch(() => {})
      const imagePromise = assetLoader
        .loadAsset(AssetType.STATIC_IMAGE, TestImages.BACKGROUND)
        .catch(() => {})
      const soundPromise = assetLoader
        .loadAsset(AssetType.SOUND, TestSounds.JUMP)
        .catch(() => {})

      expect(spritesheetPromise).toBeInstanceOf(Promise)
      expect(imagePromise).toBeInstanceOf(Promise)
      expect(soundPromise).toBeInstanceOf(Promise)

      await Promise.all([spritesheetPromise, imagePromise, soundPromise])
    })
  })

  describe("Hook Integration", () => {
    it("should allow hooks to load custom assets", async () => {
      const loader = new MockLoader()
      loader.setMockData("background.png", "data:image/png;base64,bg")
      loader.setMockData("jump.opus", "data:audio/opus;base64,audio")
      loader.setMockData("player.png", "data:image/png;base64,player")
      loader.setMockData("player.json", JSON.stringify({
        frames: { frame1: { frame: { x: 0, y: 0, w: 32, h: 32 } } },
        meta: { image: "player.png" },
      }))
      loader.setMockData("enemy.png", "data:image/png;base64,enemy")
      loader.setMockData("enemy.json", JSON.stringify({
        frames: { frame1: { frame: { x: 0, y: 0, w: 32, h: 32 } } },
        meta: { image: "enemy.png" },
      }))

      const mockTexture = { baseTexture: { valid: true } } as any
      const mockSpritesheet = {
        textures: { frame1: { test: "texture1" } as any },
        parse: async () => {},
      } as any

      mock.module("@hiddentao/clockwork-engine", () => ({
        PIXI: {
          Assets: {
            load: async () => mockTexture,
          },
          Spritesheet: class {
            textures = mockSpritesheet.textures
            async parse() {
              await mockSpritesheet.parse()
            }
          },
        },
      }))

      let customAssetLoaded = false

      const hooks: AssetLoaderHooks<TestAssetLoader> = {
        beforePreload: async (loaderInstance) => {
          customAssetLoaded = true
          expect(loaderInstance).toBeInstanceOf(TestAssetLoader)
        },
      }

      const assetLoader = new TestAssetLoader(loader as any, hooks)
      await assetLoader.preloadAssets()

      expect(customAssetLoaded).toBe(true)
    })

    it("should execute hooks in correct order", async () => {
      const loader = new MockLoader()
      loader.setMockData("background.png", "data:image/png;base64,bg")
      loader.setMockData("jump.opus", "data:audio/opus;base64,audio")
      loader.setMockData("player.png", "data:image/png;base64,player")
      loader.setMockData("player.json", JSON.stringify({
        frames: { frame1: { frame: { x: 0, y: 0, w: 32, h: 32 } } },
        meta: { image: "player.png" },
      }))
      loader.setMockData("enemy.png", "data:image/png;base64,enemy")
      loader.setMockData("enemy.json", JSON.stringify({
        frames: { frame1: { frame: { x: 0, y: 0, w: 32, h: 32 } } },
        meta: { image: "enemy.png" },
      }))

      const mockTexture = { baseTexture: { valid: true } } as any
      const mockSpritesheet = {
        textures: { frame1: { test: "texture1" } as any },
        parse: async () => {},
      } as any

      mock.module("@hiddentao/clockwork-engine", () => ({
        PIXI: {
          Assets: {
            load: async () => mockTexture,
          },
          Spritesheet: class {
            textures = mockSpritesheet.textures
            async parse() {
              await mockSpritesheet.parse()
            }
          },
        },
      }))

      const executionOrder: string[] = []

      const hooks: AssetLoaderHooks<TestAssetLoader> = {
        beforePreload: async () => {
          executionOrder.push("before")
        },
        afterPreload: async () => {
          executionOrder.push("after")
        },
      }

      const assetLoader = new TestAssetLoader(loader as any, hooks)
      await assetLoader.preloadAssets()

      expect(executionOrder).toEqual(["before", "after"])
    })
  })

  describe("Abstract Methods", () => {
    it("should require implementation of abstract methods", () => {
      const loader = new MockLoader()
      const assetLoader = new TestAssetLoader(loader as any)

      expect(assetLoader.getSpritesheetsList()).toEqual(
        Object.values(TestSpritesheets),
      )
      expect(assetLoader.getStaticImagesList()).toEqual(
        Object.values(TestImages),
      )
      expect(assetLoader.getSoundsList()).toEqual(Object.values(TestSounds))
    })
  })

  describe("Spritesheet", () => {
    let loader: MockLoader

    beforeEach(() => {
      loader = new MockLoader()
    })

    it("should load spritesheet with array-based frames", async () => {
      const mockImage = "data:image/png;base64,test"
      const mockJson = JSON.stringify({
        frames: [
          {
            filename: "frame1",
            frame: { x: 0, y: 0, w: 32, h: 32 },
          },
          {
            filename: "frame2",
            frame: { x: 32, y: 0, w: 32, h: 32 },
          },
        ],
        meta: {
          image: "test.png",
        },
      })

      loader.setMockData("test.png", mockImage)
      loader.setMockData("test.json", mockJson)

      const mockTexture = {
        baseTexture: {
          valid: true,
        },
      } as any

      const mockSpritesheet = {
        textures: {
          frame1: { test: "texture1" } as any,
          frame2: { test: "texture2" } as any,
        },
        parse: async () => {},
      } as any

      mock.module("@hiddentao/clockwork-engine", () => ({
        PIXI: {
          Assets: {
            load: async () => mockTexture,
          },
          Spritesheet: class {
            textures = mockSpritesheet.textures
            async parse() {
              await mockSpritesheet.parse()
            }
          },
        },
      }))

      const spritesheet = await Spritesheet.load(loader as any, "test.png")

      expect(spritesheet).toBeInstanceOf(Spritesheet)
      expect(spritesheet.getTexture("frame1")).toBeDefined()
      expect(spritesheet.getTexture("frame2")).toBeDefined()
    })

    it("should load spritesheet with object-based frames", async () => {
      const mockImage = "data:image/png;base64,test"
      const mockJson = JSON.stringify({
        frames: {
          frame1: {
            frame: { x: 0, y: 0, w: 32, h: 32 },
          },
        },
        meta: {
          image: "test.png",
        },
      })

      loader.setMockData("test.png", mockImage)
      loader.setMockData("test.json", mockJson)

      const mockTexture = {
        baseTexture: {
          valid: true,
        },
      } as any

      const mockSpritesheet = {
        textures: {
          frame1: { test: "texture1" } as any,
        },
        parse: async () => {},
      } as any

      mock.module("@hiddentao/clockwork-engine", () => ({
        PIXI: {
          Assets: {
            load: async () => mockTexture,
          },
          Spritesheet: class {
            textures = mockSpritesheet.textures
            async parse() {
              await mockSpritesheet.parse()
            }
          },
        },
      }))

      const spritesheet = await Spritesheet.load(loader as any, "test.png")

      expect(spritesheet).toBeInstanceOf(Spritesheet)
      expect(spritesheet.getTexture("frame1")).toBeDefined()
    })

    it("should warn when texture not found", async () => {
      const mockImage = "data:image/png;base64,test"
      const mockJson = JSON.stringify({
        frames: {
          frame1: {
            frame: { x: 0, y: 0, w: 32, h: 32 },
          },
        },
        meta: {
          image: "test.png",
        },
      })

      loader.setMockData("test.png", mockImage)
      loader.setMockData("test.json", mockJson)

      const mockTexture = {
        baseTexture: {
          valid: true,
        },
      } as any

      const mockSpritesheet = {
        textures: {
          frame1: { test: "texture1" } as any,
        },
        parse: async () => {},
      } as any

      mock.module("@hiddentao/clockwork-engine", () => ({
        PIXI: {
          Assets: {
            load: async () => mockTexture,
          },
          Spritesheet: class {
            textures = mockSpritesheet.textures
            async parse() {
              await mockSpritesheet.parse()
            }
          },
        },
      }))

      const spritesheet = await Spritesheet.load(loader as any, "test.png")
      const consoleWarnSpy = mock(() => {})
      const originalWarn = console.warn
      console.warn = consoleWarnSpy

      const texture = spritesheet.getTexture("nonexistent")

      console.warn = originalWarn

      expect(texture).toBeUndefined()
      expect(consoleWarnSpy).toHaveBeenCalled()
    })

    it("should get all textures", async () => {
      const mockImage = "data:image/png;base64,test"
      const mockJson = JSON.stringify({
        frames: {
          frame1: {
            frame: { x: 0, y: 0, w: 32, h: 32 },
          },
          frame2: {
            frame: { x: 32, y: 0, w: 32, h: 32 },
          },
        },
        meta: {
          image: "test.png",
        },
      })

      loader.setMockData("test.png", mockImage)
      loader.setMockData("test.json", mockJson)

      const mockTexture = {
        baseTexture: {
          valid: true,
        },
      } as any

      const mockSpritesheet = {
        textures: {
          frame1: { test: "texture1" } as any,
          frame2: { test: "texture2" } as any,
        },
        parse: async () => {},
      } as any

      mock.module("@hiddentao/clockwork-engine", () => ({
        PIXI: {
          Assets: {
            load: async () => mockTexture,
          },
          Spritesheet: class {
            textures = mockSpritesheet.textures
            async parse() {
              await mockSpritesheet.parse()
            }
          },
        },
      }))

      const spritesheet = await Spritesheet.load(loader as any, "test.png")
      const allTextures = spritesheet.getAllTextures()

      expect(Object.keys(allTextures)).toHaveLength(2)
      expect(allTextures.frame1).toBeDefined()
      expect(allTextures.frame2).toBeDefined()
    })

    it("should get underlying PIXI spritesheet", async () => {
      const mockImage = "data:image/png;base64,test"
      const mockJson = JSON.stringify({
        frames: {
          frame1: {
            frame: { x: 0, y: 0, w: 32, h: 32 },
          },
        },
        meta: {
          image: "test.png",
        },
      })

      loader.setMockData("test.png", mockImage)
      loader.setMockData("test.json", mockJson)

      const mockTexture = {
        baseTexture: {
          valid: true,
        },
      } as any

      const mockSpritesheet = {
        textures: {
          frame1: { test: "texture1" } as any,
        },
        parse: async () => {},
      } as any

      mock.module("@hiddentao/clockwork-engine", () => ({
        PIXI: {
          Assets: {
            load: async () => mockTexture,
          },
          Spritesheet: class {
            textures = mockSpritesheet.textures
            async parse() {
              await mockSpritesheet.parse()
            }
          },
        },
      }))

      const spritesheet = await Spritesheet.load(loader as any, "test.png")
      const pixiSpritesheet = spritesheet.getSpritesheet()

      expect(pixiSpritesheet).toBeDefined()
      expect(pixiSpritesheet.textures).toBeDefined()
    })

    it("should derive JSON filename from image filename", async () => {
      const mockImage = "data:image/png;base64,test"
      const mockJson = JSON.stringify({
        frames: {
          frame1: {
            frame: { x: 0, y: 0, w: 32, h: 32 },
          },
        },
        meta: {
          image: "test.webp",
        },
      })

      loader.setMockData("test.webp", mockImage)
      loader.setMockData("test.json", mockJson)

      const mockTexture = {
        baseTexture: {
          valid: true,
        },
      } as any

      const mockSpritesheet = {
        textures: {
          frame1: { test: "texture1" } as any,
        },
        parse: async () => {},
      } as any

      mock.module("@hiddentao/clockwork-engine", () => ({
        PIXI: {
          Assets: {
            load: async () => mockTexture,
          },
          Spritesheet: class {
            textures = mockSpritesheet.textures
            async parse() {
              await mockSpritesheet.parse()
            }
          },
        },
      }))

      const spritesheet = await Spritesheet.load(loader as any, "test.webp")

      expect(spritesheet).toBeInstanceOf(Spritesheet)
    })
  })

  describe("Edge Cases", () => {
    let loader: MockLoader
    let assetLoader: TestAssetLoader

    beforeEach(() => {
      loader = new MockLoader()
      assetLoader = new TestAssetLoader(loader as any)
    })

    it("should return cached asset on subsequent loads", async () => {
      const imageUrl = "data:image/png;base64,test"
      loader.setMockData("background.png", imageUrl)

      let loadCount = 0
      const mockTexture = { test: "texture" } as any

      mock.module("@hiddentao/clockwork-engine", () => ({
        PIXI: {
          Assets: {
            load: async () => {
              loadCount++
              return mockTexture
            },
          },
        },
      }))

      const asset1 = await assetLoader.loadAsset(
        AssetType.STATIC_IMAGE,
        TestImages.BACKGROUND,
      )
      const asset2 = await assetLoader.loadAsset(
        AssetType.STATIC_IMAGE,
        TestImages.BACKGROUND,
      )
      const asset3 = await assetLoader.loadAsset(
        AssetType.STATIC_IMAGE,
        TestImages.BACKGROUND,
      )

      expect(asset1).toBe(asset2)
      expect(asset2).toBe(asset3)
      expect(loadCount).toBe(1)
    })

    it("should handle missing spritesheet texture gracefully", async () => {
      const mockImage = "data:image/png;base64,test"
      const mockJson = JSON.stringify({
        frames: {
          frame1: {
            frame: { x: 0, y: 0, w: 32, h: 32 },
          },
        },
        meta: {
          image: "player.png",
        },
      })

      loader.setMockData("player.png", mockImage)
      loader.setMockData("player.json", mockJson)

      const mockTexture = {
        baseTexture: {
          valid: true,
        },
      } as any

      const mockSpritesheet = {
        textures: {
          frame1: { test: "texture1" } as any,
        },
        parse: async () => {},
      } as any

      mock.module("@hiddentao/clockwork-engine", () => ({
        PIXI: {
          Assets: {
            load: async () => mockTexture,
          },
          Spritesheet: class {
            textures = mockSpritesheet.textures
            async parse() {
              await mockSpritesheet.parse()
            }
          },
        },
      }))

      await assetLoader.loadAsset(AssetType.SPRITESHEET, TestSpritesheets.PLAYER)

      const consoleWarnSpy = mock(() => {})
      const originalWarn = console.warn
      console.warn = consoleWarnSpy

      const texture = assetLoader.getSpritesheetTexture(
        TestSpritesheets.PLAYER,
        "nonexistent",
      )

      console.warn = originalWarn

      expect(texture).toBeUndefined()
      expect(consoleWarnSpy).toHaveBeenCalled()
    })

    it("should warn when spritesheet not loaded yet", () => {
      const consoleWarnSpy = mock(() => {})
      const originalWarn = console.warn
      console.warn = consoleWarnSpy

      const texture = assetLoader.getSpritesheetTexture(
        TestSpritesheets.PLAYER,
        "frame1",
      )

      console.warn = originalWarn

      expect(texture).toBeUndefined()
      expect(consoleWarnSpy).toHaveBeenCalled()
    })

    it("should handle unsupported asset type", async () => {
      await expect(
        assetLoader.loadAsset("INVALID" as any, "test" as any),
      ).rejects.toThrow("Unsupported asset type")
    })

    it("should cache spritesheets separately from other assets", async () => {
      const mockImage = "data:image/png;base64,test"
      const mockJson = JSON.stringify({
        frames: {
          frame1: {
            frame: { x: 0, y: 0, w: 32, h: 32 },
          },
        },
        meta: {
          image: "player.png",
        },
      })

      loader.setMockData("player.png", mockImage)
      loader.setMockData("player.json", mockJson)

      const mockTexture = {
        baseTexture: {
          valid: true,
        },
      } as any

      const mockSpritesheet = {
        textures: {
          frame1: { test: "texture1" } as any,
        },
        parse: async () => {},
      } as any

      mock.module("@hiddentao/clockwork-engine", () => ({
        PIXI: {
          Assets: {
            load: async () => mockTexture,
          },
          Spritesheet: class {
            textures = mockSpritesheet.textures
            async parse() {
              await mockSpritesheet.parse()
            }
          },
        },
      }))

      await assetLoader.loadAsset(AssetType.SPRITESHEET, TestSpritesheets.PLAYER)

      expect((assetLoader as any).assetCache.size).toBe(1)
      expect((assetLoader as any).spritesheets.size).toBe(1)
    })

    it("should clear both asset cache and spritesheet cache", async () => {
      const mockImage = "data:image/png;base64,test"
      const mockJson = JSON.stringify({
        frames: {
          frame1: {
            frame: { x: 0, y: 0, w: 32, h: 32 },
          },
        },
        meta: {
          image: "player.png",
        },
      })

      loader.setMockData("player.png", mockImage)
      loader.setMockData("player.json", mockJson)
      loader.setMockData("background.png", "data:image/png;base64,bg")

      const mockTexture = {
        baseTexture: {
          valid: true,
        },
      } as any

      const mockSpritesheet = {
        textures: {
          frame1: { test: "texture1" } as any,
        },
        parse: async () => {},
      } as any

      mock.module("@hiddentao/clockwork-engine", () => ({
        PIXI: {
          Assets: {
            load: async () => mockTexture,
          },
          Spritesheet: class {
            textures = mockSpritesheet.textures
            async parse() {
              await mockSpritesheet.parse()
            }
          },
        },
      }))

      await assetLoader.loadAsset(AssetType.SPRITESHEET, TestSpritesheets.PLAYER)
      await assetLoader.loadAsset(AssetType.STATIC_IMAGE, TestImages.BACKGROUND)

      expect((assetLoader as any).assetCache.size).toBe(2)
      expect((assetLoader as any).spritesheets.size).toBe(1)

      assetLoader.clearCache()

      expect((assetLoader as any).assetCache.size).toBe(0)
      expect((assetLoader as any).spritesheets.size).toBe(0)
    })
  })
})
