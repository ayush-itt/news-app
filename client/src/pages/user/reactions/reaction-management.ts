import inquirer from "inquirer";
import { ConsoleUI } from "../../../utils/console-ui";
import { ReactionService } from "../../../services/reaction.service";
import {
  UserReaction,
  ReactionType,
} from "../../../interfaces/reaction.interface";

export async function reactionManagementPage(): Promise<void> {
  const reactionService = new ReactionService();

  while (true) {
    ConsoleUI.newLine();
    ConsoleUI.title("👍 My Reactions");

    try {
      const stats = await reactionService.getReactionStats();
      ConsoleUI.info(
        `Total Reactions: ${stats.totalReactions} (👍 ${stats.likes} likes, 👎 ${stats.dislikes} dislikes)`
      );
    } catch (error) {
      // Stats not critical, continue without them
    }

    const choices = [
      { name: "📝 View All My Reactions", value: "all" },
      { name: "👍 View Liked Articles", value: "likes" },
      { name: "👎 View Disliked Articles", value: "dislikes" },
      { name: "🔍 React to Article by ID", value: "react" },
      { name: "📊 Reaction Statistics", value: "stats" },
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
          await viewAllReactions(reactionService);
          break;
        case "likes":
          await viewLikedArticles(reactionService);
          break;
        case "dislikes":
          await viewDislikedArticles(reactionService);
          break;
        case "react":
          await reactToArticlePrompt(reactionService);
          break;
        case "stats":
          await displayReactionStats(reactionService);
          break;
        case "back":
          return;
      }
    } catch (error) {
      ConsoleUI.error(
        `Reaction management error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      await waitForContinue();
    }
  }
}

/**
 * Display all user reactions
 */
async function viewAllReactions(
  reactionService: ReactionService
): Promise<void> {
  ConsoleUI.newLine();
  ConsoleUI.title("📝 All My Reactions");

  try {
    ConsoleUI.info("Loading your reactions...");
    const reactions = await reactionService.getUserReactions();

    if (reactions.length === 0) {
      ConsoleUI.warning("You haven't reacted to any articles yet.");
      await waitForContinue();
      return;
    }

    displayReactionsList(reactions);

    const choices = [
      { name: "🔄 Change a reaction", value: "change" },
      { name: "📋 View reaction details", value: "details" },
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
        await changeReactionPrompt(reactionService, reactions);
        break;
      case "details":
        await viewReactionDetails(reactions);
        break;
      default:
        return;
    }
  } catch (error) {
    ConsoleUI.error(
      `Error loading reactions: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
    await waitForContinue();
  }
}

/**
 * Display user liked articles
 */
async function viewLikedArticles(
  reactionService: ReactionService
): Promise<void> {
  ConsoleUI.newLine();
  ConsoleUI.title("👍 My Liked Articles");

  try {
    ConsoleUI.info("Loading your liked articles...");
    const reactions = await reactionService.getUserLikedArticles();

    if (reactions.length === 0) {
      ConsoleUI.warning("You haven't liked any articles yet.");
      await waitForContinue();
      return;
    }

    displayReactionsList(reactions);
  } catch (error) {
    ConsoleUI.error(
      `Error loading liked articles: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }

  await waitForContinue();
}

/**
 * Display user disliked articles
 */
async function viewDislikedArticles(
  reactionService: ReactionService
): Promise<void> {
  ConsoleUI.newLine();
  ConsoleUI.title("👎 My Disliked Articles");

  try {
    ConsoleUI.info("Loading your disliked articles...");
    const reactions = await reactionService.getUserDislikedArticles();

    if (reactions.length === 0) {
      ConsoleUI.warning("You haven't disliked any articles yet.");
      await waitForContinue();
      return;
    }

    displayReactionsList(reactions);
  } catch (error) {
    ConsoleUI.error(
      `Error loading disliked articles: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }

  await waitForContinue();
}

/**
 * Prompt user to react to an article by ID
 */
async function reactToArticlePrompt(
  reactionService: ReactionService
): Promise<void> {
  ConsoleUI.newLine();
  ConsoleUI.title("🔍 React to Article");

  try {
    const { articleId } = await inquirer.prompt([
      {
        type: "input",
        name: "articleId",
        message: "Enter Article ID:",
        validate: (input: string) => {
          const num = parseInt(input);
          if (isNaN(num) || num <= 0) {
            return "Please enter a valid article ID (positive number).";
          }
          return true;
        },
      },
    ]);

    const articleIdNum = parseInt(articleId);

    // First check if user already has a reaction for this article
    ConsoleUI.info("Checking existing reaction...");
    const existingReaction = await reactionService.getUserReactionForArticle(
      articleIdNum
    );

    if (existingReaction) {
      ConsoleUI.warning(
        `You already ${existingReaction.reactionType}d this article.`
      );
    }

    // Get article stats
    try {
      const stats = await reactionService.getArticleReactionStats(articleIdNum);
      ConsoleUI.info(
        `Article Stats: 👍 ${stats.likes} likes, 👎 ${stats.dislikes} dislikes`
      );
    } catch (error) {
      ConsoleUI.warning(
        "Could not fetch article stats (article may not exist)"
      );
    }

    const choices = [
      { name: "👍 Like", value: ReactionType.LIKE },
      { name: "👎 Dislike", value: ReactionType.DISLIKE },
      { name: "🔙 Cancel", value: "cancel" },
    ];

    const { reaction } = await inquirer.prompt([
      {
        type: "list",
        name: "reaction",
        message: "How do you want to react?",
        choices,
      },
    ]);

    if (reaction === "cancel") {
      return;
    }

    ConsoleUI.info(`Adding ${reaction} reaction...`);
    const result = await reactionService.reactToArticle(articleIdNum, reaction);

    if ("message" in result) {
      // Reaction was removed (toggle off)
      ConsoleUI.success(result.message);
    } else {
      // Reaction was added/updated
      ConsoleUI.success(`Successfully ${reaction}d the article!`);
    }
  } catch (error) {
    ConsoleUI.error(
      `Error reacting to article: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }

  await waitForContinue();
}

/**
 * Display reaction statistics
 */
async function displayReactionStats(
  reactionService: ReactionService
): Promise<void> {
  ConsoleUI.newLine();
  ConsoleUI.title("📊 My Reaction Statistics");

  try {
    ConsoleUI.info("Loading reaction statistics...");
    const reactions = await reactionService.getUserReactions();
    const stats = calculateReactionStats(reactions);

    ConsoleUI.success("=== Reaction Statistics ===");
    console.log(`Total Reactions: ${stats.total}`);
    console.log(`👍 Total Likes: ${stats.likes}`);
    console.log(`👎 Total Dislikes: ${stats.dislikes}`);
    console.log(`Reactions This Month: ${stats.thisMonth}`);
    console.log(`Reactions This Week: ${stats.thisWeek}`);

    if (stats.sourceCounts.size > 0) {
      console.log("\n📰 Reactions by Source:");
      stats.sourceCounts.forEach((count, source) => {
        console.log(`  ${source}: ${count}`);
      });
    }

    if (stats.categoryCounts.size > 0) {
      console.log("\n📂 Reactions by Category:");
      stats.categoryCounts.forEach((count, category) => {
        console.log(`  ${category}: ${count}`);
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
 * Display a list of reactions
 */
function displayReactionsList(reactions: UserReaction[]): void {
  console.log("\n" + "=".repeat(80));
  reactions.forEach((reaction, index) => {
    const emoji = reaction.reactionType === ReactionType.LIKE ? "👍" : "👎";
    console.log(
      `\n[${index + 1}] ${emoji} ${reaction.article?.title || "Unknown Title"}`
    );
    console.log(`    📰 Source: ${reaction.article?.source || "Unknown"}`);
    console.log(
      `    📅 Published: ${formatDate(reaction.article?.publishedAt)}`
    );
    console.log(`    ${emoji} Reacted: ${formatDate(reaction.createdAt)}`);

    if (
      reaction.article?.categories &&
      reaction.article.categories.length > 0
    ) {
      console.log(
        `    📂 Categories: ${reaction.article.categories
          .map((cat: any) => cat.name)
          .join(", ")}`
      );
    }

    console.log(`    🆔 Article ID: ${reaction.articleId}`);
  });
  console.log("\n" + "=".repeat(80));
}

/**
 * Prompt user to change a reaction
 */
async function changeReactionPrompt(
  reactionService: ReactionService,
  reactions: UserReaction[]
): Promise<void> {
  try {
    const choices = reactions.map((reaction, index) => ({
      name: `[${index + 1}] ${
        reaction.reactionType === ReactionType.LIKE ? "👍" : "👎"
      } ${reaction.article?.title || "Unknown Title"}`,
      value: reaction.articleId,
    }));

    choices.push({ name: "🔙 Cancel", value: -1 });

    const { articleId } = await inquirer.prompt([
      {
        type: "list",
        name: "articleId",
        message: "Select reaction to change:",
        choices,
      },
    ]);

    if (articleId === -1) {
      return;
    }

    const reaction = reactions.find((r) => r.articleId === articleId);
    if (!reaction) {
      ConsoleUI.error("Reaction not found.");
      await waitForContinue();
      return;
    }

    const oppositeReaction =
      reaction.reactionType === ReactionType.LIKE
        ? ReactionType.DISLIKE
        : ReactionType.LIKE;
    const oppositeEmoji = oppositeReaction === ReactionType.LIKE ? "👍" : "👎";

    const reactionChoices = [
      {
        name: `${oppositeEmoji} Change to ${oppositeReaction}`,
        value: oppositeReaction,
      },
      { name: "🗑️ Remove reaction", value: reaction.reactionType },
      { name: "🔙 Cancel", value: "cancel" },
    ];

    const { newReaction } = await inquirer.prompt([
      {
        type: "list",
        name: "newReaction",
        message: `Current reaction: ${
          reaction.reactionType === ReactionType.LIKE ? "👍" : "👎"
        } ${reaction.reactionType}. What would you like to do?`,
        choices: reactionChoices,
      },
    ]);

    if (newReaction === "cancel") {
      return;
    }

    ConsoleUI.info("Updating reaction...");
    const result = await reactionService.reactToArticle(articleId, newReaction);

    if ("message" in result) {
      ConsoleUI.success(result.message);
    } else {
      ConsoleUI.success(`Successfully changed reaction to ${newReaction}!`);
    }
  } catch (error) {
    ConsoleUI.error(
      `Error changing reaction: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }

  await waitForContinue();
}

/**
 * View detailed information about a reaction
 */
async function viewReactionDetails(reactions: UserReaction[]): Promise<void> {
  try {
    const choices = reactions.map((reaction, index) => ({
      name: `[${index + 1}] ${
        reaction.reactionType === ReactionType.LIKE ? "👍" : "👎"
      } ${reaction.article?.title || "Unknown Title"}`,
      value: reaction.id,
    }));

    choices.push({ name: "🔙 Cancel", value: -1 });

    const { reactionId } = await inquirer.prompt([
      {
        type: "list",
        name: "reactionId",
        message: "Select reaction to view details:",
        choices,
      },
    ]);

    if (reactionId === -1) {
      return;
    }

    const reaction = reactions.find((r) => r.id === reactionId);
    if (!reaction) {
      ConsoleUI.error("Reaction not found.");
      await waitForContinue();
      return;
    }

    ConsoleUI.newLine();
    ConsoleUI.title("📝 Reaction Details");

    const emoji = reaction.reactionType === ReactionType.LIKE ? "👍" : "👎";
    console.log(`${emoji} Reaction: ${reaction.reactionType}`);
    console.log(`📰 Article: ${reaction.article?.title || "Unknown Title"}`);
    console.log(`🆔 Article ID: ${reaction.articleId}`);
    console.log(`📰 Source: ${reaction.article?.source || "Unknown"}`);
    console.log(
      `📅 Article Published: ${formatDate(reaction.article?.publishedAt)}`
    );
    console.log(`${emoji} Reacted: ${formatDate(reaction.createdAt)}`);
    console.log(`🔄 Last Updated: ${formatDate(reaction.updatedAt)}`);
    console.log(`🆔 Reaction ID: ${reaction.id}`);

    if (
      reaction.article?.categories &&
      reaction.article.categories.length > 0
    ) {
      console.log(
        `📂 Categories: ${reaction.article.categories
          .map((cat: any) => cat.name)
          .join(", ")}`
      );
    }

    // Try to get current article stats
    try {
      const stats = await new ReactionService().getArticleReactionStats(
        reaction.articleId
      );
      console.log(
        `\n📊 Current Article Stats: 👍 ${stats.likes} likes, 👎 ${stats.dislikes} dislikes`
      );
    } catch (error) {
      console.log("\n📊 Current article stats not available");
    }
  } catch (error) {
    ConsoleUI.error(
      `Error viewing reaction details: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }

  await waitForContinue();
}

/**
 * Calculate reaction statistics
 */
function calculateReactionStats(reactions: UserReaction[]) {
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const stats = {
    total: reactions.length,
    likes: 0,
    dislikes: 0,
    thisWeek: 0,
    thisMonth: 0,
    categoryCounts: new Map<string, number>(),
    sourceCounts: new Map<string, number>(),
  };

  reactions.forEach((reaction) => {
    // Count reaction types
    if (reaction.reactionType === ReactionType.LIKE) {
      stats.likes++;
    } else {
      stats.dislikes++;
    }

    const createdDate = new Date(reaction.createdAt);

    if (createdDate >= oneWeekAgo) {
      stats.thisWeek++;
    }

    if (createdDate >= oneMonthAgo) {
      stats.thisMonth++;
    }

    // Count categories
    reaction.article?.categories?.forEach((category: any) => {
      const current = stats.categoryCounts.get(category.name) || 0;
      stats.categoryCounts.set(category.name, current + 1);
    });

    // Count sources
    const source = reaction.article?.source || "Unknown";
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
