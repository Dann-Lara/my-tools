import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ChannelEntity } from './channel.entity';

export enum ContentFormat {
  TUTORIAL = 'tutorial',
  STORY = 'story',
  LIST = 'list',
  COMPARISON = 'comparison',
  REACTION = 'reaction',
  SHORTS_ONLY = 'shorts_only',
}

export enum SuccessProbability {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

export enum IdeaStatus {
  IDEA = 'idea',
  SCRIPTED = 'scripted',
  FILMED = 'filmed',
  PUBLISHED = 'published',
  ANALYZED = 'analyzed',
}

export enum DistributionPlatform {
  TWITTER = 'twitter',
  REDDIT = 'reddit',
  FACEBOOK_GROUP = 'facebook_group',
  DISCORD = 'discord',
  NEWSLETTER = 'newsletter',
  TIKTOK = 'tiktok',
}

export interface DistributionChannel {
  platform: DistributionPlatform;
  suggestedCopy: string;
  hashtags: string[];
}

@Entity('youtube_content_ideas')
export class ContentIdeaEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  channelId!: string;

  @ManyToOne(() => ChannelEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'channelId' })
  channel!: ChannelEntity;

  @Column({ length: 100 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  hook!: string;

  @Column({ type: 'text', nullable: true })
  script!: string;

  @Column({ nullable: true })
  angle!: string;

  @Column({ type: 'enum', enum: ContentFormat, default: ContentFormat.TUTORIAL })
  format!: ContentFormat;

  @Column({ nullable: true })
  seoTitle!: string;

  @Column({ type: 'text', nullable: true })
  seoDescription!: string;

  @Column('simple-array', { nullable: true })
  tags!: string[];

  @Column('simple-array', { nullable: true })
  hashtags!: string[];

  @Column({ type: 'enum', enum: SuccessProbability, default: SuccessProbability.MEDIUM })
  successProbability!: SuccessProbability;

  @Column({ nullable: true })
  successReason!: string;

  @Column({ type: 'text', nullable: true })
  shortAngle!: string;

  @Column({ type: 'text', nullable: true })
  shortScript!: string;

  @Column({ type: 'enum', enum: IdeaStatus, default: IdeaStatus.IDEA })
  status!: IdeaStatus;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  publishedCtr!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  publishedRetention!: number;

  @Column({ type: 'bigint', nullable: true })
  publishedViews!: number;

  @Column({ type: 'int', default: 0 })
  position!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
