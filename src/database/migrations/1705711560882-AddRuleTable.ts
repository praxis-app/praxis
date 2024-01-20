import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRuleTable1705711560882 implements MigrationInterface {
  name = 'AddRuleTable1705711560882';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "rule" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "description" character varying NOT NULL, "priority" integer NOT NULL, "groupId" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a5577f464213af7ffbe866e3cb5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "server_role_permission" ADD "manageRules" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "rule" ADD CONSTRAINT "FK_7c273c2b4a9497fe8775542807a" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "rule" DROP CONSTRAINT "FK_7c273c2b4a9497fe8775542807a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "server_role_permission" DROP COLUMN "manageRules"`,
    );
    await queryRunner.query(`DROP TABLE "rule"`);
  }
}
