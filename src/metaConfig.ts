export enum GameConfigFieldType {
  COLOR = "COLOR",
  STRING = "STRING",
  STRING_LIST = "STRING_LIST",
  SPRITESHEET = "SPRITESHEET",
}

export interface GameConfigFieldBase {
  type: GameConfigFieldType
  label: string
  description: string
  optional?: boolean
}

export interface ColorFieldConfig extends GameConfigFieldBase {
  type: GameConfigFieldType.COLOR
  defaultValue?: string
  allowedValues?: string[]
  format?: "hex" | "rgb" | "rgba"
}

export interface StringFieldConfig extends GameConfigFieldBase {
  type: GameConfigFieldType.STRING
  defaultValue?: string
  allowedValues?: string[]
  minLength?: number
  maxLength?: number
  pattern?: string
}

export interface StringListFieldConfig extends GameConfigFieldBase {
  type: GameConfigFieldType.STRING_LIST
  items: string[]
  selectedIndex?: number | null
}

export interface SpritesheetValue {
  img: string
  json: string
}

export interface SpritesheetFieldConfig extends GameConfigFieldBase {
  type: GameConfigFieldType.SPRITESHEET
  defaultValue?: SpritesheetValue
}

export type GameConfigFieldDefinition =
  | ColorFieldConfig
  | StringFieldConfig
  | StringListFieldConfig
  | SpritesheetFieldConfig

export type GameMetaConfigSchema = Record<string, GameConfigFieldDefinition>

export interface StringListValue {
  items: string[]
  selectedIndex: number | null
}

export type GameMetaConfigFieldValueForType<T extends GameConfigFieldType> =
  T extends GameConfigFieldType.COLOR
    ? string
    : T extends GameConfigFieldType.STRING
      ? string
      : T extends GameConfigFieldType.STRING_LIST
        ? StringListValue
        : T extends GameConfigFieldType.SPRITESHEET
          ? SpritesheetValue
          : never

export type GameMetaConfigFieldValue =
  | string
  | StringListValue
  | SpritesheetValue

export type GameMetaConfigValues = Record<string, GameMetaConfigFieldValue>

export type InferMetaConfigValues<TSchema extends GameMetaConfigSchema> = {
  [K in keyof TSchema]?: GameMetaConfigFieldValueForType<TSchema[K]["type"]>
}

export interface ValidationError {
  field: string
  message: string
}

