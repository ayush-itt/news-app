import inquirer from "inquirer";
import { ConsoleUI } from "../../../utils/console-ui";
import { UserReadingHistoryService } from "../../../services/admin/user-reading-history.service";
import {
  UserReadingHistory,
  ReadingHistoryListResponse,
  GetReadingHistoryQuery,
} from "../../../interfaces";

export async function userReadingHistoryPage(): Promise<void> {
  const readingHistoryService = new UserReadingHistoryService();

  while (true) {
    ConsoleUI.newLine();
    ConsoleUI.title("📚 My Reading History");

    const choices = [
      { name: "📖 View Reading History", value: "list" },
      { name: "📅 Filter by Date Range", value: "filter" },
      { name: "📊 Reading Statistics", value: "stats" },
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
          await viewMyReadingHistory(readingHistoryService);
          break;
        case "filter":
          await filterMyReadingHistoryByDate(readingHistoryService);
          break;
        case "stats":
          await viewMyReadingStatistics(readingHistoryService);
          break;
        case "back":
          return;
      }
    } catch (error) {
      ConsoleUI.error("Reading history error: " + (error as Error).message);
      await waitForContinue();
    }
  }
}

async function viewMyReadingHistory(
  readingHistoryService: UserReadingHistoryService,
  query: GetReadingHistoryQuery = { page: 1, limit: 10 }
): Promise<void> {
  try {
    ConsoleUI.info("Loading your reading history...");
    const response = await readingHistoryService.getUserReadingHistory(query);

    if (response.history.length === 0) {
      ConsoleUI.warning(
        "No reading history found. Start reading some articles!"
      );
      await waitForContinue();
      return;
    }

    displayMyReadingHistoryList(response);
    await handleMyHistoryPagination(response, query, (newQuery) =>
      viewMyReadingHistory(readingHistoryService, newQuery)
    );
  } catch (error) {
    ConsoleUI.error(
      "Failed to load reading history: " + (error as Error).message
    );
    await waitForContinue();
  }
}

async function filterMyReadingHistoryByDate(
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

    const response = await readingHistoryService.getUserReadingHistory(query);

    if (response.history.length === 0) {
      ConsoleUI.warning(
        "No reading history found for the specified date range."
      );
      await waitForContinue();
      return;
    }

    displayMyReadingHistoryList(response);
    await handleMyHistoryPagination(response, query, (newQuery) =>
      viewMyReadingHistory(readingHistoryService, newQuery)
    );
  } catch (error) {
    ConsoleUI.error(
      "Failed to filter reading history: " + (error as Error).message
    );
    await waitForContinue();
  }
}

async function viewMyReadingStatistics(
  readingHistoryService: UserReadingHistoryService
): Promise<void> {
  try {
    ConsoleUI.info("Generating your reading statistics...");

    // Get user's reading data
    const response = await readingHistoryService.getUserReadingHistory({
      page: 1,
      limit: 100,
    });

    if (response.history.length === 0) {
      ConsoleUI.warning(
        "No reading history available for statistics. Start reading some articles!"
      );
      await waitForContinue();
      return;
    }

    // Calculate user's personal statistics
    const stats = calculateMyReadingStatistics(response.history);

    ConsoleUI.newLine();
    ConsoleUI.title("📊 Your Reading Statistics");
    ConsoleUI.separator();

    console.log(`📈 Total Articles Read: ${response.total}`);
    console.log(`📅 Reading Days: ${stats.readingDays}`);
    console.log(
      `📊 Average Articles per Day: ${stats.avgArticlesPerDay.toFixed(2)}`
    );
    console.log(
      `🏆 Most Active Day: ${stats.mostActiveDay} (${stats.mostActiveDayCount} articles)`
    );

    if (stats.favoriteCategories.length > 0) {
      ConsoleUI.newLine();
      console.log("📚 Your Favorite Categories:");
      stats.favoriteCategories.forEach((cat: any, index: number) => {
        console.log(
          `  ${index + 1}. ${cat.name}: ${
            cat.count
          } articles (${cat.percentage.toFixed(1)}%)`
        );
      });
    }

    if (stats.favoriteSources.length > 0) {
      ConsoleUI.newLine();
      console.log("📰 Your Favorite News Sources:");
      stats.favoriteSources.forEach((source: any, index: number) => {
        console.log(
          `  ${index + 1}. ${source.name}: ${
            source.count
          } articles (${source.percentage.toFixed(1)}%)`
        );
      });
    }

    if (stats.recentTrend) {
      ConsoleUI.newLine();
      console.log(`📈 Recent Reading Trend: ${stats.recentTrend}`);
    }

    await waitForContinue();
  } catch (error) {
    ConsoleUI.error(
      "Failed to generate statistics: " + (error as Error).message
    );
    await waitForContinue();
  }
}

