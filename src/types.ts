export enum GameInputType {
  INTENT = "intent",
}

export enum GameIntent {
  UP = "up",
  DOWN = "down",
  LEFT = "left",
  RIGHT = "right",
  CLOCKWISE = "clockwise",
  COUNTER_CLOCKWISE = "counter_clockwise",

  START_MOVING_LEFT = "start_moving_left",
  STOP_MOVING_LEFT = "stop_moving_left",
  START_MOVING_RIGHT = "start_moving_right",
  STOP_MOVING_RIGHT = "stop_moving_right",

  EASTER_EGG_1 = "easter_egg_1",

  ACTION = "action",
  PAUSE = "pause",
  RESUME = "resume",
  START = "start",
  RESET = "reset",
}

export interface SingleKeyConfig {
  type: "single"
  key: string
  event: "onPressed" | "onReleased" | "onPressedWithRepeat"
}

export interface KeyComboConfig {
  type: "combo"
  keyCombo: string
  event?: "onPressed" | "onReleased"
}

export type KeyInputConfig = SingleKeyConfig | KeyComboConfig

export interface InputMappingEntry {
  keys: KeyInputConfig | KeyInputConfig[]
  displayText?: string
}

export type GameInputMapping = Partial<Record<GameIntent, InputMappingEntry>>
