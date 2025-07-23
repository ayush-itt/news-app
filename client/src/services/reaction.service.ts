import { ApiService } from "./api.service";
import {
  UserReaction,
  ReactionRequest,
  ReactionStats,
  ReactionType,
  ReactionStatusResponse,
} from "../interfaces/reaction.interface";
import { IApiResponse } from "../interfaces/api.interface";

export class ReactionService {
  private apiService: ApiService;

  constructor() {
    this.apiService = ApiService.getInstance();
  }

  /**
   * React to an article (like/dislike) or toggle off reaction
   */
  async reactToArticle(
    articleId: number,
    reaction: ReactionType
  ): Promise<UserReaction | ReactionStatusResponse> {
    try {
      const reactionData: ReactionRequest = { reaction };
      const response = await this.apiService.put<
        UserReaction | ReactionStatusResponse
      >(`/user-reactions/${articleId}`, reactionData);

      // The backend returns the data directly, not wrapped in a data field
      return response;
    } catch (error) {
      console.error("Error reacting to article:", error);
      throw error;
    }
  }

  /**
   * Get all user reactions
   */
  async getUserReactions(): Promise<UserReaction[]> {
    try {
      const response = await this.apiService.get<UserReaction[]>(
        "/user-reactions/my-reactions"
      );
      return response || [];
    } catch (error) {
      console.error("Error fetching user reactions:", error);
      throw error;
    }
  }

  /**
   * Get user liked articles
   */
  async getUserLikedArticles(): Promise<UserReaction[]> {
    try {
      const response = await this.apiService.get<UserReaction[]>(
        "/user-reactions/likes"
      );
      return response || [];
    } catch (error) {
      console.error("Error fetching liked articles:", error);
      throw error;
    }
  }

  /**
   * Get user disliked articles
   */
  async getUserDislikedArticles(): Promise<UserReaction[]> {
    try {
      const response = await this.apiService.get<UserReaction[]>(
        "/user-reactions/dislikes"
      );
      return response || [];
    } catch (error) {
      console.error("Error fetching disliked articles:", error);
      throw error;
    }
  }

  /**
   * Get article reaction statistics
   */
  async getArticleReactionStats(articleId: number): Promise<ReactionStats> {
    try {
      const response = await this.apiService.get<ReactionStats>(
        `/user-reactions/stats/${articleId}`
      );
      if (!response) {
        throw new Error(
          "Failed to get article reaction stats - no data returned"
        );
      }
      return response;
    } catch (error) {
      console.error("Error fetching article reaction stats:", error);
      throw error;
    }
  }

  /**
   * Get user reaction for specific article
   */
  async getUserReactionForArticle(
    articleId: number
  ): Promise<UserReaction | null> {
    try {
      const response = await this.apiService.get<UserReaction | null>(
        `/user-reactions/my-reaction/${articleId}`
      );
      return response || null;
    } catch (error) {
      // 404 is expected when no reaction exists
      if (error instanceof Error && error.message.includes("404")) {
        return null;
      }
      console.error("Error fetching user reaction for article:", error);
      throw error;
    }
  }

  /**
   * Like an article
   */
  async likeArticle(
    articleId: number
  ): Promise<UserReaction | ReactionStatusResponse> {
    return this.reactToArticle(articleId, ReactionType.LIKE);
  }

  /**
   * Dislike an article
   */
  async dislikeArticle(
    articleId: number
  ): Promise<UserReaction | ReactionStatusResponse> {
    return this.reactToArticle(articleId, ReactionType.DISLIKE);
  }

  /**
   * Get reaction statistics for the current user
   */
  async getReactionStats(): Promise<{
    totalReactions: number;
    likes: number;
    dislikes: number;
  }> {
    try {
      const reactions = await this.getUserReactions();
      const likes = reactions.filter(
        (r) => r.reactionType === ReactionType.LIKE
      ).length;
      const dislikes = reactions.filter(
        (r) => r.reactionType === ReactionType.DISLIKE
      ).length;

      return {
        totalReactions: reactions.length,
        likes,
        dislikes,
      };
    } catch (error) {
      console.error("Error getting reaction stats:", error);
      return { totalReactions: 0, likes: 0, dislikes: 0 };
    }
  }
}
