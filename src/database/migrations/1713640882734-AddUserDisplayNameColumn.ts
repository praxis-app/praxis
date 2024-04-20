import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserDisplayNameColumn1713640882734
  implements MigrationInterface
{
  name = 'AddUserDisplayNameColumn1713640882734';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "displayName" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "displayName"`);
  }
}
