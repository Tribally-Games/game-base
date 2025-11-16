/**
 * Base asset loader for games.
 * Provides type-safe asset loading with generic asset name enums.
 */

import type { Loader } from "@hiddentao/clockwork-engine"
import { PIXI } from "@hiddentao/clockwork-engine"
import { Spritesheet } from "./Spritesheet"
import {
  type AssetLoaderHooks,
  AssetType,
  type AssetTypeMap,
  type LoadedAssetMap,
} from "./types"

/**
 * Base asset loader class that games extend.
 * Handles loading and caching of all asset types with type safety.
 */
export abstract class BaseAssetLoader<
  TSpritesheets extends string = string,
  TStaticImages extends string = string,
  TSounds extends string = string,
> {
  protected loader: Loader
  protected assetCache: Map<
    string,
    Spritesheet | PIXI.Texture | HTMLAudioElement
  > = new Map()
  protected spritesheets: Map<string, Spritesheet> = new Map()
  protected hooks: AssetLoaderHooks<this>

  constructor(
    loader: Loader,
    hooks: AssetLoaderHooks<
      BaseAssetLoader<TSpritesheets, TStaticImages, TSounds>
    > = {},
  ) {
    this.loader = loader
    this.hooks = hooks
  }

  /**
   * Get the underlying loader instance.
   */
  public getLoader(): Loader {
    return this.loader
  }

  /**
   * Games must implement this to return the list of spritesheet asset names.
   */
  protected abstract getSpritesheetsList(): readonly TSpritesheets[]

  /**
   * Games must implement this to return the list of static image asset names.
   */
  protected abstract getStaticImagesList(): readonly TStaticImages[]

  /**
   * Games must implement this to return the list of sound asset names.
   */
  protected abstract getSoundsList(): readonly TSounds[]

  /**
   * Loads an asset of the given type.
   */
  public async loadAsset<T extends AssetType>(
    type: T,
    asset: AssetTypeMap<TSpritesheets, TStaticImages, TSounds>[T],
  ): Promise<LoadedAssetMap[T]> {
    const assetName = asset as string
    const cacheKey = `${type}:${assetName}`

    if (this.assetCache.has(cacheKey)) {
      return this.assetCache.get(cacheKey) as LoadedAssetMap[T]
    }

    let loadedAsset: Spritesheet | PIXI.Texture | HTMLAudioElement

    switch (type) {
      case AssetType.SPRITESHEET: {
        loadedAsset = await this.loadSpritesheet(assetName)
        break
      }

      case AssetType.STATIC_IMAGE: {
        const url = await this.loader.fetchData(assetName)
        loadedAsset = await PIXI.Assets.load(url)
        break
      }

      case AssetType.SOUND: {
        const url = await this.loader.fetchData(assetName)
        const audio = new Audio(url)
        await new Promise<void>((resolve, reject) => {
          audio.addEventListener("canplaythrough", () => resolve(), {
            once: true,
          })
          audio.addEventListener("error", reject, { once: true })
        })
        loadedAsset = audio
        break
      }

      default:
        throw new Error(`Unsupported asset type: ${type}`)
    }

    this.assetCache.set(cacheKey, loadedAsset)
    return loadedAsset as LoadedAssetMap[T]
  }

  /**
   * Load a spritesheet using the Spritesheet class.
   */
  protected async loadSpritesheet(imageFilename: string): Promise<Spritesheet> {
    if (this.spritesheets.has(imageFilename)) {
      return this.spritesheets.get(imageFilename)!
    }

    const spritesheet = await Spritesheet.load(this.loader, imageFilename)
    this.spritesheets.set(imageFilename, spritesheet)
    return spritesheet
  }

  /**
   * Get a texture from a loaded spritesheet.
   */
  public getSpritesheetTexture(
    spritesheetName: TSpritesheets,
    textureName: string,
  ): PIXI.Texture | undefined {
    const spritesheet = this.spritesheets.get(spritesheetName as string)
    if (!spritesheet) {
      console.warn(
        `Spritesheet not found: ${spritesheetName}. Available: ${Array.from(this.spritesheets.keys()).join(", ")}`,
      )
      return undefined
    }
    const texture = spritesheet.getTexture(textureName)
    if (!texture) {
      console.warn(
        `Texture "${textureName}" not found in spritesheet "${spritesheetName}"`,
      )
    }
    return texture
  }

  /**
   * Preload all game assets at startup using parallel loading.
   */
  public async preloadAssets(
    onProgress?: (loaded: number, total: number) => void,
  ): Promise<void> {
    // Call beforePreload hook if provided
    if (this.hooks.beforePreload) {
      await this.hooks.beforePreload(this)
    }

    const spritesheetPromises = this.getSpritesheetsList().map((sprite) =>
      this.loadAsset(
        AssetType.SPRITESHEET,
        sprite as AssetTypeMap<
          TSpritesheets,
          TStaticImages,
          TSounds
        >[AssetType.SPRITESHEET],
      ).catch((err) => {
        console.warn(`Failed to load spritesheet ${sprite}:`, err)
        return null
      }),
    )

    const imagePromises = this.getStaticImagesList().map((image) =>
      this.loadAsset(
        AssetType.STATIC_IMAGE,
        image as AssetTypeMap<
          TSpritesheets,
          TStaticImages,
          TSounds
        >[AssetType.STATIC_IMAGE],
      ).catch((err) => {
        console.warn(`Failed to load image ${image}:`, err)
        return null
      }),
    )

    const soundPromises = this.getSoundsList().map((sound) =>
      this.loadAsset(
        AssetType.SOUND,
        sound as AssetTypeMap<
          TSpritesheets,
          TStaticImages,
          TSounds
        >[AssetType.SOUND],
      ).catch((err) => {
        console.warn(`Failed to load sound ${sound}:`, err)
        return null
      }),
    )

    const allPromises = [
      ...spritesheetPromises,
      ...imagePromises,
      ...soundPromises,
    ]
    const total = allPromises.length
    let loaded = 0

    const trackedPromises = allPromises.map((promise) =>
      promise.then((result) => {
        loaded++
        onProgress?.(loaded, total)
        return result
      }),
    )

    await Promise.all(trackedPromises)

    // Call afterPreload hook if provided
    if (this.hooks.afterPreload) {
      await this.hooks.afterPreload(this)
    }
  }

  /**
   * Clear all cached assets.
   */
  public clearCache(): void {
    this.assetCache.clear()
    this.spritesheets.clear()
  }
}
