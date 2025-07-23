import inquirer from "inquirer";
import { ConsoleUI } from "../../../utils/console-ui";
import { ApiService } from "../../../services/api.service";
import { CategoryService } from "../../../services/admin";
import { Category, CreateCategoryDto } from "../../../interfaces";

export class CategoryManagement {
  private categoryService: CategoryService;

  constructor() {
    const apiService = ApiService.getInstance();
    this.categoryService = new CategoryService(apiService);
  }

  async show(): Promise<void> {
    try {
      while (true) {
        const choice = await this.showMenu();

        switch (choice) {
          case "view_all":
            await this.viewAllCategories();
            break;
          case "view_active":
            await this.viewActiveCategories();
            break;
          case "create":
            await this.createCategory();
            break;
          case "toggle_status":
            await this.toggleCategoryStatus();
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
        `Error in category management: ${
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
        message: "Category Management:",
        choices: [
          { name: "📋 View All Categories", value: "view_all" },
          { name: "🟢 View Active Categories Only", value: "view_active" },
          { name: "➕ Add New Category", value: "create" },
          { name: "🔄 Enable/Disable Category", value: "toggle_status" },
          { name: "← Back to Admin Dashboard", value: "back" },
        ],
      },
    ]);
    return choice;
  }

  private async viewAllCategories(): Promise<void> {
    try {
      ConsoleUI.info("Loading all categories...");
      const categories = await this.categoryService.getAllCategories(false);

      this.displayCategories(categories, "All Categories");
    } catch (error) {
      ConsoleUI.error(
        `Failed to load categories: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  private async viewActiveCategories(): Promise<void> {
    try {
      ConsoleUI.info("Loading active categories...");
      const categories = await this.categoryService.getAllCategories(true);

      this.displayCategories(categories, "Active Categories");
    } catch (error) {
      ConsoleUI.error(
        `Failed to load active categories: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  private displayCategories(categories: Category[], title: string): void {
    if (categories.length === 0) {
      ConsoleUI.warning("No categories found.");
      return;
    }

    ConsoleUI.title(title);

    categories.forEach((category, index) => {
      const status = category.isActive ? "🟢 Active" : "🔴 Inactive";

      ConsoleUI.info(`\n${index + 1}. ${category.name}`);
      console.log(`   ID: ${category.id}`);
      console.log(
        `   Description: ${category.description || "No description"}`
      );
      console.log(`   Status: ${status}`);
      console.log(
        `   Created: ${new Date(category.createdAt).toLocaleString()}`
      );
      console.log(
        `   Updated: ${new Date(category.updatedAt).toLocaleString()}`
      );
    });

    const activeCount = categories.filter((cat) => cat.isActive).length;
    const inactiveCount = categories.length - activeCount;

    ConsoleUI.success(
      `\nTotal: ${categories.length} categories (${activeCount} active, ${inactiveCount} inactive)`
    );
  }

  private async createCategory(): Promise<void> {
    try {
      ConsoleUI.title("Create New Category");

      const categoryData = await inquirer.prompt([
        {
          type: "input",
          name: "name",
          message: "Category name:",
          validate: (input) => {
            if (!input.trim()) {
              return "Category name is required";
            }
            if (input.trim().length < 2) {
              return "Category name must be at least 2 characters long";
            }
            if (input.trim().length > 100) {
              return "Category name must not exceed 100 characters";
            }
            return true;
          },
        },
        {
          type: "input",
          name: "description",
          message: "Category description (optional):",
          default: "",
        },
      ]);

      const createData: CreateCategoryDto = {
        name: categoryData.name.trim(),
      };

      if (categoryData.description.trim()) {
        createData.description = categoryData.description.trim();
      }

      // Confirm creation
      const { confirm } = await inquirer.prompt([
        {
          type: "confirm",
          name: "confirm",
          message: `Create category "${createData.name}"?`,
          default: true,
        },
      ]);

      if (!confirm) {
        ConsoleUI.info("Category creation cancelled.");
        return;
      }

      ConsoleUI.info("Creating category...");
      const response = await this.categoryService.createCategory(createData);

      ConsoleUI.success("Category created successfully!");
      ConsoleUI.info(response.message);
    } catch (error) {
      ConsoleUI.error(
        `Failed to create category: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  private async toggleCategoryStatus(): Promise<void> {
    try {
      // First show all categories so user can see IDs
      ConsoleUI.info("Loading categories...");
      const categories = await this.categoryService.getAllCategories(false);

      if (categories.length === 0) {
        ConsoleUI.warning("No categories found.");
        return;
      }

      ConsoleUI.title("Categories");
      categories.forEach((category, index) => {
        const status = category.isActive ? "🟢 Active" : "🔴 Inactive";
        console.log(
          `${index + 1}. [ID: ${category.id}] ${category.name} - ${status}`
        );
      });

      const { categoryId } = await inquirer.prompt([
        {
          type: "input",
          name: "categoryId",
          message: "Enter category ID to toggle status:",
          validate: (input) => {
            const id = parseInt(input);
            if (isNaN(id) || id <= 0) {
              return "Please enter a valid positive number";
            }
            const category = categories.find((cat) => cat.id === id);
            if (!category) {
              return "Category with this ID not found";
            }
            return true;
          },
        },
      ]);

      const categoryToToggle = categories.find(
        (cat) => cat.id === parseInt(categoryId)
      );
      if (!categoryToToggle) {
        ConsoleUI.error("Category not found.");
        return;
      }

      const newStatus = categoryToToggle.isActive ? "disable" : "enable";
      const { confirm } = await inquirer.prompt([
        {
          type: "confirm",
          name: "confirm",
          message: `Are you sure you want to ${newStatus} category "${categoryToToggle.name}"?`,
          default: false,
        },
      ]);

      if (!confirm) {
        ConsoleUI.info("Status toggle cancelled.");
        return;
      }

      ConsoleUI.info(
        `${newStatus === "enable" ? "Enabling" : "Disabling"} category...`
      );
      const response = await this.categoryService.toggleCategoryStatus(
        parseInt(categoryId)
      );

      ConsoleUI.success(`Category status toggled successfully!`);
      ConsoleUI.info(response.message);
    } catch (error) {
      ConsoleUI.error(
        `Failed to toggle category status: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
}
