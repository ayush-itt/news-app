import { EmailNotificationData } from './email.service';

export class EmailTemplateHelper {
  static generateHtmlTemplate(data: EmailNotificationData): string {
    const articlesHtml = data.articles
      .map(
        (article) => `
        <div style="border-left: 4px solid #007bff; padding-left: 16px; margin-bottom: 20px;">
          <h3 style="margin: 0 0 8px 0; color: #333;">
            <a href="${article.url}" style="color: #007bff; text-decoration: none;">${article.title}</a>
          </h3>
          ${
            article.category
              ? `<span style="background: #e9ecef; padding: 4px 8px; border-radius: 4px; font-size: 12px; color: #495057;">Category: ${article.category}</span>`
              : ''
          }
          ${
            article.keyword
              ? `<span style="background: #fff3cd; padding: 4px 8px; border-radius: 4px; font-size: 12px; color: #856404; margin-left: 8px;">Keyword: ${article.keyword}</span>`
              : ''
          }
        </div>
      `,
      )
      .join('');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>News Notification</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h1 style="color: #007bff; margin: 0;">📰 News Aggregator</h1>
            <p style="margin: 8px 0 0 0; color: #666;">Hello ${data.userName},</p>
          </div>
          
          <p>We found <strong>${data.articles.length}</strong> new article(s) that match your preferences:</p>
          
          ${articlesHtml}
          
          <div style="background: #e9ecef; padding: 15px; border-radius: 8px; margin-top: 30px;">
            <p style="margin: 0; font-size: 14px; color: #666;">
              You're receiving this email because you've subscribed to news notifications. 
              You can manage your preferences in the application.
            </p>
          </div>
        </body>
      </html>
    `;
  }

  static generateTextTemplate(data: EmailNotificationData): string {
    const articlesText = data.articles
      .map((article, index) => {
        let text = `${index + 1}. ${article.title}\n   Link: ${article.url}`;
        if (article.category) text += `\n   Category: ${article.category}`;
        if (article.keyword) text += `\n   Keyword: ${article.keyword}`;
        return text;
      })
      .join('\n\n');

    return `
News Aggregator - New Articles

Hello ${data.userName},

We found ${data.articles.length} new article(s) that match your preferences:

${articlesText}

--
You're receiving this email because you've subscribed to news notifications.
You can manage your preferences in the application.
    `.trim();
  }
}
