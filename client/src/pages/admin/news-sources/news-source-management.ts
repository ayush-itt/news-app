import inquirer from "inquirer";
import { ConsoleUI } from "../../../utils/console-ui";
import { ApiService } from "../../../services/api.service";
import { NewsSourceService } from "../../../services/admin";
import { NewsSource, UpdateNewsSourceDto } from "../../../interfaces";

export class NewsSourceManagement {
  private newsSourceService: NewsSourceService;

  constructor() {
    const apiService = ApiService.getInstance();
    this.newsSourceService = new NewsSourceService(apiService);
  }

  async show(): Promise<void> {
    try {
      while (true) {
        const choice = await this.showMenu();

        switch (choice) {
          case "view_all":
            await this.viewAllNewsSources();
            break;
          case "view_details":
            await this.viewNewsSourceDetails();
            break;
          case "update":
            await this.updateNewsSource();
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
        `Error in news sources management: ${
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
        message: "News Sources Management:",
        choices: [
          { name: "📋 View All News Sources", value: "view_all" },
          { name: "🔍 View News Source Details", value: "view_details" },
          { name: "✏️  Update News Source", value: "update" },
          { name: "← Back to Admin Dashboard", value: "back" },
        ],
      },
    ]);
    return choice;
  }

  private async viewAllNewsSources(): Promise<void> {
    try {
      ConsoleUI.info("Loading news sources...");
      const sources = await this.newsSourceService.getAllNewsSources();

      if (sources.length === 0) {
        ConsoleUI.warning("No news sources found.");
        return;
      }

      ConsoleUI.title("All News Sources");

      sources.forEach((source, index) => {
        const status = source.isActive ? "🟢 Active" : "🔴 Inactive";
        const lastFetch = source.lastFetchAt
          ? new Date(source.lastFetchAt).toLocaleString()
          : "Never";
        const errorStatus = source.lastError
          ? "⚠️  Has Errors"
          : "✅ No Errors";

        ConsoleUI.info(`\n${index + 1}. ${source.name}`);
        console.log(`   ID: ${source.id}`);
        console.log(`   Type: ${source.type}`);
        console.log(`   Base URL: ${source.baseUrl}`);
        console.log(`   API Key Env: ${source.apiKeyEnv || "Not set"}`);
        console.log(`   Status: ${status}`);
        console.log(`   Last Fetch: ${lastFetch}`);
        console.log(`   Error Status: ${errorStatus}`);

        if (source.lastError) {
          console.log(`   Last Error: ${source.lastError}`);
        }
      });

      ConsoleUI.success(`\nTotal: ${sources.length} news sources`);
    } catch (error) {
      ConsoleUI.error(
        `Failed to load news sources: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  private async viewNewsSourceDetails(): Promise<void> {
    try {
      const { sourceId } = await inquirer.prompt([
        {
          type: "input",
          name: "sourceId",
          message: "Enter news source ID:",
          validate: (input) => {
            const id = parseInt(input);
            if (isNaN(id) || id <= 0) {
              return "Please enter a valid positive number";
            }
            return true;
          },
        },
      ]);

      ConsoleUI.info("Loading news source details...");
      const source = await this.newsSourceService.getNewsSourceById(
        parseInt(sourceId)
      );

      this.displayNewsSourceDetails(source);
    } catch (error) {
      ConsoleUI.error(
        `Failed to load news source details: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  private displayNewsSourceDetails(source: NewsSource): void {
    ConsoleUI.title(`News Source Details - ${source.name}`);

    const status = source.isActive ? "🟢 Active" : "🔴 Inactive";
    const lastFetch = source.lastFetchAt
      ? new Date(source.lastFetchAt).toLocaleString()
      : "Never";
    const errorStatus = source.lastError ? "⚠️  Has Errors" : "✅ No Errors";

    console.log(`ID: ${source.id}`);
    console.log(`Name: ${source.name}`);
    console.log(`Type: ${source.type}`);
    console.log(`Base URL: ${source.baseUrl}`);
    console.log(
      `API Key Environment Variable: ${source.apiKeyEnv || "Not set"}`
    );
    console.log(`Status: ${status}`);
    console.log(`Last Fetch: ${lastFetch}`);
    console.log(`Error Status: ${errorStatus}`);

    if (source.lastError) {
      console.log(`Last Error: ${source.lastError}`);
    }

    console.log(`Created: ${new Date(source.createdAt).toLocaleString()}`);
    console.log(`Updated: ${new Date(source.updatedAt).toLocaleString()}`);
  }

  private async updateNewsSource(): Promise<void> {
    try {
      const { sourceId } = await inquirer.prompt([
        {
          type: "input",
          name: "sourceId",
          message: "Enter news source ID to update:",
          validate: (input) => {
            const id = parseInt(input);
            if (isNaN(id) || id <= 0) {
              return "Please enter a valid positive number";
            }
            return true;
          },
        },
      ]);

      // First, get current details
      ConsoleUI.info("Loading current news source details...");
      const currentSource = await this.newsSourceService.getNewsSourceById(
        parseInt(sourceId)
      );

      ConsoleUI.info(`Current News Source: ${currentSource.name}`);
      console.log(
        `Current API Key Env: ${currentSource.apiKeyEnv || "Not set"}`
      );

      const updateData = await inquirer.prompt([
        {
          type: "input",
          name: "name",
          message: "New name (leave empty to keep current):",
          default: "",
          validate: (input) => {
            if (
              input.trim() &&
              (input.trim().length < 2 || input.trim().length > 100)
            ) {
              return "Name must be between 2 and 100 characters if provided";
            }
            return true;
          },
        },
        {
          type: "input",
          name: "apiKeyEnv",
          message:
            "New API key environment variable name (leave empty to keep current):",
          default: "",
          validate: (input) => {
            if (input.trim() && input.trim().length > 100) {
              return "API key environment variable name must not exceed 100 characters";
            }
            return true;
          },
        },
      ]);

      // Prepare update payload (only include non-empty fields)
      const updatePayload: UpdateNewsSourceDto = {};
      if (updateData.name.trim()) {
        updatePayload.name = updateData.name.trim();
      }
      if (updateData.apiKeyEnv.trim()) {
        updatePayload.apiKeyEnv = updateData.apiKeyEnv.trim();
      }

      // Check if there are any updates
      if (Object.keys(updatePayload).length === 0) {
        ConsoleUI.warning("No changes made.");
        return;
      }

      // Confirm update
      const { confirm } = await inquirer.prompt([
        {
          type: "confirm",
          name: "confirm",
          message: "Are you sure you want to update this news source?",
          default: false,
        },
      ]);

      if (!confirm) {
        ConsoleUI.info("Update cancelled.");
        return;
      }

      ConsoleUI.info("Updating news source...");
      const updatedSource = await this.newsSourceService.updateNewsSource(
        parseInt(sourceId),
        updatePayload
      );

      ConsoleUI.success("News source updated successfully!");
      this.displayNewsSourceDetails(updatedSource);
    } catch (error) {
      ConsoleUI.error(
        `Failed to update news source: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
}
