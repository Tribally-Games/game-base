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

  if (options.assetsDir) {
    const assetsPath = path.resolve(gamePath, options.assetsDir)
    if (fs.existsSync(assetsPath)) {
      const files = fs.readdirSync(assetsPath, {
        recursive: true,
        withFileTypes: true,
      })
      for (const file of files) {
        if (file.isFile()) {
          const relativePath = path.relative(
            assetsPath,
            file.parentPath ? path.join(file.parentPath, file.name) : file.name,
          )
          const aliasName = `@assets/${relativePath}`
          aliases[aliasName] = path.join(assetsPath, relativePath)
        }
      }
    }
  }

  const config: InlineConfig = {
    base: "./",
    root: templatePath,
    mode: mode === "development" ? "development" : "production",

    resolve: {
      alias: aliases,
      dedupe: ["react", "react-dom"],
    },

    plugins: [react()],

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
  }

  return config
}
