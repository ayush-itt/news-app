import { ConsoleUI } from "./utils/console-ui";
import { APP_CONSTANTS } from "./utils/config";
import { mainMenuPage } from "./pages/main-menu";

async function main(): Promise<void> {
  try {
    ConsoleUI.clear();
    ConsoleUI.title(APP_CONSTANTS.APP_NAME);
    ConsoleUI.info(APP_CONSTANTS.WELCOME_MESSAGE);
    ConsoleUI.separator();

    await mainMenuPage();
  } catch (error) {
    ConsoleUI.error("Application error: " + (error as Error).message);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGINT", () => {
  ConsoleUI.newLine();
  ConsoleUI.info("Goodbye! 👋");
  process.exit(0);
});

// Start the application
main();
