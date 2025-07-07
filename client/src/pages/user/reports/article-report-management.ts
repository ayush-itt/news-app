import inquirer from "inquirer";
import { ArticleReportService } from "../../../services/article-report.service";
import {
  CreateArticleReportDto,
  ReportCountResponse,
} from "../../../interfaces";

export class ArticleReportManagement {
  private articleReportService: ArticleReportService;

  constructor() {
    this.articleReportService = new ArticleReportService();
  }

  async displayInterface(): Promise<void> {
    while (true) {
      console.clear();
      console.log("=".repeat(50));
      console.log("           ARTICLE REPORTING");
      console.log("=".repeat(50));

      const choices = [
        { name: "1. Report an Article", value: "1" },
        { name: "2. Check Report Count for Article", value: "2" },
        { name: "3. View Report Reasons Guide", value: "3" },
        { name: "4. Back to User Dashboard", value: "4" },
      ];

      try {
        const { choice } = await inquirer.prompt([
          {
            type: "list",
            name: "choice",
            message: "What would you like to do?",
            choices,
          },
        ]);

        switch (choice) {
          case "1":
            await this.reportArticle();
            break;
          case "2":
            await this.checkReportCount();
            break;
          case "3":
            await this.viewReportReasonsGuide();
            break;
          case "4":
            return;
          default:
            console.log("Invalid choice. Please select 1-4.");
            await this.waitForKeyPress();
        }
      } catch (error: any) {
        console.error("Error:", error.message);
        await this.waitForKeyPress();
      }
    }
  }

  private async reportArticle(): Promise<void> {
    console.clear();
    console.log("=".repeat(40));
    console.log("        REPORT ARTICLE");
    console.log("=".repeat(40));

    const { articleIdStr } = await inquirer.prompt([
      {
        type: "input",
        name: "articleIdStr",
        message: "Enter Article ID to report:",
        validate: (input: string) => {
          if (!input.trim()) {
            return "Article ID is required.";
          }
          const id = parseInt(input.trim());
          if (isNaN(id)) {
            return "Please enter a valid Article ID (number).";
          }
          return true;
        },
      },
    ]);

    const articleId = parseInt(articleIdStr.trim());

    // Check if user has already reported this article
    try {
      console.log("\nChecking if you have already reported this article...");
      const hasReported =
        await this.articleReportService.hasUserReportedArticle(articleId);
      if (hasReported) {
        console.log("\n❌ You have already reported this article.");
        await this.waitForKeyPress();
        return;
      }
    } catch (error: any) {
      // Continue with reporting process
    }

    const predefinedReasons = this.articleReportService.getPredefinedReasons();
    const reasonChoices = [
      ...predefinedReasons.map((reason, index) => ({
        name: `${index + 1}. ${this.articleReportService.formatReasonForDisplay(
          reason
        )}`,
        value: reason,
      })),
      {
        name: `${predefinedReasons.length + 1}. Custom reason`,
        value: "custom",
      },
      {
        name: `${predefinedReasons.length + 2}. No specific reason`,
        value: "none",
      },
    ];

    const { reasonChoice } = await inquirer.prompt([
      {
        type: "list",
        name: "reasonChoice",
        message: "Select a reason for reporting:",
        choices: reasonChoices,
      },
    ]);

    let reportData: CreateArticleReportDto = {};

    if (reasonChoice === "custom") {
      const { customReason } = await inquirer.prompt([
        {
          type: "input",
          name: "customReason",
          message: "Enter your custom reason:",
          validate: (input: string) =>
            input.trim().length > 0 || "Custom reason cannot be empty",
        },
      ]);
      reportData.reason = customReason.trim();
    } else if (reasonChoice !== "none") {
      reportData.reason = reasonChoice;
    }

    try {
      console.log("\nSubmitting report...");
      const report = await this.articleReportService.reportArticle(
        articleId,
        reportData
      );

      console.log("\n✅ Article reported successfully!");
      console.log("=".repeat(40));
      console.log(`Report ID: ${report.id}`);
      console.log(`Article ID: ${report.articleId}`);
      console.log(
        `Reason: ${this.articleReportService.formatReasonForDisplay(
          report.reason
        )}`
      );
      console.log(
        `Reported at: ${new Date(report.createdAt).toLocaleString()}`
      );
      console.log("\nThank you for helping maintain content quality!");
    } catch (error: any) {
      console.log(`\n❌ Failed to report article: ${error.message}`);
    }

    await this.waitForKeyPress();
  }

  private async checkReportCount(): Promise<void> {
    console.clear();
    console.log("=".repeat(40));
    console.log("     CHECK REPORT COUNT");
    console.log("=".repeat(40));

    const { articleIdStr } = await inquirer.prompt([
      {
        type: "input",
        name: "articleIdStr",
        message: "Enter Article ID to check:",
        validate: (input: string) => {
          if (!input.trim()) {
            return "Article ID is required.";
          }
          const id = parseInt(input.trim());
          if (isNaN(id)) {
            return "Please enter a valid Article ID (number).";
          }
          return true;
        },
      },
    ]);

    const articleId = parseInt(articleIdStr.trim());

    try {
      console.log("\nFetching report count...");
      const reportCount: ReportCountResponse =
        await this.articleReportService.getArticleReportCount(articleId);

      console.log("\n📊 Report Count Information");
      console.log("=".repeat(40));
      console.log(`Article ID: ${reportCount.articleId}`);
      console.log(`Total Reports: ${reportCount.reportCount}`);

      if (reportCount.reportCount === 0) {
        console.log("\n✅ This article has not been reported yet.");
      } else if (reportCount.reportCount === 1) {
        console.log("\n⚠️  This article has been reported 1 time.");
      } else {
        console.log(
          `\n⚠️  This article has been reported ${reportCount.reportCount} times.`
        );
      }
    } catch (error: any) {
      console.log(`\n❌ Failed to get report count: ${error.message}`);
    }

    await this.waitForKeyPress();
  }

  private async viewReportReasonsGuide(): Promise<void> {
    console.clear();
    console.log("=".repeat(50));
    console.log("          REPORT REASONS GUIDE");
    console.log("=".repeat(50));

    console.log("\n📋 When to report articles:");
    console.log("-".repeat(30));
    console.log("• Spam Content: Repetitive, unwanted, or promotional content");
    console.log(
      "• Inappropriate Content: Content not suitable for general audience"
    );
    console.log("• Misleading Information: False or misleading claims");
    console.log("• Hate Speech: Content promoting hatred against groups");
    console.log("• Violence: Content promoting or depicting violence");
    console.log("• Harassment: Content targeting individuals harmfully");
    console.log(
      "• Copyright Violation: Unauthorized use of copyrighted material"
    );
    console.log("• Fake News: Deliberately false or fabricated news");
    console.log("• Other: Any other legitimate concern");

    console.log("\n🔍 Reporting Guidelines:");
    console.log("-".repeat(30));
    console.log(
      "• Only report articles that genuinely violate content policies"
    );
    console.log("• Provide specific reasons when possible");
    console.log("• You can only report each article once");
    console.log("• Reports are reviewed by administrators");
    console.log("• False reports may result in account restrictions");

    console.log("\n✅ Thank you for helping maintain content quality!");

    await this.waitForKeyPress();
  }

  private async waitForKeyPress(): Promise<void> {
    await inquirer.prompt([
      {
        type: "input",
        name: "continue",
        message: "Press Enter to continue...",
      },
    ]);
  }
}
