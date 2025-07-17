import inquirer from "inquirer";
import { ConsoleUI } from "../../../utils/console-ui";
import { ArticleService } from "../../../services/article.service";
import { ReactionService } from "../../../services/reaction.service";
import {
  IArticle,
  PaginatedArticleResponse,
  ArticleQuery,
  CreateArticleReportDto,
  ReactionType,
} from "../../../interfaces";
import { BookmarkService } from "../../../services/bookmark.service";
import { ArticleReportService } from "../../../services/article-report.service";

export async function articleBrowsingPage(): Promise<void> {
  const articleService = new ArticleService();

  while (true) {
    ConsoleUI.newLine();
    ConsoleUI.title("📰 Article Browsing");

    const choices = [
      { name: "📄 Browse All Articles", value: "browse" },
      { name: "🔍 Search Articles", value: "search" },
      { name: "📂 Browse by Category", value: "category" },
      { name: "🔧 Advanced Filters", value: "filters" },
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
        case "browse":
          await browseAllArticles(articleService);
          break;
        case "search":
          await searchArticles(articleService);
          break;
        case "category":
          await browseByCategory(articleService);
          break;
        case "filters":
          await advancedFilters(articleService);
          break;
        case "back":
          return;
      }
    } catch (error) {
      ConsoleUI.error("Article browsing error: " + (error as Error).message);
      await waitForContinue();
    }
  }
}

async function browseAllArticles(
  articleService: ArticleService,
  query: ArticleQuery = { page: 1, limit: 10 }
): Promise<void> {
  try {
    ConsoleUI.info("Loading articles...");
    const response = await articleService.getArticles(query);

    if (response.data.length === 0) {
      ConsoleUI.warning("No articles found.");
      await waitForContinue();
      return;
    }

    displayArticleList(response);
    await handleArticlePagination(response, query, (newQuery) =>
      browseAllArticles(articleService, newQuery)
    );
  } catch (error) {
    ConsoleUI.error("Failed to load articles: " + (error as Error).message);
    await waitForContinue();
  }
}

async function searchArticles(articleService: ArticleService): Promise<void> {
  try {
    const { searchTerm } = await inquirer.prompt([
      {
        type: "input",
        name: "searchTerm",
        message: "Enter search term:",
        validate: (input: string) =>
          input.trim().length > 0 || "Please enter a search term",
      },
    ]);

    ConsoleUI.info(`Searching for: "${searchTerm}"...`);
    const response = await articleService.searchArticles({
      q: searchTerm,
      page: 1,
      limit: 10,
    });

    if (response.data.length === 0) {
      ConsoleUI.warning(`No articles found for "${searchTerm}".`);
      await waitForContinue();
      return;
    }

    displayArticleList(response);
    await handleArticlePagination(
      response,
      { q: searchTerm, page: 1, limit: 10 },
      (newQuery) => searchMoreArticles(articleService, searchTerm, newQuery)
    );
  } catch (error) {
    ConsoleUI.error("Failed to search articles: " + (error as Error).message);
    await waitForContinue();
  }
}

async function searchMoreArticles(
  articleService: ArticleService,
  searchTerm: string,
  query: any
): Promise<void> {
  try {
    const response = await articleService.searchArticles({
      q: searchTerm,
      page: query.page,
      limit: query.limit,
    });
    displayArticleList(response);
    await handleArticlePagination(response, query, (newQuery) =>
      searchMoreArticles(articleService, searchTerm, newQuery)
    );
  } catch (error) {
    ConsoleUI.error(
      "Failed to load more search results: " + (error as Error).message
    );
    await waitForContinue();
  }
}

