/**
 * Audio system for game sound playback.
 *
 * Provides two AudioManager implementations:
 * - RealAudioManager: Uses Web Audio API for actual sound playback
 * - DummyAudioManager: No-op implementation for in-memory replays
 *
 * @example
 * ```typescript
 * import { RealAudioManager } from '@tribally.games/game-base/audio'
 *
 * const audioManager = new RealAudioManager()
 * await audioManager.loadSound('coin', dataUri)
 * audioManager.playSound('coin', 0.8)
 * ```
 */

export { RealAudioManager } from "./RealAudioManager"
export { DummyAudioManager } from "./DummyAudioManager"

export type { AudioManager } from "./types"

export { dataUriToArrayBuffer } from "./utils"
