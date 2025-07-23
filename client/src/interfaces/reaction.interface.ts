export enum ReactionType {
  LIKE = "like",
  DISLIKE = "dislike",
}

export interface UserReaction {
  id: number;
  userId: number;
  articleId: number;
  reactionType: ReactionType;
  createdAt: string;
  updatedAt: string;
  article?: {
    id: number;
    title: string;
    source?: string;
    publishedAt: string;
    categories?: Array<{ id: number; name: string }>;
  };
}

export interface ReactionRequest {
  reaction: ReactionType;
}

export interface ReactionStats {
  likes: number;
  dislikes: number;
  articleId: number;
}

export interface ReactionStatusResponse {
  message: string;
  success: boolean;
}
