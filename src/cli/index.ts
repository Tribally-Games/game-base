#!/usr/bin/env node

import { Command } from "commander"
import pkg from "../../package.json"

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

program.parse()
