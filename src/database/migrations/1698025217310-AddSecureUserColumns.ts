import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSecureUserColumns1698025217310 implements MigrationInterface {
  name = 'AddSecureUserColumns1698025217310';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "secureName" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "nameHash" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "UQ_7dd65e3d269abfe758f54d338ea" UNIQUE ("nameHash")`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "secureEmail" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "emailHash" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "UQ_db61f96b422d727fb25bc5295d6" UNIQUE ("emailHash")`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "secureBio" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "secureBio"`);
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "UQ_db61f96b422d727fb25bc5295d6"`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "emailHash"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "secureEmail"`);
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "UQ_7dd65e3d269abfe758f54d338ea"`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "nameHash"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "secureName"`);
  }
}
