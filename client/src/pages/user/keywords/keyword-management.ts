import inquirer from "inquirer";
import { ConsoleUI } from "../../../utils/console-ui";
import { KeywordService } from "../../../services/keyword.service";
import { CategoryService } from "../../../services/category.service";
import {
  UserKeyword,
  CreateKeywordRequest,
} from "../../../interfaces/keyword.interface";
import { Category } from "../../../interfaces/category.interface";

export async function keywordManagementPage(): Promise<void> {
  const keywordService = new KeywordService();

  while (true) {
    ConsoleUI.newLine();
    ConsoleUI.title("🔑 My Keywords");

    try {
      const stats = await keywordService.getKeywordStats();
      ConsoleUI.info(
        `Keywords: ${stats.totalKeywords} total (✅ ${stats.activeKeywords} active, ❌ ${stats.inactiveKeywords} inactive)`
      );
    } catch (error) {
      // Stats not critical, continue without them
    }

    const choices = [
      { name: "📝 View All Keywords", value: "all" },
      { name: "✅ View Active Keywords", value: "active" },
      { name: "❌ View Inactive Keywords", value: "inactive" },
      { name: "➕ Add New Keyword", value: "add" },
      { name: "🔧 Manage Keywords", value: "manage" },
      { name: "🔍 Search Keywords", value: "search" },
      { name: "📊 Keyword Statistics", value: "stats" },
      { name: "🔙 Back to Dashboard", value: "back" },
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
        case "all":
          await viewAllKeywords(keywordService);
          break;
        case "active":
          await viewActiveKeywords(keywordService);
          break;
        case "inactive":
          await viewInactiveKeywords(keywordService);
          break;
        case "add":
          await addNewKeyword(keywordService);
          break;
        case "manage":
          await manageKeywords(keywordService);
          break;
        case "search":
          await searchKeywords(keywordService);
          break;
        case "stats":
          await displayKeywordStats(keywordService);
          break;
        case "back":
          return;
      }
    } catch (error) {
      ConsoleUI.error(
        `Keyword management error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      await waitForContinue();
    }
  }
}

/**
 * Display all user keywords
 */
async function viewAllKeywords(keywordService: KeywordService): Promise<void> {
  ConsoleUI.newLine();
  ConsoleUI.title("📝 All My Keywords");

  try {
    ConsoleUI.info("Loading your keywords...");
    const keywords = await keywordService.getUserKeywords();

    if (keywords.length === 0) {
      ConsoleUI.warning("You haven't created any keywords yet.");
      await waitForContinue();
      return;
    }

    displayKeywordsList(keywords);

    const choices = [
      { name: "✏️ Edit a keyword", value: "edit" },
      { name: "🔄 Toggle keyword status", value: "toggle" },
      { name: "🗑️ Delete a keyword", value: "delete" },
      { name: "📋 View keyword details", value: "details" },
      { name: "🔙 Go back", value: "back" },
    ];

    const { action } = await inquirer.prompt([
      {
        type: "list",
        name: "action",
        message: "What would you like to do?",
        choices,
      },
    ]);

    switch (action) {
      case "edit":
        await editKeywordPrompt(keywordService, keywords);
        break;
      case "toggle":
        await toggleKeywordStatusPrompt(keywordService, keywords);
        break;
      case "delete":
        await deleteKeywordPrompt(keywordService, keywords);
        break;
      case "details":
        await viewKeywordDetails(keywords);
        break;
      default:
        return;
    }
  } catch (error) {
    ConsoleUI.error(
      `Error loading keywords: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
    await waitForContinue();
  }
}

/**
 * Display active keywords
 */
async function viewActiveKeywords(
  keywordService: KeywordService
): Promise<void> {
  ConsoleUI.newLine();
  ConsoleUI.title("✅ Active Keywords");

  try {
    ConsoleUI.info("Loading your active keywords...");
    const keywords = await keywordService.getActiveKeywords();

    if (keywords.length === 0) {
      ConsoleUI.warning("You don't have any active keywords.");
      await waitForContinue();
      return;
    }

    displayKeywordsList(keywords);
  } catch (error) {
    ConsoleUI.error(
      `Error loading active keywords: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }

  await waitForContinue();
}

/**
 * Display inactive keywords
 */
async function viewInactiveKeywords(
  keywordService: KeywordService
): Promise<void> {
  ConsoleUI.newLine();
  ConsoleUI.title("❌ Inactive Keywords");

  try {
    ConsoleUI.info("Loading your inactive keywords...");
    const keywords = await keywordService.getInactiveKeywords();

    if (keywords.length === 0) {
      ConsoleUI.warning("You don't have any inactive keywords.");
      await waitForContinue();
      return;
    }

    displayKeywordsList(keywords);
  } catch (error) {
    ConsoleUI.error(
      `Error loading inactive keywords: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }

  await waitForContinue();
}

/**
 * Add a new keyword
 */
async function addNewKeyword(keywordService: KeywordService): Promise<void> {
  ConsoleUI.newLine();
  ConsoleUI.title("➕ Add New Keyword");

  try {
    // Get available categories
    const categoryService = new CategoryService();
    ConsoleUI.info("Loading available categories...");
    const categories = await categoryService.getActiveCategories();

    if (categories.length === 0) {
      ConsoleUI.warning(
        "No active categories available. Please contact an administrator."
      );
      await waitForContinue();
      return;
    }

    const categoryChoices = categories.map((category) => ({
      name: `${category.name} - ${category.description || "No description"}`,
      value: category.id,
    }));

    const { categoryId } = await inquirer.prompt([
      {
        type: "list",
        name: "categoryId",
        message: "Select a category for your keyword:",
        choices: categoryChoices,
      },
    ]);

    const { keyword } = await inquirer.prompt([
      {
        type: "input",
        name: "keyword",
        message: "Enter the keyword (2-100 characters):",
        validate: (input: string) => {
          if (!input.trim()) {
            return "Keyword cannot be empty.";
          }
          if (input.length < 2) {
            return "Keyword must be at least 2 characters long.";
          }
          if (input.length > 100) {
            return "Keyword must not exceed 100 characters.";
          }
          return true;
        },
      },
    ]);

    const { isActive } = await inquirer.prompt([
      {
        type: "confirm",
        name: "isActive",
        message: "Should this keyword be active immediately?",
        default: true,
      },
    ]);

    const createData: CreateKeywordRequest = {
      categoryId,
      keyword: keyword.trim(),
      isActive,
    };

    ConsoleUI.info("Creating keyword...");
    const newKeyword = await keywordService.createKeyword(createData);
    ConsoleUI.success(
      `Successfully created keyword: "${newKeyword.keyword}" in category "${newKeyword.categoryName}"`
    );
  } catch (error) {
    ConsoleUI.error(
      `Error creating keyword: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }

  await waitForContinue();
}

/**
 * Manage keywords (bulk operations)
 */
async function manageKeywords(keywordService: KeywordService): Promise<void> {
  ConsoleUI.newLine();
  ConsoleUI.title("🔧 Manage Keywords");

  try {
    ConsoleUI.info("Loading your keywords...");
    const keywords = await keywordService.getUserKeywords();

    if (keywords.length === 0) {
      ConsoleUI.warning("You don't have any keywords to manage.");
      await waitForContinue();
      return;
    }

    const choices = [
      { name: "✅ Activate multiple keywords", value: "activate" },
      { name: "❌ Deactivate multiple keywords", value: "deactivate" },
      { name: "📂 View keywords by category", value: "by-category" },
      { name: "🗑️ Delete multiple keywords", value: "bulk-delete" },
      { name: "🔙 Go back", value: "back" },
    ];

    const { action } = await inquirer.prompt([
      {
        type: "list",
        name: "action",
        message: "What would you like to do?",
        choices,
      },
    ]);

    switch (action) {
      case "activate":
        await bulkActivateKeywords(keywordService, keywords);
        break;
      case "deactivate":
        await bulkDeactivateKeywords(keywordService, keywords);
        break;
      case "by-category":
        await viewKeywordsByCategory(keywordService);
        break;
      case "bulk-delete":
        await bulkDeleteKeywords(keywordService, keywords);
        break;
      default:
        return;
    }
  } catch (error) {
    ConsoleUI.error(
      `Error managing keywords: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
    await waitForContinue();
  }
}

/**
 * Search keywords
 */
async function searchKeywords(keywordService: KeywordService): Promise<void> {
  ConsoleUI.newLine();
  ConsoleUI.title("🔍 Search Keywords");

  try {
    const { searchTerm } = await inquirer.prompt([
      {
        type: "input",
        name: "searchTerm",
        message: "Enter search term (keyword or category name):",
        validate: (input: string) => {
          if (!input.trim()) {
            return "Search term cannot be empty.";
          }
          return true;
        },
      },
    ]);

    ConsoleUI.info("Searching keywords...");
    const keywords = await keywordService.searchKeywords(searchTerm.trim());

    if (keywords.length === 0) {
      ConsoleUI.warning(`No keywords found matching "${searchTerm}".`);
      await waitForContinue();
      return;
    }

    ConsoleUI.success(`Found ${keywords.length} keyword(s):`);
    displayKeywordsList(keywords);
  } catch (error) {
    ConsoleUI.error(
      `Error searching keywords: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }

  await waitForContinue();
}

/**
 * Display keyword statistics
 */
async function displayKeywordStats(
  keywordService: KeywordService
): Promise<void> {
  ConsoleUI.newLine();
  ConsoleUI.title("📊 Keyword Statistics");

  try {
    ConsoleUI.info("Loading keyword statistics...");
    const keywords = await keywordService.getUserKeywords();
    const stats = calculateKeywordStats(keywords);

    ConsoleUI.success("=== Keyword Statistics ===");
    console.log(`Total Keywords: ${stats.total}`);
    console.log(`✅ Active: ${stats.active}`);
    console.log(`❌ Inactive: ${stats.inactive}`);
    console.log(`📊 Active Rate: ${stats.activeRate}%`);

    if (stats.keywordsByCategory.size > 0) {
      console.log("\n📂 Keywords by Category:");
      stats.keywordsByCategory.forEach((count, category) => {
        console.log(`  ${category}: ${count}`);
      });
    }

    if (stats.recentKeywords > 0) {
      console.log(`\n🆕 Created This Week: ${stats.recentKeywords}`);
    }
  } catch (error) {
    ConsoleUI.error(
      `Error loading statistics: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }

  await waitForContinue();
}

/**
 * Display a list of keywords
 */
function displayKeywordsList(keywords: UserKeyword[]): void {
  console.log("\n" + "=".repeat(80));
  keywords.forEach((keyword, index) => {
    const status = keyword.isActive ? "✅ Active" : "❌ Inactive";
    console.log(`\n[${index + 1}] ${status} "${keyword.keyword}"`);
    console.log(`    📂 Category: ${keyword.categoryName || "Unknown"}`);
    console.log(`    📅 Created: ${formatDate(keyword.createdAt)}`);
    console.log(`    🆔 Keyword ID: ${keyword.id}`);
  });
  console.log("\n" + "=".repeat(80));
}

/**
 * Edit keyword prompt
 */
async function editKeywordPrompt(
  keywordService: KeywordService,
  keywords: UserKeyword[]
): Promise<void> {
  try {
    const choices = keywords.map((keyword, index) => ({
      name: `[${index + 1}] ${keyword.isActive ? "✅" : "❌"} "${
        keyword.keyword
      }" (${keyword.categoryName})`,
      value: keyword.id,
    }));

    choices.push({ name: "🔙 Cancel", value: -1 });

    const { keywordId } = await inquirer.prompt([
      {
        type: "list",
        name: "keywordId",
        message: "Select keyword to edit:",
        choices,
      },
    ]);

    if (keywordId === -1) {
      return;
    }

    const keyword = keywords.find((k) => k.id === keywordId);
    if (!keyword) {
      ConsoleUI.error("Keyword not found.");
      await waitForContinue();
      return;
    }

    const { newKeywordText } = await inquirer.prompt([
      {
        type: "input",
        name: "newKeywordText",
        message: `Enter new keyword text (current: "${keyword.keyword}"):`,
        default: keyword.keyword,
        validate: (input: string) => {
          if (!input.trim()) {
            return "Keyword cannot be empty.";
          }
          if (input.length < 2) {
            return "Keyword must be at least 2 characters long.";
          }
          if (input.length > 100) {
            return "Keyword must not exceed 100 characters.";
          }
          return true;
        },
      },
    ]);

    ConsoleUI.info("Updating keyword...");
    const updatedKeyword = await keywordService.updateKeyword(keywordId, {
      keyword: newKeywordText.trim(),
    });
    ConsoleUI.success(
      `Successfully updated keyword to: "${updatedKeyword.keyword}"`
    );
  } catch (error) {
    ConsoleUI.error(
      `Error editing keyword: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }

  await waitForContinue();
}

/**
 * Toggle keyword status prompt
 */
async function toggleKeywordStatusPrompt(
  keywordService: KeywordService,
  keywords: UserKeyword[]
): Promise<void> {
  try {
    const choices = keywords.map((keyword, index) => ({
      name: `[${index + 1}] ${keyword.isActive ? "✅" : "❌"} "${
        keyword.keyword
      }" (${keyword.categoryName})`,
      value: keyword.id,
    }));

    choices.push({ name: "🔙 Cancel", value: -1 });

    const { keywordId } = await inquirer.prompt([
      {
        type: "list",
        name: "keywordId",
        message: "Select keyword to toggle status:",
        choices,
      },
    ]);

    if (keywordId === -1) {
      return;
    }

    const keyword = keywords.find((k) => k.id === keywordId);
    if (!keyword) {
      ConsoleUI.error("Keyword not found.");
      await waitForContinue();
      return;
    }

    const currentStatus = keyword.isActive ? "active" : "inactive";
    const newStatus = keyword.isActive ? "inactive" : "active";

    const { confirmed } = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirmed",
        message: `"${keyword.keyword}" is currently ${currentStatus}. Make it ${newStatus}?`,
        default: true,
      },
    ]);

    if (confirmed) {
      ConsoleUI.info("Toggling keyword status...");
      const updatedKeyword = await keywordService.toggleKeywordActive(
        keywordId
      );
      const resultStatus = updatedKeyword.isActive ? "active" : "inactive";
      ConsoleUI.success(
        `Successfully made "${updatedKeyword.keyword}" ${resultStatus}!`
      );
    } else {
      ConsoleUI.info("Status change cancelled.");
    }
  } catch (error) {
    ConsoleUI.error(
      `Error toggling keyword status: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }

  await waitForContinue();
}

/**
 * Delete keyword prompt
 */
async function deleteKeywordPrompt(
  keywordService: KeywordService,
  keywords: UserKeyword[]
): Promise<void> {
  try {
    const choices = keywords.map((keyword, index) => ({
      name: `[${index + 1}] ${keyword.isActive ? "✅" : "❌"} "${
        keyword.keyword
      }" (${keyword.categoryName})`,
      value: keyword.id,
    }));

    choices.push({ name: "🔙 Cancel", value: -1 });

    const { keywordId } = await inquirer.prompt([
      {
        type: "list",
        name: "keywordId",
        message: "Select keyword to delete:",
        choices,
      },
    ]);

    if (keywordId === -1) {
      return;
    }

    const keyword = keywords.find((k) => k.id === keywordId);
    if (!keyword) {
      ConsoleUI.error("Keyword not found.");
      await waitForContinue();
      return;
    }

    const { confirmed } = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirmed",
        message: `Are you sure you want to delete "${keyword.keyword}"? This action cannot be undone.`,
        default: false,
      },
    ]);

    if (confirmed) {
      ConsoleUI.info("Deleting keyword...");
      await keywordService.deleteKeyword(keywordId);
      ConsoleUI.success(`Successfully deleted keyword: "${keyword.keyword}"`);
    } else {
      ConsoleUI.info("Deletion cancelled.");
    }
  } catch (error) {
    ConsoleUI.error(
      `Error deleting keyword: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }

  await waitForContinue();
}

/**
 * View keyword details
 */
async function viewKeywordDetails(keywords: UserKeyword[]): Promise<void> {
  try {
    const choices = keywords.map((keyword, index) => ({
      name: `[${index + 1}] ${keyword.isActive ? "✅" : "❌"} "${
        keyword.keyword
      }" (${keyword.categoryName})`,
      value: keyword.id,
    }));

    choices.push({ name: "🔙 Cancel", value: -1 });

    const { keywordId } = await inquirer.prompt([
      {
        type: "list",
        name: "keywordId",
        message: "Select keyword to view details:",
        choices,
      },
    ]);

    if (keywordId === -1) {
      return;
    }

    const keyword = keywords.find((k) => k.id === keywordId);
    if (!keyword) {
      ConsoleUI.error("Keyword not found.");
      await waitForContinue();
      return;
    }

    ConsoleUI.newLine();
    ConsoleUI.title("📋 Keyword Details");

    const status = keyword.isActive ? "✅ Active" : "❌ Inactive";
    console.log(`${status} "${keyword.keyword}"`);
    console.log(`📂 Category: ${keyword.categoryName || "Unknown"}`);
    console.log(`🆔 Keyword ID: ${keyword.id}`);
    console.log(`🆔 Category ID: ${keyword.categoryId}`);
    console.log(`👤 User ID: ${keyword.userId}`);
    console.log(`📅 Created: ${formatDate(keyword.createdAt)}`);
  } catch (error) {
    ConsoleUI.error(
      `Error viewing keyword details: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }

  await waitForContinue();
}

/**
 * View keywords by category
 */
async function viewKeywordsByCategory(
  keywordService: KeywordService
): Promise<void> {
  try {
    const categoryService = new CategoryService();
    ConsoleUI.info("Loading categories...");
    const categories = await categoryService.getActiveCategories();

    if (categories.length === 0) {
      ConsoleUI.warning("No categories available.");
      await waitForContinue();
      return;
    }

    const categoryChoices = categories.map((category) => ({
      name: `${category.name} - ${category.description || "No description"}`,
      value: category.id,
    }));

    categoryChoices.push({ name: "🔙 Cancel", value: -1 });

    const { categoryId } = await inquirer.prompt([
      {
        type: "list",
        name: "categoryId",
        message: "Select category to view keywords:",
        choices: categoryChoices,
      },
    ]);

    if (categoryId === -1) {
      return;
    }

    ConsoleUI.info("Loading keywords for category...");
    const keywords = await keywordService.getKeywordsByCategory(categoryId);

    if (keywords.length === 0) {
      const category = categories.find((c) => c.id === categoryId);
      ConsoleUI.warning(`No keywords found for category "${category?.name}".`);
      await waitForContinue();
      return;
    }

    const category = categories.find((c) => c.id === categoryId);
    ConsoleUI.newLine();
    ConsoleUI.title(`📂 Keywords in "${category?.name}"`);
    displayKeywordsList(keywords);
  } catch (error) {
    ConsoleUI.error(
      `Error viewing keywords by category: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }

  await waitForContinue();
}

