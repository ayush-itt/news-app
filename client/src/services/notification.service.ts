import { ApiService } from "./api.service";
import {
  Notification,
  NotificationQueryDto,
  PaginatedNotificationsResponse,
  UnreadCountResponse,
  MarkAllReadResponse,
  TestEmailResponse,
} from "../interfaces";

export class NotificationService {
  constructor(private apiService: ApiService) {}

  /**
   * Get user notifications with pagination and filtering
   */
  async getNotifications(
    query?: NotificationQueryDto
  ): Promise<PaginatedNotificationsResponse> {
    const params = new URLSearchParams();

    if (query?.page) {
      params.append("page", query.page.toString());
    }
    if (query?.limit) {
      params.append("limit", query.limit.toString());
    }
    if (query?.isRead !== undefined) {
      params.append("isRead", query.isRead.toString());
    }

    const queryString = params.toString();
    const url = queryString
      ? `/notifications?${queryString}`
      : "/notifications";

    return await this.apiService.get<PaginatedNotificationsResponse>(url);
  }

  /**
   * Get count of unread notifications
   */
  async getUnreadCount(): Promise<UnreadCountResponse> {
    return await this.apiService.get<UnreadCountResponse>(
      "/notifications/unread-count"
    );
  }

  /**
   * Mark a specific notification as read
   */
  async markAsRead(notificationId: number): Promise<Notification> {
    return await this.apiService.put<Notification>(
      `/notifications/${notificationId}/read`
    );
  }

  /**
   * Mark all unread notifications as read
   */
  async markAllAsRead(): Promise<MarkAllReadResponse> {
    return await this.apiService.put<MarkAllReadResponse>(
      "/notifications/read-all"
    );
  }

  /**
   * Send test email notification (for testing purposes)
   */
  async sendTestEmail(): Promise<TestEmailResponse> {
    return await this.apiService.post<TestEmailResponse>(
      "/notifications/test-email"
    );
  }
}
