import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInitialMemberCountColumn1709498470199
  implements MigrationInterface
{
  name = 'AddInitialMemberCountColumn1709498470199';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "questionnaire_ticket" ADD "initialMemberCount" integer NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "questionnaire_ticket" DROP COLUMN "initialMemberCount"`,
    );
  }
}
