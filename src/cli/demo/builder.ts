import { existsSync } from "node:fs"
import * as path from "node:path"
import chalk from "chalk"
import { build } from "vite"
import { copyDirectory } from "../utils/fileUtils.js"
import { generateViteConfig } from "./config.js"
import { getTemplatePath, validateGamePath } from "./utils.js"

interface BuildOptions {
  port: string
  host: string
  open: boolean
  outDir: string
  assetsDir?: string
}

export async function buildDemo(
  gamePath: string,
  options: BuildOptions,
): Promise<void> {
  try {
    console.log(chalk.blue(`Building demo for game: ${gamePath}`))

    await validateGamePath(gamePath)

    const templatePath = getTemplatePath()
    const config = generateViteConfig(
      gamePath,
      templatePath,
      {
        port: Number.parseInt(options.port),
        host: options.host,
        open: options.open,
        outDir: options.outDir,
        ...(options.assetsDir && { assetsDir: options.assetsDir }),
      },
      "build",
    )

    await build(config)

    const outputPath = path.resolve(gamePath, options.outDir)

    if (options.assetsDir) {
      const assetsPath = path.resolve(gamePath, options.assetsDir)
      if (existsSync(assetsPath)) {
        console.log(chalk.blue("Copying game assets..."))
        const gameAssetsOutput = path.join(outputPath, "game-assets")
        await copyDirectory(assetsPath, gameAssetsOutput)
        console.log(chalk.green("✓ Game assets copied"))
      }
    }

    console.log(chalk.green(`\n✓ Demo built successfully`))
    console.log(chalk.gray(`Output directory: ${outputPath}\n`))
  } catch (error) {
    console.error(chalk.red("Error building demo:"), error)
    process.exit(1)
  }
}
