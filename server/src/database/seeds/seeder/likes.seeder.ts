import { DataSource } from 'typeorm';
import { LikeRepository } from '@/database/repositories/like.repository';
import { likesData } from '../data/likes';

export class LikesSeeder {
  static async seed(dataSource: DataSource): Promise<void> {
    const likeRepository = new LikeRepository(dataSource);

    console.log('Seeding likes...');

    for (const likeData of likesData) {
      const existingLike = await likeRepository.findByUserAndArticle(
        likeData.userId,
        likeData.articleId,
      );

      if (!existingLike) {
        await likeRepository.createLike(likeData.userId, likeData.articleId);
      }
    }

    console.log('Likes seeded successfully');
  }
}
