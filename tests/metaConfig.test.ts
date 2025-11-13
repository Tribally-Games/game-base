import { describe, expect, test } from "bun:test"
import {
  type ColorFieldConfig,
  GameConfigFieldType,
  type GameMetaConfigSchema,
  type InferMetaConfigValues,
  type SpritesheetFieldConfig,
  type SpritesheetValue,
  type StringFieldConfig,
  type StringListFieldConfig,
  type StringListValue,
  mergeWithDefaults,
  validateMetaConfigValues,
} from "../src/metaConfig"

describe("MetaConfig - Field Types", () => {
  test("should have COLOR field type", () => {
    expect(GameConfigFieldType.COLOR).toBe("COLOR")
  })

  test("should have STRING field type", () => {
    expect(GameConfigFieldType.STRING).toBe("STRING")
  })

  test("should have STRING_LIST field type", () => {
    expect(GameConfigFieldType.STRING_LIST).toBe("STRING_LIST")
  })

  test("should have SPRITESHEET field type", () => {
    expect(GameConfigFieldType.SPRITESHEET).toBe("SPRITESHEET")
  })

  test("should have exactly 4 field types", () => {
    const values = Object.values(GameConfigFieldType)
    expect(values).toHaveLength(4)
  })
})

describe("MetaConfig - ColorFieldConfig", () => {
  test("should create valid color field config", () => {
    const config: ColorFieldConfig = {
      type: GameConfigFieldType.COLOR,
      label: "Background Color",
      description: "Choose the background color",
      format: "hex",
    }

    expect(config.type).toBe(GameConfigFieldType.COLOR)
    expect(config.label).toBe("Background Color")
    expect(config.description).toBe("Choose the background color")
    expect(config.format).toBe("hex")
  })

  test("should support optional fields", () => {
    const config: ColorFieldConfig = {
      type: GameConfigFieldType.COLOR,
      label: "Text Color",
      description: "Text color",
      optional: true,
      defaultValue: "#000000",
      allowedValues: ["#000000", "#FFFFFF", "#FF0000"],
    }

    expect(config.optional).toBe(true)
    expect(config.defaultValue).toBe("#000000")
    expect(config.allowedValues).toEqual(["#000000", "#FFFFFF", "#FF0000"])
  })

  test("should support different color formats", () => {
    const hexConfig: ColorFieldConfig = {
      type: GameConfigFieldType.COLOR,
      label: "Color",
      description: "Hex color",
      format: "hex",
    }

    const rgbConfig: ColorFieldConfig = {
      type: GameConfigFieldType.COLOR,
      label: "Color",
      description: "RGB color",
      format: "rgb",
    }

    const rgbaConfig: ColorFieldConfig = {
      type: GameConfigFieldType.COLOR,
      label: "Color",
      description: "RGBA color",
      format: "rgba",
    }

    expect(hexConfig.format).toBe("hex")
    expect(rgbConfig.format).toBe("rgb")
    expect(rgbaConfig.format).toBe("rgba")
  })
})

describe("MetaConfig - StringFieldConfig", () => {
  test("should create valid string field config", () => {
    const config: StringFieldConfig = {
      type: GameConfigFieldType.STRING,
      label: "Player Name",
      description: "Enter your player name",
    }

    expect(config.type).toBe(GameConfigFieldType.STRING)
    expect(config.label).toBe("Player Name")
    expect(config.description).toBe("Enter your player name")
  })

  test("should support string constraints", () => {
    const config: StringFieldConfig = {
      type: GameConfigFieldType.STRING,
      label: "Username",
      description: "Choose a username",
      minLength: 3,
      maxLength: 20,
      pattern: "^[a-zA-Z0-9_]+$",
    }

    expect(config.minLength).toBe(3)
    expect(config.maxLength).toBe(20)
    expect(config.pattern).toBe("^[a-zA-Z0-9_]+$")
  })

  test("should support allowed values for dropdown behavior", () => {
    const config: StringFieldConfig = {
      type: GameConfigFieldType.STRING,
      label: "Difficulty",
      description: "Select difficulty level",
      allowedValues: ["easy", "medium", "hard"],
      defaultValue: "medium",
    }

    expect(config.allowedValues).toEqual(["easy", "medium", "hard"])
    expect(config.defaultValue).toBe("medium")
  })
})

describe("MetaConfig - StringListFieldConfig", () => {
  test("should create valid string list field config", () => {
    const config: StringListFieldConfig = {
      type: GameConfigFieldType.STRING_LIST,
      label: "Map Selection",
      description: "Choose a map",
      items: ["map1", "map2", "map3"],
    }

    expect(config.type).toBe(GameConfigFieldType.STRING_LIST)
    expect(config.label).toBe("Map Selection")
    expect(config.items).toEqual(["map1", "map2", "map3"])
  })

  test("should support default index", () => {
    const config: StringListFieldConfig = {
      type: GameConfigFieldType.STRING_LIST,
      label: "Theme",
      description: "Select theme",
      items: ["light", "dark", "auto"],
      selectedIndex: 2,
    }

    expect(config.selectedIndex).toBe(2)
  })

  test("should support null default index for random selection", () => {
    const config: StringListFieldConfig = {
      type: GameConfigFieldType.STRING_LIST,
      label: "Starting Map",
      description: "Pick a starting map (or random)",
      items: ["forest", "desert", "mountain"],
      selectedIndex: null,
    }

    expect(config.selectedIndex).toBe(null)
  })
})

