import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGroupConfigColumns1701547747691 implements MigrationInterface {
  name = 'AddGroupConfigColumns1701547747691';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "proposal_action_group_config" ADD "standAsidesLimit" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_action_group_config" ADD "reservationsLimit" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_action_group_config" ADD "ratificationThreshold" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_action_group_config" ADD "oldStandAsidesLimit" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_action_group_config" ADD "oldReservationsLimit" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_action_group_config" ADD "oldRatificationThreshold" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_config" ADD "standAsidesLimit" integer NOT NULL DEFAULT '2'`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_config" ADD "reservationsLimit" integer NOT NULL DEFAULT '3'`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_config" ADD "ratificationThreshold" integer NOT NULL DEFAULT '50'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "group_config" DROP COLUMN "ratificationThreshold"`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_config" DROP COLUMN "reservationsLimit"`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_config" DROP COLUMN "standAsidesLimit"`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_action_group_config" DROP COLUMN "oldRatificationThreshold"`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_action_group_config" DROP COLUMN "oldReservationsLimit"`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_action_group_config" DROP COLUMN "oldStandAsidesLimit"`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_action_group_config" DROP COLUMN "ratificationThreshold"`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_action_group_config" DROP COLUMN "reservationsLimit"`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_action_group_config" DROP COLUMN "standAsidesLimit"`,
    );
  }
}
