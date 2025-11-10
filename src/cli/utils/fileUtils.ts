import { extname } from "node:path"
import { glob } from "glob"

export interface FileGroup {
  images: string[]
  audio: string[]
}

export interface FileSizeInfo {
  inputSize: number
  outputSize: number
  savings: number
  savingsPercent: number
  keptOriginal?: boolean
  attemptedOutputSize?: number
}

export async function findFiles(pattern: string): Promise<string[]> {
  const files = await glob(pattern, {
    absolute: true,
    nodir: true,
  })

  return files
}

export function groupFilesByType(files: string[]): FileGroup {
  const images: string[] = []
  const audio: string[] = []

  for (const file of files) {
    const ext = extname(file).toLowerCase()

    if (ext === ".png" || ext === ".jpg" || ext === ".jpeg") {
      images.push(file)
    } else if (ext === ".wav") {
      audio.push(file)
    }
  }

  return { images, audio }
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export function formatSavings(sizeInfo: FileSizeInfo): string {
  const {
    inputSize,
    outputSize,
    savingsPercent,
    keptOriginal,
    attemptedOutputSize,
  } = sizeInfo

  if (keptOriginal && attemptedOutputSize !== undefined) {
    const attemptedSavings = inputSize - attemptedOutputSize
    const attemptedPercent = (attemptedSavings / inputSize) * 100
    return `${formatFileSize(inputSize)} → ${formatFileSize(attemptedOutputSize)} (${attemptedPercent.toFixed(1)}% saved, keeping original)`
  }

  return `${formatFileSize(inputSize)} → ${formatFileSize(outputSize)} (${savingsPercent.toFixed(1)}% saved)`
}
