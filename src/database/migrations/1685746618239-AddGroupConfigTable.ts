import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGroupConfigTable1685746618239 implements MigrationInterface {
  name = 'AddGroupConfigTable1685746618239';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "group_config" ("id" SERIAL NOT NULL, "privacy" character varying NOT NULL DEFAULT 'private', "groupId" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_dc7c4d6516e432f27172bea056" UNIQUE ("groupId"), CONSTRAINT "PK_da86c7edf57f462384137cd1725" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_config" ADD CONSTRAINT "FK_dc7c4d6516e432f27172bea056b" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "group_config" DROP CONSTRAINT "FK_dc7c4d6516e432f27172bea056b"`,
    );
    await queryRunner.query(`DROP TABLE "group_config"`);
  }
}
