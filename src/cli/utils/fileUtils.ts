import { extname } from "node:path"
import { glob } from "glob"

export interface FileGroup {
  images: string[]
  audio: string[]
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
