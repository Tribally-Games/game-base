import { resolve } from "node:path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@game-module": resolve(process.cwd(), "src/index.ts"),
      "@game-demo": resolve(process.cwd(), "src/demo"),
    },
  },
  define: {
    // Inject the absolute project root path for asset loading
    __GAME_PROJECT_ROOT__: JSON.stringify(process.cwd()),
  },
  server: {
    fs: {
      // Allow serving files from the game project root
      // This enables loading game assets via /@fs/ prefix
      allow: [process.cwd()],
    },
  },
})
