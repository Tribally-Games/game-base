import { mkdir } from "node:fs/promises"
import { basename, dirname, join } from "node:path"
import { execa } from "execa"

export async function convertToWebP(
  inputPath: string,
  outputDir: string,
  quality: number,
): Promise<string> {
  const filename = basename(inputPath).replace(/\.(png|jpe?g)$/i, ".webp")
  const outputPath = join(outputDir, filename)

  await mkdir(dirname(outputPath), { recursive: true })

  await execa("cwebp", ["-q", quality.toString(), inputPath, "-o", outputPath])

  return outputPath
}

export async function convertToOpus(
  inputPath: string,
  outputDir: string,
  bitrate: number,
): Promise<string> {
  const filename = basename(inputPath).replace(/\.wav$/i, ".opus")
  const outputPath = join(outputDir, filename)

  await mkdir(dirname(outputPath), { recursive: true })

  await execa("opusenc", [
    "--bitrate",
    bitrate.toString(),
    inputPath,
    outputPath,
  ])

  return outputPath
}
