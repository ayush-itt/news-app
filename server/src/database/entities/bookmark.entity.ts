import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { Article } from './article.entity';

@Entity('bookmarks')
@Unique(['user', 'article'])
export class Bookmark {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'article_id' })
  articleId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Article, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'article_id' })
  article: Article;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
