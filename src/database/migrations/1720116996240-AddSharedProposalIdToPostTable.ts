import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSharedProposalIdToPostTable1720116996240
  implements MigrationInterface
{
  name = 'AddSharedProposalIdToPostTable1720116996240';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "post" ADD "sharedProposalId" integer`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "post" DROP COLUMN "sharedProposalId"`,
    );
  }
}
