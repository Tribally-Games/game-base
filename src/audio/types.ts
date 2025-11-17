/**
 * Audio manager interface for game sound playback.
 *
 * Game engines should never directly call DOM/HTML APIs. Instead, they receive
 * an AudioManager instance that handles all audio operations.
 *
 * Two implementations are provided:
 * - RealAudioManager: Uses Web Audio API for actual sound playback
 * - DummyAudioManager: No-op implementation for in-memory replays and testing
 */
export interface AudioManager {
  /**
   * Load a sound for later playback.
   *
   * @param soundId - Unique identifier for this sound
   * @param data - Either a data URI string (e.g., "data:audio/opus;base64,...")
   *               or an AudioBuffer for procedurally generated sounds
   * @returns Promise that resolves when sound is loaded and ready
   */
  loadSound(soundId: string, data: string | AudioBuffer): Promise<void>

  /**
   * Play a previously loaded sound.
   *
   * @param soundId - The sound to play
   * @param volume - Volume level (0.0 to 1.0), defaults to 1.0
   * @param loop - Whether to loop the sound continuously, defaults to false
   */
  playSound(soundId: string, volume?: number, loop?: boolean): void

  /**
   * Stop a specific looping sound.
   *
   * @param soundId - The looping sound to stop
   */
  stopSound(soundId: string): void

  /**
   * Stop all currently playing sounds.
   */
  stopAll(): void

  /**
   * Resume the audio context.
   *
   * Required for browser autoplay policies - call this when user interaction
   * occurs (e.g., game start button click).
   *
   * @returns Promise that resolves when context is resumed
   */
  resumeAudioContext(): Promise<void>
}
