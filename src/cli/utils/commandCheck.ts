import chalk from "chalk"
import commandExists from "command-exists"

export async function checkCommands(): Promise<void> {
  const cwebpExists = await checkCommand("cwebp")
  const opusencExists = await checkCommand("opusenc")

  if (!cwebpExists || !opusencExists) {
    process.exit(1)
  }
}

async function checkCommand(command: string): Promise<boolean> {
  try {
    await commandExists(command)
    return true
  } catch {
    console.error(chalk.red(`✗ ${command} not found`))

    if (command === "cwebp") {
      console.error(chalk.yellow("\nTo install cwebp:"))
      console.error(chalk.gray("  macOS:   brew install webp"))
      console.error(chalk.gray("  Ubuntu:  sudo apt-get install webp"))
      console.error(
        chalk.gray(
          "  More:    https://web.dev/articles/codelab-serve-images-webp",
        ),
      )
    } else if (command === "opusenc") {
      console.error(chalk.yellow("\nTo install opusenc:"))
      console.error(chalk.gray("  macOS:   brew install opus-tools"))
      console.error(chalk.gray("  Ubuntu:  sudo apt-get install opus-tools"))
      console.error(
        chalk.gray("  More:    https://formulae.brew.sh/formula/opus-tools"),
      )
    }
    console.error()

    return false
  }
}
