import { describe, expect, test } from "bun:test"
import { GameState } from "@clockwork-engine/core"
import {
  type GameModuleConfig,
  createGameModule,
} from "../src/createGameModule"
import {
  GameConfigFieldType,
  type InferMetaConfigValues,
} from "../src/metaConfig"
import {
  calculateProgress,
  formatObjectiveDescription,
  getObjectiveIcon,
  validateObjective,
} from "../src/objectives"
import type { Objective } from "../src/objectives/types"
import { GameInputType, GameIntent, type GameInputMapping } from "../src/types"

describe("createGameModule Integration", () => {
  class MockGameEngine {}
  class MockGameCanvas {}

  const createDefaultConfig = (
    overrides: Partial<GameModuleConfig> = {},
  ): GameModuleConfig => ({
    version: "1.0.0",
    customOperators: [],
    objectiveDefinitions: [],
    objectiveMetadata: {},
    validateCustomObjective: () => false,
    getProgressValue: () => null,
    setupInitializationData: () => ({}),
    getMetaConfigSchema: () => ({}),
    extractGameSnapshotInfo: () => ({}),
    formatGameSnapshotInfo: () => [],
    getInputMapping: (): GameInputMapping => ({
      [GameIntent.UP]: { 
        keys: { type: 'single', key: 'w', event: 'onPressed' },
        displayText: 'Move Up'
      },
      [GameIntent.DOWN]: { 
        keys: { type: 'single', key: 's', event: 'onPressed' },
        displayText: 'Move Down'
      },
      [GameIntent.LEFT]: { 
        keys: { type: 'single', key: 'a', event: 'onPressed' },
        displayText: 'Move Left'
      },
      [GameIntent.RIGHT]: { 
        keys: { type: 'single', key: 'd', event: 'onPressed' },
        displayText: 'Move Right'
      },
      [GameIntent.RESET]: { 
        keys: { type: 'single', key: 'r', event: 'onPressed' },
        displayText: 'Reset Game'
      },
    }),
    ...overrides,
  })

  test("should create game module with all required exports", () => {
    const config = createDefaultConfig()

    const module = createGameModule(
      MockGameEngine as any,
      MockGameCanvas as any,
      config,
    )

    expect(module.GameEngine).toBe(MockGameEngine)
    expect(module.GameCanvas).toBe(MockGameCanvas)
    expect(module.GameInputType).toEqual(GameInputType)
    expect(module.GameIntent).toEqual(GameIntent)
    expect(module.getVersion()).toBe("1.0.0")
  })

  test("should create game module with custom operators config", () => {
    const config = createDefaultConfig({
      version: "2.0.0",
      customOperators: ["APPLE"],
      objectiveDefinitions: [{ tier: "EASY", operator: "APPLE", threshold: 5 }],
      objectiveMetadata: {
        APPLE: {
          name: "Apples",
          icon: "🍎",
          description: (threshold) => `Eat ${threshold} apples`,
        },
      },
    })

    const module = createGameModule(
      MockGameEngine as any,
      MockGameCanvas as any,
      config,
    )

    expect(module.getVersion()).toBe("2.0.0")
    expect(config.customOperators).toEqual(["APPLE"])
  })

  test("should enable custom validation with config", () => {
    const config = createDefaultConfig({
      version: "1.0.0",
      customOperators: ["APPLE"],
      objectiveDefinitions: [],
      validateCustomObjective: (objective, snapshot) =>
        (snapshot.applesEaten || 0) >= objective.threshold,
    })

    createGameModule(
      MockGameEngine as any,
      MockGameCanvas as any,
      config,
    )

    const objective: Objective = {
      id: 1,
      tier: "EASY",
      operator: "APPLE",
      threshold: 5,
      prizeValue: 10,
      isComplete: false,
    }

    const snapshot = {
      state: GameState.PLAYING,
      score: 0,
      applesEaten: 10,
    }

    expect(validateObjective(objective, snapshot, config)).toBe(true)
  })

  test("should enable custom metadata with config", () => {
    const config = createDefaultConfig({
      version: "1.0.0",
      objectiveDefinitions: [],
      objectiveMetadata: {
        POTION: {
          name: "Potions",
          icon: "🧪",
          description: (threshold) => `Collect ${threshold} potions`,
        },
      },
    })

    createGameModule(
      MockGameEngine as any,
      MockGameCanvas as any,
      config,
    )

    expect(getObjectiveIcon("POTION", config)).toBe("🧪")

    const objective: Objective = {
      id: 1,
      tier: "EASY",
      operator: "POTION",
      threshold: 3,
      prizeValue: 10,
      isComplete: false,
    }
    expect(formatObjectiveDescription(objective, config)).toBe(
      "Collect 3 potions",
    )
  })

  test("should enable custom progress calculation with config", () => {
    const config = createDefaultConfig({
      version: "1.0.0",
      objectiveDefinitions: [],
      getProgressValue: (operator, snapshot) => {
        if (operator === "APPLE") return snapshot.applesEaten ?? null
        return null
      },
    })

    createGameModule(
      MockGameEngine as any,
      MockGameCanvas as any,
      config,
    )

    const objective: Objective = {
      id: 1,
      tier: "EASY",
      operator: "APPLE",
      threshold: 10,
      prizeValue: 10,
      isComplete: false,
    }

    const snapshot = {
      state: GameState.PLAYING,
      score: 0,
      applesEaten: 7,
    }

    const progress = calculateProgress(objective, snapshot, config)
    expect(progress.currentValue).toBe(7)
    expect(progress.threshold).toBe(10)
    expect(progress.percentage).toBe(70)
  })

  test("should support full game configuration", () => {
    const config = createDefaultConfig({
      version: "1.5.0",
      customOperators: ["APPLE", "POTION"],
      objectiveDefinitions: [
        { tier: "EASY", operator: "APPLE", threshold: 1 },
        { tier: "EASY", operator: "APPLE", threshold: 3 },
        { tier: "MEDIUM", operator: "POTION", threshold: 2 },
      ],
      objectiveMetadata: {
        APPLE: {
          name: "Apples",
          icon: "🍎",
          description: (threshold) =>
            `Eat ${threshold} apple${threshold > 1 ? "s" : ""}`,
        },
        POTION: {
          name: "Potions",
          icon: "🧪",
          description: (threshold) =>
            `Collect ${threshold} potion${threshold > 1 ? "s" : ""}`,
        },
      },
      validateCustomObjective: (objective, snapshot) => {
        if (objective.operator === "APPLE") {
          return (snapshot.applesEaten || 0) >= objective.threshold
        }
        if (objective.operator === "POTION") {
          return (snapshot.potionsEaten || 0) >= objective.threshold
        }
        return false
      },
      extractGameSnapshotInfo: (snapshot) => ({
        applesEaten: snapshot.applesEaten || 0,
        potionsEaten: snapshot.potionsEaten || 0,
        state: snapshot.state,
        level: snapshot.level,
      }),
      formatGameSnapshotInfo: (info) => [
        { label: "State", value: info.state },
        { label: "Level", value: info.level },
        { label: "Apples", value: info.applesEaten },
        { label: "Potions", value: info.potionsEaten },
      ],
      getProgressValue: (operator, snapshot) => {
        if (operator === "APPLE") return snapshot.applesEaten ?? null
        if (operator === "POTION") return snapshot.potionsEaten ?? null
        return null
      },
      setupInitializationData: () => ({
        mapName: "base_map",
      }),
    })

    const module = createGameModule(
      MockGameEngine as any,
      MockGameCanvas as any,
      config,
    )

    expect(module.getVersion()).toBe("1.5.0")
    expect(config.customOperators).toEqual(["APPLE", "POTION"])
    expect(config.objectiveDefinitions.length).toBe(3)
    expect(config.setupInitializationData()).toEqual({ mapName: "base_map" })

    const info = config.extractGameSnapshotInfo({ applesEaten: 5, potionsEaten: 3, state: "PLAYING", level: 2 })
    expect(info).toEqual({ applesEaten: 5, potionsEaten: 3, state: "PLAYING", level: 2 })
  })

  test("should support extractGameSnapshotInfo and formatGameSnapshotInfo configuration", () => {
    const config = createDefaultConfig({
      version: "1.0.0",
      objectiveDefinitions: [],
      extractGameSnapshotInfo: (snapshot) => ({
        state: snapshot.state,
        level: snapshot.level,
        levelName: snapshot.levelName,
        applesEaten: snapshot.applesEaten || 0,
        potionsCollected: snapshot.potionsCollected || 0,
        enemiesDefeated: snapshot.enemiesDefeated || 0,
      }),
      formatGameSnapshotInfo: (info) => [
        { label: "State", value: info.state },
        { label: "Level", value: `${info.level} - ${info.levelName}` },
        { label: "Apples", value: info.applesEaten },
        { label: "Potions", value: info.potionsCollected },
        { label: "Enemies", value: info.enemiesDefeated },
      ],
    })

    createGameModule(
      MockGameEngine as any,
      MockGameCanvas as any,
      config,
    )

    expect(config.extractGameSnapshotInfo).toBeDefined()
    expect(config.formatGameSnapshotInfo).toBeDefined()

    const snapshot = {
      state: "PLAYING",
      level: 5,
      levelName: "Forest",
      applesEaten: 10,
      potionsCollected: 5,
      enemiesDefeated: 20,
    }
    const extractedInfo = config.extractGameSnapshotInfo(snapshot)
    expect(extractedInfo).toEqual({
      state: "PLAYING",
      level: 5,
      levelName: "Forest",
      applesEaten: 10,
      potionsCollected: 5,
      enemiesDefeated: 20,
    })

    const formatted = config.formatGameSnapshotInfo(extractedInfo)
    expect(formatted).toEqual([
      { label: "State", value: "PLAYING" },
      { label: "Level", value: "5 - Forest" },
      { label: "Apples", value: 10 },
      { label: "Potions", value: 5 },
      { label: "Enemies", value: 20 },
    ])
  })

  test("should support getMetaConfigSchema configuration", () => {
    const config = createDefaultConfig({
      version: "1.0.0",
      objectiveDefinitions: [],
      getMetaConfigSchema: () => ({
        snakeColor: {
          type: GameConfigFieldType.COLOR,
          label: "Snake Color",
          description: "Custom snake color",
          format: "hex" as const,
        },
        mapSelection: {
          type: GameConfigFieldType.STRING_LIST,
          label: "Map Selection",
          description: "Choose a map",
          items: ["map1", "map2", "map3"],
          selectedIndex: null,
        },
      }),
    })

    const module = createGameModule(
      MockGameEngine as any,
      MockGameCanvas as any,
      config,
    )

    expect(module.getGameModuleConfig().getMetaConfigSchema).toBeDefined()
    const schema = module.getGameModuleConfig().getMetaConfigSchema()
    expect(schema.snakeColor.type).toBe(GameConfigFieldType.COLOR)
    expect(schema.mapSelection.type).toBe(GameConfigFieldType.STRING_LIST)
  })

  test("should support setupInitializationData with metaConfig parameter", () => {
    const metaConfigSchema = {
      playerName: {
        type: GameConfigFieldType.STRING,
        label: "Player Name",
        description: "Your name",
      },
      startingLevel: {
        type: GameConfigFieldType.STRING_LIST,
        label: "Starting Level",
        description: "Choose starting level",
        items: ["level1", "level2", "level3"],
        selectedIndex: 0,
      },
    } as const

    type MetaValues = InferMetaConfigValues<typeof metaConfigSchema>

    const config = createDefaultConfig({
      version: "1.0.0",
      objectiveDefinitions: [],
      getMetaConfigSchema: () => metaConfigSchema,
      setupInitializationData: (metaConfig?: MetaValues) => {
        const gameConfig: Record<string, any> = {}

        if (metaConfig?.playerName) {
          gameConfig.playerName = metaConfig.playerName
        }

        if (metaConfig?.startingLevel) {
          const { items, selectedIndex } = metaConfig.startingLevel
          if (selectedIndex !== null) {
            gameConfig.level = items[selectedIndex]
          } else {
            gameConfig.level = items[Math.floor(Math.random() * items.length)]
          }
        }

        return gameConfig
      },
    })

    const module = createGameModule(
      MockGameEngine as any,
      MockGameCanvas as any,
      config,
    )

    const setupFn = module.getGameModuleConfig().setupInitializationData
    expect(setupFn).toBeDefined()

    const metaConfig: MetaValues = {
      playerName: "TestPlayer",
      startingLevel: {
        items: ["level1", "level2", "level3"],
        selectedIndex: 1,
      },
    }

    const gameConfig = setupFn?.(metaConfig)
    expect(gameConfig?.playerName).toBe("TestPlayer")
    expect(gameConfig?.level).toBe("level2")
  })

  test("should handle setupInitializationData with random STRING_LIST selection", () => {
    const metaConfigSchema = {
      mapName: {
        type: GameConfigFieldType.STRING_LIST,
        label: "Map",
        description: "Select map",
        items: ["forest", "desert", "mountain"],
        selectedIndex: null,
      },
    } as const

    type MetaValues = InferMetaConfigValues<typeof metaConfigSchema>

    const MAPS = ["forest", "desert", "mountain"]

    const config: GameModuleConfig = {
      version: "1.0.0",
      customOperators: [],
      objectiveDefinitions: [],
      objectiveMetadata: {},
      validateCustomObjective: () => false,
      getProgressValue: () => null,
      getMetaConfigSchema: () => ({}),
      extractGameSnapshotInfo: () => ({}),
      formatGameSnapshotInfo: () => [],
      getInputMapping: () => ({}),
      setupInitializationData: (metaConfig?: MetaValues) => {
        if (metaConfig?.mapName) {
          const { items, selectedIndex } = metaConfig.mapName
          if (selectedIndex === null) {
            const randomIndex = Math.floor(Math.random() * items.length)
            return { mapName: items[randomIndex] }
          }
          return { mapName: items[selectedIndex] }
        }
        return { mapName: MAPS[0] }
      },
    }

    createGameModule(
      MockGameEngine as any,
      MockGameCanvas as any,
      config,
    )

    const metaConfig: MetaValues = {
      mapName: {
        items: MAPS,
        selectedIndex: null,
      },
    }

    const gameConfig = config.setupInitializationData?.(metaConfig)
    expect(MAPS).toContain(gameConfig?.mapName)
  })

  test("should handle setupInitializationData with COLOR field values", () => {
    const metaConfigSchema = {
      backgroundColor: {
        type: GameConfigFieldType.COLOR,
        label: "Background Color",
        description: "Choose background color",
        format: "hex" as const,
      },
      textColor: {
        type: GameConfigFieldType.COLOR,
        label: "Text Color",
        description: "Choose text color",
        format: "hex" as const,
        optional: true,
      },
    } as const

    type MetaValues = InferMetaConfigValues<typeof metaConfigSchema>

    const config: GameModuleConfig = {
      version: "1.0.0",
      customOperators: [],
      objectiveDefinitions: [],
      objectiveMetadata: {},
      validateCustomObjective: () => false,
      getProgressValue: () => null,
      getMetaConfigSchema: () => ({}),
      extractGameSnapshotInfo: () => ({}),
      formatGameSnapshotInfo: () => [],
      getInputMapping: () => ({}),
      setupInitializationData: (metaConfig?: MetaValues) => {
        const gameConfig: Record<string, any> = {}

        if (metaConfig?.backgroundColor) {
          gameConfig.bgColor = metaConfig.backgroundColor
        }

        if (metaConfig?.textColor) {
          gameConfig.txtColor = metaConfig.textColor
        }

        return gameConfig
      },
    }

    createGameModule(
      MockGameEngine as any,
      MockGameCanvas as any,
      config,
    )

    const metaConfig: MetaValues = {
      backgroundColor: "#FFFFFF",
      textColor: "#000000",
    }

    const gameConfig = config.setupInitializationData?.(metaConfig)
    expect(gameConfig?.bgColor).toBe("#FFFFFF")
    expect(gameConfig?.txtColor).toBe("#000000")
  })

  test("should handle setupInitializationData without metaConfig", () => {
    const config: GameModuleConfig = {
      version: "1.0.0",
      customOperators: [],
      objectiveDefinitions: [],
      objectiveMetadata: {},
      validateCustomObjective: () => false,
      getProgressValue: () => null,
      getMetaConfigSchema: () => ({}),
      extractGameSnapshotInfo: () => ({}),
      formatGameSnapshotInfo: () => [],
      getInputMapping: () => ({}),
      setupInitializationData: (metaConfig) => {
        if (!metaConfig) {
          return { defaultValue: true }
        }
        return { defaultValue: false }
      },
    }

    createGameModule(
      MockGameEngine as any,
      MockGameCanvas as any,
      config,
    )

    const gameConfig1 = config.setupInitializationData?.()
    const gameConfig2 = config.setupInitializationData?.(undefined)

    expect(gameConfig1?.defaultValue).toBe(true)
    expect(gameConfig2?.defaultValue).toBe(true)
  })

  test("should require getInputMapping method in config", () => {
    const config = createDefaultConfig()
    expect(config.getInputMapping).toBeDefined()
    
    const inputMapping = config.getInputMapping()
    expect(inputMapping).toBeDefined()
    expect(inputMapping[GameIntent.UP]).toEqual({ 
      keys: { type: 'single', key: 'w', event: 'onPressed' },
      displayText: 'Move Up'
    })
  })

  test("should support custom input mapping configurations", () => {
    const config = createDefaultConfig({
      getInputMapping: (): GameInputMapping => ({
        [GameIntent.UP]: {
          keys: [
            { type: 'single', key: 'w', event: 'onPressed' },
            { type: 'single', key: 'ArrowUp', event: 'onPressed' }
          ],
          displayText: 'Move Up'
        },
        [GameIntent.LEFT]: { 
          keys: { type: 'single', key: 'a', event: 'onPressed' },
          displayText: 'Move Left'
        },
        [GameIntent.ACTION]: { 
          keys: { type: 'combo', keyCombo: 'ctrl + space', event: 'onPressed' },
          displayText: 'Action'
        },
        [GameIntent.PAUSE]: { 
          keys: { type: 'single', key: 'p', event: 'onPressed' },
          displayText: 'Pause'
        },
      }),
    })

    const inputMapping = config.getInputMapping()
    expect(Array.isArray(inputMapping[GameIntent.UP]?.keys)).toBe(true)
    expect(inputMapping[GameIntent.ACTION]?.keys).toEqual({ type: 'combo', keyCombo: 'ctrl + space', event: 'onPressed' })
  })

  test("should support key combos with default event type", () => {
    const config = createDefaultConfig({
      getInputMapping: (): GameInputMapping => ({
        [GameIntent.RESET]: { 
          keys: { type: 'combo', keyCombo: 'ctrl + r' }, // no event specified, should default to onPressed
          displayText: 'Reset'
        },
      }),
    })

    const inputMapping = config.getInputMapping()
    const resetEntry = inputMapping[GameIntent.RESET]
    expect(resetEntry?.keys).toBeDefined()
    const resetConfig = resetEntry?.keys as any
    expect(resetConfig.type).toBe('combo')
    expect(resetConfig.keyCombo).toBe('ctrl + r')
    expect(resetConfig.event).toBeUndefined() // event is optional for combos
  })

  test("should support hiding intents from instructions with empty displayText", () => {
    const config = createDefaultConfig({
      getInputMapping: (): GameInputMapping => ({
        [GameIntent.UP]: { 
          keys: { type: 'single', key: 'w', event: 'onPressed' },
          displayText: 'Move Up'  // Will appear in instructions
        },
        [GameIntent.STOP_MOVING_LEFT]: {
          keys: { type: 'single', key: 'a', event: 'onReleased' },
          displayText: ''  // Hidden from instructions
        },
        [GameIntent.ACTION]: {
          keys: { type: 'single', key: 'space', event: 'onPressed' },
          // No displayText - also hidden from instructions
        },
      }),
    })

    const inputMapping = config.getInputMapping()
    
    // Intent with displayText should be included
    expect(inputMapping[GameIntent.UP]?.displayText).toBe('Move Up')
    
    // Intent with empty displayText should be excluded from instructions
    expect(inputMapping[GameIntent.STOP_MOVING_LEFT]?.displayText).toBe('')
    
    // Intent with no displayText should be excluded from instructions  
    expect(inputMapping[GameIntent.ACTION]?.displayText).toBeUndefined()
  })
})