async function browseByCategory(articleService: ArticleService): Promise<void> {
  try {
    const { categoryId } = await inquirer.prompt([
      {
        type: "number",
        name: "categoryId",
        message: "Enter Category ID:",
        validate: (input: number) =>
          input > 0 || "Please enter a valid category ID",
      },
    ]);

    ConsoleUI.info(`Loading articles for category ${categoryId}...`);
    const response = await articleService.getArticlesByCategory(
      categoryId,
      1,
      10
    );

    if (response.data.length === 0) {
      ConsoleUI.warning(`No articles found for category ${categoryId}.`);
      await waitForContinue();
      return;
    }

    displayArticleList(response);
    await handleCategoryPagination(response, categoryId, 1, 10, (page, limit) =>
      browseCategoryPages(articleService, categoryId, page, limit)
    );
  } catch (error) {
    ConsoleUI.error(
      "Failed to load articles by category: " + (error as Error).message
    );
    await waitForContinue();
  }
}

async function browseCategoryPages(
  articleService: ArticleService,
  categoryId: number,
  page: number,
  limit: number
): Promise<void> {
  try {
    const response = await articleService.getArticlesByCategory(
      categoryId,
      page,
      limit
    );
    displayArticleList(response);
    await handleCategoryPagination(
      response,
      categoryId,
      page,
      limit,
      (newPage, newLimit) =>
        browseCategoryPages(articleService, categoryId, newPage, newLimit)
    );
  } catch (error) {
    ConsoleUI.error(
      "Failed to load category articles: " + (error as Error).message
    );
    await waitForContinue();
  }
}

async function advancedFilters(articleService: ArticleService): Promise<void> {
  try {
    const filters = await inquirer.prompt([
      {
        type: "input",
        name: "search",
        message: "Search term (optional):",
      },
      {
        type: "input",
        name: "author",
        message: "Author name (optional):",
      },
      {
        type: "input",
        name: "source",
        message: "Source/Publisher (optional):",
      },
      {
        type: "input",
        name: "categoryIds",
        message: "Category IDs (comma-separated, optional):",
      },
      {
        type: "input",
        name: "publishedAfter",
        message: "Published after date (YYYY-MM-DD, optional):",
      },
      {
        type: "input",
        name: "publishedBefore",
        message: "Published before date (YYYY-MM-DD, optional):",
      },
    ]);

    const query: ArticleQuery = { page: 1, limit: 10 };

    if (filters.search.trim()) query.search = filters.search.trim();
    if (filters.author.trim()) query.author = filters.author.trim();
    if (filters.source.trim()) query.source = filters.source.trim();
    if (filters.categoryIds.trim()) {
      query.categoryIds = filters.categoryIds
        .split(",")
        .map((id: string) => parseInt(id.trim()))
        .filter((id: number) => !isNaN(id));
    }
    if (filters.publishedAfter.trim()) {
      query.publishedAfter = new Date(
        filters.publishedAfter.trim()
      ).toISOString();
    }
    if (filters.publishedBefore.trim()) {
      query.publishedBefore = new Date(
        filters.publishedBefore.trim()
      ).toISOString();
    }

    ConsoleUI.info("Applying filters...");
    const response = await articleService.getArticles(query);

    if (response.data.length === 0) {
      ConsoleUI.warning("No articles found with the applied filters.");
      await waitForContinue();
      return;
    }

    displayArticleList(response);
    await handleArticlePagination(response, query, (newQuery) =>
      browseAllArticles(articleService, newQuery)
    );
  } catch (error) {
    ConsoleUI.error("Failed to apply filters: " + (error as Error).message);
    await waitForContinue();
  }
}

function displayArticleList(response: PaginatedArticleResponse): void {
  ConsoleUI.newLine();
  ConsoleUI.title(
    `📰 Articles (Page ${response.page} of ${response.totalPages})`
  );
  console.log(`Total articles: ${response.total}`);
  ConsoleUI.separator();

  response.data.forEach((article, index) => {
    const publishedDate = new Date(article.publishedAt).toLocaleDateString();
    const truncatedContent = article.content
      ? article.content.substring(0, 150) + "..."
      : "No content preview available";

    console.log(`${index + 1}. 📰 "${article.title}"`);
    console.log(`   ✍️ Author: ${article.author || "Unknown"}`);
    console.log(`   🌐 Source: ${article.source || "Unknown"}`);
    console.log(`   📅 Published: ${publishedDate}`);

    if (article.categories && article.categories.length > 0) {
      const categories = article.categories
        .map((cat: any) => cat.name)
        .join(", ");
      console.log(`   🏷️ Categories: ${categories}`);
    }

    console.log(`   📄 Preview: ${truncatedContent}`);
    console.log(`   🔗 URL: ${article.originalUrl}`);
    ConsoleUI.separator();
  });

  // Show option to read full article
  console.log("💡 Tip: Select an article number to read the full content");
}

