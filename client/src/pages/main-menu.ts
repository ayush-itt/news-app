import inquirer from "inquirer";
import { ConsoleUI } from "../utils/console-ui";
import { AppStateService } from "../services/app-state.service";
import { loginPage } from "./auth/login";
import { registerPage } from "./auth/register";
import { userDashboard } from "./user/user-dashboard";
import { adminDashboard } from "./admin/admin-dashboard";

export async function mainMenuPage(): Promise<void> {
  const appState = AppStateService.getInstance();

  // If already authenticated, go to appropriate dashboard
  if (appState.isAuthenticated()) {
    if (appState.isAdmin()) {
      return adminDashboard();
    } else {
      return userDashboard();
    }
  }

  ConsoleUI.newLine();
  ConsoleUI.title("Main Menu");

  const choices = [
    { name: "🔐 Login", value: "login" },
    { name: "📝 Register", value: "register" },
    { name: "🚪 Exit", value: "exit" },
  ];

  try {
    const { action } = await inquirer.prompt([
      {
        type: "list",
        name: "action",
        message: "What would you like to do?",
        choices,
      },
    ]);

    switch (action) {
      case "login":
        await loginPage();
        break;
      case "register":
        await registerPage();
        break;
      case "exit":
        ConsoleUI.info("Goodbye! 👋");
        process.exit(0);
        break;
    }
  } catch (error) {
    if (error && typeof error === "object" && "isTtyError" in error) {
      ConsoleUI.error("This application requires an interactive terminal");
    } else {
      ConsoleUI.error("An error occurred: " + (error as Error).message);
    }
    process.exit(1);
  }
}
