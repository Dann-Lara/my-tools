import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('module_visibility')
export class ModuleVisibilityEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  moduleName!: string;

  @Column({ default: true })
  isEnabled!: boolean;

  @Column('simple-array', { nullable: true })
  allowedRoles!: string[];

  @Column('simple-array', { nullable: true })
  allowedUsers!: string[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
