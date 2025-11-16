import * as fs from "node:fs"
import * as path from "node:path"

export async function validateGamePath(gamePath: string): Promise<void> {
  const resolvedPath = path.resolve(gamePath)

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Game path does not exist: ${resolvedPath}`)
  }

  if (!fs.statSync(resolvedPath).isDirectory()) {
    throw new Error(`Game path is not a directory: ${resolvedPath}`)
  }

  const packageJsonPath = path.join(resolvedPath, "package.json")
  if (!fs.existsSync(packageJsonPath)) {
    throw new Error(`No package.json found in game directory: ${resolvedPath}`)
  }

  const srcIndexPath = path.join(resolvedPath, "src", "index.ts")
  if (!fs.existsSync(srcIndexPath)) {
    throw new Error(`No src/index.ts found in game directory: ${resolvedPath}`)
  }
}

export function getTemplatePath(): string {
  // Resolve from this file's location to find the package root
  // When built: bin/game-base.js -> need to find src/demo-template/
  // Start from the bin directory and go up to package root
  let currentDir = path.dirname(new URL(import.meta.url).pathname)

  // Walk up to find package.json (package root)
  while (currentDir !== path.dirname(currentDir)) {
    const packageJsonPath = path.join(currentDir, "package.json")
    if (fs.existsSync(packageJsonPath)) {
      // Found package root
      return path.join(currentDir, "src", "demo-template")
    }
    currentDir = path.dirname(currentDir)
  }

  throw new Error("Could not find game-base package root")
}
