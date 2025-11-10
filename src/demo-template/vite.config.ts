import { resolve } from "node:path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@game": resolve(process.cwd(), "src"),
      "@game-module": resolve(process.cwd(), "src/index.ts"),
      "@game-demo": resolve(process.cwd(), "src/demo"),
    },
  },
})
