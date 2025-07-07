import { CategoryService } from "../../../services/category.service";
import { ArticleService } from "../../../services/article.service";
import {
  Category,
  ArticleQuery,
  PaginatedArticleResponse,
} from "../../../interfaces";
import inquirer from "inquirer";

export class CategoryBrowsingManagement {
  private categoryService: CategoryService;
  private articleService: ArticleService;

  constructor() {
    this.categoryService = new CategoryService();
    this.articleService = new ArticleService();
  }

  async displayInterface(): Promise<void> {
    while (true) {
      console.clear();
      console.log("=".repeat(50));
      console.log("           BROWSE CATEGORIES");
      console.log("=".repeat(50));
      console.log("1. View All Categories");
      console.log("2. Browse Articles by Category");
      console.log("3. Search Categories");
      console.log("4. Category Statistics");
      console.log("5. Back to User Dashboard");
      console.log("=".repeat(50));

      const { choice } = await inquirer.prompt([
        {
          type: "list",
          name: "choice",
          message: "What would you like to do?",
          choices: [
            { name: "1. View All Categories", value: "1" },
            { name: "2. Browse Articles by Category", value: "2" },
            { name: "3. Search Categories", value: "3" },
            { name: "4. Category Statistics", value: "4" },
            { name: "5. Back to User Dashboard", value: "5" },
          ],
        },
      ]);

      try {
        switch (choice) {
          case "1":
            await this.viewAllCategories();
            break;
          case "2":
            await this.browseArticlesByCategory();
            break;
          case "3":
            await this.searchCategories();
            break;
          case "4":
            await this.showCategoryStatistics();
            break;
          case "5":
            return;
          default:
            console.log("Invalid choice. Please select 1-5.");
            await this.waitForKeyPress();
        }
      } catch (error: any) {
        console.error("Error:", error.message);
        await this.waitForKeyPress();
      }
    }
  }

  private async viewAllCategories(): Promise<void> {
    console.clear();
    console.log("=".repeat(40));
    console.log("        ALL CATEGORIES");
    console.log("=".repeat(40));

    try {
      console.log("\nFetching categories...");
      const categories = await this.categoryService.getCategories(false); // Get all categories

      if (categories.length === 0) {
        console.log("\n📂 No categories found.");
        await this.waitForKeyPress();
        return;
      }

      console.log(`\n📁 Found ${categories.length} categories:\n`);
      console.log("=".repeat(40));

      categories.forEach((category: Category, index: number) => {
        console.log(`${index + 1}. ${category.name}`);
        if (category.description) {
          console.log(`   📝 ${category.description}`);
        }
        console.log(`   🆔 ID: ${category.id}`);
        console.log("   " + "-".repeat(30));
      });

      console.log("\nOptions:");
      console.log("1. Select a category to view details");
      console.log("2. Back to categories menu");

      const { choice } = await inquirer.prompt([
        {
          type: "list",
          name: "choice",
          message: "What would you like to do?",
          choices: [
            { name: "1. Select a category to view details", value: "1" },
            { name: "2. Back to categories menu", value: "2" },
          ],
        },
      ]);

      if (choice === "1") {
        const categoryChoices = categories.map((category, index) => ({
          name: `${index + 1}. ${category.name}`,
          value: category,
        }));

        const { selectedCategory } = await inquirer.prompt([
          {
            type: "list",
            name: "selectedCategory",
            message: "Select a category:",
            choices: categoryChoices,
          },
        ]);

        await this.viewCategoryDetails(selectedCategory);
      }
    } catch (error: any) {
      console.log(`\n❌ Failed to fetch categories: ${error.message}`);
      await this.waitForKeyPress();
    }
  }

