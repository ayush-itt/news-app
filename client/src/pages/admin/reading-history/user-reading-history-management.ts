import inquirer from "inquirer";
import { ConsoleUI } from "../../../utils/console-ui";
import { UserReadingHistoryService } from "../../../services/admin/user-reading-history.service";
import {
  UserReadingHistory,
  ReadingHistoryListResponse,
  GetReadingHistoryQuery,
} from "../../../interfaces";

export async function userReadingHistoryManagementPage(): Promise<void> {
  const readingHistoryService = new UserReadingHistoryService();

  while (true) {
    ConsoleUI.newLine();
    ConsoleUI.title("📚 User Reading History Analytics");

    const choices = [
      { name: "📖 View All Users Reading History", value: "list" },
      { name: "🔍 Search by User ID", value: "search" },
      { name: "📅 Filter by Date Range", value: "filter" },
      { name: "📊 View Reading Statistics", value: "stats" },
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
        case "list":
          await viewAllReadingHistory(readingHistoryService);
          break;
        case "search":
          await searchByUserId(readingHistoryService);
          break;
        case "filter":
          await filterByDateRange(readingHistoryService);
          break;
        case "stats":
          await viewReadingStatistics(readingHistoryService);
          break;
        case "back":
          return;
      }
    } catch (error) {
      ConsoleUI.error(
        "Reading history management error: " + (error as Error).message
      );
      await waitForContinue();
    }
  }
}

async function viewAllReadingHistory(
  readingHistoryService: UserReadingHistoryService,
  query: GetReadingHistoryQuery = { page: 1, limit: 10 }
): Promise<void> {
  try {
    ConsoleUI.info("Loading reading history...");
    const response = await readingHistoryService.getAllUsersReadingHistory(
      query
    );

    if (response.history.length === 0) {
      ConsoleUI.warning("No reading history found.");
      await waitForContinue();
      return;
    }

    displayReadingHistoryList(response);
    await handlePagination(response, query, (newQuery) =>
      viewAllReadingHistory(readingHistoryService, newQuery)
    );
  } catch (error) {
    ConsoleUI.error(
      "Failed to load reading history: " + (error as Error).message
    );
    await waitForContinue();
  }
}

async function searchByUserId(
  readingHistoryService: UserReadingHistoryService
): Promise<void> {
  try {
    const { userId } = await inquirer.prompt([
      {
        type: "number",
        name: "userId",
        message: "Enter User ID:",
        validate: (input: number) =>
          input > 0 || "Please enter a valid user ID",
      },
    ]);

    ConsoleUI.info(`Searching reading history for user ID: ${userId}...`);
    const response = await readingHistoryService.getAllUsersReadingHistory({
      userId,
      page: 1,
      limit: 10,
    });

    if (response.history.length === 0) {
      ConsoleUI.warning(`No reading history found for user ID: ${userId}`);
      await waitForContinue();
      return;
    }

    displayReadingHistoryList(response);
    await handlePagination(
      response,
      { userId, page: 1, limit: 10 },
      (newQuery) => viewAllReadingHistory(readingHistoryService, newQuery)
    );
  } catch (error) {
    ConsoleUI.error(
      "Failed to search reading history: " + (error as Error).message
    );
    await waitForContinue();
  }
}