describe("MetaConfig - SpritesheetFieldConfig", () => {
  test("should create valid spritesheet field config", () => {
    const config: SpritesheetFieldConfig = {
      type: GameConfigFieldType.SPRITESHEET,
      label: "Character Sprites",
      description: "Choose character spritesheet",
    }

    expect(config.type).toBe(GameConfigFieldType.SPRITESHEET)
    expect(config.label).toBe("Character Sprites")
    expect(config.description).toBe("Choose character spritesheet")
  })

  test("should support optional fields", () => {
    const config: SpritesheetFieldConfig = {
      type: GameConfigFieldType.SPRITESHEET,
      label: "UI Sprites",
      description: "UI spritesheet",
      optional: true,
      defaultValue: {
        img: "https://example.com/ui.png",
        json: "https://example.com/ui.json",
      },
    }

    expect(config.optional).toBe(true)
    expect(config.defaultValue?.img).toBe("https://example.com/ui.png")
    expect(config.defaultValue?.json).toBe("https://example.com/ui.json")
  })

  test("should support different image formats in default value", () => {
    const pngConfig: SpritesheetFieldConfig = {
      type: GameConfigFieldType.SPRITESHEET,
      label: "PNG Sprites",
      description: "PNG spritesheet",
      defaultValue: {
        img: "sprites.png",
        json: "sprites.json",
      },
    }

    const jpgConfig: SpritesheetFieldConfig = {
      type: GameConfigFieldType.SPRITESHEET,
      label: "JPG Sprites",
      description: "JPG spritesheet",
      defaultValue: {
        img: "background.jpg",
        json: "background.json",
      },
    }

    const webpConfig: SpritesheetFieldConfig = {
      type: GameConfigFieldType.SPRITESHEET,
      label: "WebP Sprites",
      description: "WebP spritesheet",
      defaultValue: {
        img: "compressed.webp",
        json: "compressed.json",
      },
    }

    expect(pngConfig.defaultValue?.img).toBe("sprites.png")
    expect(jpgConfig.defaultValue?.img).toBe("background.jpg")
    expect(webpConfig.defaultValue?.img).toBe("compressed.webp")
  })
})

describe("MetaConfig - SpritesheetValue", () => {
  test("should create valid spritesheet value", () => {
    const value: SpritesheetValue = {
      img: "https://cdn.example.com/sprites.png",
      json: "https://cdn.example.com/sprites.json",
    }

    expect(value.img).toBe("https://cdn.example.com/sprites.png")
    expect(value.json).toBe("https://cdn.example.com/sprites.json")
  })

  test("should support different image formats", () => {
    const pngValue: SpritesheetValue = {
      img: "sprites.png",
      json: "sprites.json",
    }

    const jpegValue: SpritesheetValue = {
      img: "background.jpeg",
      json: "background.json",
    }

    const webpValue: SpritesheetValue = {
      img: "optimized.webp",
      json: "optimized.json",
    }

    expect(pngValue.img).toBe("sprites.png")
    expect(jpegValue.img).toBe("background.jpeg")
    expect(webpValue.img).toBe("optimized.webp")
  })

  test("should support relative and absolute URLs", () => {
    const relativeValue: SpritesheetValue = {
      img: "./assets/sprites.png",
      json: "./assets/sprites.json",
    }

    const absoluteValue: SpritesheetValue = {
      img: "https://cdn.example.com/game/sprites.png",
      json: "https://cdn.example.com/game/sprites.json",
    }

    expect(relativeValue.img).toBe("./assets/sprites.png")
    expect(absoluteValue.img).toBe("https://cdn.example.com/game/sprites.png")
  })
})

describe("MetaConfig - StringListValue", () => {
  test("should create valid string list value with specific selection", () => {
    const value: StringListValue = {
      items: ["option1", "option2", "option3"],
      selectedIndex: 1,
    }

    expect(value.items).toEqual(["option1", "option2", "option3"])
    expect(value.selectedIndex).toBe(1)
  })

  test("should create valid string list value with random selection", () => {
    const value: StringListValue = {
      items: ["red", "blue", "green"],
      selectedIndex: null,
    }

    expect(value.items).toEqual(["red", "blue", "green"])
    expect(value.selectedIndex).toBe(null)
  })
})

describe("MetaConfig - GameMetaConfigSchema", () => {
  test("should create schema with multiple field types", () => {
    const schema: GameMetaConfigSchema = {
      backgroundColor: {
        type: GameConfigFieldType.COLOR,
        label: "Background Color",
        description: "Choose background color",
        format: "hex",
      },
      playerName: {
        type: GameConfigFieldType.STRING,
        label: "Player Name",
        description: "Enter your name",
      },
      mapSelection: {
        type: GameConfigFieldType.STRING_LIST,
        label: "Map",
        description: "Select a map",
        items: ["map1", "map2"],
        selectedIndex: 0,
      },
      characterSprites: {
        type: GameConfigFieldType.SPRITESHEET,
        label: "Character Sprites",
        description: "Character spritesheet",
        defaultValue: {
          img: "characters.png",
          json: "characters.json",
        },
      },
    }

    expect(schema.backgroundColor.type).toBe(GameConfigFieldType.COLOR)
    expect(schema.playerName.type).toBe(GameConfigFieldType.STRING)
    expect(schema.mapSelection.type).toBe(GameConfigFieldType.STRING_LIST)
    expect(schema.characterSprites.type).toBe(GameConfigFieldType.SPRITESHEET)
  })
})

