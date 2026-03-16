import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateYoutubeModule1702000000000 implements MigrationInterface {
  name = 'CreateYoutubeModule1702000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Niches table
    await queryRunner.query(`
      CREATE TABLE "youtube_niches" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" VARCHAR(255) NOT NULL,
        "slug" VARCHAR(255) UNIQUE NOT NULL,
        "description" TEXT,
        "searchVolume" VARCHAR(20) DEFAULT 'medium',
        "competition" VARCHAR(20) DEFAULT 'medium',
        "opportunityScore" INT NOT NULL DEFAULT 50,
        "trend" VARCHAR(20) DEFAULT 'stable',
        "trendPercent" INT,
        "topKeywords" VARCHAR[] DEFAULT '{}',
        "suggestedAudience" VARCHAR(500),
        "estimatedCPM" DECIMAL(5,2),
        "source" VARCHAR(20) DEFAULT 'ai',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    // Channels table
    await queryRunner.query(`
      CREATE TABLE "youtube_channels" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "nicheId" UUID REFERENCES "youtube_niches"("id") ON DELETE SET NULL,
        "name" VARCHAR(255) NOT NULL,
        "slug" VARCHAR(255) UNIQUE NOT NULL,
        "description" TEXT,
        "targetAudience" VARCHAR(500),
        "channelGoal" VARCHAR(500),
        "ctr" DECIMAL(5,2),
        "avgRetention" DECIMAL(5,2),
        "subscriberCount" INT,
        "totalViews" BIGINT,
        "status" VARCHAR(20) DEFAULT 'setup',
        "monetizationSetupCompleted" BOOLEAN DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    // Content ideas table
    await queryRunner.query(`
      CREATE TABLE "youtube_content_ideas" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "channelId" UUID NOT NULL REFERENCES "youtube_channels"("id") ON DELETE CASCADE,
        "title" VARCHAR(100) NOT NULL,
        "hook" TEXT,
        "script" TEXT,
        "angle" VARCHAR(500),
        "format" VARCHAR(20) DEFAULT 'tutorial',
        "seoTitle" VARCHAR(100),
        "seoDescription" TEXT,
        "tags" VARCHAR[] DEFAULT '{}',
        "hashtags" VARCHAR[] DEFAULT '{}',
        "successProbability" VARCHAR(10) DEFAULT 'medium',
        "successReason" VARCHAR(500),
        "shortAngle" TEXT,
        "shortScript" TEXT,
        "status" VARCHAR(20) DEFAULT 'idea',
        "publishedCtr" DECIMAL(5,2),
        "publishedRetention" DECIMAL(5,2),
        "publishedViews" BIGINT,
        "position" INT NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    // AI prompts table
    await queryRunner.query(`
      CREATE TABLE "youtube_ai_prompts" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "ideaId" UUID NOT NULL REFERENCES "youtube_content_ideas"("id") ON DELETE CASCADE,
        "platform" VARCHAR(50) NOT NULL,
        "prompt" TEXT NOT NULL,
        "tips" TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    // Monetization setups table
    await queryRunner.query(`
      CREATE TABLE "youtube_monetization_setups" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "channelId" UUID NOT NULL REFERENCES "youtube_channels"("id") ON DELETE CASCADE,
        "steps" JSONB NOT NULL DEFAULT '[]',
        "completedAt" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    // Module visibility table
    await queryRunner.query(`
      CREATE TABLE "module_visibility" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "moduleName" VARCHAR(100) UNIQUE NOT NULL,
        "isEnabled" BOOLEAN DEFAULT true,
        "allowedRoles" VARCHAR[] DEFAULT '{}',
        "allowedUsers" VARCHAR[] DEFAULT '{}',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    // Insert default module visibility records
    await queryRunner.query(`
      INSERT INTO "module_visibility" ("moduleName", "isEnabled", "allowedRoles", "allowedUsers")
      VALUES 
        ('youtube', true, '{}', '{}'),
        ('checklists', true, '{}', '{}'),
        ('applications', true, '{}', '{}')
      ON CONFLICT ("moduleName") DO NOTHING
    `);

    // Create indexes
    await queryRunner.query(`CREATE INDEX "IDX_channels_userId" ON "youtube_channels" ("userId")`);
    await queryRunner.query(`CREATE INDEX "IDX_channels_nicheId" ON "youtube_channels" ("nicheId")`);
    await queryRunner.query(`CREATE INDEX "IDX_ideas_channelId" ON "youtube_content_ideas" ("channelId")`);
    await queryRunner.query(`CREATE INDEX "IDX_ideas_status" ON "youtube_content_ideas" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_prompts_ideaId" ON "youtube_ai_prompts" ("ideaId")`);
    await queryRunner.query(`CREATE INDEX "IDX_monetization_channelId" ON "youtube_monetization_setups" ("channelId")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_monetization_channelId"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_prompts_ideaId"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_ideas_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_ideas_channelId"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_channels_nicheId"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_channels_userId"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "module_visibility"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "youtube_monetization_setups"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "youtube_ai_prompts"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "youtube_content_ideas"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "youtube_channels"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "youtube_niches"`);
  }
}
