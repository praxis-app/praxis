import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGroupMemberLinkTable1681010227367
  implements MigrationInterface
{
  name = 'AddGroupMemberLinkTable1681010227367';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "group_members_user" ("groupId" integer NOT NULL, "userId" integer NOT NULL, CONSTRAINT "PK_7170c9a27e7b823d391d9e11f2e" PRIMARY KEY ("groupId", "userId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bfa303089d367a2e3c02b002b8" ON "group_members_user" ("groupId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_427107c650638bcb2f1e167d2e" ON "group_members_user" ("userId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "group_members_user" ADD CONSTRAINT "FK_bfa303089d367a2e3c02b002b8f" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_members_user" ADD CONSTRAINT "FK_427107c650638bcb2f1e167d2e5" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "group_members_user" DROP CONSTRAINT "FK_427107c650638bcb2f1e167d2e5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_members_user" DROP CONSTRAINT "FK_bfa303089d367a2e3c02b002b8f"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_427107c650638bcb2f1e167d2e"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_bfa303089d367a2e3c02b002b8"`,
    );
    await queryRunner.query(`DROP TABLE "group_members_user"`);
  }
}
