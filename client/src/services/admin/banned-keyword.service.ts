import { ApiService } from "../api.service";
import {
  BannedKeyword,
  CreateBannedKeywordDto,
  GetBannedKeywordsQueryDto,
  BannedKeywordListResponse,
} from "../../interfaces";

export class BannedKeywordService {
  constructor(private apiService: ApiService) {}

  /**
   * Get all banned keywords with optional filtering
   */
  async getBannedKeywords(
    query?: GetBannedKeywordsQueryDto
  ): Promise<BannedKeywordListResponse> {
    const params = new URLSearchParams();

    if (query?.isActive !== undefined) {
      params.append("isActive", query.isActive.toString());
    }
    if (query?.search) {
      params.append("search", query.search);
    }
    if (query?.page) {
      params.append("page", query.page.toString());
    }
    if (query?.limit) {
      params.append("limit", query.limit.toString());
    }

    const queryString = params.toString();
    const url = queryString
      ? `/banned-keywords?${queryString}`
      : "/banned-keywords";

    return await this.apiService.get<BannedKeywordListResponse>(url);
  }

  /**
   * Get banned keyword by ID
   */
  async getBannedKeywordById(id: number): Promise<BannedKeyword> {
    return await this.apiService.get<BannedKeyword>(`/banned-keywords/${id}`);
  }

  /**
   * Create new banned keyword
   */
  async createBannedKeyword(
    keywordData: CreateBannedKeywordDto
  ): Promise<BannedKeyword> {
    return await this.apiService.post<BannedKeyword>(
      "/banned-keywords",
      keywordData
    );
  }
}
