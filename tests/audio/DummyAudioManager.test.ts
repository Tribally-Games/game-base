import { describe, expect, test } from "bun:test"
import { DummyAudioManager } from "../../src/audio/DummyAudioManager"

describe("DummyAudioManager", () => {
  test("loadSound returns immediately", async () => {
    const manager = new DummyAudioManager()
    await expect(manager.loadSound("test", "data:audio/opus;base64,test")).resolves.toBeUndefined()
  })

  test("playSound does nothing", () => {
    const manager = new DummyAudioManager()
    expect(() => manager.playSound("test", 0.5, true)).not.toThrow()
  })

  test("stopSound does nothing", () => {
    const manager = new DummyAudioManager()
    expect(() => manager.stopSound("test")).not.toThrow()
  })

  test("stopAll does nothing", () => {
    const manager = new DummyAudioManager()
    expect(() => manager.stopAll()).not.toThrow()
  })

  test("resumeAudioContext returns immediately", async () => {
    const manager = new DummyAudioManager()
    await expect(manager.resumeAudioContext()).resolves.toBeUndefined()
  })

  test("implements AudioManager interface", async () => {
    const manager = new DummyAudioManager()

    // Verify all methods exist and are callable
    await manager.loadSound("sound1", "data:audio/opus;base64,test")
    manager.playSound("sound1")
    manager.playSound("sound2", 0.8)
    manager.playSound("sound3", 0.5, true)
    manager.stopSound("sound3")
    manager.stopAll()
    await manager.resumeAudioContext()

    // All operations should complete without errors
    expect(true).toBe(true)
  })
})
