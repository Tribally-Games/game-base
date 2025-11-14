import type { GameInputMapping, KeyInputConfig } from "../types"

function formatKeyName(key: string): string {
  // Convert key codes to more readable names
  const keyMap: Record<string, string> = {
    ArrowUp: "↑",
    ArrowDown: "↓",
    ArrowLeft: "←",
    ArrowRight: "→",
    space: "Space",
    Space: "Space",
  }

  return keyMap[key] || key.toUpperCase()
}

function formatKeyConfig(config: KeyInputConfig): string {
  if (config.type === "single") {
    return formatKeyName(config.key)
  } else {
    // For combos, format them nicely
    return config.keyCombo
      .replace(/\+/g, "+")
      .split("+")
      .map((key) => formatKeyName(key.trim()))
      .join("+")
  }
}

function formatKeyConfigs(configs: KeyInputConfig | KeyInputConfig[]): string {
  const configArray = Array.isArray(configs) ? configs : [configs]
  return configArray.map(formatKeyConfig).join("/")
}

export function getInputInstructions(inputMapping: GameInputMapping): string[] {
  const instructions: string[] = []

  // Generate instructions for each defined intent
  for (const [_intent, entry] of Object.entries(inputMapping)) {
    if (entry && entry.displayText) {
      const keys = formatKeyConfigs(entry.keys)
      instructions.push(`${keys} = ${entry.displayText}`)
    }
  }

  // Always add system defaults
  instructions.push("Space = Pause/Resume")
  instructions.push("R = Reset")

  return instructions
}
