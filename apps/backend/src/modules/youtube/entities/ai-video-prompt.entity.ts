import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ContentIdeaEntity } from './content-idea.entity';

export enum AIPlatform {
  SORA = 'sora',
  RUNWAY = 'runway',
  KLING = 'kling',
  MIDJOURNEY = 'midjourney',
  PIKA = 'pika',
}

export enum PromptType {
  VIDEO = 'video',
  THUMBNAIL = 'thumbnail',
  SHORT = 'short',
}

@Entity('youtube_ai_prompts')
export class AIVideoPromptEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  ideaId!: string;

  @ManyToOne(() => ContentIdeaEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ideaId' })
  idea!: ContentIdeaEntity;

  @Column({ type: 'enum', enum: AIPlatform })
  platform!: AIPlatform;

  @Column({ type: 'enum', enum: PromptType })
  promptType!: PromptType;

  @Column({ type: 'text' })
  promptText!: string;

  @Column({ type: 'int' })
  generationBatch!: number;

  @Column({ default: false })
  completed!: boolean;

  @CreateDateColumn()
  createdAt!: Date;
}
