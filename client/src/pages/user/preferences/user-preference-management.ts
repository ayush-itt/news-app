import inquirer from "inquirer";
import { ConsoleUI } from "../../../utils/console-ui";
import { UserPreferenceService } from "../../../services/user-preference.service";
import { UserPreference } from "../../../interfaces/user-preference.interface";

export async function userPreferenceManagementPage(): Promise<void> {
  const preferenceService = new UserPreferenceService();

  while (true) {
    ConsoleUI.newLine();
    ConsoleUI.title("⚙️ My Preferences");

    try {
      const stats = await preferenceService.getPreferenceStats();
      ConsoleUI.info(
        `Category Preferences: ${stats.subscribedCategories} subscribed, ${stats.unsubscribedCategories} unsubscribed`
      );
    } catch (error) {
      // Stats not critical, continue without them
    }

    const choices = [
      { name: "📂 View All Category Preferences", value: "all" },
      { name: "✅ View Subscribed Categories", value: "subscribed" },
      { name: "❌ View Unsubscribed Categories", value: "unsubscribed" },
      { name: "🔧 Manage Category Subscriptions", value: "manage" },
      { name: "📊 Preference Statistics", value: "stats" },
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
          await viewAllPreferences(preferenceService);
          break;
        case "subscribed":
          await viewSubscribedCategories(preferenceService);
          break;
        case "unsubscribed":
          await viewUnsubscribedCategories(preferenceService);
          break;
        case "manage":
          await manageSubscriptions(preferenceService);
          break;
        case "stats":
          await displayPreferenceStats(preferenceService);
          break;
        case "back":
          return;
      }
    } catch (error) {
      ConsoleUI.error(
        `Preference management error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      await waitForContinue();
    }
  }
}

/**
 * Display all user preferences
 */
async function viewAllPreferences(
  preferenceService: UserPreferenceService
): Promise<void> {
  ConsoleUI.newLine();
  ConsoleUI.title("📂 All Category Preferences");

  try {
    ConsoleUI.info("Loading your preferences...");
    const preferences = await preferenceService.getUserPreferences();

    if (preferences.length === 0) {
      ConsoleUI.warning("No category preferences found.");
      await waitForContinue();
      return;
    }

    displayPreferencesList(preferences);

    const choices = [
      { name: "🔧 Change subscriptions", value: "change" },
      { name: "📋 View preference details", value: "details" },
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
      case "change":
        await changeSubscriptionPrompt(preferenceService, preferences);
        break;
      case "details":
        await viewPreferenceDetails(preferences);
        break;
      default:
        return;
    }
  } catch (error) {
    ConsoleUI.error(
      `Error loading preferences: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
    await waitForContinue();
  }
}

/**
 * Display subscribed categories
 */
async function viewSubscribedCategories(
  preferenceService: UserPreferenceService
): Promise<void> {
  ConsoleUI.newLine();
  ConsoleUI.title("✅ My Subscribed Categories");

  try {
    ConsoleUI.info("Loading your subscribed categories...");
    const preferences = await preferenceService.getSubscribedCategories();

    if (preferences.length === 0) {
      ConsoleUI.warning("You haven't subscribed to any categories yet.");
      await waitForContinue();
      return;
    }

    displayPreferencesList(preferences);
  } catch (error) {
    ConsoleUI.error(
      `Error loading subscribed categories: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }

  await waitForContinue();
}

/**
 * Display unsubscribed categories
 */
async function viewUnsubscribedCategories(
  preferenceService: UserPreferenceService
): Promise<void> {
  ConsoleUI.newLine();
  ConsoleUI.title("❌ Unsubscribed Categories");

  try {
    ConsoleUI.info("Loading unsubscribed categories...");
    const preferences = await preferenceService.getUnsubscribedCategories();

    if (preferences.length === 0) {
      ConsoleUI.warning("You are subscribed to all available categories.");
      await waitForContinue();
      return;
    }

    displayPreferencesList(preferences);
  } catch (error) {
    ConsoleUI.error(
      `Error loading unsubscribed categories: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }

  await waitForContinue();
}

/**
 * Manage category subscriptions
 */
async function manageSubscriptions(
  preferenceService: UserPreferenceService
): Promise<void> {
  ConsoleUI.newLine();
  ConsoleUI.title("🔧 Manage Category Subscriptions");

  try {
    ConsoleUI.info("Loading your preferences...");
    const preferences = await preferenceService.getUserPreferences();

    if (preferences.length === 0) {
      ConsoleUI.warning("No categories available for subscription management.");
      await waitForContinue();
      return;
    }

    const choices = [
      { name: "✅ Subscribe to categories", value: "subscribe" },
      { name: "❌ Unsubscribe from categories", value: "unsubscribe" },
      { name: "🔄 Toggle specific subscriptions", value: "toggle" },
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
      case "subscribe":
        await bulkSubscribe(preferenceService, preferences);
        break;
      case "unsubscribe":
        await bulkUnsubscribe(preferenceService, preferences);
        break;
      case "toggle":
        await toggleSubscriptions(preferenceService, preferences);
        break;
      default:
        return;
    }
  } catch (error) {
    ConsoleUI.error(
      `Error managing subscriptions: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
    await waitForContinue();
  }
}

/**
 * Display preference statistics
 */
async function displayPreferenceStats(
  preferenceService: UserPreferenceService
): Promise<void> {
  ConsoleUI.newLine();
  ConsoleUI.title("📊 My Preference Statistics");

  try {
    ConsoleUI.info("Loading preference statistics...");
    const preferences = await preferenceService.getUserPreferences();
    const stats = calculatePreferenceStats(preferences);

    ConsoleUI.success("=== Preference Statistics ===");
    console.log(`Total Categories: ${stats.total}`);
    console.log(`✅ Subscribed: ${stats.subscribed}`);
    console.log(`❌ Unsubscribed: ${stats.unsubscribed}`);
    console.log(`📊 Subscription Rate: ${stats.subscriptionRate}%`);

    if (stats.recentlyUpdated > 0) {
      console.log(`🔄 Recently Updated (This Week): ${stats.recentlyUpdated}`);
    }

    if (stats.categoryBreakdown.size > 0) {
      console.log("\n📂 Category Breakdown:");
      stats.categoryBreakdown.forEach((isSubscribed, categoryName) => {
        const status = isSubscribed ? "✅ Subscribed" : "❌ Unsubscribed";
        console.log(`  ${categoryName}: ${status}`);
      });
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
 * Display a list of preferences
 */
function displayPreferencesList(preferences: UserPreference[]): void {
  console.log("\n" + "=".repeat(80));
  preferences.forEach((preference, index) => {
    const status = preference.isSubscribed
      ? "✅ Subscribed"
      : "❌ Unsubscribed";
    console.log(
      `\n[${index + 1}] ${status} ${
        preference.category?.name || "Unknown Category"
      }`
    );
    console.log(
      `    📝 Description: ${
        preference.category?.description || "No description"
      }`
    );
    console.log(`    🏷️ Slug: ${preference.category?.slug || "N/A"}`);
    console.log(`    🔄 Last Updated: ${formatDate(preference.updatedAt)}`);
    console.log(`    🆔 Category ID: ${preference.categoryId}`);

    if (preference.category?.isActive === false) {
      console.log(`    ⚠️ Status: Inactive Category`);
    }
  });
  console.log("\n" + "=".repeat(80));
}

/**
 * Prompt user to change a subscription
 */
async function changeSubscriptionPrompt(
  preferenceService: UserPreferenceService,
  preferences: UserPreference[]
): Promise<void> {
  try {
    const choices = preferences.map((preference, index) => ({
      name: `[${index + 1}] ${preference.isSubscribed ? "✅" : "❌"} ${
        preference.category?.name || "Unknown Category"
      }`,
      value: preference.categoryId,
    }));

    choices.push({ name: "🔙 Cancel", value: -1 });

    const { categoryId } = await inquirer.prompt([
      {
        type: "list",
        name: "categoryId",
        message: "Select category to change subscription:",
        choices,
      },
    ]);

    if (categoryId === -1) {
      return;
    }

    const preference = preferences.find((p) => p.categoryId === categoryId);
    if (!preference) {
      ConsoleUI.error("Category preference not found.");
      await waitForContinue();
      return;
    }

    const currentStatus = preference.isSubscribed
      ? "subscribed"
      : "unsubscribed";
    const newStatus = preference.isSubscribed ? "unsubscribe" : "subscribe";

    const { confirmed } = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirmed",
        message: `You are currently ${currentStatus} to "${preference.category?.name}". Do you want to ${newStatus}?`,
        default: true,
      },
    ]);

    if (confirmed) {
      ConsoleUI.info(`Updating subscription...`);
      await preferenceService.updatePreference(
        categoryId,
        !preference.isSubscribed
      );
      ConsoleUI.success(
        `Successfully ${newStatus}d to "${preference.category?.name}"!`
      );
    } else {
      ConsoleUI.info("Subscription change cancelled.");
    }
  } catch (error) {
    ConsoleUI.error(
      `Error changing subscription: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }

  await waitForContinue();
}

/**
 * View detailed information about a preference
 */
async function viewPreferenceDetails(
  preferences: UserPreference[]
): Promise<void> {
  try {
    const choices = preferences.map((preference, index) => ({
      name: `[${index + 1}] ${preference.isSubscribed ? "✅" : "❌"} ${
        preference.category?.name || "Unknown Category"
      }`,
      value: preference.id,
    }));

    choices.push({ name: "🔙 Cancel", value: -1 });

    const { preferenceId } = await inquirer.prompt([
      {
        type: "list",
        name: "preferenceId",
        message: "Select preference to view details:",
        choices,
      },
    ]);

    if (preferenceId === -1) {
      return;
    }

    const preference = preferences.find((p) => p.id === preferenceId);
    if (!preference) {
      ConsoleUI.error("Preference not found.");
      await waitForContinue();
      return;
    }

    ConsoleUI.newLine();
    ConsoleUI.title("📋 Preference Details");

    const status = preference.isSubscribed
      ? "✅ Subscribed"
      : "❌ Unsubscribed";
    console.log(`${status} ${preference.category?.name || "Unknown Category"}`);
    console.log(
      `📝 Description: ${preference.category?.description || "No description"}`
    );
    console.log(`🏷️ Slug: ${preference.category?.slug || "N/A"}`);
    console.log(`🆔 Category ID: ${preference.categoryId}`);
    console.log(`🆔 Preference ID: ${preference.id}`);
    console.log(`📅 Created: ${formatDate(preference.createdAt)}`);
    console.log(`🔄 Last Updated: ${formatDate(preference.updatedAt)}`);

    if (preference.category?.isActive === false) {
      console.log(`⚠️ Category Status: Inactive`);
    } else {
      console.log(`✅ Category Status: Active`);
    }
  } catch (error) {
    ConsoleUI.error(
      `Error viewing preference details: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }

  await waitForContinue();
}

/**
 * Bulk subscribe to categories
 */
async function bulkSubscribe(
  preferenceService: UserPreferenceService,
  preferences: UserPreference[]
): Promise<void> {
  const unsubscribed = preferences.filter((p) => !p.isSubscribed);

  if (unsubscribed.length === 0) {
    ConsoleUI.warning(
      "You are already subscribed to all available categories."
    );
    await waitForContinue();
    return;
  }

  try {
    const choices = unsubscribed.map((preference, index) => ({
      name: `${preference.category?.name || "Unknown Category"}`,
      value: preference.categoryId,
    }));

    const { categoryIds } = await inquirer.prompt([
      {
        type: "checkbox",
        name: "categoryIds",
        message: "Select categories to subscribe to:",
        choices,
        validate: (answer: number[]) => {
          if (answer.length === 0) {
            return "Please select at least one category.";
          }
          return true;
        },
      },
    ]);

    ConsoleUI.info(`Subscribing to ${categoryIds.length} categories...`);

    const updates = categoryIds.map((categoryId: number) => ({
      categoryId,
      isSubscribed: true,
    }));

    await preferenceService.bulkUpdatePreferences(updates);
    ConsoleUI.success(
      `Successfully subscribed to ${categoryIds.length} categories!`
    );
  } catch (error) {
    ConsoleUI.error(
      `Error subscribing to categories: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }

  await waitForContinue();
}

/**
 * Bulk unsubscribe from categories
 */
async function bulkUnsubscribe(
  preferenceService: UserPreferenceService,
  preferences: UserPreference[]
): Promise<void> {
  const subscribed = preferences.filter((p) => p.isSubscribed);

  if (subscribed.length === 0) {
    ConsoleUI.warning("You are not subscribed to any categories.");
    await waitForContinue();
    return;
  }

  try {
    const choices = subscribed.map((preference, index) => ({
      name: `${preference.category?.name || "Unknown Category"}`,
      value: preference.categoryId,
    }));

    const { categoryIds } = await inquirer.prompt([
      {
        type: "checkbox",
        name: "categoryIds",
        message: "Select categories to unsubscribe from:",
        choices,
        validate: (answer: number[]) => {
          if (answer.length === 0) {
            return "Please select at least one category.";
          }
          return true;
        },
      },
    ]);

    ConsoleUI.info(`Unsubscribing from ${categoryIds.length} categories...`);

    const updates = categoryIds.map((categoryId: number) => ({
      categoryId,
      isSubscribed: false,
    }));

    await preferenceService.bulkUpdatePreferences(updates);
    ConsoleUI.success(
      `Successfully unsubscribed from ${categoryIds.length} categories!`
    );
  } catch (error) {
    ConsoleUI.error(
      `Error unsubscribing from categories: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }

  await waitForContinue();
}

/**
 * Toggle specific subscriptions
 */
async function toggleSubscriptions(
  preferenceService: UserPreferenceService,
  preferences: UserPreference[]
): Promise<void> {
  try {
    const choices = preferences.map((preference, index) => ({
      name: `${preference.isSubscribed ? "✅" : "❌"} ${
        preference.category?.name || "Unknown Category"
      }`,
      value: preference.categoryId,
      checked: preference.isSubscribed,
    }));

    const { categoryIds } = await inquirer.prompt([
      {
        type: "checkbox",
        name: "categoryIds",
        message: "Toggle subscriptions (✅ = subscribed, ❌ = unsubscribed):",
        choices,
      },
    ]);

    ConsoleUI.info("Updating subscriptions...");

    const updates = preferences.map((preference) => ({
      categoryId: preference.categoryId,
      isSubscribed: categoryIds.includes(preference.categoryId),
    }));

    const changedUpdates = updates.filter((update) => {
      const currentPreference = preferences.find(
        (p) => p.categoryId === update.categoryId
      );
      return currentPreference?.isSubscribed !== update.isSubscribed;
    });

    if (changedUpdates.length === 0) {
      ConsoleUI.warning("No changes were made to your subscriptions.");
      await waitForContinue();
      return;
    }

    await preferenceService.bulkUpdatePreferences(changedUpdates);
    ConsoleUI.success(
      `Successfully updated ${changedUpdates.length} subscription(s)!`
    );
  } catch (error) {
    ConsoleUI.error(
      `Error toggling subscriptions: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }

  await waitForContinue();
}

/**
 * Calculate preference statistics
 */
function calculatePreferenceStats(preferences: UserPreference[]) {
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const stats = {
    total: preferences.length,
    subscribed: 0,
    unsubscribed: 0,
    subscriptionRate: 0,
    recentlyUpdated: 0,
    categoryBreakdown: new Map<string, boolean>(),
  };

  preferences.forEach((preference) => {
    if (preference.isSubscribed) {
      stats.subscribed++;
    } else {
      stats.unsubscribed++;
    }

    const updatedDate = new Date(preference.updatedAt);
    if (updatedDate >= oneWeekAgo) {
      stats.recentlyUpdated++;
    }

    // Category breakdown
    const categoryName = preference.category?.name || "Unknown Category";
    stats.categoryBreakdown.set(categoryName, preference.isSubscribed);
  });

  stats.subscriptionRate =
    stats.total > 0 ? Math.round((stats.subscribed / stats.total) * 100) : 0;

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
