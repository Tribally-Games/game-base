import type { IDemoFileSystemLoader } from "./types"

/**
 * HTTP-based asset loader for browser environments using Vite dev server.
 * Loads assets via HTTP using Vite's /@fs/ prefix to access the game project root.
 * The Vite config must allow serving files from the project root (see vite.config.ts).
 */
export class DemoFileSystemLoader implements IDemoFileSystemLoader {
  private baseUrl: string

  /**
   * @param baseUrl - Base URL for asset loading (defaults to Vite's /@fs/ + absolute project root)
   * In development, Vite serves files from outside the project using /@fs/absolute/path
   */
  constructor(baseUrl?: string) {
    // In browser, we need to use the /@fs/ prefix with the absolute path
    // The game project will be at a known location during dev
    this.baseUrl = baseUrl || "/@fs/"
  }

  /**
   * Load an asset via HTTP.
   * Returns a URL that can be used with PIXI.Assets or other loaders.
   */
  async loadAsset(relativePath: string): Promise<string> {
    // Clean up the path - remove leading slashes
    const cleanPath = relativePath.replace(/^\/+/, "")

    // Construct URL using /@fs/ prefix for Vite dev server
    const url = `${this.baseUrl}${cleanPath}`

    // Verify the asset exists by attempting a HEAD request
    try {
      const response = await fetch(url, { method: "HEAD" })
      if (!response.ok) {
        throw new Error(
          `Asset not found: ${relativePath} (HTTP ${response.status})`,
        )
      }
    } catch (error) {
      throw new Error(
        `Failed to load asset: ${relativePath} - ${error instanceof Error ? error.message : String(error)}`,
      )
    }

    return url
  }

  /**
   * Read a text file via HTTP.
   * Returns the file contents as a UTF-8 string.
   */
  async readTextFile(relativePath: string): Promise<string> {
    const cleanPath = relativePath.replace(/^\/+/, "")
    const url = `${this.baseUrl}${cleanPath}`

    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(
          `File not found: ${relativePath} (HTTP ${response.status})`,
        )
      }
      return await response.text()
    } catch (error) {
      throw new Error(
        `Failed to read file: ${relativePath} - ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }
}
