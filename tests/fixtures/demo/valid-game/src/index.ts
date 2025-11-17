import type { GameEngine as ClockworkGameEngine, GameCanvas as ClockworkGameCanvas, Loader } from "@hiddentao/clockwork-engine"

interface AudioManager {
  playSound(name: string, volume: number): void
  stopSound(name: string): void
}

interface BaseGameSnapshot {
  state: number
  score: number
  survivedSeconds?: number
  combos?: number
  streak?: number
  [key: string]: any
}

interface TestGameSnapshot extends BaseGameSnapshot {
  itemsCollected: number
  comboCount: number
}

class TestGameEngine implements ClockworkGameEngine {
  private loader: Loader
  private audioManager: AudioManager

  constructor(loader: Loader, audioManager: AudioManager) {
    this.loader = loader
    this.audioManager = audioManager
  }

  init() {}
  start() {}
  pause() {}
  resume() {}
  reset() {}
  update(_dt: number) {}
  render() {}
  cleanup() {}
  getSnapshot(): TestGameSnapshot {
    return {
      state: 0,
      score: 0,
      itemsCollected: 0,
      comboCount: 0,
    }
  }
  loadSnapshot(_snapshot: TestGameSnapshot) {}
}

class TestGameCanvas implements ClockworkGameCanvas {
  init() {}
  render() {}
  cleanup() {}
}

export const GameEngine = TestGameEngine
export const GameCanvas = TestGameCanvas
export const getVersion = () => "1.0.0"
