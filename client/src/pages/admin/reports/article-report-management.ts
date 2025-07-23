import inquirer from "inquirer";
import { ConsoleUI } from "../../../utils/console-ui";
import { ApiService } from "../../../services/api.service";
import { ArticleReportService } from "../../../services/admin";
import { ArticleReport, GetReportsQueryDto } from "../../../interfaces";

export class ArticleReportManagement {
  private reportService: ArticleReportService;

  constructor() {
    const apiService = ApiService.getInstance();
    this.reportService = new ArticleReportService(apiService);
  }

  async show(): Promise<void> {
    try {
      while (true) {
        const choice = await this.showMenu();

        switch (choice) {
          case "view_all":
            await this.viewAllReports();
            break;
          case "view_by_article":
            await this.viewReportsByArticle();
            break;
          case "view_by_user":
            await this.viewReportsByUser();
            break;
          case "search_reports":
            await this.searchReports();
            break;
          case "get_article_count":
            await this.getArticleReportCount();
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
        `Error in article reports management: ${
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
        message: "Article Reports & Moderation:",
        choices: [
          { name: "📋 View All Reports", value: "view_all" },
          { name: "📰 Reports by Article", value: "view_by_article" },
          { name: "👤 Reports by User", value: "view_by_user" },
          { name: "🔍 Browse Reports", value: "search_reports" },
          { name: "🔢 Get Article Report Count", value: "get_article_count" },
          { name: "← Back to Admin Dashboard", value: "back" },
        ],
      },
    ]);
    return choice;
  }

  private async viewAllReports(): Promise<void> {
    try {
      ConsoleUI.info("Loading all reports...");
      const response = await this.reportService.getAllReports({ limit: 20 });

      this.displayReportsResponse(response, "All Article Reports");
    } catch (error) {
      ConsoleUI.error(
        `Failed to load reports: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  private async viewReportsByArticle(): Promise<void> {
    try {
      const { articleId } = await inquirer.prompt([
        {
          type: "input",
          name: "articleId",
          message: "Enter article ID:",
          validate: (input) => {
            const id = parseInt(input);
            if (isNaN(id) || id <= 0) {
              return "Please enter a valid positive number";
            }
            return true;
          },
        },
      ]);

      ConsoleUI.info(`Loading reports for article ${articleId}...`);
      const response = await this.reportService.getReportsByArticleId(
        parseInt(articleId)
      );

      if (response.reports.length === 0) {
        ConsoleUI.warning(`No reports found for article ${articleId}.`);
        return;
      }

      ConsoleUI.title(`Reports for Article ${articleId}`);

      response.reports.forEach((report, index) => {
        ConsoleUI.info(`\n${index + 1}. Report #${report.id}`);
        console.log(
          `   Reported by: ${report.user?.username || "Unknown"} (ID: ${
            report.userId
          })`
        );
        console.log(`   Reason: ${report.reason || "No reason provided"}`);
        console.log(`   Date: ${new Date(report.createdAt).toLocaleString()}`);

        if (report.article) {
          console.log(`   Article: "${report.article.title}"`);
          console.log(
            `   Article Status: ${
              report.article.isActive ? "🟢 Active" : "🔴 Inactive"
            }`
          );
        }
      });

      ConsoleUI.success(
        `\nTotal reports for this article: ${response.totalReports}`
      );
    } catch (error) {
      ConsoleUI.error(
        `Failed to load article reports: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  private async viewReportsByUser(): Promise<void> {
    try {
      const { userId } = await inquirer.prompt([
        {
          type: "input",
          name: "userId",
          message: "Enter user ID:",
          validate: (input) => {
            const id = parseInt(input);
            if (isNaN(id) || id <= 0) {
              return "Please enter a valid positive number";
            }
            return true;
          },
        },
      ]);

      ConsoleUI.info(`Loading reports by user ${userId}...`);
      const response = await this.reportService.getReportsByUserId(
        parseInt(userId)
      );

      if (response.reports.length === 0) {
        ConsoleUI.warning(`No reports found by user ${userId}.`);
        return;
      }

      ConsoleUI.title(`Reports by User ${userId}`);

      response.reports.forEach((report, index) => {
        ConsoleUI.info(`\n${index + 1}. Report #${report.id}`);
        console.log(`   Article ID: ${report.articleId}`);

        if (report.article) {
          console.log(`   Article: "${report.article.title}"`);
          console.log(
            `   Article Status: ${
              report.article.isActive ? "🟢 Active" : "🔴 Inactive"
            }`
          );
        }

        console.log(`   Reason: ${report.reason || "No reason provided"}`);
        console.log(`   Date: ${new Date(report.createdAt).toLocaleString()}`);
      });

      ConsoleUI.success(
        `\nTotal reports by this user: ${response.totalReports}`
      );
    } catch (error) {
      ConsoleUI.error(
        `Failed to load user reports: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  private async searchReports(): Promise<void> {
    try {
      const searchOptions = await inquirer.prompt([
        {
          type: "list",
          name: "searchType",
          message: "How would you like to view reports?",
          choices: [
            { name: "Recent reports (last 20)", value: "recent" },
            { name: "Custom pagination", value: "pagination" },
          ],
        },
      ]);

      let queryParams: GetReportsQueryDto = {};

      switch (searchOptions.searchType) {
        case "recent":
          queryParams.limit = 20;
          queryParams.page = 1;
          break;

        case "pagination":
          const paginationParams = await inquirer.prompt([
            {
              type: "input",
              name: "page",
              message: "Page number (default: 1):",
              default: "1",
              validate: (input) => {
                const page = parseInt(input);
                if (isNaN(page) || page < 1) {
                  return "Please enter a valid page number (1 or greater)";
                }
                return true;
              },
            },
            {
              type: "input",
              name: "limit",
              message: "Items per page (default: 10):",
              default: "10",
              validate: (input) => {
                const limit = parseInt(input);
                if (isNaN(limit) || limit < 1 || limit > 100) {
                  return "Please enter a valid limit (1-100)";
                }
                return true;
              },
            },
          ]);
          queryParams.page = parseInt(paginationParams.page);
          queryParams.limit = parseInt(paginationParams.limit);
          break;
      }

      ConsoleUI.info("Loading reports...");
      const response = await this.reportService.getAllReports(queryParams);

      const title =
        searchOptions.searchType === "recent"
          ? "Recent Reports"
          : "Custom Search Results";

      this.displayReportsResponse(response, title);
    } catch (error) {
      ConsoleUI.error(
        `Failed to load reports: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  private displayReportsResponse(response: any, title: string): void {
    if (response.reports.length === 0) {
      ConsoleUI.warning("No reports found.");
      return;
    }

    ConsoleUI.title(title);

    response.reports.forEach((report: ArticleReport, index: number) => {
      ConsoleUI.info(`\n${index + 1}. Report #${report.id}`);
      console.log(`   Article ID: ${report.articleId}`);

      if (report.article) {
        console.log(`   Article: "${report.article.title}"`);
        console.log(
          `   Article Status: ${
            report.article.isActive ? "🟢 Active" : "🔴 Inactive"
          }`
        );
        if (report.article.author) {
          console.log(`   Article Author: ${report.article.author}`);
        }
      }

      console.log(
        `   Reported by: ${report.user?.username || "Unknown"} (ID: ${
          report.userId
        })`
      );
      console.log(`   Reason: ${report.reason || "No reason provided"}`);
      console.log(`   Date: ${new Date(report.createdAt).toLocaleString()}`);

      if (index < response.reports.length - 1) {
        console.log("   " + "─".repeat(40));
      }
    });

    // Display pagination info
    ConsoleUI.success(
      `\nShowing ${response.reports.length} of ${response.total} reports`
    );

    if (response.totalPages > 1) {
      ConsoleUI.info(`Page ${response.page} of ${response.totalPages}`);
    }
  }

  private async getArticleReportCount(): Promise<void> {
    try {
      const { articleId } = await inquirer.prompt([
        {
          type: "input",
          name: "articleId",
          message: "Enter article ID to get report count:",
          validate: (input) => {
            const id = parseInt(input);
            if (isNaN(id) || id <= 0) {
              return "Please enter a valid positive number";
            }
            return true;
          },
        },
      ]);

      ConsoleUI.info("Getting report count...");
      const reportCount = await this.reportService.getArticleReportCount(
        parseInt(articleId)
      );

      ConsoleUI.title(`Report Count for Article ${reportCount.articleId}`);
      console.log(`Total Reports: ${reportCount.reportCount}`);

      if (reportCount.reportCount === 0) {
        ConsoleUI.success("This article has no reports.");
      } else if (reportCount.reportCount === 1) {
        ConsoleUI.warning("This article has 1 report.");
      } else {
        ConsoleUI.warning(
          `This article has ${reportCount.reportCount} reports.`
        );
      }
    } catch (error) {
      ConsoleUI.error(
        `Failed to get report count: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
}
