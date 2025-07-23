export interface Notification {
  id: number;
  article: {
    id: number;
    title: string;
    url: string;
  } | null;
  category: {
    id: number;
    name: string;
  } | null;
  keyword: {
    id: number;
    name: string;
  } | null;
  message: string;
  type: "article_match" | "system" | "admin";
  isRead: boolean;
  createdAt: Date;
  readAt: Date | null;
}

export interface NotificationQueryDto {
  page?: number;
  limit?: number;
  isRead?: boolean;
}

export interface PaginatedNotificationsResponse {
  notifications: Notification[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  unreadCount: number;
}

export interface UnreadCountResponse {
  count: number;
}

export interface MarkAllReadResponse {
  count: number;
}

export interface TestEmailResponse {
  success: boolean;
  message: string;
}
