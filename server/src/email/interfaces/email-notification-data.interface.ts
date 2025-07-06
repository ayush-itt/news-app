import { IEmailArticle } from './email-article.interface';

export interface IEmailNotificationData {
  userId: number;
  userEmail: string;
  userName: string;
  articles: IEmailArticle[];
}
