import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsDefaultColumnToGroupTable1715555522528
  implements MigrationInterface
{
  name = 'AddIsDefaultColumnToGroupTable1715555522528';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "group" ADD "isDefault" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "group" DROP COLUMN "isDefault"`);
  }
}