export function validateMetaConfigValues(
  schema: GameMetaConfigSchema,
  values: GameMetaConfigValues,
): ValidationError[] {
  const errors: ValidationError[] = []

  for (const [fieldName, fieldConfig] of Object.entries(schema)) {
    const value = values[fieldName]

    if (value === undefined) {
      if (!fieldConfig.optional) {
        errors.push({
          field: fieldName,
          message: `Field '${fieldName}' is required`,
        })
      }
      continue
    }

    switch (fieldConfig.type) {
      case GameConfigFieldType.COLOR: {
        if (typeof value !== "string") {
          errors.push({
            field: fieldName,
            message: `Field '${fieldName}' must be a string`,
          })
          break
        }

        if (
          fieldConfig.allowedValues &&
          !fieldConfig.allowedValues.includes(value)
        ) {
          errors.push({
            field: fieldName,
            message: `Field '${fieldName}' must be one of: ${fieldConfig.allowedValues.join(", ")}`,
          })
        }

        if (fieldConfig.format === "hex" && !/^#[0-9A-Fa-f]{6}$/.test(value)) {
          errors.push({
            field: fieldName,
            message: `Field '${fieldName}' must be a valid hex color (e.g., #FF0000)`,
          })
        }

        break
      }

      case GameConfigFieldType.STRING: {
        if (typeof value !== "string") {
          errors.push({
            field: fieldName,
            message: `Field '${fieldName}' must be a string`,
          })
          break
        }

        if (
          fieldConfig.allowedValues &&
          !fieldConfig.allowedValues.includes(value)
        ) {
          errors.push({
            field: fieldName,
            message: `Field '${fieldName}' must be one of: ${fieldConfig.allowedValues.join(", ")}`,
          })
        }

        if (
          fieldConfig.minLength !== undefined &&
          value.length < fieldConfig.minLength
        ) {
          errors.push({
            field: fieldName,
            message: `Field '${fieldName}' must be at least ${fieldConfig.minLength} characters`,
          })
        }

        if (
          fieldConfig.maxLength !== undefined &&
          value.length > fieldConfig.maxLength
        ) {
          errors.push({
            field: fieldName,
            message: `Field '${fieldName}' must be at most ${fieldConfig.maxLength} characters`,
          })
        }

        if (
          fieldConfig.pattern &&
          !new RegExp(fieldConfig.pattern).test(value)
        ) {
          errors.push({
            field: fieldName,
            message: `Field '${fieldName}' does not match required pattern`,
          })
        }

        break
      }

      case GameConfigFieldType.STRING_LIST: {
        if (typeof value !== "object" || value === null) {
          errors.push({
            field: fieldName,
            message: `Field '${fieldName}' must be an object with items and selectedIndex`,
          })
          break
        }

        const listValue = value as StringListValue

        if (!Array.isArray(listValue.items)) {
          errors.push({
            field: fieldName,
            message: `Field '${fieldName}.items' must be an array`,
          })
          break
        }

        if (
          listValue.selectedIndex !== null &&
          (typeof listValue.selectedIndex !== "number" ||
            listValue.selectedIndex < 0 ||
            listValue.selectedIndex >= listValue.items.length)
        ) {
          errors.push({
            field: fieldName,
            message: `Field '${fieldName}.selectedIndex' must be null or a valid index (0-${listValue.items.length - 1})`,
          })
        }

        if (
          !listValue.items.every((item) => fieldConfig.items.includes(item))
        ) {
          errors.push({
            field: fieldName,
            message: `Field '${fieldName}.items' must only contain items from the schema`,
          })
        }

        break
      }

      case GameConfigFieldType.SPRITESHEET: {
        if (typeof value !== "object" || value === null) {
          errors.push({
            field: fieldName,
            message: `Field '${fieldName}' must be an object with img and json properties`,
          })
          break
        }

        const spritesheetValue = value as SpritesheetValue

        if (typeof spritesheetValue.img !== "string") {
          errors.push({
            field: fieldName,
            message: `Field '${fieldName}.img' must be a string`,
          })
        } else {
          const imgUrl = spritesheetValue.img.toLowerCase()
          const isDataUrl = imgUrl.startsWith("data:")
          const hasValidExtension =
            imgUrl.endsWith(".jpg") ||
            imgUrl.endsWith(".jpeg") ||
            imgUrl.endsWith(".png") ||
            imgUrl.endsWith(".webp")

          if (!isDataUrl && !hasValidExtension) {
            errors.push({
              field: fieldName,
              message: `Field '${fieldName}.img' must be a data URL or a URL ending with .jpg, .jpeg, .png, or .webp`,
            })
          }
        }

        if (typeof spritesheetValue.json !== "string") {
          errors.push({
            field: fieldName,
            message: `Field '${fieldName}.json' must be a string`,
          })
        } else {
          const jsonUrl = spritesheetValue.json.toLowerCase()
          const isDataUrl = jsonUrl.startsWith("data:")
          const hasValidExtension = jsonUrl.endsWith(".json")

          if (!isDataUrl && !hasValidExtension) {
            errors.push({
              field: fieldName,
              message: `Field '${fieldName}.json' must be a data URL or a URL ending with .json`,
            })
          }
        }

        break
      }
    }
  }

  return errors
}

/**
 * Merge input values with schema defaults.
 * Used when initializing meta config values with defaults from the schema
 */
export function mergeWithDefaults(
  schema: GameMetaConfigSchema,
  inputValues: GameMetaConfigValues | null | undefined,
): GameMetaConfigValues {
  const merged: GameMetaConfigValues = {}
  const values = inputValues || {}

  for (const [fieldName, fieldDef] of Object.entries(schema)) {
    if (values[fieldName] !== undefined) {
      merged[fieldName] = values[fieldName]
    } else if (fieldDef.type === GameConfigFieldType.STRING_LIST) {
      merged[fieldName] = {
        items: fieldDef.items,
        selectedIndex: fieldDef.selectedIndex ?? null,
      }
    } else if (fieldDef.defaultValue !== undefined) {
      merged[fieldName] = fieldDef.defaultValue
    }
  }

  return merged
}
