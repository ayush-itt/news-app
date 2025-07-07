export interface UserPreference {
  id: number;
  userId: number;
  categoryId: number;
  isSubscribed: boolean;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: number;
    name: string;
    slug: string;
    description: string;
    isActive: boolean;
  };
}

export interface UpdateUserPreferenceRequest {
  isSubscribed?: boolean;
}

export interface UserPreferenceStats {
  totalPreferences: number;
  subscribedCategories: number;
  unsubscribedCategories: number;
}
