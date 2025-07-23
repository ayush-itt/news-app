import { IReadingHistoryArticle } from './reading-history-article.interface';
import { IReadingHistoryUser } from './reading-history-user.interface';

export interface IReadingHistoryResponse {
  id: number;
  userId: number;
  articleId: number;
  createdAt: Date;
  article?: IReadingHistoryArticle;
  user?: IReadingHistoryUser;
}
