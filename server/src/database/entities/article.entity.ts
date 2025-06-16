import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Category } from './category.entity';

@Entity('articles')
export class Article {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  uuid: string;

  @Column({ type: 'varchar', length: 500, nullable: false })
  title: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  author: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  source: string;

  @Column({ type: 'varchar', length: 1000, nullable: false })
  original_url: string;

  @Column({ type: 'timestamp', nullable: false })
  published_at: Date;

  @CreateDateColumn({ type: 'timestamp' })
  scraped_at: Date;

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
}