async function handleArticlePagination(
  response: PaginatedArticleResponse,
  currentQuery: any,
  fetchFunction: (query: any) => Promise<void>
): Promise<void> {
  if (response.totalPages <= 1) {
    await handleArticleSelection(response);
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
  choices.push({ name: "📖 Read Article", value: "read" });
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
    case "read":
      await handleArticleSelection(response);
      break;
    case "continue":
      break;
  }
}

async function handleCategoryPagination(
  response: PaginatedArticleResponse,
  categoryId: number,
  currentPage: number,
  currentLimit: number,
  fetchFunction: (page: number, limit: number) => Promise<void>
): Promise<void> {
  if (response.totalPages <= 1) {
    await handleArticleSelection(response);
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
  choices.push({ name: "📖 Read Article", value: "read" });
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
        await fetchFunction(response.page - 1, currentLimit);
      }
      break;
    case "next":
      if (response.page < response.totalPages) {
        await fetchFunction(response.page + 1, currentLimit);
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
      await fetchFunction(pageNumber, currentLimit);
      break;
    case "read":
      await handleArticleSelection(response);
      break;
    case "continue":
      break;
  }
}

async function handleArticleSelection(
  response: PaginatedArticleResponse
): Promise<void> {
  if (response.data.length === 0) return;

  const { articleIndex } = await inquirer.prompt([
    {
      type: "number",
      name: "articleIndex",
      message: `Enter article number to read (1-${response.data.length}):`,
      validate: (input: number) =>
        (input >= 1 && input <= response.data.length) ||
        `Please enter a number between 1 and ${response.data.length}`,
    },
  ]);

  const selectedArticle = response.data[articleIndex - 1];
  await displayFullArticle(selectedArticle);
}

async function displayFullArticle(article: IArticle): Promise<void> {
  ConsoleUI.clear();
  ConsoleUI.title("📖 Full Article");
  ConsoleUI.separator();

  console.log(`📰 Title: ${article.title}`);
  console.log(`✍️ Author: ${article.author || "Unknown"}`);
  console.log(`🌐 Source: ${article.source || "Unknown"}`);
  console.log(
    `📅 Published: ${new Date(article.publishedAt).toLocaleString()}`
  );

  if (article.categories && article.categories.length > 0) {
    const categories = article.categories
      .map((cat: any) => cat.name)
      .join(", ");
    console.log(`🏷️ Categories: ${categories}`);
  }

  console.log(`🔗 Original URL: ${article.originalUrl}`);

  ConsoleUI.separator();
  console.log("📄 Content:");
  console.log(article.content || "No content available for this article.");

  ConsoleUI.separator();

  // Bookmark logic
  const bookmarkService = new BookmarkService();
  let isBookmarked = false;
  try {
    isBookmarked = await bookmarkService.isArticleBookmarked(article.id);
  } catch {}

  while (true) {
    // Dynamic menu
    const choices = [
      { name: "👍 Like this Article", value: "like" },
      { name: "👎 Dislike this Article", value: "dislike" },
      {
        name: isBookmarked
          ? "🔖 Unsave (Remove Bookmark)"
          : "🔖 Save (Bookmark) Article",
        value: "bookmark",
      },
      { name: "🚨 Report this Article", value: "report" },
      { name: "🔙 Back to Articles", value: "back" },
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
        case "like":
          await reactToArticle(article, ReactionType.LIKE);
          break;
        case "dislike":
          await reactToArticle(article, ReactionType.DISLIKE);
          break;
        case "bookmark":
          if (isBookmarked) {
            try {
              await bookmarkService.removeBookmark(article.id);
              ConsoleUI.success("Bookmark removed.");
              isBookmarked = false;
            } catch (e: any) {
              ConsoleUI.error(
                "Failed to remove bookmark: " + (e?.message || e)
              );
            }
          } else {
            try {
              await bookmarkService.saveBookmark(article.id);
              ConsoleUI.success("Article bookmarked.");
              isBookmarked = true;
            } catch (e: any) {
              ConsoleUI.error(
                "Failed to bookmark article: " + (e?.message || e)
              );
            }
          }
          break;
        case "report":
          await reportArticleFromView(article);
          break;
        case "back":
          return;
      }
    } catch (error: any) {
      ConsoleUI.error("Action error: " + error.message);
      await waitForContinue();
    }
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
}

