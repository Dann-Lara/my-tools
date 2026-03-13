import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAdminIdAndAllowedModules1700000000000 implements MigrationInterface {
  name = 'AddAdminIdAndAllowedModules1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Agregar columna adminId
    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD COLUMN IF NOT EXISTS "adminId" UUID
    `);
    
    // Agregar índice para mejorar búsquedas por adminId
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_users_adminId" 
      ON "users" ("adminId")
    `);

    // Agregar columna allowedModules con valor por defecto
    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD COLUMN IF NOT EXISTS "allowedModules" VARCHAR[] DEFAULT ARRAY['checklist', 'applications', 'ai']
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_users_adminId"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "allowedModules"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "adminId"`);
  }
}
