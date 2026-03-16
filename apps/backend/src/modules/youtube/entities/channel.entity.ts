import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { NicheEntity } from './niche.entity';

export enum ChannelStatus {
  SETUP = 'setup',
  ACTIVE = 'active',
  PAUSED = 'paused',
  MONETIZED = 'monetized',
}

@Entity('youtube_channels')
export class ChannelEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  userId!: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: UserEntity;

  @Column()
  nicheId!: string;

  @ManyToOne(() => NicheEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'nicheId' })
  niche!: NicheEntity;

  @Column()
  name!: string;

  @Column({ unique: true })
  slug!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ nullable: true })
  targetAudience!: string;

  @Column({ nullable: true })
  channelGoal!: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  ctr!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  avgRetention!: number;

  @Column({ type: 'int', nullable: true })
  subscriberCount!: number;

  @Column({ type: 'bigint', nullable: true })
  totalViews!: number;

  @Column({ type: 'enum', enum: ChannelStatus, default: ChannelStatus.SETUP })
  status!: ChannelStatus;

  @Column({ default: false })
  monetizationSetupCompleted!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