  private async viewCategoryDetails(category: Category): Promise<void> {
    console.clear();
    console.log("=".repeat(40));
    console.log("      CATEGORY DETAILS");
    console.log("=".repeat(40));

    console.log(`📁 Name: ${category.name}`);
    console.log(`🆔 ID: ${category.id}`);
    if (category.description) {
      console.log(`📝 Description: ${category.description}`);
    }
    console.log(`📅 Created: ${new Date(category.createdAt).toLocaleString()}`);
    if (category.updatedAt) {
      console.log(
        `🔄 Updated: ${new Date(category.updatedAt).toLocaleString()}`
      );
    }

    console.log("\nOptions:");
    console.log("1. Browse articles in this category");
    console.log("2. Back to categories list");

    const { choice } = await inquirer.prompt([
      {
        type: "list",
        name: "choice",
        message: "What would you like to do?",
        choices: [
          { name: "1. Browse articles in this category", value: "1" },
          { name: "2. Back to categories list", value: "2" },
        ],
      },
    ]);

    if (choice === "1") {
      await this.browseArticlesInCategory(category);
    }
  }

  private async browseArticlesByCategory(): Promise<void> {
    console.clear();
    console.log("=".repeat(40));
    console.log("    BROWSE ARTICLES BY CATEGORY");
    console.log("=".repeat(40));

    try {
      console.log("\nFetching categories...");
      const categories = await this.categoryService.getCategories(false); // Get all categories

      if (categories.length === 0) {
        console.log("\n📂 No categories found.");
        await this.waitForKeyPress();
        return;
      }

      const categoryChoices = categories.map((category, index) => ({
        name: `${index + 1}. ${category.name}`,
        value: category,
      }));

      const { selectedCategory } = await inquirer.prompt([
        {
          type: "list",
          name: "selectedCategory",
          message: "Select a category:",
          choices: categoryChoices,
        },
      ]);

      await this.browseArticlesInCategory(selectedCategory);
    } catch (error: any) {
      console.log(`\n❌ Failed to fetch categories: ${error.message}`);
      await this.waitForKeyPress();
    }
  }

  private async browseArticlesInCategory(category: Category): Promise<void> {
    console.clear();
    console.log("=".repeat(50));
    console.log(`      ARTICLES IN: ${category.name.toUpperCase()}`);
    console.log("=".repeat(50));

    try {
      console.log("\nFetching articles...");

      const query: ArticleQuery = {
        page: 1,
        limit: 10,
        categoryIds: [category.id],
      };

      const response: PaginatedArticleResponse =
        await this.articleService.getArticles(query);

      if (response.data.length === 0) {
        console.log(`\n📰 No articles found in category "${category.name}".`);
        await this.waitForKeyPress();
        return;
      }

      console.log(
        `\n📊 Found ${response.total} articles in "${category.name}" (showing ${response.data.length}):\n`
      );
      console.log("=".repeat(50));

      response.data.forEach((article, index) => {
        console.log(`${index + 1}. ${article.title}`);
        console.log(`   ✍️ Author: ${article.author || "Unknown"}`);
        console.log(`   🌐 Source: ${article.source || "Unknown"}`);
        console.log(
          `   📅 Published: ${new Date(article.publishedAt).toLocaleString()}`
        );
        console.log(`   🔗 ${article.originalUrl}`);
        console.log("   " + "-".repeat(40));
      });

      if (response.total > response.data.length) {
        console.log(
          `\n📄 Showing ${response.data.length} of ${response.total} articles.`
        );
        console.log(
          "💡 Tip: Use the main article browsing feature for pagination and detailed search."
        );
      }
    } catch (error: any) {
      console.log(`\n❌ Failed to fetch articles: ${error.message}`);
    }

    await this.waitForKeyPress();
  }

