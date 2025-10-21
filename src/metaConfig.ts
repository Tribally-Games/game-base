export enum GameConfigFieldType {
  COLOR = "COLOR",
  STRING = "STRING",
  STRING_LIST = "STRING_LIST",
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
  defaultIndex?: number | null
}

export type GameConfigFieldDefinition =
  | ColorFieldConfig
  | StringFieldConfig
  | StringListFieldConfig

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
        : never

export type GameMetaConfigFieldValue = string | StringListValue

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
    }
  }

  return errors
}
