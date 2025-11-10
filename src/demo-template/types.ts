/**
 * Interface for loading assets from the filesystem in Node.js environments.
 * Games can use this to load assets during testing or server-side execution.
 */
export interface IDemoFileSystemLoader {
  /**
   * Load an asset from the filesystem.
   * For binary assets (images, audio), returns an absolute file path or file:// URL
   * that can be used with PIXI.Assets or similar loaders in Node.js environments.
   *
   * @param relativePath - Path relative to the game project root (current working directory)
   * @returns A file path or URL that can be used to load the asset
   * @throws Error if the file does not exist or cannot be read
   */
  loadAsset(relativePath: string): Promise<string>

  /**
   * Read a text file from the filesystem.
   * Useful for loading JSON configuration files or other text-based assets.
   *
   * @param relativePath - Path relative to the game project root (current working directory)
   * @returns The file contents as a UTF-8 string
   * @throws Error if the file does not exist or cannot be read
   */
  readTextFile(relativePath: string): Promise<string>
}

/**
 * Type definition for the GameModuleContext
 */
export interface GameModuleContextType {
  module: any
  DemoLoader: any
  fileSystemLoader: IDemoFileSystemLoader
}
