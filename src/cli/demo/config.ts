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

export function generateViteConfig(
  gamePath: string,
  templatePath: string,
  options: DemoOptions,
  mode: "development" | "build",
): InlineConfig {
  const aliases: Record<string, string> = {
    "@game": path.resolve(gamePath, "src"),
    "@game-module": path.resolve(gamePath, "src/index.ts"),
    "@game-demo": path.resolve(gamePath, "src/demo"),
  }

  const assetsPath = options.assetsDir
    ? path.resolve(gamePath, options.assetsDir)
    : null

  const config: InlineConfig = {
    configFile: false,
    base: "./",
    root: templatePath,
    mode: mode === "development" ? "development" : "production",

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
                    const assetPath = path.join(
                      assetsPath,
                      req.url.slice("/game-assets/".length),
                    )
                    if (
                      fs.existsSync(assetPath) &&
                      fs.statSync(assetPath).isFile()
                    ) {
                      return res.end(fs.readFileSync(assetPath))
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
    // Copy assets to build output directory
    if (!config.build) config.build = {}
    config.build.copyPublicDir = false
  }

  return config
}
