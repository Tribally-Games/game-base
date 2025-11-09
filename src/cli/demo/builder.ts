import * as path from "node:path"
import chalk from "chalk"
import { build } from "vite"
import { generateViteConfig } from "./config.js"
import { getTemplatePath, validateGamePath } from "./utils.js"

interface BuildOptions {
  port: string
  host: string
  open: boolean
  outDir: string
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
      },
      "build",
    )

    await build(config)

    const outputPath = path.resolve(gamePath, options.outDir)
    console.log(chalk.green(`\n✓ Demo built successfully`))
    console.log(chalk.gray(`Output directory: ${outputPath}\n`))
  } catch (error) {
    console.error(chalk.red("Error building demo:"), error)
    process.exit(1)
  }
}
