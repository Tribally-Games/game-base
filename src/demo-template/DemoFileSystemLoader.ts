import { existsSync } from "node:fs"
import { readFile } from "node:fs/promises"
import { resolve } from "node:path"
import type { IDemoFileSystemLoader } from "./types"

/**
 * Filesystem-based asset loader for Node.js environments.
 * Loads assets from the filesystem relative to the current working directory.
 * Designed to be passed to game DemoLoader instances for testing and server-side execution.
 */
export class DemoFileSystemLoader implements IDemoFileSystemLoader {
  private baseDir: string

  /**
   * @param baseDir - Base directory for asset loading (defaults to current working directory)
   */
  constructor(baseDir: string = process.cwd()) {
    this.baseDir = baseDir
  }

  /**
   * Load an asset from the filesystem.
   * Returns an absolute file path that can be used with PIXI.Assets or other loaders in Node.js.
   */
  async loadAsset(relativePath: string): Promise<string> {
    const absolutePath = resolve(this.baseDir, relativePath)

    if (!existsSync(absolutePath)) {
      throw new Error(
        `Asset not found: ${relativePath} (resolved to ${absolutePath})`,
      )
    }

    return absolutePath
  }

  /**
   * Read a text file from the filesystem.
   * Returns the file contents as a UTF-8 string.
   */
  async readTextFile(relativePath: string): Promise<string> {
    const absolutePath = resolve(this.baseDir, relativePath)

    if (!existsSync(absolutePath)) {
      throw new Error(
        `File not found: ${relativePath} (resolved to ${absolutePath})`,
      )
    }

    try {
      const content = await readFile(absolutePath, "utf-8")
      return content
    } catch (error) {
      throw new Error(
        `Failed to read file: ${relativePath} - ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }
}
