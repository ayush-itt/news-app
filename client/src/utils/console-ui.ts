import chalk from "chalk";

export class ConsoleUI {
  static success(message: string): void {
    console.log(chalk.green("✅ " + message));
  }

  static error(message: string): void {
    console.log(chalk.red("❌ " + message));
  }

  static warning(message: string): void {
    console.log(chalk.yellow("⚠️ " + message));
  }

  static info(message: string): void {
    console.log(chalk.blue("ℹ️ " + message));
  }

  static title(message: string): void {
    console.log(chalk.bold.cyan("\n🌟 " + message));
  }

  static separator(): void {
    console.log(chalk.gray("─".repeat(50)));
  }

  static clear(): void {
    console.clear();
  }

  static newLine(): void {
    console.log();
  }
}
