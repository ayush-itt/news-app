import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { Category } from './category.entity';
import { Notification as NotificationEntity } from './notification.entity';

@Entity('articles')
export class Article {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 500, nullable: false })
  title: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  author: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  source: string;

  @Column({
    type: 'varchar',
    length: 1000,
    nullable: false,
    name: 'original_url',
  })
  originalUrl: string;

  @Column({ type: 'timestamp', nullable: false, name: 'published_at' })
  publishedAt: Date;

  @CreateDateColumn({ type: 'timestamp', name: 'scraped_at' })
  scrapedAt: Date;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @Column({
    type: 'boolean',
    default: false,
    name: 'processed_for_notifications',
  })
  processedForNotifications: boolean;

  @Column({
    type: 'boolean',
    default: true,
    name: 'is_active',
  })
  isActive: boolean;

  @ManyToMany(() => Category, (category) => category.articles, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinTable({
    name: 'article_categories',
    joinColumn: {
      name: 'article_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'category_id',
      referencedColumnName: 'id',
    },
  })
  categories: Category[];

  @OneToMany(() => NotificationEntity, (notification) => notification.article)
  notifications: NotificationEntity[];
}
