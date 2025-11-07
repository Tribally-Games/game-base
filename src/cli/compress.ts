import { mkdir } from "node:fs/promises"
import chalk from "chalk"
import { checkCommands } from "./utils/commandCheck.js"
import { convertToOpus, convertToWebP } from "./utils/converters.js"
import { findFiles, groupFilesByType } from "./utils/fileUtils.js"

export interface CompressOptions {
  output: string
  webpQuality: string
  opusBitrate: string
}

export async function compress(
  pattern: string,
  options: CompressOptions,
): Promise<void> {
  await checkCommands()

  await mkdir(options.output, { recursive: true })

  console.log(chalk.blue("Finding files..."))
  const files = await findFiles(pattern)

  if (files.length === 0) {
    console.log(chalk.yellow("No files found matching pattern"))
    return
  }

  const { images, audio } = groupFilesByType(files)

  console.log(
    chalk.gray(
      `Found ${images.length} image(s) and ${audio.length} audio file(s)`,
    ),
  )
  console.log()

  const webpQuality = Number.parseInt(options.webpQuality, 10)
  const opusBitrate = Number.parseInt(options.opusBitrate, 10)

  let successCount = 0
  let errorCount = 0

  for (const imagePath of images) {
    try {
      const outputPath = await convertToWebP(
        imagePath,
        options.output,
        webpQuality,
      )
      console.log(chalk.green("✓"), chalk.gray(outputPath))
      successCount++
    } catch (error) {
      console.error(
        chalk.red("✗"),
        chalk.gray(imagePath),
        chalk.red(error instanceof Error ? error.message : String(error)),
      )
      errorCount++
    }
  }

  for (const audioPath of audio) {
    try {
      const outputPath = await convertToOpus(
        audioPath,
        options.output,
        opusBitrate,
      )
      console.log(chalk.green("✓"), chalk.gray(outputPath))
      successCount++
    } catch (error) {
      console.error(
        chalk.red("✗"),
        chalk.gray(audioPath),
        chalk.red(error instanceof Error ? error.message : String(error)),
      )
      errorCount++
    }
  }

  console.log()
  console.log(chalk.green(`${successCount} file(s) converted successfully`))

  if (errorCount > 0) {
    console.log(chalk.red(`${errorCount} file(s) failed`))
    process.exit(1)
  }
}
