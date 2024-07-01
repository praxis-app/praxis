import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSharedPostIdToPostTable1719688685494
  implements MigrationInterface
{
  name = 'AddSharedPostIdToPostTable1719688685494';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "post" ADD "sharedPostId" integer`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "post" DROP COLUMN "sharedPostId"`);
  }
}
