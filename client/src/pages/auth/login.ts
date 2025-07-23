import inquirer from "inquirer";
import { AuthService } from "../../services/auth.service";
import { AppStateService } from "../../services/app-state.service";
import { ConsoleUI } from "../../utils/console-ui";
import { mainMenuPage } from "../main-menu";
import { userDashboard } from "../user/user-dashboard";
import { adminDashboard } from "../admin/admin-dashboard";

export async function loginPage(): Promise<void> {
  ConsoleUI.newLine();
  ConsoleUI.title("Login");

  try {
    const credentials = await inquirer.prompt([
      {
        type: "input",
        name: "email",
        message: "Email:",
        validate: (input: string) => {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(input) || "Please enter a valid email";
        },
      },
      {
        type: "password",
        name: "password",
        message: "Password:",
        mask: "*",
        validate: (input: string) => input.length > 0 || "Password is required",
      },
    ]);

    const authService = new AuthService();
    const success = await authService.login(credentials);

    if (success) {
      const appState = AppStateService.getInstance();

      // Navigate to appropriate dashboard
      if (appState.isAdmin()) {
        await adminDashboard();
      } else {
        await userDashboard();
      }
    } else {
      ConsoleUI.error("Login failed. Please try again.");

      const { retry } = await inquirer.prompt([
        {
          type: "confirm",
          name: "retry",
          message: "Would you like to try again?",
          default: true,
        },
      ]);

      if (retry) {
        await loginPage();
      } else {
        await mainMenuPage();
      }
    }
  } catch (error) {
    ConsoleUI.error("Login error: " + (error as Error).message);
    await mainMenuPage();
  }
}
