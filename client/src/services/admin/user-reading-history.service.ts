import { ApiService } from "../api.service";
import {
  ReadingHistoryListResponse,
  GetReadingHistoryQuery,
} from "../../interfaces";

export class UserReadingHistoryService {
  private api: ApiService;

  constructor() {
    this.api = ApiService.getInstance();
  }

  /**
   * Get all users' reading history (admin only)
   */
  async getAllUsersReadingHistory(
    query: GetReadingHistoryQuery = {}
  ): Promise<ReadingHistoryListResponse> {
    try {
      const params = new URLSearchParams();

      if (query.page) params.append("page", query.page.toString());
      if (query.limit) params.append("limit", query.limit.toString());
      if (query.userId) params.append("userId", query.userId.toString());
      if (query.startDate) params.append("startDate", query.startDate);
      if (query.endDate) params.append("endDate", query.endDate);

      const queryString = params.toString();
      const url = queryString
        ? `/reading-history/admin/all?${queryString}`
        : "/reading-history/admin/all";

      const response = await this.api.get<ReadingHistoryListResponse>(url);
      return response;
    } catch (error) {
      console.error("Error fetching all users reading history:", error);
      throw error;
    }
  }

  /**
   * Get current user's reading history
   */
  async getUserReadingHistory(
    query: GetReadingHistoryQuery = {}
  ): Promise<ReadingHistoryListResponse> {
    try {
      const params = new URLSearchParams();

      if (query.page) params.append("page", query.page.toString());
      if (query.limit) params.append("limit", query.limit.toString());
      if (query.startDate) params.append("startDate", query.startDate);
      if (query.endDate) params.append("endDate", query.endDate);

      const queryString = params.toString();
      const url = queryString
        ? `/reading-history?${queryString}`
        : "/reading-history";

      const response = await this.api.get<ReadingHistoryListResponse>(url);
      return response;
    } catch (error) {
      console.error("Error fetching user reading history:", error);
      throw error;
    }
  }
}
