import { MigrationInterface, QueryRunner } from 'typeorm';

export class VerificationThresholdColumn1722222659235
  implements MigrationInterface
{
  name = 'VerificationThresholdColumn1722222659235';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "questionnaire_ticket_config" RENAME COLUMN "ratificationThreshold" TO "verificationThreshold"`,
    );
    await queryRunner.query(
      `ALTER TABLE "server_config" ADD "verificationThreshold" integer NOT NULL DEFAULT '51'`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_config" ALTER COLUMN "ratificationThreshold" SET DEFAULT '51'`,
    );
    await queryRunner.query(
      `ALTER TABLE "server_config" ALTER COLUMN "ratificationThreshold" SET DEFAULT '51'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "server_config" ALTER COLUMN "ratificationThreshold" SET DEFAULT '50'`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_config" ALTER COLUMN "ratificationThreshold" SET DEFAULT '50'`,
    );
    await queryRunner.query(
      `ALTER TABLE "server_config" DROP COLUMN "verificationThreshold"`,
    );
    await queryRunner.query(
      `ALTER TABLE "questionnaire_ticket_config" RENAME COLUMN "verificationThreshold" TO "ratificationThreshold"`,
    );
  }
}
