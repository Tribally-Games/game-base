import { Loader } from "@hiddentao/clockwork-engine"

/**
 * Demo loader implementation for development and testing environments.
 *
 * Loads game assets from the `/game-assets/` path served by the demo dev server.
 * Handles both text-based assets (JSON, JavaScript) and binary assets (images, audio).
 *
 * Binary assets are converted to Data URLs for in-memory usage, while text assets
 * are returned as strings.
 *
 * @example
 * ```typescript
 * const loader = new DemoLoader()
 * const spriteData = await loader.fetchData('sprites/player.json')
 * const imageUrl = await loader.fetchData('images/player.png')
 * ```
 *
 * Note: For production environments, implement a custom Loader that loads assets
 * from your CDN or bundled assets.
 */
export class DemoLoader extends Loader {
  /**
   * Fetches asset data by ID.
   *
   * If the ID is already a full URL (http://, https://, or data:), uses it directly.
   * Otherwise, prefixes with `/game-assets/` to load from the demo server.
   *
   * @param id - Asset identifier or full URL
   * @returns Promise resolving to asset data as string or Data URL
   */
  async fetchData(id: string): Promise<string> {
    let url = id
    if (
      !id.startsWith("http://") &&
      !id.startsWith("https://") &&
      !id.startsWith("data:")
    ) {
      url = `/game-assets/${id}`
    }

    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(
          `Failed to fetch ${url}: ${response.status} ${response.statusText}`,
        )
      }

      const contentType = response.headers.get("content-type") || ""

      if (contentType.includes("json") || contentType.includes("text")) {
        return await response.text()
      }

      const blob = await response.blob()
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })
    } catch (error) {
      throw new Error(
        `DemoLoader failed to load asset "${id}": ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }
}
