import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * BannedKeyword entity for storing keywords that should filter out articles
 * Related to: Complexity 1 - Admin Controls - Keyword Filtering
 */
@Entity('banned_keywords')
export class BannedKeyword {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  keyword: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isCaseSensitive: boolean;

  @Column({ type: 'boolean', default: false })
  isRegex: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
