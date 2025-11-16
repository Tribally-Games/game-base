import type { Loader } from "@hiddentao/clockwork-engine"
import { PIXI } from "@hiddentao/clockwork-engine"

interface SpriteFrameData {
  filename: string
  frame: { x: number; y: number; w: number; h: number }
}

interface SpritesheetData {
  frames: SpriteFrameData[] | Record<string, any>
  meta: {
    image: string
  }
}

/**
 * Represents a loaded spritesheet with its textures and metadata.
 */
export class Spritesheet {
  private textures: Record<string, PIXI.Texture> = {}
  private spritesheet: PIXI.Spritesheet

  private constructor(
    spritesheet: PIXI.Spritesheet,
    textures: Record<string, PIXI.Texture>,
  ) {
    this.spritesheet = spritesheet
    this.textures = textures
  }

  /**
   * Load a spritesheet using the Loader pattern.
   *
   * @param loader - The Loader instance to use for fetching data
   * @param imageFilename - Full image filename (e.g., "coin-spritesheet.webp", "bomb-spritesheet.png") or URL
   * @param jsonFilename - Optional JSON filename or URL. If not provided, derives from imageFilename
   * @returns Promise resolving to a Spritesheet instance
   */
  static async load(
    loader: Loader,
    imageFilename: string,
    jsonFilename?: string,
  ): Promise<Spritesheet> {
    // Use provided JSON filename or derive from image filename
    const jsonFile =
      jsonFilename || imageFilename.replace(/\.(png|webp|jpg|jpeg)$/, ".json")

    // Load JSON data via loader
    const jsonData = await loader.fetchData(jsonFile)
    const data: SpritesheetData = JSON.parse(jsonData)

    // Load the image via loader
    const imageUrl = await loader.fetchData(imageFilename)
    const texture = await PIXI.Assets.load(imageUrl)
    const baseTexture = texture.baseTexture

    // Convert array-based frames to object-based format for PIXI
    const pixiData: any = {
      ...data,
      frames: {},
    }

    // Convert frames array to object keyed by filename
    if (Array.isArray(data.frames)) {
      data.frames.forEach((frame) => {
        pixiData.frames[frame.filename] = {
          frame: frame.frame,
          rotated: false,
          trimmed: false,
          spriteSourceSize: frame.frame,
          sourceSize: { w: frame.frame.w, h: frame.frame.h },
        }
      })
    } else {
      pixiData.frames = data.frames
    }

    // Create spritesheet
    const spritesheet = new PIXI.Spritesheet(baseTexture, pixiData)
    await spritesheet.parse()

    // Store textures with their original frame names
    const textures: Record<string, PIXI.Texture> = { ...spritesheet.textures }

    return new Spritesheet(spritesheet, textures)
  }

  /**
   * Get a texture by frame name.
   *
   * @param name - Frame name (e.g., "idle-000")
   * @returns The texture if found, undefined otherwise
   */
  getTexture(name: string): PIXI.Texture | undefined {
    const texture = this.textures[name]

    if (!texture) {
      console.warn(
        `Texture "${name}" not found. Available textures: ${Object.keys(this.textures).slice(0, 5).join(", ")}...`,
      )
    }

    return texture
  }

  /**
   * Get all textures for this spritesheet.
   */
  getAllTextures(): Record<string, PIXI.Texture> {
    return { ...this.textures }
  }

  /**
   * Get the underlying PIXI.Spritesheet instance.
   */
  getSpritesheet(): PIXI.Spritesheet {
    return this.spritesheet
  }
}
