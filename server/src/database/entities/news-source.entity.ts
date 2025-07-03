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

  @Column({ type: 'varchar', length: 255, nullable: false, name: 'base_url' })
  baseUrl: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'api_key_env' })
  apiKeyEnv: string;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true, name: 'last_fetch_at' })
  lastFetchAt: Date;

  @Column({ type: 'text', nullable: true, name: 'last_error' })
  lastError: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
