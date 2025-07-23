import { DataSource } from 'typeorm';
import { Bookmark } from '../../entities/bookmark.entity';
import { bookmarksData } from '../data/bookmarks';

export class BookmarksSeeder {
  static async seed(dataSource: DataSource): Promise<void> {
    const bookmarkRepository = dataSource.getRepository(Bookmark);

    // Check if bookmarks already exist
    const existingBookmarks = await bookmarkRepository.find({ take: 1 });
    if (existingBookmarks.length > 0) {
      console.log('Bookmarks already exist, skipping seeding...');
      return;
    }

    console.log('Seeding bookmarks...');

    for (const bookmarkData of bookmarksData) {
      const existingBookmark = await bookmarkRepository.findOne({
        where: {
          userId: bookmarkData.userId,
          articleId: bookmarkData.articleId,
        },
      });

      if (!existingBookmark) {
        const bookmark = bookmarkRepository.create({
          userId: bookmarkData.userId,
          articleId: bookmarkData.articleId,
        });
        await bookmarkRepository.save(bookmark);
        console.log(
          `Created bookmark for user ${bookmarkData.userId} on article ${bookmarkData.articleId}`,
        );
      } else {
        console.log(
          `Bookmark already exists for user ${bookmarkData.userId} on article ${bookmarkData.articleId}`,
        );
      }
    }

    console.log('Bookmarks seeding completed!');
  }
}
