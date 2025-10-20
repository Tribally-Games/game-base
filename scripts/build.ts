#!/usr/bin/env bun

import { $ } from "bun"
import {
  rmSync,
  mkdirSync,
  existsSync,
} from "node:fs"

const isWatch = process.argv.includes("--watch")

async function clean() {
  console.log("🧹 Cleaning build directories...")

  if (existsSync("dist")) {
    rmSync("dist", { recursive: true, force: true })
  }
}

async function createDirectories() {
  console.log("📁 Creating directory structure...")

  mkdirSync("dist/esm", { recursive: true })
  mkdirSync("dist/cjs", { recursive: true })
  mkdirSync("dist/types", { recursive: true })
}

async function buildTypes() {
  console.log("🏗️  Building TypeScript declarations...")

  await $`bunx tsc --emitDeclarationOnly`
}

async function buildESM() {
  console.log("📦 Building ESM version...")

  const result = await Bun.build({
    entrypoints: ["src/index.ts"],
    outdir: "dist/esm",
    format: "esm",
    target: "node",
    minify: false,
    sourcemap: "external",
  })

  if (!result.success) {
    console.error("❌ ESM build failed:")
    for (const log of result.logs) {
      console.error(log)
    }
    process.exit(1)
  }
}

async function buildCJS() {
  console.log("📦 Building CJS version...")

  const result = await Bun.build({
    entrypoints: ["src/index.ts"],
    outdir: "dist/cjs",
    format: "cjs",
    target: "node",
    minify: false,
    sourcemap: "external",
  })

  if (!result.success) {
    console.error("❌ CJS build failed:")
    for (const log of result.logs) {
      console.error(log)
    }
    process.exit(1)
  }
}

async function build() {
  console.log("🚀 Starting build process...\n")

  await clean()
  await createDirectories()

  try {
    await Promise.all([buildTypes(), buildESM(), buildCJS()])

    console.log("\n✅ Build completed successfully!")
    console.log("📁 Output:")
    console.log("  - dist/esm/     (ES modules)")
    console.log("  - dist/cjs/     (CommonJS)")
    console.log("  - dist/types/   (TypeScript declarations)")
  } catch (error) {
    console.error("\n❌ Build failed:", error)
    process.exit(1)
  }
}

async function watchBuild() {
  console.log("👀 Watching for changes...\n")

  const watcher = new Bun.FileWatcher(["src"])

  for await (const event of watcher) {
    if (event.path.endsWith(".ts")) {
      console.log(`\n🔄 File changed: ${event.path}`)
      console.log("🔄 Rebuilding...\n")

      try {
        await build()
        console.log("\n✅ Rebuild completed!")
      } catch (error) {
        console.error("\n❌ Rebuild failed:", error)
      }

      console.log("\n👀 Watching for changes...")
    }
  }
}

if (isWatch) {
  await build()
  await watchBuild()
} else {
  await build()
}
