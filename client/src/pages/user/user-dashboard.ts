import inquirer from "inquirer";
import { ConsoleUI } from "../../utils/console-ui";
import { AppStateService } from "../../services/app-state.service";
import { AuthService } from "../../services/auth.service";
import { mainMenuPage } from "../main-menu";
import { NotificationManagement } from "./notifications/notification-management";
import { userReadingHistoryPage } from "./reading-history/user-reading-history";
import { articleBrowsingPage } from "./articles/article-browsing";
import { bookmarkManagementPage } from "./bookmarks/bookmark-management";
import { reactionManagementPage } from "./reactions/reaction-management";
import { userPreferenceManagementPage } from "./preferences/user-preference-management";
import { keywordManagementPage } from "./keywords/keyword-management";
import { ArticleReportManagement } from "./reports/article-report-management";
import { CategoryBrowsingManagement } from "./categories/category-browsing-management";
import { UserProfileManagement } from "./profile/user-profile-management";

export async function userDashboard(): Promise<void> {
  const appState = AppStateService.getInstance();
  const user = appState.getUser();

  let shouldContinue = true;

  while (shouldContinue) {
    ConsoleUI.newLine();
    ConsoleUI.title(`Welcome, ${user?.username}! 👤`);
    ConsoleUI.info(`Date: ${new Date().toLocaleDateString()}`);
    ConsoleUI.info(`Time: ${new Date().toLocaleTimeString()}`);
    ConsoleUI.separator();

    const choices = [
      { name: "📰 Browse Articles", value: "articles" },
      { name: "🔖 Saved Articles", value: "saved" },
      { name: "👍 My Reactions", value: "reactions" },
      { name: "🚨 Report Articles", value: "reports" },
      { name: "📂 Browse Categories", value: "categories" },
      { name: "👤 My Profile", value: "profile" },
      { name: "🔔 Notifications", value: "notifications" },
      { name: "📚 Reading History", value: "history" },
      { name: "⚙️ Preferences", value: "preferences" },
      { name: "🔑 Manage Keywords", value: "keywords" },
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
        case "articles":
          await articleBrowsingPage();
          break; // Continue the loop
        case "saved":
          await bookmarkManagementPage();
          break; // Continue the loop
        case "reactions":
          await reactionManagementPage();
          break; // Continue the loop
        case "reports":
          const articleReportManagement = new ArticleReportManagement();
          await articleReportManagement.displayInterface();
          break; // Continue the loop
        case "categories":
          const categoryBrowsingManagement = new CategoryBrowsingManagement();
          await categoryBrowsingManagement.displayInterface();
          break; // Continue the loop
        case "profile":
          const userProfileManagement = new UserProfileManagement();
          await userProfileManagement.displayInterface();
          break; // Continue the loop
        case "notifications":
          const notificationManagement = new NotificationManagement();
          await notificationManagement.show();
          break; // Continue the loop
        case "preferences":
          await userPreferenceManagementPage();
          break; // Continue the loop
        case "history":
          await userReadingHistoryPage();
          break; // Continue the loop
        case "keywords":
          await keywordManagementPage();
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