function displayMyReadingHistoryList(
  response: ReadingHistoryListResponse
): void {
  ConsoleUI.newLine();
  ConsoleUI.title(
    `📖 Your Reading History (Page ${response.page} of ${response.totalPages})`
  );
  console.log(`Total articles read: ${response.total}`);
  ConsoleUI.separator();

  response.history.forEach((entry, index) => {
    const article = entry.article || {
      title: "Unknown Article",
      source: "Unknown",
    };
    const readDate = new Date(entry.createdAt).toLocaleString();

    console.log(`${index + 1}. 📰 "${article.title}"`);
    console.log(`   🌐 Source: ${article.source}`);
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

async function handleMyHistoryPagination(
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

function calculateMyReadingStatistics(history: UserReadingHistory[]): any {
  const categoryMap = new Map<string, number>();
  const sourceMap = new Map<string, number>();
  const dayMap = new Map<string, number>();

  history.forEach((entry) => {
    // Count reads per day
    const dayKey = new Date(entry.createdAt).toDateString();
    dayMap.set(dayKey, (dayMap.get(dayKey) || 0) + 1);

    // Count reads per category
    if (entry.article?.categories) {
      entry.article.categories.forEach((category: any) => {
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

  // Find most active day
  let mostActiveDay = "N/A";
  let mostActiveDayCount = 0;
  dayMap.forEach((count, day) => {
    if (count > mostActiveDayCount) {
      mostActiveDayCount = count;
      mostActiveDay = new Date(day).toLocaleDateString();
    }
  });

  // Calculate average articles per day
  const avgArticlesPerDay = dayMap.size > 0 ? history.length / dayMap.size : 0;

  // Top categories with percentages
  const favoriteCategories = Array.from(categoryMap.entries())
    .map(([name, count]) => ({
      name,
      count,
      percentage: (count / history.length) * 100,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Top sources with percentages
  const favoriteSources = Array.from(sourceMap.entries())
    .map(([name, count]) => ({
      name,
      count,
      percentage: (count / history.length) * 100,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Calculate recent trend (last 7 days vs previous 7 days)
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const recentReads = history.filter(
    (entry) => new Date(entry.createdAt) >= sevenDaysAgo
  ).length;

  const previousReads = history.filter(
    (entry) =>
      new Date(entry.createdAt) >= fourteenDaysAgo &&
      new Date(entry.createdAt) < sevenDaysAgo
  ).length;

  let recentTrend = "";
  if (recentReads > previousReads) {
    recentTrend = `📈 Increasing (${recentReads} vs ${previousReads} articles)`;
  } else if (recentReads < previousReads) {
    recentTrend = `📉 Decreasing (${recentReads} vs ${previousReads} articles)`;
  } else {
    recentTrend = `➡️ Stable (${recentReads} articles per week)`;
  }

  return {
    readingDays: dayMap.size,
    avgArticlesPerDay,
    mostActiveDay,
    mostActiveDayCount,
    favoriteCategories,
    favoriteSources,
    recentTrend,
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
