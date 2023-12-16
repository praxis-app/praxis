import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSecurityTxtColumn1702684900226 implements MigrationInterface {
  name = 'AddSecurityTxtColumn1702684900226';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "server_config" ADD "securityTxt" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "server_config" DROP COLUMN "securityTxt"`,
    );
  }
}
