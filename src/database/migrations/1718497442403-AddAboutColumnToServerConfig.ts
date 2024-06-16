import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAboutColumnToServerConfig1718497442403
  implements MigrationInterface
{
  name = 'AddAboutColumnToServerConfig1718497442403';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "server_config" ADD "about" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "server_config" DROP COLUMN "about"`);
  }
}
