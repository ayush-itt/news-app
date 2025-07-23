import inquirer from "inquirer";
import { AuthService } from "../../services/auth.service";
import { ConsoleUI } from "../../utils/console-ui";
import { mainMenuPage } from "../main-menu";

interface RegisterData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export async function registerPage(): Promise<void> {
  ConsoleUI.newLine();
  ConsoleUI.title("Register New Account");

  try {
    const userData = (await inquirer.prompt([
      {
        type: "input",
        name: "username",
        message: "Username:",
        validate: (input: string) => {
          if (input.length < 3) return "Username must be at least 3 characters";
          if (!/^[a-zA-Z0-9_]+$/.test(input))
            return "Username can only contain letters, numbers, and underscores";
          return true;
        },
      },
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
        validate: (input: string) => {
          if (input.length < 6) return "Password must be at least 6 characters";
          return true;
        },
      },
      {
        type: "password",
        name: "confirmPassword",
        message: "Confirm Password:",
        mask: "*",
        validate: (input: string, answers: any) => {
          return input === answers.password || "Passwords do not match";
        },
      },
    ])) as RegisterData;

    const authService = new AuthService();
    const success = await authService.register({
      username: userData.username,
      email: userData.email,
      password: userData.password,
    });

    if (success) {
      const { loginNow } = await inquirer.prompt([
        {
          type: "confirm",
          name: "loginNow",
          message: "Would you like to login now?",
          default: true,
        },
      ]);

      if (loginNow) {
        const { loginPage } = await import("./login");
        await loginPage();
      } else {
        await mainMenuPage();
      }
    } else {
      ConsoleUI.error("Registration failed. Please try again.");

      const { retry } = await inquirer.prompt([
        {
          type: "confirm",
          name: "retry",
          message: "Would you like to try again?",
          default: true,
        },
      ]);

      if (retry) {
        await registerPage();
      } else {
        await mainMenuPage();
      }
    }
  } catch (error) {
    ConsoleUI.error("Registration error: " + (error as Error).message);
    await mainMenuPage();
  }
}