describe("MetaConfig - InferMetaConfigValues", () => {
  test("should infer correct value types from schema", () => {
    const schema = {
      color: {
        type: GameConfigFieldType.COLOR,
        label: "Color",
        description: "Pick a color",
      },
      name: {
        type: GameConfigFieldType.STRING,
        label: "Name",
        description: "Enter name",
      },
      mapSelection: {
        type: GameConfigFieldType.STRING_LIST,
        label: "Map",
        description: "Select map",
        items: ["a", "b", "c"],
      },
      sprites: {
        type: GameConfigFieldType.SPRITESHEET,
        label: "Sprites",
        description: "Game sprites",
      },
    } as const

    type Values = InferMetaConfigValues<typeof schema>

    const values: Values = {
      color: "#FF0000",
      name: "Player1",
      mapSelection: {
        items: ["a", "b", "c"],
        selectedIndex: 1,
      },
      sprites: {
        img: "game-sprites.png",
        json: "game-sprites.json",
      },
    }

    expect(values.color).toBe("#FF0000")
    expect(values.name).toBe("Player1")
    expect(values.mapSelection?.selectedIndex).toBe(1)
    expect(values.sprites?.img).toBe("game-sprites.png")
    expect(values.sprites?.json).toBe("game-sprites.json")
  })

  test("should allow undefined for optional fields", () => {
    const schema = {
      requiredColor: {
        type: GameConfigFieldType.COLOR,
        label: "Required",
        description: "Required color",
      },
      optionalName: {
        type: GameConfigFieldType.STRING,
        label: "Optional",
        description: "Optional name",
        optional: true,
      },
    } as const

    type Values = InferMetaConfigValues<typeof schema>

    const values1: Values = {
      requiredColor: "#000000",
    }

    const values2: Values = {
      requiredColor: "#FFFFFF",
      optionalName: "Test",
    }

    expect(values1.requiredColor).toBe("#000000")
    expect(values1.optionalName).toBeUndefined()
    expect(values2.optionalName).toBe("Test")
  })

  test("should correctly type STRING_LIST values", () => {
    const schema = {
      maps: {
        type: GameConfigFieldType.STRING_LIST,
        label: "Maps",
        description: "Map selection",
        items: ["map1", "map2", "map3"],
        selectedIndex: null,
      },
    } as const

    type Values = InferMetaConfigValues<typeof schema>

    const randomSelection: Values = {
      maps: {
        items: ["map1", "map2", "map3"],
        selectedIndex: null,
      },
    }

    const specificSelection: Values = {
      maps: {
        items: ["map1", "map2", "map3"],
        selectedIndex: 2,
      },
    }

    expect(randomSelection.maps?.selectedIndex).toBe(null)
    expect(specificSelection.maps?.selectedIndex).toBe(2)
  })
})

describe("MetaConfig - Type Safety", () => {
  test("should enforce correct value types for COLOR fields", () => {
    const schema = {
      bgColor: {
        type: GameConfigFieldType.COLOR,
        label: "Background",
        description: "Background color",
      },
    } as const

    type Values = InferMetaConfigValues<typeof schema>

    const validValues: Values = {
      bgColor: "#123456",
    }

    expect(validValues.bgColor).toBe("#123456")
  })

  test("should enforce correct value types for STRING fields", () => {
    const schema = {
      username: {
        type: GameConfigFieldType.STRING,
        label: "Username",
        description: "Your username",
      },
    } as const

    type Values = InferMetaConfigValues<typeof schema>

    const validValues: Values = {
      username: "player123",
    }

    expect(validValues.username).toBe("player123")
  })

  test("should enforce correct value structure for STRING_LIST fields", () => {
    const schema = {
      level: {
        type: GameConfigFieldType.STRING_LIST,
        label: "Level",
        description: "Starting level",
        items: ["level1", "level2", "level3"],
      },
    } as const

    type Values = InferMetaConfigValues<typeof schema>

    const validValues: Values = {
      level: {
        items: ["level1", "level2", "level3"],
        selectedIndex: 0,
      },
    }

    expect(validValues.level?.items).toEqual(["level1", "level2", "level3"])
    expect(validValues.level?.selectedIndex).toBe(0)
  })
})

describe("MetaConfig - Real World Scenarios", () => {
  test("should handle game configuration schema", () => {
    const gameSchema = {
      snakeColor: {
        type: GameConfigFieldType.COLOR,
        label: "Snake Color",
        description: "Custom snake color",
        optional: true,
        format: "hex" as const,
      },
      obstacleColor: {
        type: GameConfigFieldType.COLOR,
        label: "Obstacle Color",
        description: "Custom obstacle color",
        optional: true,
        format: "hex" as const,
      },
      mapSelection: {
        type: GameConfigFieldType.STRING_LIST,
        label: "Map",
        description: "Starting map",
        items: ["forest", "desert", "ice"],
        selectedIndex: null,
      },
      difficulty: {
        type: GameConfigFieldType.STRING,
        label: "Difficulty",
        description: "Game difficulty",
        allowedValues: ["easy", "medium", "hard"],
        defaultValue: "medium",
      },
    } as const

    type GameValues = InferMetaConfigValues<typeof gameSchema>

    const config: GameValues = {
      snakeColor: "#00FF00",
      mapSelection: {
        items: ["forest", "desert", "ice"],
        selectedIndex: null,
      },
      difficulty: "hard",
    }

    expect(config.snakeColor).toBe("#00FF00")
    expect(config.obstacleColor).toBeUndefined()
    expect(config.mapSelection?.selectedIndex).toBe(null)
    expect(config.difficulty).toBe("hard")
  })

  test("should validate that schema and values are linked", () => {
    const schema = {
      theme: {
        type: GameConfigFieldType.STRING,
        label: "Theme",
        description: "UI theme",
        allowedValues: ["light", "dark"],
      },
    } as const

    type Values = InferMetaConfigValues<typeof schema>

    const values: Values = {
      theme: "dark",
    }

    expect(values.theme).toBe("dark")
    expect(schema.theme.allowedValues).toContain(values.theme)
  })
})

