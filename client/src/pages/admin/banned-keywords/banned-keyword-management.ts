import inquirer from "inquirer";
import { ConsoleUI } from "../../../utils/console-ui";
import { ApiService } from "../../../services/api.service";
import { BannedKeywordService } from "../../../services/admin";
import {
  CreateBannedKeywordDto,
  GetBannedKeywordsQueryDto,
  BannedKeyword,
} from "../../../interfaces";

export class BannedKeywordManagement {
  private bannedKeywordService: BannedKeywordService;

  constructor() {
    const apiService = ApiService.getInstance();
    this.bannedKeywordService = new BannedKeywordService(apiService);
  }

  async show(): Promise<void> {
    try {
      while (true) {
        const choice = await this.showMenu();

        switch (choice) {
          case "view_all":
            await this.viewAllBannedKeywords();
            break;
          case "view_active":
            await this.viewActiveBannedKeywords();
            break;
          case "search":
            await this.searchBannedKeywords();
            break;
          case "create":
            await this.createBannedKeyword();
            break;
          case "back":
            return;
        }

        // Wait for user input before showing menu again
        await inquirer.prompt([
          {
            type: "input",
            name: "continue",
            message: "Press Enter to continue...",
          },
        ]);
      }
    } catch (error) {
      ConsoleUI.error(
        `Error in banned keywords management: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  private async showMenu(): Promise<string> {
    const { choice } = await inquirer.prompt([
      {
        type: "list",
        name: "choice",
        message: "Banned Keywords Management:",
        choices: [
          { name: "📋 View All Banned Keywords", value: "view_all" },
          { name: "🟢 View Active Keywords Only", value: "view_active" },
          { name: "🔍 Search Keywords", value: "search" },
          { name: "➕ Add New Banned Keyword", value: "create" },
          { name: "← Back to Admin Dashboard", value: "back" },
        ],
      },
    ]);
    return choice;
  }

  private async viewAllBannedKeywords(): Promise<void> {
    try {
      ConsoleUI.info("Loading all banned keywords...");
      const response = await this.bannedKeywordService.getBannedKeywords({
        limit: 50,
      });

      this.displayBannedKeywords(response, "All Banned Keywords");
    } catch (error) {
      ConsoleUI.error(
        `Failed to load banned keywords: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  private async viewActiveBannedKeywords(): Promise<void> {
    try {
      ConsoleUI.info("Loading active banned keywords...");
      const response = await this.bannedKeywordService.getBannedKeywords({
        isActive: true,
        limit: 50,
      });

      this.displayBannedKeywords(response, "Active Banned Keywords");
    } catch (error) {
      ConsoleUI.error(
        `Failed to load active banned keywords: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  private async searchBannedKeywords(): Promise<void> {
    try {
      const { searchTerm } = await inquirer.prompt([
        {
          type: "input",
          name: "searchTerm",
          message: "Enter search term:",
          validate: (input) => {
            if (!input.trim()) {
              return "Search term is required";
            }
            return true;
          },
        },
      ]);

      ConsoleUI.info(`Searching for keywords containing "${searchTerm}"...`);
      const response = await this.bannedKeywordService.getBannedKeywords({
        search: searchTerm.trim(),
        limit: 50,
      });

      this.displayBannedKeywords(
        response,
        `Search Results for "${searchTerm}"`
      );
    } catch (error) {
      ConsoleUI.error(
        `Failed to search banned keywords: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  private displayBannedKeywords(response: any, title: string): void {
    const keywords = response.keywords || response;

    if (keywords.length === 0) {
      ConsoleUI.warning("No banned keywords found.");
      return;
    }

    ConsoleUI.title(title);

    keywords.forEach((keyword: BannedKeyword, index: number) => {
      const status = keyword.isActive ? "🟢 Active" : "🔴 Inactive";
      const caseSensitive = keyword.isCaseSensitive
        ? "📝 Case Sensitive"
        : "📝 Case Insensitive";
      const isRegex = keyword.isRegex ? "🔧 Regex" : "📝 Plain Text";

      ConsoleUI.info(`\n${index + 1}. ${keyword.keyword}`);
      console.log(`   ID: ${keyword.id}`);
      console.log(`   Description: ${keyword.description || "No description"}`);
      console.log(`   Status: ${status}`);
      console.log(`   Type: ${isRegex}`);
      console.log(`   Case: ${caseSensitive}`);
      console.log(
        `   Created: ${new Date(keyword.createdAt).toLocaleString()}`
      );
      console.log(
        `   Updated: ${new Date(keyword.updatedAt).toLocaleString()}`
      );
    });

    if (response.total !== undefined) {
      const activeCount = keywords.filter(
        (kw: BannedKeyword) => kw.isActive
      ).length;
      const inactiveCount = keywords.length - activeCount;

      ConsoleUI.success(
        `\nShowing ${keywords.length} of ${response.total} keywords (${activeCount} active, ${inactiveCount} inactive)`
      );

      if (response.totalPages > 1) {
        ConsoleUI.info(`Page ${response.page} of ${response.totalPages}`);
      }
    } else {
      ConsoleUI.success(`\nTotal: ${keywords.length} keywords`);
    }
  }

  private async createBannedKeyword(): Promise<void> {
    try {
      ConsoleUI.title("Add New Banned Keyword");

      const keywordData = await inquirer.prompt([
        {
          type: "input",
          name: "keyword",
          message: "Keyword to ban:",
          validate: (input) => {
            if (!input.trim()) {
              return "Keyword is required";
            }
            if (input.trim().length < 1) {
              return "Keyword must be at least 1 character long";
            }
            if (input.trim().length > 255) {
              return "Keyword must not exceed 255 characters";
            }
            return true;
          },
        },
        {
          type: "input",
          name: "description",
          message: "Description (optional):",
          default: "",
        },
        {
          type: "confirm",
          name: "isRegex",
          message: "Is this a regular expression?",
          default: false,
        },
        {
          type: "confirm",
          name: "isCaseSensitive",
          message: "Should matching be case sensitive?",
          default: false,
        },
      ]);

      // If it's a regex, validate the syntax
      if (keywordData.isRegex) {
        try {
          new RegExp(keywordData.keyword.trim());
        } catch (regexError) {
          ConsoleUI.error(
            "Invalid regular expression syntax. Please check your pattern."
          );
          return;
        }

        // Show warning about regex
        ConsoleUI.warning(
          "⚠️  Regular expressions can be powerful but complex. Make sure to test thoroughly."
        );
        const { continueWithRegex } = await inquirer.prompt([
          {
            type: "confirm",
            name: "continueWithRegex",
            message: "Continue with this regular expression?",
            default: false,
          },
        ]);

        if (!continueWithRegex) {
          ConsoleUI.info("Keyword creation cancelled.");
          return;
        }
      }

      const createData: CreateBannedKeywordDto = {
        keyword: keywordData.keyword.trim(),
        isRegex: keywordData.isRegex,
        isCaseSensitive: keywordData.isCaseSensitive,
      };

      if (keywordData.description.trim()) {
        createData.description = keywordData.description.trim();
      }

      // Show summary
      ConsoleUI.info("\nKeyword Summary:");
      console.log(`Keyword: ${createData.keyword}`);
      console.log(
        `Type: ${createData.isRegex ? "Regular Expression" : "Plain Text"}`
      );
      console.log(
        `Case Sensitive: ${createData.isCaseSensitive ? "Yes" : "No"}`
      );
      console.log(`Description: ${createData.description || "None"}`);

      // Confirm creation
      const { confirm } = await inquirer.prompt([
        {
          type: "confirm",
          name: "confirm",
          message: "Add this banned keyword?",
          default: true,
        },
      ]);

      if (!confirm) {
        ConsoleUI.info("Keyword creation cancelled.");
        return;
      }

      ConsoleUI.info("Adding banned keyword...");
      const newKeyword = await this.bannedKeywordService.createBannedKeyword(
        createData
      );

      ConsoleUI.success("Banned keyword added successfully!");

      // Display the created keyword
      ConsoleUI.title("Created Keyword");
      const status = newKeyword.isActive ? "🟢 Active" : "🔴 Inactive";
      const caseSensitive = newKeyword.isCaseSensitive
        ? "📝 Case Sensitive"
        : "📝 Case Insensitive";
      const isRegex = newKeyword.isRegex ? "🔧 Regex" : "📝 Plain Text";

      console.log(`ID: ${newKeyword.id}`);
      console.log(`Keyword: ${newKeyword.keyword}`);
      console.log(`Description: ${newKeyword.description || "No description"}`);
      console.log(`Status: ${status}`);
      console.log(`Type: ${isRegex}`);
      console.log(`Case: ${caseSensitive}`);
      console.log(
        `Created: ${new Date(newKeyword.createdAt).toLocaleString()}`
      );
    } catch (error) {
      ConsoleUI.error(
        `Failed to create banned keyword: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
}
