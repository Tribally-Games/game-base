#!/usr/bin/env node

import { Command } from "commander"
import pkg from "../../package.json"
import { compress } from "./compress.js"

const program = new Command()

program
  .name("game-base")
  .description("CLI for Tribally arcade games base utilities")
  .version(pkg.version)

program
  .command("version")
  .description("Display version information")
  .action(() => {
    console.log(pkg.version)
  })

program
  .command("compress")
  .description("Compress image and audio files")
  .argument("<pattern>", "Glob pattern to match files")
  .requiredOption("-o, --output <dir>", "Output directory")
  .option("--webp-quality <number>", "WebP quality (0-100)", "25")
  .option("--opus-bitrate <number>", "Opus bitrate in kbps", "24")
  .action(compress)

program.parse()
