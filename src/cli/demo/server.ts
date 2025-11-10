import chalk from "chalk"
import { createServer } from "vite"
import { generateViteConfig } from "./config.js"
import { getTemplatePath, validateGamePath } from "./utils.js"

interface ServerOptions {
  port: string
  host: string
  open: boolean
  outDir: string
  assetsDir?: string
}

export async function startDevServer(
  gamePath: string,
  options: ServerOptions,
): Promise<void> {
  try {
    console.log(chalk.blue("Starting demo dev server..."))

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
      "development",
    )

    const server = await createServer(config)
    await server.listen()

    server.printUrls()

    console.log(chalk.green(`\nDemo server running for game: ${gamePath}`))
    console.log(chalk.gray("Press Ctrl+C to stop\n"))
  } catch (error) {
    console.error(chalk.red("Error starting dev server:"), error)
    process.exit(1)
  }
}
