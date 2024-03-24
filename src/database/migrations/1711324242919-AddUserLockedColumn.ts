import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserLockedColumn1711324242919 implements MigrationInterface {
  name = 'AddUserLockedColumn1711324242919';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "locked" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "locked"`);
  }
}
