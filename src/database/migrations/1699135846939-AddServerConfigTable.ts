import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddServerConfigTable1699135846939 implements MigrationInterface {
  name = 'AddServerConfigTable1699135846939';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "server_config" ("id" SERIAL NOT NULL, "showCanaryStatement" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_f0bf5101843e99a758694f11417" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "server_role_permission" ADD "manageSettings" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "server_role_permission" DROP COLUMN "manageSettings"`,
    );
    await queryRunner.query(`DROP TABLE "server_config"`);
  }
}
