import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Article } from './article.entity';
import { Category } from './category.entity';
import { Keyword } from './keyword.entity';

@Entity('notifications')
@Index('idx_user_notifications', ['userId', 'isRead', 'createdAt'])
@Index('unique_user_article', ['userId', 'articleId'], { unique: true })
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'article_id', nullable: true })
  articleId: number | null;

  @Column({ name: 'category_id', nullable: true })
  categoryId: number | null;

  @Column({ name: 'keyword_id', nullable: true })
  keywordId: number | null;

  @Column({ name: 'is_read', default: false })
  isRead: boolean;

  @Column({ name: 'is_emailed', default: false })
  isEmailed: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.notifications, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Article, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'article_id' })
  article: Article | null;

  @ManyToOne(() => Category, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'category_id' })
  category: Category | null;

  @ManyToOne(() => Keyword, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'keyword_id' })
  keyword: Keyword | null;
}
