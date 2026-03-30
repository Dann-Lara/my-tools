import type { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1699999999999 implements MigrationInterface {
  name = 'InitialSchema1699999999999';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Users table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying NOT NULL,
        "name" character varying NOT NULL,
        "passwordHash" character varying NOT NULL,
        "role" character varying NOT NULL DEFAULT 'client',
        "isActive" boolean NOT NULL DEFAULT true,
        "telegramChatId" character varying,
        "adminId" uuid,
        "allowedModules" VARCHAR[] DEFAULT ARRAY['checklist', 'applications', 'ai', 'youtube'],
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_users_email" ON "users" ("email")`);
    await queryRunner.query(`CREATE INDEX "IDX_users_adminId" ON "users" ("adminId")`);

    // Checklists table
    await queryRunner.query(`
      CREATE TABLE "checklists" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "title" character varying NOT NULL,
        "description" text,
        "status" character varying NOT NULL DEFAULT 'active',
        "source" character varying,
        "reminderDays" integer,
        "reminderTime" character varying,
        "reminderSent" boolean NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_checklists" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_checklists_userId" ON "checklists" ("userId")`);

    // Checklist items table
    await queryRunner.query(`
      CREATE TABLE "checklist_items" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "checklistId" uuid NOT NULL,
        "description" text NOT NULL,
        "frequency" character varying NOT NULL DEFAULT 'daily',
        "estimatedDuration" integer,
        "hack" text,
        "completed" boolean NOT NULL DEFAULT false,
        "lastCompletedAt" TIMESTAMP,
        "completedAt" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_checklist_items" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_checklist_items_checklistId" ON "checklist_items" ("checklistId")`,
    );

    // Job offers table
    await queryRunner.query(`
      CREATE TABLE "job_offers" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "company" character varying(200) NOT NULL,
        "position" character varying(200) NOT NULL,
        "description" text NOT NULL,
        "requirements" text,
        "location" character varying(200),
        "salary" character varying(100),
        "sourceUrl" character varying(500),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_job_offers" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_job_offers_userId" ON "job_offers" ("userId")`);

    // Base CVs table
    await queryRunner.query(`
      CREATE TABLE "base_cvs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "cvText" text NOT NULL DEFAULT '',
        "lastEvaluatedAt" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_base_cvs_userId" UNIQUE ("userId"),
        CONSTRAINT "PK_base_cvs" PRIMARY KEY ("id")
      )
    `);

    // Applications table
    await queryRunner.query(`
      CREATE TABLE "applications" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "jobOfferId" uuid,
        "company" character varying(200),
        "position" character varying(200),
        "jobOffer" text,
        "status" character varying NOT NULL DEFAULT 'pending',
        "appliedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "appliedFrom" character varying(200),
        "location" character varying(200),
        "salary" character varying(100),
        "sourceUrl" character varying(500),
        "atsScore" integer,
        "cvGenerated" text,
        "cvGeneratedLang" character varying(10),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_applications" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_applications_userId" ON "applications" ("userId")`);
    await queryRunner.query(
      `CREATE INDEX "IDX_applications_status" ON "applications" ("userId", "status")`,
    );

    // YouTube niches table
    await queryRunner.query(`
      CREATE TABLE "youtube_niches" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "niche" text NOT NULL,
        "targetAudience" text,
        "contentTypes" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_youtube_niches" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_youtube_niches_userId" ON "youtube_niches" ("userId")`,
    );

    // YouTube channels table
    await queryRunner.query(`
      CREATE TABLE "youtube_channels" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "channelId" uuid NOT NULL,
        "name" character varying NOT NULL,
        "description" text,
        "targetAudience" text,
        "primaryLanguage" character varying(10),
        "nicheId" uuid,
        "monetizationStatus" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_youtube_channels" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_youtube_channels_userId" ON "youtube_channels" ("userId")`,
    );

    // Content ideas table
    await queryRunner.query(`
      CREATE TABLE "content_ideas" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "channelId" uuid NOT NULL,
        "userId" uuid NOT NULL,
        "title" character varying NOT NULL,
        "description" text,
        "seoKeywords" text,
        "seoScore" integer,
        "estimatedViews" integer,
        "engagementScore" integer,
        "status" character varying NOT NULL DEFAULT 'pending',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_content_ideas" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_content_ideas_channelId" ON "content_ideas" ("channelId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_content_ideas_userId" ON "content_ideas" ("userId")`,
    );

    // AI video prompts table
    await queryRunner.query(`
      CREATE TABLE "youtube_ai_prompts" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "ideaId" uuid NOT NULL,
        "platform" character varying NOT NULL,
        "promptType" character varying NOT NULL,
        "promptText" text NOT NULL,
        "generationBatch" character varying,
        "completed" boolean NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_youtube_ai_prompts" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_youtube_ai_prompts_ideaId" ON "youtube_ai_prompts" ("ideaId")`,
    );

    // Monetization setup table
    await queryRunner.query(`
      CREATE TABLE "monetization_setups" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "channelId" uuid NOT NULL,
        "monetizationTypes" text,
        "estimatedRevenue" character varying,
        "adRevenueEnabled" boolean NOT NULL DEFAULT false,
        "sponsorshipsEnabled" boolean NOT NULL DEFAULT false,
        "affiliateMarketingEnabled" boolean NOT NULL DEFAULT false,
        "membershipsEnabled" boolean NOT NULL DEFAULT false,
        "channelMembershipsEnabled" boolean NOT NULL DEFAULT false,
        "superThanksEnabled" boolean NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_monetization_setups" PRIMARY KEY ("id")
      )
    `);

    // Module visibility table
    await queryRunner.query(`
      CREATE TABLE "module_visibility" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "moduleKey" character varying NOT NULL,
        "isEnabled" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_module_visibility" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_module_visibility_userId" ON "module_visibility" ("userId")`,
    );

    // Foreign keys
    await queryRunner.query(
      `ALTER TABLE "checklists" ADD CONSTRAINT "FK_checklists_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "checklist_items" ADD CONSTRAINT "FK_checklist_items_checklistId" FOREIGN KEY ("checklistId") REFERENCES "checklists"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_offers" ADD CONSTRAINT "FK_job_offers_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "base_cvs" ADD CONSTRAINT "FK_base_cvs_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "applications" ADD CONSTRAINT "FK_applications_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "youtube_niches" ADD CONSTRAINT "FK_youtube_niches_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "youtube_channels" ADD CONSTRAINT "FK_youtube_channels_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "content_ideas" ADD CONSTRAINT "FK_content_ideas_channelId" FOREIGN KEY ("channelId") REFERENCES "youtube_channels"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "youtube_ai_prompts" ADD CONSTRAINT "FK_youtube_ai_prompts_ideaId" FOREIGN KEY ("ideaId") REFERENCES "content_ideas"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "monetization_setups" ADD CONSTRAINT "FK_monetization_setups_channelId" FOREIGN KEY ("channelId") REFERENCES "youtube_channels"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "module_visibility" ADD CONSTRAINT "FK_module_visibility_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_users_adminId" FOREIGN KEY ("adminId") REFERENCES "users"("id") ON DELETE SET NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "FK_users_adminId"`);
    await queryRunner.query(
      `ALTER TABLE "module_visibility" DROP CONSTRAINT IF EXISTS "FK_module_visibility_userId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "monetization_setups" DROP CONSTRAINT IF EXISTS "FK_monetization_setups_channelId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "youtube_ai_prompts" DROP CONSTRAINT IF EXISTS "FK_youtube_ai_prompts_ideaId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "content_ideas" DROP CONSTRAINT IF EXISTS "FK_content_ideas_channelId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "youtube_channels" DROP CONSTRAINT IF EXISTS "FK_youtube_channels_userId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "youtube_niches" DROP CONSTRAINT IF EXISTS "FK_youtube_niches_userId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "applications" DROP CONSTRAINT IF EXISTS "FK_applications_userId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "base_cvs" DROP CONSTRAINT IF EXISTS "FK_base_cvs_userId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_offers" DROP CONSTRAINT IF EXISTS "FK_job_offers_userId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "checklist_items" DROP CONSTRAINT IF EXISTS "FK_checklist_items_checklistId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "checklists" DROP CONSTRAINT IF EXISTS "FK_checklists_userId"`,
    );

    await queryRunner.query(`DROP TABLE IF EXISTS "module_visibility"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "monetization_setups"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "youtube_ai_prompts"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "content_ideas"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "youtube_channels"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "youtube_niches"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "applications"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "base_cvs"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "job_offers"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "checklist_items"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "checklists"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
  }
}
