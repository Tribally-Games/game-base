import { copyFile, mkdir, stat, unlink } from "node:fs/promises"
import { basename, dirname, join } from "node:path"
import { execa } from "execa"
import type { FileSizeInfo } from "./fileUtils.js"

export interface ConversionResult {
  outputPath: string
  sizeInfo: FileSizeInfo
}

export async function convertToWebP(
  inputPath: string,
  outputDir: string,
  quality: number,
): Promise<ConversionResult> {
  const filename = basename(inputPath).replace(/\.(png|jpe?g)$/i, ".webp")
  const outputPath = join(outputDir, filename)

  await mkdir(dirname(outputPath), { recursive: true })

  const inputStats = await stat(inputPath)
  const inputSize = inputStats.size

  await execa("cwebp", ["-q", quality.toString(), inputPath, "-o", outputPath])

  let outputStats = await stat(outputPath)
  let outputSize = outputStats.size

  if (outputSize > inputSize) {
    const attemptedOutputSize = outputSize
    await unlink(outputPath)
    const originalFilename = basename(inputPath)
    const newOutputPath = join(outputDir, originalFilename)
    await copyFile(inputPath, newOutputPath)

    return {
      outputPath: newOutputPath,
      sizeInfo: {
        inputSize,
        outputSize: inputSize,
        savings: 0,
        savingsPercent: 0,
        keptOriginal: true,
        attemptedOutputSize,
      },
    }
  }

  const savings = inputSize - outputSize
  const savingsPercent = (savings / inputSize) * 100

  return {
    outputPath,
    sizeInfo: {
      inputSize,
      outputSize,
      savings,
      savingsPercent,
    },
  }
}

export async function convertToOpus(
  inputPath: string,
  outputDir: string,
  bitrate: number,
): Promise<ConversionResult> {
  const filename = basename(inputPath).replace(/\.wav$/i, ".opus")
  const outputPath = join(outputDir, filename)

  await mkdir(dirname(outputPath), { recursive: true })

  const inputStats = await stat(inputPath)
  const inputSize = inputStats.size

  await execa("opusenc", [
    "--bitrate",
    bitrate.toString(),
    inputPath,
    outputPath,
  ])

  let outputStats = await stat(outputPath)
  let outputSize = outputStats.size

  if (outputSize > inputSize) {
    const attemptedOutputSize = outputSize
    await unlink(outputPath)
    const originalFilename = basename(inputPath)
    const newOutputPath = join(outputDir, originalFilename)
    await copyFile(inputPath, newOutputPath)

    return {
      outputPath: newOutputPath,
      sizeInfo: {
        inputSize,
        outputSize: inputSize,
        savings: 0,
        savingsPercent: 0,
        keptOriginal: true,
        attemptedOutputSize,
      },
    }
  }

  const savings = inputSize - outputSize
  const savingsPercent = (savings / inputSize) * 100

  return {
    outputPath,
    sizeInfo: {
      inputSize,
      outputSize,
      savings,
      savingsPercent,
    },
  }
}
