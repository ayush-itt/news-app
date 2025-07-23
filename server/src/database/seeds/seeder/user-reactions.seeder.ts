import { DataSource } from 'typeorm';
import { UserReaction } from '../../entities/user-reaction.entity';
import { userReactionsData } from '../data/user-reactions';

export class UserReactionsSeeder {
  static async seed(dataSource: DataSource): Promise<void> {
    const userReactionRepository = dataSource.getRepository(UserReaction);

    // Check if user reactions already exist
    const existingReactions = await userReactionRepository.find();
    if (existingReactions.length > 0) {
      console.log('User reactions already exist, skipping seeding...');
      return;
    }

    console.log('Seeding user reactions...');

    // Create user reactions
    for (const reactionData of userReactionsData) {
      // Check if reaction already exists for this user and article
      const existingReaction = await userReactionRepository.findOne({
        where: {
          userId: reactionData.userId,
          articleId: reactionData.articleId,
        },
      });

      if (!existingReaction) {
        const reaction = userReactionRepository.create({
          userId: reactionData.userId,
          articleId: reactionData.articleId,
          reactionType: reactionData.reactionType,
        });

        await userReactionRepository.save(reaction);
        console.log(
          `✓ Created ${reactionData.reactionType} reaction for user ${reactionData.userId} on article ${reactionData.articleId}`,
        );
      } else {
        console.log(
          `⚠ Reaction already exists for user ${reactionData.userId} on article ${reactionData.articleId}`,
        );
      }
    }

    console.log('✅ User reactions seeding completed!');
  }
}
