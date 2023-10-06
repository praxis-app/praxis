import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropRoleMemberEntityTable1681173025669
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "role_member" DROP CONSTRAINT "FK_d8d704a0c5445a41ff5ec5a6f26"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_member" DROP CONSTRAINT "FK_e615f68e242fd1add54be0032d2"`,
    );
    await queryRunner.query(`DROP TABLE "role_member"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "role_member" ("id" SERIAL NOT NULL, "roleId" integer NOT NULL, "userId" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_768f9d166547a51dbb0e3fee645" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_member" ADD CONSTRAINT "FK_e615f68e242fd1add54be0032d2" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_member" ADD CONSTRAINT "FK_d8d704a0c5445a41ff5ec5a6f26" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