describe("MetaConfig - Validation", () => {
  test("should validate required fields", () => {
    const schema: GameMetaConfigSchema = {
      requiredField: {
        type: GameConfigFieldType.STRING,
        label: "Required",
        description: "This is required",
      },
      optionalField: {
        type: GameConfigFieldType.STRING,
        label: "Optional",
        description: "This is optional",
        optional: true,
      },
    }

    const values = {
      optionalField: "test",
    }

    const errors = validateMetaConfigValues(schema, values)
    expect(errors).toHaveLength(1)
    expect(errors[0].field).toBe("requiredField")
    expect(errors[0].message).toContain("required")
  })

  test("should pass validation when all required fields are present", () => {
    const schema: GameMetaConfigSchema = {
      name: {
        type: GameConfigFieldType.STRING,
        label: "Name",
        description: "Your name",
      },
    }

    const values = {
      name: "John",
    }

    const errors = validateMetaConfigValues(schema, values)
    expect(errors).toHaveLength(0)
  })

  test("should validate COLOR field format", () => {
    const schema: GameMetaConfigSchema = {
      color: {
        type: GameConfigFieldType.COLOR,
        label: "Color",
        description: "Pick a color",
        format: "hex",
      },
    }

    const invalidValues = {
      color: "red",
    }

    const errors = validateMetaConfigValues(schema, invalidValues)
    expect(errors).toHaveLength(1)
    expect(errors[0].field).toBe("color")
    expect(errors[0].message).toContain("hex color")
  })

  test("should pass validation for valid hex color", () => {
    const schema: GameMetaConfigSchema = {
      color: {
        type: GameConfigFieldType.COLOR,
        label: "Color",
        description: "Pick a color",
        format: "hex",
      },
    }

    const values = {
      color: "#FF0000",
    }

    const errors = validateMetaConfigValues(schema, values)
    expect(errors).toHaveLength(0)
  })

  test("should validate COLOR allowedValues", () => {
    const schema: GameMetaConfigSchema = {
      brandColor: {
        type: GameConfigFieldType.COLOR,
        label: "Brand Color",
        description: "Choose a brand color",
        allowedValues: ["#FF0000", "#00FF00", "#0000FF"],
      },
    }

    const invalidValues = {
      brandColor: "#FFFF00",
    }

    const errors = validateMetaConfigValues(schema, invalidValues)
    expect(errors).toHaveLength(1)
    expect(errors[0].field).toBe("brandColor")
    expect(errors[0].message).toContain("must be one of")
  })

  test("should validate STRING minLength", () => {
    const schema: GameMetaConfigSchema = {
      username: {
        type: GameConfigFieldType.STRING,
        label: "Username",
        description: "Pick a username",
        minLength: 3,
      },
    }

    const invalidValues = {
      username: "ab",
    }

    const errors = validateMetaConfigValues(schema, invalidValues)
    expect(errors).toHaveLength(1)
    expect(errors[0].field).toBe("username")
    expect(errors[0].message).toContain("at least 3")
  })

  test("should validate STRING maxLength", () => {
    const schema: GameMetaConfigSchema = {
      username: {
        type: GameConfigFieldType.STRING,
        label: "Username",
        description: "Pick a username",
        maxLength: 10,
      },
    }

    const invalidValues = {
      username: "verylongusername",
    }

    const errors = validateMetaConfigValues(schema, invalidValues)
    expect(errors).toHaveLength(1)
    expect(errors[0].field).toBe("username")
    expect(errors[0].message).toContain("at most 10")
  })

  test("should validate STRING pattern", () => {
    const schema: GameMetaConfigSchema = {
      username: {
        type: GameConfigFieldType.STRING,
        label: "Username",
        description: "Alphanumeric only",
        pattern: "^[a-zA-Z0-9]+$",
      },
    }

    const invalidValues = {
      username: "user@name",
    }

    const errors = validateMetaConfigValues(schema, invalidValues)
    expect(errors).toHaveLength(1)
    expect(errors[0].field).toBe("username")
    expect(errors[0].message).toContain("pattern")
  })

  test("should validate STRING allowedValues", () => {
    const schema: GameMetaConfigSchema = {
      difficulty: {
        type: GameConfigFieldType.STRING,
        label: "Difficulty",
        description: "Game difficulty",
        allowedValues: ["easy", "medium", "hard"],
      },
    }

    const invalidValues = {
      difficulty: "extreme",
    }

    const errors = validateMetaConfigValues(schema, invalidValues)
    expect(errors).toHaveLength(1)
    expect(errors[0].field).toBe("difficulty")
    expect(errors[0].message).toContain("must be one of")
  })

  test("should validate STRING_LIST structure", () => {
    const schema: GameMetaConfigSchema = {
      maps: {
        type: GameConfigFieldType.STRING_LIST,
        label: "Maps",
        description: "Select map",
        items: ["map1", "map2"],
      },
    }

    const invalidValues = {
      maps: "not an object",
    }

    const errors = validateMetaConfigValues(schema, invalidValues)
    expect(errors).toHaveLength(1)
    expect(errors[0].field).toBe("maps")
    expect(errors[0].message).toContain("object")
  })

  test("should validate STRING_LIST selectedIndex range", () => {
    const schema: GameMetaConfigSchema = {
      maps: {
        type: GameConfigFieldType.STRING_LIST,
        label: "Maps",
        description: "Select map",
        items: ["map1", "map2", "map3"],
      },
    }

    const invalidValues = {
      maps: {
        items: ["map1", "map2", "map3"],
        selectedIndex: 5,
      },
    }

    const errors = validateMetaConfigValues(schema, invalidValues)
    expect(errors).toHaveLength(1)
    expect(errors[0].field).toBe("maps")
    expect(errors[0].message).toContain("valid index")
  })

  test("should allow null selectedIndex for random selection", () => {
    const schema: GameMetaConfigSchema = {
      maps: {
        type: GameConfigFieldType.STRING_LIST,
        label: "Maps",
        description: "Select map",
        items: ["map1", "map2"],
      },
    }

    const values = {
      maps: {
        items: ["map1", "map2"],
        selectedIndex: null,
      },
    }

    const errors = validateMetaConfigValues(schema, values)
    expect(errors).toHaveLength(0)
  })

  test("should validate STRING_LIST items match schema", () => {
    const schema: GameMetaConfigSchema = {
      levels: {
        type: GameConfigFieldType.STRING_LIST,
        label: "Levels",
        description: "Select level",
        items: ["level1", "level2", "level3"],
      },
    }

    const invalidValues = {
      levels: {
        items: ["level1", "invalidLevel"],
        selectedIndex: 0,
      },
    }

    const errors = validateMetaConfigValues(schema, invalidValues)
    expect(errors).toHaveLength(1)
    expect(errors[0].field).toBe("levels")
    expect(errors[0].message).toContain(
      "must only contain items from the schema",
    )
  })

  test("should validate multiple fields with multiple errors", () => {
    const schema: GameMetaConfigSchema = {
      name: {
        type: GameConfigFieldType.STRING,
        label: "Name",
        description: "Your name",
        minLength: 3,
      },
      color: {
        type: GameConfigFieldType.COLOR,
        label: "Color",
        description: "Pick a color",
        format: "hex",
      },
      level: {
        type: GameConfigFieldType.STRING_LIST,
        label: "Level",
        description: "Select level",
        items: ["easy", "hard"],
      },
    }

    const invalidValues = {
      name: "ab",
      color: "red",
      level: {
        items: ["easy", "hard"],
        selectedIndex: 10,
      },
    }

    const errors = validateMetaConfigValues(schema, invalidValues)
    expect(errors).toHaveLength(3)
    expect(errors.map((e) => e.field)).toContain("name")
    expect(errors.map((e) => e.field)).toContain("color")
    expect(errors.map((e) => e.field)).toContain("level")
  })

  test("should pass validation for complex valid configuration", () => {
    const schema: GameMetaConfigSchema = {
      playerName: {
        type: GameConfigFieldType.STRING,
        label: "Player Name",
        description: "Your player name",
        minLength: 3,
        maxLength: 20,
        pattern: "^[a-zA-Z0-9_]+$",
      },
      snakeColor: {
        type: GameConfigFieldType.COLOR,
        label: "Snake Color",
        description: "Snake color",
        format: "hex",
        optional: true,
      },
      mapSelection: {
        type: GameConfigFieldType.STRING_LIST,
        label: "Map",
        description: "Starting map",
        items: ["forest", "desert", "ice"],
      },
      difficulty: {
        type: GameConfigFieldType.STRING,
        label: "Difficulty",
        description: "Game difficulty",
        allowedValues: ["easy", "medium", "hard"],
      },
    }

    const validValues = {
      playerName: "Player123",
      snakeColor: "#00FF00",
      mapSelection: {
        items: ["forest", "desert", "ice"],
        selectedIndex: 1,
      },
      difficulty: "medium",
    }

    const errors = validateMetaConfigValues(schema, validValues)
    expect(errors).toHaveLength(0)
  })

  test("should handle type mismatch errors", () => {
    const schema: GameMetaConfigSchema = {
      name: {
        type: GameConfigFieldType.STRING,
        label: "Name",
        description: "Your name",
      },
    }

    const invalidValues = {
      name: 123,
    }

    const errors = validateMetaConfigValues(schema, invalidValues as any)
    expect(errors).toHaveLength(1)
    expect(errors[0].field).toBe("name")
    expect(errors[0].message).toContain("must be a string")
  })

  test("should validate SPRITESHEET structure", () => {
    const schema: GameMetaConfigSchema = {
      sprites: {
        type: GameConfigFieldType.SPRITESHEET,
        label: "Sprites",
        description: "Game sprites",
      },
    }

    const invalidValues = {
      sprites: "not an object",
    }

    const errors = validateMetaConfigValues(schema, invalidValues)
    expect(errors).toHaveLength(1)
    expect(errors[0].field).toBe("sprites")
    expect(errors[0].message).toContain("object with img and json properties")
  })

  test("should validate SPRITESHEET img property type", () => {
    const schema: GameMetaConfigSchema = {
      sprites: {
        type: GameConfigFieldType.SPRITESHEET,
        label: "Sprites",
        description: "Game sprites",
      },
    }

    const invalidValues = {
      sprites: {
        img: 123,
        json: "sprites.json",
      },
    }

    const errors = validateMetaConfigValues(schema, invalidValues as any)
    expect(errors).toHaveLength(1)
    expect(errors[0].field).toBe("sprites")
    expect(errors[0].message).toContain("sprites.img' must be a string")
  })

  test("should validate SPRITESHEET json property type", () => {
    const schema: GameMetaConfigSchema = {
      sprites: {
        type: GameConfigFieldType.SPRITESHEET,
        label: "Sprites",
        description: "Game sprites",
      },
    }

    const invalidValues = {
      sprites: {
        img: "sprites.png",
        json: 456,
      },
    }

    const errors = validateMetaConfigValues(schema, invalidValues as any)
    expect(errors).toHaveLength(1)
    expect(errors[0].field).toBe("sprites")
    expect(errors[0].message).toContain("sprites.json' must be a string")
  })

  test("should validate SPRITESHEET image file extension", () => {
    const schema: GameMetaConfigSchema = {
      sprites: {
        type: GameConfigFieldType.SPRITESHEET,
        label: "Sprites",
        description: "Game sprites",
      },
    }

    const invalidValues = {
      sprites: {
        img: "sprites.gif",
        json: "sprites.json",
      },
    }

    const errors = validateMetaConfigValues(schema, invalidValues)
    expect(errors).toHaveLength(1)
    expect(errors[0].field).toBe("sprites")
    expect(errors[0].message).toContain("must be a data URL or a URL ending with .jpg, .jpeg, .png, or .webp")
  })

  test("should validate SPRITESHEET json file extension", () => {
    const schema: GameMetaConfigSchema = {
      sprites: {
        type: GameConfigFieldType.SPRITESHEET,
        label: "Sprites",
        description: "Game sprites",
      },
    }

    const invalidValues = {
      sprites: {
        img: "sprites.png",
        json: "sprites.xml",
      },
    }

    const errors = validateMetaConfigValues(schema, invalidValues)
    expect(errors).toHaveLength(1)
    expect(errors[0].field).toBe("sprites")
    expect(errors[0].message).toContain("must be a data URL or a URL ending with .json")
  })

  test("should pass validation for valid SPRITESHEET with PNG", () => {
    const schema: GameMetaConfigSchema = {
      sprites: {
        type: GameConfigFieldType.SPRITESHEET,
        label: "Sprites",
        description: "Game sprites",
      },
    }

    const validValues = {
      sprites: {
        img: "https://example.com/sprites.png",
        json: "https://example.com/sprites.json",
      },
    }

    const errors = validateMetaConfigValues(schema, validValues)
    expect(errors).toHaveLength(0)
  })

  test("should pass validation for valid SPRITESHEET with JPG", () => {
    const schema: GameMetaConfigSchema = {
      sprites: {
        type: GameConfigFieldType.SPRITESHEET,
        label: "Sprites",
        description: "Game sprites",
      },
    }

    const validValues = {
      sprites: {
        img: "./assets/background.jpg",
        json: "./assets/background.json",
      },
    }

    const errors = validateMetaConfigValues(schema, validValues)
    expect(errors).toHaveLength(0)
  })

  test("should pass validation for valid SPRITESHEET with JPEG", () => {
    const schema: GameMetaConfigSchema = {
      sprites: {
        type: GameConfigFieldType.SPRITESHEET,
        label: "Sprites",
        description: "Game sprites",
      },
    }

    const validValues = {
      sprites: {
        img: "photo.jpeg",
        json: "photo.json",
      },
    }

    const errors = validateMetaConfigValues(schema, validValues)
    expect(errors).toHaveLength(0)
  })

  test("should pass validation for valid SPRITESHEET with WebP", () => {
    const schema: GameMetaConfigSchema = {
      sprites: {
        type: GameConfigFieldType.SPRITESHEET,
        label: "Sprites",
        description: "Game sprites",
      },
    }

    const validValues = {
      sprites: {
        img: "optimized.webp",
        json: "optimized.json",
      },
    }

    const errors = validateMetaConfigValues(schema, validValues)
    expect(errors).toHaveLength(0)
  })

  test("should pass validation for valid SPRITESHEET with data URLs", () => {
    const schema: GameMetaConfigSchema = {
      sprites: {
        type: GameConfigFieldType.SPRITESHEET,
        label: "Sprites",
        description: "Game sprites",
      },
    }

    const validValues = {
      sprites: {
        img: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
        json: "data:application/json;base64,eyJmcmFtZXMiOnsidGVzdC5wbmciOnsic291cmNlU2l6ZSI6eyJ3IjoxNiwiaCI6MTZ9fX19",
      },
    }

    const errors = validateMetaConfigValues(schema, validValues)
    expect(errors).toHaveLength(0)
  })

  test("should handle case insensitive file extensions", () => {
    const schema: GameMetaConfigSchema = {
      sprites: {
        type: GameConfigFieldType.SPRITESHEET,
        label: "Sprites",
        description: "Game sprites",
      },
    }

    const validValues = {
      sprites: {
        img: "SPRITES.PNG",
        json: "SPRITES.JSON",
      },
    }

    const errors = validateMetaConfigValues(schema, validValues)
    expect(errors).toHaveLength(0)
  })

  test("should validate multiple SPRITESHEET errors at once", () => {
    const schema: GameMetaConfigSchema = {
      sprites: {
        type: GameConfigFieldType.SPRITESHEET,
        label: "Sprites",
        description: "Game sprites",
      },
    }

    const invalidValues = {
      sprites: {
        img: "sprites.gif",
        json: "sprites.xml",
      },
    }

    const errors = validateMetaConfigValues(schema, invalidValues)
    expect(errors).toHaveLength(2)
    expect(errors.map((e) => e.field)).toEqual(["sprites", "sprites"])
    expect(errors[0].message).toContain("jpg, .jpeg, .png, or .webp")
    expect(errors[1].message).toContain("ending with .json")
  })
})

