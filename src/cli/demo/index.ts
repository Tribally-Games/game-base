import type { Command } from "commander"
import { buildDemo } from "./builder.js"
import { startDevServer } from "./server.js"

export function registerDemoCommand(program: Command): void {
  program
    .command("demo [path]")
    .description("Run or build demo for a game")
    .option("--mode <mode>", "Mode: dev or build", "dev")
    .option("--port <number>", "Dev server port", "5173")
    .option("--host <string>", "Dev server host", "localhost")
    .option("--out-dir <path>", "Build output directory", "dist-demo")
    .option("--open", "Open browser automatically", false)
    .action(async (path, options) => {
      const gamePath = path || process.cwd()

      if (options.mode === "build") {
        await buildDemo(gamePath, options)
      } else {
        await startDevServer(gamePath, options)
      }
    })
}
