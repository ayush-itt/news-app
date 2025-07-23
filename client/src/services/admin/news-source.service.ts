import { ApiService } from "../api.service";
import { NewsSource, UpdateNewsSourceDto } from "../../interfaces";

export class NewsSourceService {
  constructor(private apiService: ApiService) {}

  /**
   * Get all news sources
   */
  async getAllNewsSources(): Promise<NewsSource[]> {
    return await this.apiService.get<NewsSource[]>("/news-sources");
  }

  /**
   * Get news source by ID
   */
  async getNewsSourceById(id: number): Promise<NewsSource> {
    return await this.apiService.get<NewsSource>(`/news-sources/${id}`);
  }

  /**
   * Update news source (name and API key environment variable)
   */
  async updateNewsSource(
    id: number,
    updateData: UpdateNewsSourceDto
  ): Promise<NewsSource> {
    return await this.apiService.put<NewsSource>(
      `/news-sources/${id}`,
      updateData
    );
  }
}