describe("MetaConfig - mergeWithDefaults", () => {
  test("should preserve explicit values over defaults", () => {
    const schema: GameMetaConfigSchema = {
      color: {
        type: GameConfigFieldType.COLOR,
        label: "Color",
        description: "Pick color",
        defaultValue: "#000000",
      },
      name: {
        type: GameConfigFieldType.STRING,
        label: "Name",
        description: "Enter name",
        defaultValue: "default",
      },
    }

    const values = {
      color: "#FF0000",
      name: "custom",
    }

    const merged = mergeWithDefaults(schema, values)
    expect(merged.color).toBe("#FF0000")
    expect(merged.name).toBe("custom")
  })

  test("should use defaults when values are not provided", () => {
    const schema: GameMetaConfigSchema = {
      color: {
        type: GameConfigFieldType.COLOR,
        label: "Color",
        description: "Pick color",
        defaultValue: "#123456",
      },
      text: {
        type: GameConfigFieldType.STRING,
        label: "Text",
        description: "Enter text",
        defaultValue: "hello",
      },
    }

    const merged = mergeWithDefaults(schema, {})
    expect(merged.color).toBe("#123456")
    expect(merged.text).toBe("hello")
  })

  test("should handle STRING_LIST with explicit selectedIndex", () => {
    const schema: GameMetaConfigSchema = {
      maps: {
        type: GameConfigFieldType.STRING_LIST,
        label: "Maps",
        description: "Select map",
        items: ["map1", "map2", "map3"],
        selectedIndex: 1,
      },
    }

    const merged = mergeWithDefaults(schema, {})
    expect(merged.maps).toEqual({
      items: ["map1", "map2", "map3"],
      selectedIndex: 1,
    })
  })

  test("should handle STRING_LIST with selectedIndex as null", () => {
    const schema: GameMetaConfigSchema = {
      themes: {
        type: GameConfigFieldType.STRING_LIST,
        label: "Themes",
        description: "Select theme",
        items: ["light", "dark"],
        selectedIndex: null,
      },
    }

    const merged = mergeWithDefaults(schema, {})
    expect(merged.themes).toEqual({
      items: ["light", "dark"],
      selectedIndex: null,
    })
  })

  test("should handle STRING_LIST without selectedIndex (defaults to null)", () => {
    const schema: GameMetaConfigSchema = {
      levels: {
        type: GameConfigFieldType.STRING_LIST,
        label: "Levels",
        description: "Select level",
        items: ["easy", "hard"],
      },
    }

    const merged = mergeWithDefaults(schema, {})
    expect(merged.levels).toEqual({
      items: ["easy", "hard"],
      selectedIndex: null,
    })
  })

  test("should preserve provided STRING_LIST value over schema default", () => {
    const schema: GameMetaConfigSchema = {
      maps: {
        type: GameConfigFieldType.STRING_LIST,
        label: "Maps",
        description: "Select map",
        items: ["map1", "map2", "map3"],
        selectedIndex: 0,
      },
    }

    const values = {
      maps: {
        items: ["map1", "map2", "map3"],
        selectedIndex: 2,
      },
    }

    const merged = mergeWithDefaults(schema, values)
    expect(merged.maps).toEqual({
      items: ["map1", "map2", "map3"],
      selectedIndex: 2,
    })
  })

  test("should handle mixed schema with partial values", () => {
    const schema: GameMetaConfigSchema = {
      bgColor: {
        type: GameConfigFieldType.COLOR,
        label: "Background",
        description: "Background color",
        defaultValue: "#FFFFFF",
      },
      playerName: {
        type: GameConfigFieldType.STRING,
        label: "Name",
        description: "Player name",
        defaultValue: "Player",
      },
      difficulty: {
        type: GameConfigFieldType.STRING_LIST,
        label: "Difficulty",
        description: "Select difficulty",
        items: ["easy", "medium", "hard"],
        selectedIndex: 1,
      },
    }

    const values = {
      playerName: "CustomPlayer",
    }

    const merged = mergeWithDefaults(schema, values)
    expect(merged.bgColor).toBe("#FFFFFF")
    expect(merged.playerName).toBe("CustomPlayer")
    expect(merged.difficulty).toEqual({
      items: ["easy", "medium", "hard"],
      selectedIndex: 1,
    })
  })

  test("should handle null input values", () => {
    const schema: GameMetaConfigSchema = {
      color: {
        type: GameConfigFieldType.COLOR,
        label: "Color",
        description: "Pick color",
        defaultValue: "#000000",
      },
    }

    const merged = mergeWithDefaults(schema, null)
    expect(merged.color).toBe("#000000")
  })

  test("should handle undefined input values", () => {
    const schema: GameMetaConfigSchema = {
      name: {
        type: GameConfigFieldType.STRING,
        label: "Name",
        description: "Enter name",
        defaultValue: "default",
      },
    }

    const merged = mergeWithDefaults(schema, undefined)
    expect(merged.name).toBe("default")
  })

  test("should not include fields without defaults or values", () => {
    const schema: GameMetaConfigSchema = {
      requiredColor: {
        type: GameConfigFieldType.COLOR,
        label: "Color",
        description: "Required color",
      },
      optionalName: {
        type: GameConfigFieldType.STRING,
        label: "Name",
        description: "Optional name",
        optional: true,
      },
    }

    const merged = mergeWithDefaults(schema, {})
    expect(merged.requiredColor).toBeUndefined()
    expect(merged.optionalName).toBeUndefined()
  })

  test("should handle complex real-world scenario", () => {
    const schema: GameMetaConfigSchema = {
      snakeColor: {
        type: GameConfigFieldType.COLOR,
        label: "Snake Color",
        description: "Custom snake color",
        format: "hex",
        defaultValue: "#00FF00",
      },
      obstacleColor: {
        type: GameConfigFieldType.COLOR,
        label: "Obstacle Color",
        description: "Custom obstacle color",
        format: "hex",
        optional: true,
      },
      mapSelection: {
        type: GameConfigFieldType.STRING_LIST,
        label: "Map",
        description: "Starting map",
        items: ["forest", "desert", "ice"],
        selectedIndex: null,
      },
      difficulty: {
        type: GameConfigFieldType.STRING,
        label: "Difficulty",
        description: "Game difficulty",
        allowedValues: ["easy", "medium", "hard"],
        defaultValue: "medium",
      },
    }

    const values = {
      obstacleColor: "#FF0000",
    }

    const merged = mergeWithDefaults(schema, values)
    expect(merged.snakeColor).toBe("#00FF00")
    expect(merged.obstacleColor).toBe("#FF0000")
    expect(merged.mapSelection).toEqual({
      items: ["forest", "desert", "ice"],
      selectedIndex: null,
    })
    expect(merged.difficulty).toBe("medium")
  })

  test("should handle empty schema", () => {
    const schema: GameMetaConfigSchema = {}
    const merged = mergeWithDefaults(schema, {})
    expect(merged).toEqual({})
  })

  test("should handle schema with only STRING_LIST fields", () => {
    const schema: GameMetaConfigSchema = {
      maps: {
        type: GameConfigFieldType.STRING_LIST,
        label: "Maps",
        description: "Map selection",
        items: ["a", "b", "c"],
        selectedIndex: 0,
      },
      themes: {
        type: GameConfigFieldType.STRING_LIST,
        label: "Themes",
        description: "Theme selection",
        items: ["light", "dark"],
        selectedIndex: null,
      },
    }

    const merged = mergeWithDefaults(schema, {})
    expect(merged.maps).toEqual({
      items: ["a", "b", "c"],
      selectedIndex: 0,
    })
    expect(merged.themes).toEqual({
      items: ["light", "dark"],
      selectedIndex: null,
    })
  })

  test("should use SPRITESHEET defaults when values are not provided", () => {
    const schema: GameMetaConfigSchema = {
      sprites: {
        type: GameConfigFieldType.SPRITESHEET,
        label: "Sprites",
        description: "Game sprites",
        defaultValue: {
          img: "default.png",
          json: "default.json",
        },
      },
    }

    const merged = mergeWithDefaults(schema, {})
    expect(merged.sprites).toEqual({
      img: "default.png",
      json: "default.json",
    })
  })

  test("should preserve provided SPRITESHEET value over schema default", () => {
    const schema: GameMetaConfigSchema = {
      sprites: {
        type: GameConfigFieldType.SPRITESHEET,
        label: "Sprites",
        description: "Game sprites",
        defaultValue: {
          img: "default.png",
          json: "default.json",
        },
      },
    }

    const values = {
      sprites: {
        img: "custom.webp",
        json: "custom.json",
      },
    }

    const merged = mergeWithDefaults(schema, values)
    expect(merged.sprites).toEqual({
      img: "custom.webp",
      json: "custom.json",
    })
  })

  test("should handle mixed schema with SPRITESHEET and partial values", () => {
    const schema: GameMetaConfigSchema = {
      bgColor: {
        type: GameConfigFieldType.COLOR,
        label: "Background",
        description: "Background color",
        defaultValue: "#FFFFFF",
      },
      sprites: {
        type: GameConfigFieldType.SPRITESHEET,
        label: "Sprites",
        description: "Game sprites",
        defaultValue: {
          img: "game.png",
          json: "game.json",
        },
      },
      difficulty: {
        type: GameConfigFieldType.STRING_LIST,
        label: "Difficulty",
        description: "Game difficulty",
        items: ["easy", "medium", "hard"],
        selectedIndex: 1,
      },
    }

    const values = {
      sprites: {
        img: "custom.jpg",
        json: "custom.json",
      },
    }

    const merged = mergeWithDefaults(schema, values)
    expect(merged.bgColor).toBe("#FFFFFF")
    expect(merged.sprites).toEqual({
      img: "custom.jpg",
      json: "custom.json",
    })
    expect(merged.difficulty).toEqual({
      items: ["easy", "medium", "hard"],
      selectedIndex: 1,
    })
  })

  test("should not include SPRITESHEET fields without defaults or values", () => {
    const schema: GameMetaConfigSchema = {
      requiredSprites: {
        type: GameConfigFieldType.SPRITESHEET,
        label: "Required Sprites",
        description: "Required sprites",
      },
      optionalSprites: {
        type: GameConfigFieldType.SPRITESHEET,
        label: "Optional Sprites",
        description: "Optional sprites",
        optional: true,
      },
    }

    const merged = mergeWithDefaults(schema, {})
    expect(merged.requiredSprites).toBeUndefined()
    expect(merged.optionalSprites).toBeUndefined()
  })
})
