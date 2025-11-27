import type {
  GameEngine as ClockworkGameEngine,
  GameCanvas as ClockworkGameCanvas,
  GameEngineOptions,
  GameCanvasOptions,
  PlatformLayer,
} from "@hiddentao/clockwork-engine"

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
  constructor(_options: GameEngineOptions) {}

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
  constructor(_options: GameCanvasOptions, _platform: PlatformLayer) {}

  init() {}
  render() {}
  cleanup() {}
}

export const GameEngine = TestGameEngine
export const GameCanvas = TestGameCanvas
export const getVersion = () => "1.0.0"
