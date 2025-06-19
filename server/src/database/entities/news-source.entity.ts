import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum NewsSourceType {
  NEWSAPI = 'newsapi',
  THENEWSAPI = 'thenewsapi',
  FIREBASE = 'firebase',
}

@Entity('news_sources')
export class NewsSource {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, nullable: false, unique: true })
  name: string;

  @Column({
    type: 'enum',
    enum: NewsSourceType,
    nullable: false,
  })
  type: NewsSourceType;

  @Column({ type: 'varchar', length: 255, nullable: false })
  base_url: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  api_key_env: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'timestamp', nullable: true })
  last_fetch_at: Date;

  @Column({ type: 'text', nullable: true })
  last_error: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
