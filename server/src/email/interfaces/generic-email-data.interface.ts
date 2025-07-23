import { IEmailSender } from './email-sender.interface';

export interface IGenericEmailData {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  from?: IEmailSender;
}
