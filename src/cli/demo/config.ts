import * as path from "node:path"
import react from "@vitejs/plugin-react"
import type { InlineConfig } from "vite"

interface DemoOptions {
  port: number
  host: string
  open: boolean
  outDir: string
}

export function generateViteConfig(
  gamePath: string,
  templatePath: string,
  options: DemoOptions,
  mode: "development" | "build",
): InlineConfig {
  const config: InlineConfig = {
    base: "./",
    root: templatePath,
    mode: mode === "development" ? "development" : "production",

    resolve: {
      alias: {
        "@game": path.resolve(gamePath, "src"),
        "@game-module": path.resolve(gamePath, "src/index.ts"),
        "@game-demo": path.resolve(gamePath, "src/demo"),
      },
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