async function filterByDateRange(
  readingHistoryService: UserReadingHistoryService
): Promise<void> {
  try {
    const { startDate, endDate } = await inquirer.prompt([
      {
        type: "input",
        name: "startDate",
        message: "Enter start date (YYYY-MM-DD) or press Enter to skip:",
      },
      {
        type: "input",
        name: "endDate",
        message: "Enter end date (YYYY-MM-DD) or press Enter to skip:",
      },
    ]);

    const query: GetReadingHistoryQuery = { page: 1, limit: 10 };

    if (startDate.trim()) {
      query.startDate = new Date(startDate.trim()).toISOString();
    }

    if (endDate.trim()) {
      query.endDate = new Date(endDate.trim()).toISOString();
    }

    if (!startDate.trim() && !endDate.trim()) {
      ConsoleUI.warning(
        "No date range specified. Showing all reading history."
      );
    }

    const response = await readingHistoryService.getAllUsersReadingHistory(
      query
    );

    if (response.history.length === 0) {
      ConsoleUI.warning(
        "No reading history found for the specified date range."
      );
      await waitForContinue();
      return;
    }

    displayReadingHistoryList(response);
    await handlePagination(response, query, (newQuery) =>
      viewAllReadingHistory(readingHistoryService, newQuery)
    );
  } catch (error) {
    ConsoleUI.error(
      "Failed to filter reading history: " + (error as Error).message
    );
    await waitForContinue();
  }
}

async function viewReadingStatistics(
  readingHistoryService: UserReadingHistoryService
): Promise<void> {
  try {
    ConsoleUI.info("Generating reading statistics...");

    // Get recent reading data to generate statistics
    const response = await readingHistoryService.getAllUsersReadingHistory({
      page: 1,
      limit: 100,
    });

    if (response.history.length === 0) {
      ConsoleUI.warning("No reading history available for statistics.");
      await waitForContinue();
      return;
    }

    // Calculate statistics
    const stats = calculateReadingStatistics(response.history);

    ConsoleUI.newLine();
    ConsoleUI.title("📊 Reading Statistics");
    ConsoleUI.separator();

    console.log(`📈 Total Reading Sessions: ${response.total}`);
    console.log(`👥 Unique Users: ${stats.uniqueUsers}`);
    console.log(`📰 Unique Articles: ${stats.uniqueArticles}`);
    console.log(
      `🏆 Most Active User: ${stats.mostActiveUser} (${stats.mostActiveUserCount} reads)`
    );
    console.log(
      `📖 Most Read Article: ${stats.mostReadArticle} (${stats.mostReadArticleCount} times)`
    );
    console.log(
      `📊 Average Reads per User: ${stats.avgReadsPerUser.toFixed(2)}`
    );

    if (stats.topCategories.length > 0) {
      ConsoleUI.newLine();
      console.log("📚 Top Categories:");
      stats.topCategories.forEach((cat: any, index: number) => {
        console.log(`  ${index + 1}. ${cat.name}: ${cat.count} reads`);
      });
    }

    if (stats.topSources.length > 0) {
      ConsoleUI.newLine();
      console.log("📰 Top News Sources:");
      stats.topSources.forEach((source: any, index: number) => {
        console.log(`  ${index + 1}. ${source.name}: ${source.count} reads`);
      });
    }

    await waitForContinue();
  } catch (error) {
    ConsoleUI.error(
      "Failed to generate statistics: " + (error as Error).message
    );
    await waitForContinue();
  }
}

function displayReadingHistoryList(response: ReadingHistoryListResponse): void {
  ConsoleUI.newLine();
  ConsoleUI.title(
    `📖 Reading History (Page ${response.page} of ${response.totalPages})`
  );
  console.log(`Total entries: ${response.total}`);
  ConsoleUI.separator();

  response.history.forEach((entry, index) => {
    const user = entry.user || { username: "Unknown", email: "N/A" };
    const article = entry.article || {
      title: "Unknown Article",
      source: "Unknown",
    };
    const readDate = new Date(entry.createdAt).toLocaleString();

    console.log(`${index + 1}. 👤 User: ${user.username} (${user.email})`);
    console.log(`   📰 Article: "${article.title}" from ${article.source}`);
    console.log(`   📅 Read on: ${readDate}`);

    if (entry.article?.categories && entry.article.categories.length > 0) {
      const categories = entry.article.categories
        .map((cat: any) => cat.name)
        .join(", ");
      console.log(`   🏷️ Categories: ${categories}`);
    }

    ConsoleUI.separator();
  });
}

