import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateVotingTimeLimitDefault1703118466924
  implements MigrationInterface
{
  name = 'UpdateVotingTimeLimitDefault1703118466924';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "group_config" ALTER COLUMN "votingTimeLimit" SET DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "group_config" ALTER COLUMN "votingTimeLimit" SET DEFAULT '4320'`,
    );
  }
}
