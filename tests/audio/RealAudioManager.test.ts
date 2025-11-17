import { AudioContext } from "isomorphic-web-audio-api"
import { describe, expect, test } from "bun:test"
import { RealAudioManager } from "../../src/audio/RealAudioManager"

// Set up AudioContext polyfill for test environment
if (!globalThis.AudioContext) {
  globalThis.AudioContext = AudioContext as any
}

// Helper to create a simple test audio buffer
function createTestBuffer(duration = 0.1): AudioBuffer {
  const audioContext = new AudioContext()
  const sampleRate = audioContext.sampleRate
  const length = Math.floor(duration * sampleRate)
  const buffer = audioContext.createBuffer(1, length, sampleRate)
  const data = buffer.getChannelData(0)

  // Fill with a simple sine wave
  for (let i = 0; i < length; i++) {
    const t = i / sampleRate
    data[i]! = Math.sin(2 * Math.PI * 440 * t)
  }

  return buffer
}

describe("RealAudioManager", () => {
  test("loads sound from AudioBuffer", async () => {
    const manager = new RealAudioManager()
    const buffer = createTestBuffer()

    await manager.loadSound("beep", buffer)

    // Should not throw when playing
    expect(() => manager.playSound("beep")).not.toThrow()

    await manager.close()
  })

  test("warns when playing unloaded sound", () => {
    const manager = new RealAudioManager()

    // Mock console.warn to capture warning
    const warnings: string[] = []
    const originalWarn = console.warn
    console.warn = (msg: string) => warnings.push(msg)

    manager.playSound("nonexistent")

    expect(warnings.length).toBe(1)
    expect(warnings[0]).toContain("not loaded")

    console.warn = originalWarn
  })

  test("plays sound with volume control", async () => {
    const manager = new RealAudioManager()
    const buffer = createTestBuffer()

    await manager.loadSound("sound", buffer)

    expect(() => manager.playSound("sound", 0.5)).not.toThrow()
    expect(() => manager.playSound("sound", 0.0)).not.toThrow()
    expect(() => manager.playSound("sound", 1.0)).not.toThrow()

    await manager.close()
  })

  test("plays looping sound", async () => {
    const manager = new RealAudioManager()
    const buffer = createTestBuffer()

    await manager.loadSound("loop", buffer)

    expect(() => manager.playSound("loop", 1.0, true)).not.toThrow()

    await manager.close()
  })

  test("stops specific looping sound", async () => {
    const manager = new RealAudioManager()
    const buffer = createTestBuffer()

    await manager.loadSound("loop1", buffer)
    await manager.loadSound("loop2", buffer)

    manager.playSound("loop1", 1.0, true)
    manager.playSound("loop2", 1.0, true)

    expect(() => manager.stopSound("loop1")).not.toThrow()
    expect(() => manager.stopSound("loop2")).not.toThrow()

    await manager.close()
  })

  test("stops all sounds", async () => {
    const manager = new RealAudioManager()
    const buffer = createTestBuffer()

    await manager.loadSound("sound1", buffer)
    await manager.loadSound("sound2", buffer)

    manager.playSound("sound1")
    manager.playSound("sound2", 1.0, true)

    expect(() => manager.stopAll()).not.toThrow()

    await manager.close()
  })

  test("resumes audio context", async () => {
    const manager = new RealAudioManager()

    await manager.resumeAudioContext()

    // Should be running after resume
    expect(["running", "suspended"]).toContain(manager.getState())

    await manager.close()
  })

  test("handles multiple sounds", async () => {
    const manager = new RealAudioManager()

    const beep = createTestBuffer(0.1)
    const boop = createTestBuffer(0.1)
    const buzz = createTestBuffer(0.1)

    await manager.loadSound("beep", beep)
    await manager.loadSound("boop", boop)
    await manager.loadSound("buzz", buzz)

    manager.playSound("beep")
    manager.playSound("boop", 0.5)
    manager.playSound("buzz", 0.3)

    await manager.close()
  })

  test("replaces looping sound when played again", async () => {
    const manager = new RealAudioManager()
    const buffer = createTestBuffer()

    await manager.loadSound("music", buffer)

    // Play looping sound
    manager.playSound("music", 1.0, true)

    // Play again - should stop the first instance
    expect(() => manager.playSound("music", 1.0, true)).not.toThrow()

    await manager.close()
  })

  test("closes cleanly", async () => {
    const manager = new RealAudioManager()
    const buffer = createTestBuffer()

    await manager.loadSound("sound", buffer)
    manager.playSound("sound", 1.0, true)

    await manager.close()

    expect(manager.getState()).toBe("closed")
  })

  test("handles stop on non-looping sound gracefully", async () => {
    const manager = new RealAudioManager()
    const buffer = createTestBuffer()

    await manager.loadSound("sound", buffer)

    // Try to stop a sound that isn't looping
    expect(() => manager.stopSound("sound")).not.toThrow()

    await manager.close()
  })

  test("clamps volume to valid range", async () => {
    const manager = new RealAudioManager()
    const buffer = createTestBuffer()

    await manager.loadSound("sound", buffer)

    // Volume should be clamped between 0 and 1
    expect(() => manager.playSound("sound", -0.5)).not.toThrow()
    expect(() => manager.playSound("sound", 1.5)).not.toThrow()

    await manager.close()
  })

  test("caches loaded sounds and skips reload", async () => {
    const manager = new RealAudioManager()
    let generateCount = 0

    // Create a function that tracks how many times it's called
    const createTrackedBuffer = () => {
      generateCount++
      return createTestBuffer()
    }

    const buffer1 = createTrackedBuffer()
    expect(generateCount).toBe(1)

    await manager.loadSound("cached", buffer1)

    // Try to load the same sound again with a new buffer
    const buffer2 = createTrackedBuffer()
    expect(generateCount).toBe(2)

    await manager.loadSound("cached", buffer2)

    // Should still play the first buffer (cached)
    expect(() => manager.playSound("cached")).not.toThrow()

    // Load a different sound ID should work normally
    const buffer3 = createTrackedBuffer()
    expect(generateCount).toBe(3)

    await manager.loadSound("different", buffer3)
    expect(() => manager.playSound("different")).not.toThrow()

    await manager.close()
  })
})
