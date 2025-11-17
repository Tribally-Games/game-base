export class DemoLoader {
  private assets: Map<string, string> = new Map()

  async load() {
    const assetPaths = [
      "/game-assets/test.png",
      "/game-assets/test.wav",
    ]

    for (const path of assetPaths) {
      try {
        const response = await fetch(path)
        if (response.ok) {
          const text = await response.text()
          this.assets.set(path, text)
        }
      } catch (error) {
        console.warn(`Failed to load asset: ${path}`, error)
      }
    }
  }

  getAsset(path: string): string | undefined {
    return this.assets.get(path)
  }
}
