import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum SearchVolume {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  VERY_HIGH = 'very_high',
}

export enum Competition {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export enum Trend {
  RISING = 'rising',
  STABLE = 'stable',
  DECLINING = 'declining',
}

export enum NicheSource {
  TUBEBUDDY = 'tubebuddy',
  AI = 'ai',
  MANUAL = 'manual',
}

@Entity('youtube_niches')
export class NicheEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ unique: true })
  slug!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ type: 'enum', enum: SearchVolume, default: SearchVolume.MEDIUM })
  searchVolume!: SearchVolume;

  @Column({ type: 'enum', enum: Competition, default: Competition.MEDIUM })
  competition!: Competition;

  @Column({ type: 'int' })
  opportunityScore!: number;

  @Column({ type: 'enum', enum: Trend, default: Trend.STABLE })
  trend!: Trend;

  @Column({ type: 'int', nullable: true })
  trendPercent!: number;

  @Column('simple-array', { nullable: true })
  topKeywords!: string[];

  @Column({ nullable: true })
  suggestedAudience!: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  estimatedCPM!: number;

  @Column({ type: 'enum', enum: NicheSource, default: NicheSource.AI })
  source!: NicheSource;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
