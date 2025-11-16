import * as fs from "node:fs"
import * as path from "node:path"
import react from "@vitejs/plugin-react"
import type { InlineConfig } from "vite"

interface DemoOptions {
  port: number
  host: string
  open: boolean
  outDir: string
  assetsDir?: string
}

function getMimeType(ext: string): string | null {
  const mimeTypes: Record<string, string> = {
    // Images
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",

    // Audio
    ".mp3": "audio/mpeg",
    ".wav": "audio/wav",
    ".ogg": "audio/ogg",
    ".opus": "audio/opus",
    ".m4a": "audio/mp4",

    // Text/Data
    ".json": "application/json",
    ".js": "text/javascript",
    ".mjs": "text/javascript",
    ".txt": "text/plain",
    ".xml": "application/xml",

    // Fonts
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".ttf": "font/ttf",
    ".otf": "font/otf",
  }

  return mimeTypes[ext] || null
}

export function generateViteConfig(
  gamePath: string,
  templatePath: string,
  options: DemoOptions,
  mode: "development" | "build",
): InlineConfig {
  const gameDemoPath = path.resolve(gamePath, "src/demo")
  const hasGameDemo = fs.existsSync(gameDemoPath)

  const aliases: Record<string, string> = {
    "@game": path.resolve(gamePath, "src"),
    "@game-module": path.resolve(gamePath, "src/index.ts"),
  }

  if (hasGameDemo) {
    aliases["@game-demo"] = gameDemoPath
  }

  const assetsPath = options.assetsDir
    ? path.resolve(gamePath, options.assetsDir)
    : null

  const config: InlineConfig = {
    configFile: false,
    base: "./",
    root: templatePath,
    mode: mode === "development" ? "development" : "production",

    define: {
      __HAS_GAME_DEMO__: JSON.stringify(hasGameDemo),
    },

    resolve: {
      alias: aliases,
      dedupe: ["react", "react-dom"],
    },

    plugins: [
      react(),
      // Serve game assets at /game-assets/ URL path
      ...(assetsPath && fs.existsSync(assetsPath)
        ? [
            {
              name: "serve-game-assets",
              configureServer(server: any) {
                server.middlewares.use((req: any, res: any, next: any) => {
                  if (req.url?.startsWith("/game-assets/")) {
                    // Remove query parameters from URL
                    const urlPath = req.url.split("?")[0]
                    const assetPath = path.join(
                      assetsPath,
                      urlPath.slice("/game-assets/".length),
                    )
                    if (
                      fs.existsSync(assetPath) &&
                      fs.statSync(assetPath).isFile()
                    ) {
                      const stats = fs.statSync(assetPath)
                      const fileContent = fs.readFileSync(assetPath)
                      const ext = path.extname(assetPath).toLowerCase()
                      const mimeType = getMimeType(ext)

                      if (mimeType) {
                        res.setHeader("Content-Type", mimeType)
                      }
                      res.setHeader("Content-Length", stats.size.toString())
                      res.setHeader(
                        "Cache-Control",
                        "no-cache, no-store, must-revalidate",
                      )
                      res.setHeader("Pragma", "no-cache")
                      res.setHeader("Expires", "0")

                      return res.end(fileContent)
                    }
                  }
                  next()
                })
              },
            },
          ]
        : []),
    ],

    optimizeDeps: {
      include: ["react", "react-dom", "react-toastify", "react/jsx-runtime"],
    },

    build: {
      outDir: path.resolve(gamePath, options.outDir),
      emptyOutDir: true,
      rollupOptions: {
        input: path.resolve(templatePath, "index.html"),
      },
      sourcemap: true,
    },
  }

  if (mode === "development") {
    config.server = {
      port: options.port,
      host: options.host,
      open: options.open,
    }

    // Serve assets directory at /game-assets/ URL path
    if (assetsPath && fs.existsSync(assetsPath)) {
      config.server.fs = {
        strict: false,
        allow: [templatePath, gamePath, assetsPath],
      }
    }
  }

  if (mode === "build" && assetsPath && fs.existsSync(assetsPath)) {
    // Assets are copied to game-assets/ subdirectory by builder.ts
    if (!config.build) config.build = {}
    config.build.copyPublicDir = false
  }

  return config
}
