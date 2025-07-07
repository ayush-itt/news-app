import inquirer from "inquirer";
import { ConsoleUI } from "../../utils/console-ui";
import { AppStateService } from "../../services/app-state.service";
import { AuthService } from "../../services/auth.service";
import { mainMenuPage } from "../main-menu";
import { userManagementPage } from "./users/user-management";
import { NewsSourceManagement } from "./news-sources/news-source-management";
import { CategoryManagement } from "./categories/category-management";
import { BannedKeywordManagement } from "./banned-keywords/banned-keyword-management";
import { ArticleReportManagement } from "./reports/article-report-management";
import { userReadingHistoryManagementPage } from "./reading-history/user-reading-history-management";

export async function adminDashboard(): Promise<void> {
  const appState = AppStateService.getInstance();
  const user = appState.getUser();

  let shouldContinue = true;

  while (shouldContinue) {
    ConsoleUI.newLine();
    ConsoleUI.title(`Admin Dashboard - Welcome, ${user?.username}! 🛡️`);
    ConsoleUI.info(`Date: ${new Date().toLocaleDateString()}`);
    ConsoleUI.info(`Time: ${new Date().toLocaleTimeString()}`);

    const choices = [
      { name: "👥 User Management", value: "users" },
      { name: "🌐 News Sources Management", value: "sources" },
      { name: "📂 Category Management", value: "categories" },
      { name: "🚫 Banned Keywords", value: "banned_keywords" },
      { name: "📚 Reading History Analytics", value: "reading_history" },
      { name: "🚨 Reports & Moderation", value: "reports" },
      { name: "🚪 Logout", value: "logout" },
      { name: "❌ Exit", value: "exit" },
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
        case "users":
          await userManagementPage();
          break; // Continue the loop
        case "sources":
          const newsSourceManagement = new NewsSourceManagement();
          await newsSourceManagement.show();
          break; // Continue the loop
        case "categories":
          const categoryManagement = new CategoryManagement();
          await categoryManagement.show();
          break; // Continue the loop
        case "banned_keywords":
          const bannedKeywordManagement = new BannedKeywordManagement();
          await bannedKeywordManagement.show();
          break; // Continue the loop
        case "reading_history":
          await userReadingHistoryManagementPage();
          break; // Continue the loop
        case "reports":
          const reportManagement = new ArticleReportManagement();
          await reportManagement.show();
          break; // Continue the loop
        case "logout":
          const authService = new AuthService();
          await authService.logout();
          shouldContinue = false; // Exit the loop
          return mainMenuPage(); // Go to main menu
        case "exit":
          ConsoleUI.info("Goodbye! 👋");
          process.exit(0);
        default:
          shouldContinue = false; // Exit the loop for any unexpected case
      }
    } catch (error) {
      ConsoleUI.error("Dashboard error: " + (error as Error).message);
      shouldContinue = false; // Exit the loop on error
      return mainMenuPage();
    }
  }
}

async function waitForContinue(): Promise<void> {
  await inquirer.prompt([
    {
      type: "input",
      name: "continue",
      message: "Press Enter to return to menu...",
    },
  ]);
  ConsoleUI.newLine();
}