  private async searchCategories(): Promise<void> {
    console.clear();
    console.log("=".repeat(40));
    console.log("       SEARCH CATEGORIES");
    console.log("=".repeat(40));

    const { searchTerm } = await inquirer.prompt([
      {
        type: "input",
        name: "searchTerm",
        message: "Enter search term:",
        validate: (input: string) =>
          input.trim().length > 0 || "Search term is required",
      },
    ]);

    if (!searchTerm.trim()) {
      console.log("Search term is required.");
      await this.waitForKeyPress();
      return;
    }

    try {
      console.log("\nSearching categories...");
      const allCategories = await this.categoryService.getCategories(false); // Get all categories

      const matchingCategories = allCategories.filter(
        (category: Category) =>
          category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (category.description &&
            category.description
              .toLowerCase()
              .includes(searchTerm.toLowerCase()))
      );

      if (matchingCategories.length === 0) {
        console.log(`\n🔍 No categories found matching "${searchTerm}".`);
        await this.waitForKeyPress();
        return;
      }

      console.log(
        `\n🔍 Found ${matchingCategories.length} categories matching "${searchTerm}":\n`
      );
      console.log("=".repeat(40));

      matchingCategories.forEach((category: Category, index: number) => {
        console.log(`${index + 1}. ${category.name}`);
        if (category.description) {
          console.log(`   📝 ${category.description}`);
        }
        console.log(`   🆔 ID: ${category.id}`);
        console.log("   " + "-".repeat(30));
      });

      console.log("\nOptions:");
      console.log("1. Select a category to view details");
      console.log("2. Back to categories menu");

      const { choice } = await inquirer.prompt([
        {
          type: "list",
          name: "choice",
          message: "What would you like to do?",
          choices: [
            { name: "1. Select a category to view details", value: "1" },
            { name: "2. Back to categories menu", value: "2" },
          ],
        },
      ]);

      if (choice === "1") {
        const categoryChoices = matchingCategories.map((category, index) => ({
          name: `${index + 1}. ${category.name}`,
          value: category,
        }));

        const { selectedCategory } = await inquirer.prompt([
          {
            type: "list",
            name: "selectedCategory",
            message: "Select a category:",
            choices: categoryChoices,
          },
        ]);

        await this.viewCategoryDetails(selectedCategory);
      }
    } catch (error: any) {
      console.log(`\n❌ Search failed: ${error.message}`);
      await this.waitForKeyPress();
    }
  }

  private async showCategoryStatistics(): Promise<void> {
    console.clear();
    console.log("=".repeat(40));
    console.log("     CATEGORY STATISTICS");
    console.log("=".repeat(40));

    try {
      console.log("\nFetching category statistics...");
      const categories = await this.categoryService.getCategories(false); // Get all categories

      console.log("\n📊 Category Overview:");
      console.log("=".repeat(30));
      console.log(`📁 Total Categories: ${categories.length}`);

      if (categories.length > 0) {
        console.log("\n📋 Categories List:");
        console.log("-".repeat(30));

        categories.forEach((category: Category, index: number) => {
          console.log(`${index + 1}. ${category.name} (ID: ${category.id})`);
        });

        // Show category with longest/shortest names
        const longest = categories.reduce((a: Category, b: Category) =>
          a.name.length > b.name.length ? a : b
        );
        const shortest = categories.reduce((a: Category, b: Category) =>
          a.name.length < b.name.length ? a : b
        );

        console.log("\n📏 Category Name Statistics:");
        console.log("-".repeat(30));
        console.log(
          `📏 Longest name: "${longest.name}" (${longest.name.length} characters)`
        );
        console.log(
          `📏 Shortest name: "${shortest.name}" (${shortest.name.length} characters)`
        );

        // Show categories with/without descriptions
        const withDescriptions = categories.filter(
          (c: Category) => c.description && c.description.trim().length > 0
        );
        console.log(
          `📝 Categories with descriptions: ${withDescriptions.length}`
        );
        console.log(
          `📝 Categories without descriptions: ${
            categories.length - withDescriptions.length
          }`
        );
      }
    } catch (error: any) {
      console.log(`\n❌ Failed to get statistics: ${error.message}`);
    }

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
