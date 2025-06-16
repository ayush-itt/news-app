import { DataSource } from 'typeorm';
import { BookmarkRepository } from '@/database/repositories/bookmark.repository';
import { bookmarksData } from '../data/bookmarks';

export class BookmarksSeeder {
  static async seed(dataSource: DataSource): Promise<void> {
    const bookmarkRepository = new BookmarkRepository(dataSource);

    console.log('Seeding bookmarks...');

    for (const bookmarkData of bookmarksData) {
      const existingBookmark = await bookmarkRepository.findByUserAndArticle(
        bookmarkData.userId,
        bookmarkData.articleId,
      );

      if (!existingBookmark) {
        await bookmarkRepository.createBookmark(
          bookmarkData.userId,
          bookmarkData.articleId,
        );
      }
    }

    console.log('Bookmarks seeded successfully');
  }
}
