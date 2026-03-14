import {
  Column, CreateDateColumn, Entity, Index,
  JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from '../../users/user.entity';

export type ApplicationStatus = 'pending' | 'in_process' | 'accepted' | 'rejected';

// ── Job Offer — one per application ─────────────────────────────────────────────
@Entity('job_offers')
@Index(['userId'])
export class JobOfferEntity {
  @PrimaryGeneratedColumn('uuid') id!: string;

  @Column({ name: 'user_id' })
  userId!: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @Column({ length: 200 }) company!: string;
  @Column({ length: 200 }) position!: string;
  @Column({ type: 'text' }) description!: string;
  @Column({ type: 'text', nullable: true }) requirements?: string;
  @Column({ length: 200, nullable: true }) location?: string;
  @Column({ length: 100, nullable: true }) salary?: string;
  @Column({ length: 500, nullable: true }) sourceUrl?: string;

  @CreateDateColumn() createdAt!: Date;
  @UpdateDateColumn() updatedAt!: Date;
}

// ── Base CV — one per user, stored in DB ─────────────────────────────────────
@Entity('base_cvs')
@Index(['userId'], { unique: true })
export class BaseCvEntity {
  @PrimaryGeneratedColumn('uuid') id!: string;

  @Column({ name: 'user_id' })
  userId!: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @Column({ length: 150, default: '' }) fullName!: string;
  @Column({ length: 150, default: '' }) email!: string;
  @Column({ length: 50, default: '' }) phone!: string;
  @Column({ length: 150, default: '' }) location!: string;
  @Column({ length: 250, default: '' }) linkedIn!: string;
  @Column({ type: 'text', default: '' }) summary!: string;
  @Column({ type: 'text', default: '' }) experience!: string;
  @Column({ type: 'text', default: '' }) education!: string;
  @Column({ type: 'text', default: '' }) skills!: string;
  @Column({ length: 250, default: '' }) languages!: string;
  @Column({ type: 'text', default: '' }) certifications!: string;

  @CreateDateColumn() createdAt!: Date;
  @UpdateDateColumn() updatedAt!: Date;
}

// ── Application ───────────────────────────────────────────────────────────────
@Entity('applications')
@Index(['userId', 'status'])
export class ApplicationEntity {
  @PrimaryGeneratedColumn('uuid') id!: string;

  @Column({ name: 'user_id' })
  userId!: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @Column({ name: 'job_offer_id', nullable: true })
  jobOfferId?: string;

  @ManyToOne(() => JobOfferEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'job_offer_id' })
  jobOffer?: JobOfferEntity;

  @Column({ length: 200 }) company!: string;
  @Column({ length: 200 }) position!: string;
  /** @deprecated Use jobOffer relation instead - stores full job offer text */
  @Column({ type: 'text' }) jobOfferText!: string;

  @Column({ type: 'varchar', default: 'pending' })
  status!: ApplicationStatus;

  @Column({ type: 'int', nullable: true }) atsScore?: number;
  /** Original single-language generated CV (kept for backwards compat) */
  @Column({ type: 'text', nullable: true }) cvGenerated?: string;
  /** ATS-optimized CV in Spanish */
  @Column({ type: 'text', nullable: true }) cvGeneratedEs?: string;
  /** ATS-optimized CV in English */
  @Column({ type: 'text', nullable: true }) cvGeneratedEn?: string;
  @Column({ default: false }) cvGeneratedFlag!: boolean;

  /** Where the user applied from (e.g. linkedin, indeed, company website) */
  @Column({ length: 200, nullable: true }) appliedFrom?: string;
  /** Raw textarea of interview questions pasted by the user */
  @Column({ type: 'text', nullable: true }) interviewQuestions?: string;
  /** AI-generated answers to the interview questions */
  @Column({ type: 'text', nullable: true }) interviewAnswers?: string;
  /** When the interview was generated */
  @Column({ type: 'timestamp', nullable: true }) interviewGeneratedAt?: Date;

  @CreateDateColumn() appliedAt!: Date;
  @UpdateDateColumn() updatedAt!: Date;
}
