import inquirer from "inquirer";
import { ConsoleUI } from "../../../utils/console-ui";
import { BookmarkService } from "../../../services/bookmark.service";
import { UserBookmark } from "../../../interfaces/bookmark.interface";

export async function bookmarkManagementPage(): Promise<void> {
  const bookmarkService = new BookmarkService();

  while (true) {
    ConsoleUI.newLine();
    ConsoleUI.title("📚 My Bookmarks");

    try {
      const stats = await bookmarkService.getBookmarkStats();
      ConsoleUI.info(`Total Bookmarks: ${stats.totalBookmarks}`);
    } catch (error) {
      // Stats not critical, continue without them
    }

    const choices = [
      { name: "📖 View All Bookmarks", value: "view" },
      { name: "🔍 Search Bookmarks", value: "search" },
      { name: "📊 Bookmark Statistics", value: "stats" },
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
        case "view":
          await viewAllBookmarks(bookmarkService);
          break;
        case "search":
          await searchBookmarks(bookmarkService);
          break;
        case "stats":
          await displayBookmarkStats(bookmarkService);
          break;
        case "back":
          return;
      }
    } catch (error) {
      ConsoleUI.error(
        `Bookmark management error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      await waitForContinue();
    }
  }
}

/**
 * Display all user bookmarks
 */
async function viewAllBookmarks(
  bookmarkService: BookmarkService
): Promise<void> {
  ConsoleUI.newLine();
  ConsoleUI.title("📖 All My Bookmarks");

  try {
    ConsoleUI.info("Loading your bookmarks...");
    const bookmarks = await bookmarkService.getUserBookmarks();

    if (bookmarks.length === 0) {
      ConsoleUI.warning("You haven't saved any bookmarks yet.");
      await waitForContinue();
      return;
    }

    displayBookmarksList(bookmarks);

    const choices = [
      { name: "🗑️ Remove a bookmark", value: "remove" },
      { name: "📋 View bookmark details", value: "details" },
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
      case "remove":
        await removeBookmarkPrompt(bookmarkService, bookmarks);
        break;
      case "details":
        await viewBookmarkDetails(bookmarks);
        break;
      default:
        return;
    }
  } catch (error) {
    ConsoleUI.error(
      `Error loading bookmarks: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
    await waitForContinue();
  }
}

/**
 * Search bookmarks by title
 */
async function searchBookmarks(
  bookmarkService: BookmarkService
): Promise<void> {
  ConsoleUI.newLine();
  ConsoleUI.title("🔍 Search Bookmarks");

  try {
    const { searchTerm } = await inquirer.prompt([
      {
        type: "input",
        name: "searchTerm",
        message: "Enter search term (article title):",
        validate: (input: string) => {
          if (!input.trim()) {
            return "Search term cannot be empty.";
          }
          return true;
        },
      },
    ]);

    ConsoleUI.info("Searching your bookmarks...");
    const allBookmarks = await bookmarkService.getUserBookmarks();

    const filteredBookmarks = allBookmarks.filter((bookmark: UserBookmark) =>
      bookmark.article?.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filteredBookmarks.length === 0) {
      ConsoleUI.warning(`No bookmarks found containing "${searchTerm}".`);
      await waitForContinue();
      return;
    }

    ConsoleUI.success(`Found ${filteredBookmarks.length} bookmark(s):`);
    displayBookmarksList(filteredBookmarks);
  } catch (error) {
    ConsoleUI.error(
      `Error searching bookmarks: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }

  await waitForContinue();
}

/**
 * Display bookmark statistics
 */
async function displayBookmarkStats(
  bookmarkService: BookmarkService
): Promise<void> {
  ConsoleUI.newLine();
  ConsoleUI.title("📊 Bookmark Statistics");

  try {
    ConsoleUI.info("Loading bookmark statistics...");
    const bookmarks = await bookmarkService.getUserBookmarks();
    const stats = calculateBookmarkStats(bookmarks);

    ConsoleUI.success("=== Bookmark Statistics ===");
    console.log(`Total Bookmarks: ${stats.total}`);
    console.log(`Bookmarks This Month: ${stats.thisMonth}`);
    console.log(`Bookmarks This Week: ${stats.thisWeek}`);

    if (stats.categoryCounts.size > 0) {
      console.log("\n📂 Bookmarks by Category:");
      stats.categoryCounts.forEach((count, category) => {
        console.log(`  ${category}: ${count}`);
      });
    }

    if (stats.sourceCounts.size > 0) {
      console.log("\n📰 Bookmarks by Source:");
      stats.sourceCounts.forEach((count, source) => {
        console.log(`  ${source}: ${count}`);
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
 * Display a list of bookmarks
 */
function displayBookmarksList(bookmarks: UserBookmark[]): void {
  console.log("\n" + "=".repeat(80));
  bookmarks.forEach((bookmark, index) => {
    console.log(
      `\n[${index + 1}] 📚 ${bookmark.article?.title || "Unknown Title"}`
    );
    console.log(`    📰 Source: ${bookmark.article?.source || "Unknown"}`);
    console.log(
      `    📅 Published: ${formatDate(bookmark.article?.publishedAt)}`
    );
    console.log(`    ⭐ Bookmarked: ${formatDate(bookmark.createdAt)}`);

    if (
      bookmark.article?.categories &&
      bookmark.article.categories.length > 0
    ) {
      console.log(
        `    📂 Categories: ${bookmark.article.categories
          .map((cat: any) => cat.name)
          .join(", ")}`
      );
    }

    console.log(`    🆔 Bookmark ID: ${bookmark.id}`);
  });
  console.log("\n" + "=".repeat(80));
}

/**
 * Prompt user to remove a bookmark
 */
async function removeBookmarkPrompt(
  bookmarkService: BookmarkService,
  bookmarks: UserBookmark[]
): Promise<void> {
  try {
    const choices = bookmarks.map((bookmark, index) => ({
      name: `[${index + 1}] ${bookmark.article?.title || "Unknown Title"}`,
      value: bookmark.id,
    }));

    choices.push({ name: "🔙 Cancel", value: -1 });

    const { bookmarkId } = await inquirer.prompt([
      {
        type: "list",
        name: "bookmarkId",
        message: "Select bookmark to remove:",
        choices,
      },
    ]);

    if (bookmarkId === -1) {
      return;
    }

    const bookmark = bookmarks.find((b) => b.id === bookmarkId);
    if (!bookmark) {
      ConsoleUI.error("Bookmark not found.");
      await waitForContinue();
      return;
    }

    const { confirmed } = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirmed",
        message: `Are you sure you want to remove "${bookmark.article?.title}"?`,
        default: false,
      },
    ]);

    if (confirmed) {
      await bookmarkService.removeBookmark(bookmark.articleId);
      ConsoleUI.success("Bookmark removed successfully!");
    } else {
      ConsoleUI.info("Bookmark removal cancelled.");
    }
  } catch (error) {
    ConsoleUI.error(
      `Error removing bookmark: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }

  await waitForContinue();
}

/**
 * View detailed information about a bookmark
 */
async function viewBookmarkDetails(bookmarks: UserBookmark[]): Promise<void> {
  try {
    const choices = bookmarks.map((bookmark, index) => ({
      name: `[${index + 1}] ${bookmark.article?.title || "Unknown Title"}`,
      value: bookmark.id,
    }));

    choices.push({ name: "🔙 Cancel", value: -1 });

    const { bookmarkId } = await inquirer.prompt([
      {
        type: "list",
        name: "bookmarkId",
        message: "Select bookmark to view details:",
        choices,
      },
    ]);

    if (bookmarkId === -1) {
      return;
    }

    const bookmark = bookmarks.find((b) => b.id === bookmarkId);
    if (!bookmark) {
      ConsoleUI.error("Bookmark not found.");
      await waitForContinue();
      return;
    }

    ConsoleUI.newLine();
    ConsoleUI.title("📚 Bookmark Details");

    console.log(`📰 Article: ${bookmark.article?.title || "Unknown Title"}`);
    console.log(`🆔 Article ID: ${bookmark.articleId}`);
    console.log(`📰 Source: ${bookmark.article?.source || "Unknown"}`);
    console.log(`📅 Published: ${formatDate(bookmark.article?.publishedAt)}`);
    console.log(`⭐ Bookmarked: ${formatDate(bookmark.createdAt)}`);
    console.log(`🆔 Bookmark ID: ${bookmark.id}`);

    if (
      bookmark.article?.categories &&
      bookmark.article.categories.length > 0
    ) {
      console.log(
        `📂 Categories: ${bookmark.article.categories
          .map((cat: any) => cat.name)
          .join(", ")}`
      );
    }
  } catch (error) {
    ConsoleUI.error(
      `Error viewing bookmark details: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }

  await waitForContinue();
}

/**
 * Calculate bookmark statistics
 */
function calculateBookmarkStats(bookmarks: UserBookmark[]) {
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const stats = {
    total: bookmarks.length,
    thisWeek: 0,
    thisMonth: 0,
    categoryCounts: new Map<string, number>(),
    sourceCounts: new Map<string, number>(),
  };

  bookmarks.forEach((bookmark) => {
    const createdDate = new Date(bookmark.createdAt);

    if (createdDate >= oneWeekAgo) {
      stats.thisWeek++;
    }

    if (createdDate >= oneMonthAgo) {
      stats.thisMonth++;
    }

    // Count categories
    bookmark.article?.categories?.forEach((category: any) => {
      const current = stats.categoryCounts.get(category.name) || 0;
      stats.categoryCounts.set(category.name, current + 1);
    });

    // Count sources
    const source = bookmark.article?.source || "Unknown";
    const currentSource = stats.sourceCounts.get(source) || 0;
    stats.sourceCounts.set(source, currentSource + 1);
  });

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
