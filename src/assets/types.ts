/**
 * Generic asset type definitions for game asset loading.
 */

import type { PIXI } from "@hiddentao/clockwork-engine"
import type { Spritesheet } from "./Spritesheet"

export enum AssetType {
  SPRITESHEET = "SPRITESHEET",
  STATIC_IMAGE = "STATIC_IMAGE",
  SOUND = "SOUND",
}

/**
 * Type-safe mapping from AssetType to its corresponding enum.
 * Games specialize this by providing their specific asset name enums.
 */
export interface AssetTypeMap<
  TSpritesheets extends string = string,
  TStaticImages extends string = string,
  TSounds extends string = string,
> {
  [AssetType.SPRITESHEET]: TSpritesheets
  [AssetType.STATIC_IMAGE]: TStaticImages
  [AssetType.SOUND]: TSounds
}

/**
 * Type-safe mapping from AssetType to its loaded asset return type.
 */
export interface LoadedAssetMap {
  [AssetType.SPRITESHEET]: Spritesheet
  [AssetType.STATIC_IMAGE]: PIXI.Texture
  [AssetType.SOUND]: HTMLAudioElement
}

/**
 * Helper type to get the enum type for a given AssetType.
 */
export type AssetEnumForType<
  T extends AssetType,
  TSpritesheets extends string = string,
  TStaticImages extends string = string,
  TSounds extends string = string,
> = AssetTypeMap<TSpritesheets, TStaticImages, TSounds>[T]

/**
 * Helper type to get all possible asset values for a given AssetType.
 */
export type AssetValueForType<
  T extends AssetType,
  TSpritesheets extends string = string,
  TStaticImages extends string = string,
  TSounds extends string = string,
> = AssetTypeMap<TSpritesheets, TStaticImages, TSounds>[T]

/**
 * Helper type to get the loaded asset type for a given AssetType.
 */
export type LoadedAssetForType<T extends AssetType> = LoadedAssetMap[T]

/**
 * Optional hooks for custom asset loading behavior.
 */
export interface AssetLoaderHooks<TLoader> {
  /**
   * Called before standard preload. Can load additional custom assets.
   */
  beforePreload?: (loader: TLoader) => Promise<void>

  /**
   * Called after standard preload completes.
   */
  afterPreload?: (loader: TLoader) => Promise<void>
}
