import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddResetPasswordSentAtColumn1712112839181
  implements MigrationInterface
{
  name = 'AddResetPasswordSentAtColumn1712112839181';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "resetPasswordSentAt" TIMESTAMP`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "resetPasswordSentAt"`,
    );
  }
}