async function handlePagination(
  response: ReadingHistoryListResponse,
  currentQuery: GetReadingHistoryQuery,
  fetchFunction: (query: GetReadingHistoryQuery) => Promise<void>
): Promise<void> {
  if (response.totalPages <= 1) {
    await waitForContinue();
    return;
  }

  const choices = [];

  if (response.page > 1) {
    choices.push({ name: "⬅️ Previous Page", value: "prev" });
  }
  if (response.page < response.totalPages) {
    choices.push({ name: "➡️ Next Page", value: "next" });
  }
  choices.push({ name: "📄 Go to Specific Page", value: "goto" });
  choices.push({ name: "✅ Continue", value: "continue" });

  const { action } = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: `Page ${response.page} of ${response.totalPages} - Choose action:`,
      choices,
    },
  ]);

  switch (action) {
    case "prev":
      if (response.page > 1) {
        await fetchFunction({ ...currentQuery, page: response.page - 1 });
      }
      break;
    case "next":
      if (response.page < response.totalPages) {
        await fetchFunction({ ...currentQuery, page: response.page + 1 });
      }
      break;
    case "goto":
      const { pageNumber } = await inquirer.prompt([
        {
          type: "number",
          name: "pageNumber",
          message: `Enter page number (1-${response.totalPages}):`,
          validate: (input: number) =>
            (input >= 1 && input <= response.totalPages) ||
            `Please enter a number between 1 and ${response.totalPages}`,
        },
      ]);
      await fetchFunction({ ...currentQuery, page: pageNumber });
      break;
    case "continue":
      break;
  }
}

function calculateReadingStatistics(history: UserReadingHistory[]): any {
  const userMap = new Map<number, number>();
  const articleMap = new Map<number, number>();
  const categoryMap = new Map<string, number>();
  const sourceMap = new Map<string, number>();

  history.forEach((entry) => {
    // Count reads per user
    userMap.set(entry.userId, (userMap.get(entry.userId) || 0) + 1);

    // Count reads per article
    articleMap.set(entry.articleId, (articleMap.get(entry.articleId) || 0) + 1);

    // Count reads per category
    if (entry.article?.categories) {
      entry.article.categories.forEach((category) => {
        categoryMap.set(
          category.name,
          (categoryMap.get(category.name) || 0) + 1
        );
      });
    }

    // Count reads per source
    if (entry.article?.source) {
      sourceMap.set(
        entry.article.source,
        (sourceMap.get(entry.article.source) || 0) + 1
      );
    }
  });

  // Find most active user
  let mostActiveUser = "N/A";
  let mostActiveUserCount = 0;
  userMap.forEach((count, userId) => {
    if (count > mostActiveUserCount) {
      mostActiveUserCount = count;
      // Try to find username from the data
      const userEntry = history.find((h) => h.userId === userId);
      mostActiveUser = userEntry?.user?.username || `User #${userId}`;
    }
  });

  // Find most read article
  let mostReadArticle = "N/A";
  let mostReadArticleCount = 0;
  articleMap.forEach((count, articleId) => {
    if (count > mostReadArticleCount) {
      mostReadArticleCount = count;
      const articleEntry = history.find((h) => h.articleId === articleId);
      mostReadArticle = articleEntry?.article?.title || `Article #${articleId}`;
    }
  });

  // Top categories
  const topCategories = Array.from(categoryMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Top sources
  const topSources = Array.from(sourceMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    uniqueUsers: userMap.size,
    uniqueArticles: articleMap.size,
    mostActiveUser,
    mostActiveUserCount,
    mostReadArticle,
    mostReadArticleCount,
    avgReadsPerUser: history.length / userMap.size,
    topCategories,
    topSources,
  };
}

async function waitForContinue(): Promise<void> {
  await inquirer.prompt([
    {
      type: "input",
      name: "continue",
      message: "Press Enter to continue...",
    },
  ]);
}