/**
 * Bulk activate keywords
 */
async function bulkActivateKeywords(
  keywordService: KeywordService,
  keywords: UserKeyword[]
): Promise<void> {
  const inactive = keywords.filter((k) => !k.isActive);

  if (inactive.length === 0) {
    ConsoleUI.warning("All keywords are already active.");
    await waitForContinue();
    return;
  }

  try {
    const choices = inactive.map((keyword) => ({
      name: `"${keyword.keyword}" (${keyword.categoryName})`,
      value: keyword.id,
    }));

    const { keywordIds } = await inquirer.prompt([
      {
        type: "checkbox",
        name: "keywordIds",
        message: "Select keywords to activate:",
        choices,
        validate: (answer: number[]) => {
          if (answer.length === 0) {
            return "Please select at least one keyword.";
          }
          return true;
        },
      },
    ]);

    ConsoleUI.info(`Activating ${keywordIds.length} keywords...`);

    const updates = keywordIds.map((id: number) => ({
      id,
      updateData: { isActive: true },
    }));

    await keywordService.bulkUpdateKeywords(updates);
    ConsoleUI.success(`Successfully activated ${keywordIds.length} keywords!`);
  } catch (error) {
    ConsoleUI.error(
      `Error activating keywords: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }

  await waitForContinue();
}

/**
 * Bulk deactivate keywords
 */
async function bulkDeactivateKeywords(
  keywordService: KeywordService,
  keywords: UserKeyword[]
): Promise<void> {
  const active = keywords.filter((k) => k.isActive);

  if (active.length === 0) {
    ConsoleUI.warning("All keywords are already inactive.");
    await waitForContinue();
    return;
  }

  try {
    const choices = active.map((keyword) => ({
      name: `"${keyword.keyword}" (${keyword.categoryName})`,
      value: keyword.id,
    }));

    const { keywordIds } = await inquirer.prompt([
      {
        type: "checkbox",
        name: "keywordIds",
        message: "Select keywords to deactivate:",
        choices,
        validate: (answer: number[]) => {
          if (answer.length === 0) {
            return "Please select at least one keyword.";
          }
          return true;
        },
      },
    ]);

    ConsoleUI.info(`Deactivating ${keywordIds.length} keywords...`);

    const updates = keywordIds.map((id: number) => ({
      id,
      updateData: { isActive: false },
    }));

    await keywordService.bulkUpdateKeywords(updates);
    ConsoleUI.success(
      `Successfully deactivated ${keywordIds.length} keywords!`
    );
  } catch (error) {
    ConsoleUI.error(
      `Error deactivating keywords: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }

  await waitForContinue();
}

/**
 * Bulk delete keywords
 */
async function bulkDeleteKeywords(
  keywordService: KeywordService,
  keywords: UserKeyword[]
): Promise<void> {
  try {
    const choices = keywords.map((keyword) => ({
      name: `${keyword.isActive ? "✅" : "❌"} "${keyword.keyword}" (${
        keyword.categoryName
      })`,
      value: keyword.id,
    }));

    const { keywordIds } = await inquirer.prompt([
      {
        type: "checkbox",
        name: "keywordIds",
        message: "Select keywords to delete:",
        choices,
        validate: (answer: number[]) => {
          if (answer.length === 0) {
            return "Please select at least one keyword.";
          }
          return true;
        },
      },
    ]);

    const { confirmed } = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirmed",
        message: `Are you sure you want to delete ${keywordIds.length} keyword(s)? This action cannot be undone.`,
        default: false,
      },
    ]);

    if (confirmed) {
      ConsoleUI.info(`Deleting ${keywordIds.length} keywords...`);

      for (const id of keywordIds) {
        await keywordService.deleteKeyword(id);
      }

      ConsoleUI.success(`Successfully deleted ${keywordIds.length} keywords!`);
    } else {
      ConsoleUI.info("Bulk deletion cancelled.");
    }
  } catch (error) {
    ConsoleUI.error(
      `Error deleting keywords: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }

  await waitForContinue();
}

/**
 * Calculate keyword statistics
 */
function calculateKeywordStats(keywords: UserKeyword[]) {
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const stats = {
    total: keywords.length,
    active: 0,
    inactive: 0,
    activeRate: 0,
    recentKeywords: 0,
    keywordsByCategory: new Map<string, number>(),
  };

  keywords.forEach((keyword) => {
    if (keyword.isActive) {
      stats.active++;
    } else {
      stats.inactive++;
    }

    const createdDate = new Date(keyword.createdAt);
    if (createdDate >= oneWeekAgo) {
      stats.recentKeywords++;
    }

    // Count by category
    const categoryName = keyword.categoryName || "Unknown Category";
    const current = stats.keywordsByCategory.get(categoryName) || 0;
    stats.keywordsByCategory.set(categoryName, current + 1);
  });

  stats.activeRate =
    stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0;

  return stats;
}

/**
 * Format date for display
 */
function formatDate(dateString?: string): string {
  if (!dateString) return "Unknown";

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  } catch {
    return "Invalid Date";
  }
}

async function waitForContinue(): Promise<void> {
  await inquirer.prompt([
    {
      type: "input",
      name: "continue",
      message: "Press Enter to continue...",
    },
  ]);
  ConsoleUI.newLine();
}
