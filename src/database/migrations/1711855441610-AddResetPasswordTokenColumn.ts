import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddResetPasswordTokenColumn1711855441610
  implements MigrationInterface
{
  name = 'AddResetPasswordTokenColumn1711855441610';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "resetPasswordToken" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "resetPasswordToken"`,
    );
  }
}