async function reportArticleFromView(article: IArticle): Promise<void> {
  const articleReportService = new ArticleReportService();

  ConsoleUI.clear();
  ConsoleUI.title("🚨 Report Article");
  ConsoleUI.separator();

  console.log(`📰 Article: ${article.title}`);
  console.log(`🆔 Article ID: ${article.id}`);
  ConsoleUI.separator();

  // Show predefined reasons
  const predefinedReasons = articleReportService.getPredefinedReasons();
  const reasonChoices = [
    ...predefinedReasons.map((reason, index) => ({
      name: `${index + 1}. ${articleReportService.formatReasonForDisplay(
        reason
      )}`,
      value: reason,
    })),
    { name: `${predefinedReasons.length + 1}. Custom reason`, value: "custom" },
    {
      name: `${predefinedReasons.length + 2}. No specific reason`,
      value: "none",
    },
    { name: "🔙 Cancel", value: "cancel" },
  ];

  try {
    const { reasonChoice } = await inquirer.prompt([
      {
        type: "list",
        name: "reasonChoice",
        message: "Select a reason for reporting:",
        choices: reasonChoices,
      },
    ]);

    if (reasonChoice === "cancel") {
      return;
    }

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

    // Confirm report submission
    const { confirm } = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirm",
        message: "Are you sure you want to report this article?",
        default: false,
      },
    ]);

    if (!confirm) {
      ConsoleUI.info("Report cancelled.");
      await waitForContinue();
      return;
    }

    // Submit report
    ConsoleUI.info("Submitting report...");
    try {
      const report = await articleReportService.reportArticle(
        article.id,
        reportData
      );
      ConsoleUI.success("✅ Article reported successfully!");
      console.log(`Report ID: ${report.id}`);
      console.log(
        `Reason: ${articleReportService.formatReasonForDisplay(report.reason)}`
      );
      console.log(
        `Reported at: ${new Date(report.createdAt).toLocaleString()}`
      );
      ConsoleUI.info("Thank you for helping maintain content quality!");
    } catch (error: any) {
      if (error.message && error.message.includes("already reported")) {
        ConsoleUI.error("You have already reported this article.");
      }
    }
  } catch (error: any) {
    ConsoleUI.error("Report error: " + error.message);
  }
  await waitForContinue();
}

async function reactToArticle(
  article: IArticle,
  reactionType: ReactionType
): Promise<void> {
  const reactionService = new ReactionService();

  try {
    ConsoleUI.info(
      `${
        reactionType === ReactionType.LIKE ? "Liking" : "Disliking"
      } article...`
    );

    await reactionService.reactToArticle(article.id, reactionType);

    const emoji = reactionType === ReactionType.LIKE ? "👍" : "👎";
    const action = reactionType === ReactionType.LIKE ? "liked" : "disliked";

    ConsoleUI.success(`✅ You have ${action} this article! ${emoji}`);
    ConsoleUI.info(`Article: "${article.title}"`);
    ConsoleUI.info("Thank you for your feedback!");
  } catch (error: any) {
    if (error.message.includes("already reacted")) {
      ConsoleUI.error(
        `You have already reacted to this article. You can change your reaction in the My Reactions page.`
      );
    } else {
      ConsoleUI.error(`Failed to ${reactionType} article: ${error.message}`);
    }
  }

  await waitForContinue();
}
