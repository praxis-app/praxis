import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAdminModelColumns1703454648429 implements MigrationInterface {
  name = 'AddAdminModelColumns1703454648429';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "proposal_action_group_config" ADD "adminModel" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_action_group_config" ADD "oldAdminModel" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_config" ADD "adminModel" character varying NOT NULL DEFAULT 'standard'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "group_config" DROP COLUMN "adminModel"`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_action_group_config" DROP COLUMN "oldAdminModel"`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_action_group_config" DROP COLUMN "adminModel"`,
    );
  }
}
