import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRoleMemberLinkTable1681172948650 implements MigrationInterface {
  name = 'AddRoleMemberLinkTable1681172948650';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "role_members_user" ("roleId" integer NOT NULL, "userId" integer NOT NULL, CONSTRAINT "PK_b47ecc28f78e95361c666b11fa8" PRIMARY KEY ("roleId", "userId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bc4c45c917cd69cef0574dc3c0" ON "role_members_user" ("roleId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8ebd83d04eb1d0270c6e1d9d62" ON "role_members_user" ("userId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "role_members_user" ADD CONSTRAINT "FK_bc4c45c917cd69cef0574dc3c0a" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_members_user" ADD CONSTRAINT "FK_8ebd83d04eb1d0270c6e1d9d620" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "role_members_user" DROP CONSTRAINT "FK_8ebd83d04eb1d0270c6e1d9d620"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_members_user" DROP CONSTRAINT "FK_bc4c45c917cd69cef0574dc3c0a"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8ebd83d04eb1d0270c6e1d9d62"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_bc4c45c917cd69cef0574dc3c0"`,
    );
    await queryRunner.query(`DROP TABLE "role_members_user"`);
  }
}
