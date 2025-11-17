import type { AudioManager } from "./types"
import { dataUriToArrayBuffer } from "./utils"

/**
 * Real audio manager using Web Audio API.
 *
 * Provides actual sound playback using AudioContext and AudioBuffer.
 * Supports both asset-based sounds (from data URIs) and procedurally
 * generated sounds (from AudioBuffer).
 *
 * Features:
 * - Efficient playback of multiple simultaneous sounds
 * - Per-sound volume control
 * - Looping sound support with individual stop control
 * - Automatic cleanup of finished sounds
 * - Browser autoplay policy compliance
 */
export class RealAudioManager implements AudioManager {
  private audioContext: AudioContext
  private sounds: Map<string, AudioBuffer>
  private activeSources: Set<AudioBufferSourceNode>
  private loopingSources: Map<string, AudioBufferSourceNode>

  constructor() {
    this.audioContext = new (
      globalThis.AudioContext || (globalThis as any).webkitAudioContext
    )()
    this.sounds = new Map()
    this.activeSources = new Set()
    this.loopingSources = new Map()
  }

  async loadSound(soundId: string, data: string | AudioBuffer): Promise<void> {
    // Check if sound is already loaded (cache hit)
    if (this.sounds.has(soundId)) {
      return
    }

    let audioBuffer: AudioBuffer

    if (typeof data === "string") {
      // Data URI - decode to AudioBuffer
      const arrayBuffer = dataUriToArrayBuffer(data)
      audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer)
    } else {
      // Already an AudioBuffer (procedurally generated)
      audioBuffer = data
    }

    this.sounds.set(soundId, audioBuffer)
  }

  playSound(soundId: string, volume = 1.0, loop = false): void {
    const audioBuffer = this.sounds.get(soundId)
    if (!audioBuffer) {
      console.warn(`Sound "${soundId}" not loaded`)
      return
    }

    // If this is a looping sound, stop any existing instance
    if (loop) {
      this.stopSound(soundId)
    }

    // Create source and gain nodes
    const source = this.audioContext.createBufferSource()
    const gainNode = this.audioContext.createGain()

    source.buffer = audioBuffer
    source.loop = loop
    gainNode.gain.value = Math.max(0, Math.min(1, volume))

    // Connect: source -> gain -> destination
    source.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    // Track active sources
    this.activeSources.add(source)
    if (loop) {
      this.loopingSources.set(soundId, source)
    }

    // Clean up when finished (for non-looping sounds)
    source.onended = () => {
      this.activeSources.delete(source)
      if (!loop) {
        source.disconnect()
        gainNode.disconnect()
      }
    }

    // Start playback
    source.start()
  }

  stopSound(soundId: string): void {
    const source = this.loopingSources.get(soundId)
    if (source) {
      try {
        source.stop()
        source.disconnect()
      } catch (_error) {
        // Source might already be stopped
      }
      this.loopingSources.delete(soundId)
      this.activeSources.delete(source)
    }
  }

  stopAll(): void {
    // Stop all active sources
    for (const source of this.activeSources) {
      try {
        source.stop()
        source.disconnect()
      } catch (_error) {
        // Source might already be stopped
      }
    }

    // Clear tracking
    this.activeSources.clear()
    this.loopingSources.clear()
  }

  async resumeAudioContext(): Promise<void> {
    if (this.audioContext.state === "suspended") {
      await this.audioContext.resume()
    }
  }

  /**
   * Get the current audio context state.
   *
   * Useful for debugging and checking if the context needs to be resumed.
   */
  getState(): AudioContextState {
    return this.audioContext.state
  }

  /**
   * Close the audio context and release resources.
   *
   * Call this when the audio manager is no longer needed (e.g., game cleanup).
   */
  async close(): Promise<void> {
    this.stopAll()
    await this.audioContext.close()
  }
}
