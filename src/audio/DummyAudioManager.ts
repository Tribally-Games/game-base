import type { AudioManager } from "./types"

/**
 * No-op audio manager for in-memory replays and testing.
 *
 * Implements the AudioManager interface but performs no actual audio operations.
 * All methods return immediately without side effects.
 *
 * Use this when:
 * - Running game replays without sound
 * - Testing game logic without audio dependencies
 * - Running in headless/server environments
 */
export class DummyAudioManager implements AudioManager {
  async loadSound(
    _soundId: string,
    _data: string | AudioBuffer,
  ): Promise<void> {
    // No-op
  }

  playSound(_soundId: string, _volume?: number, _loop?: boolean): void {
    // No-op
  }

  stopSound(_soundId: string): void {
    // No-op
  }

  stopAll(): void {
    // No-op
  }

  async resumeAudioContext(): Promise<void> {
    // No-op
  }
}
