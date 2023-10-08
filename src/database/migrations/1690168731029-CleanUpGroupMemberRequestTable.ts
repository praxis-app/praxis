import { MigrationInterface, QueryRunner } from 'typeorm';

export class CleanUpGroupMemberRequestTable1690168731029
  implements MigrationInterface
{
  name = 'CleanUpGroupMemberRequestTable1690168731029';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "group_member_request" DROP CONSTRAINT "FK_f8260c3393fef67e4bf3c0577b2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_member_request" DROP CONSTRAINT "FK_2872a8db74268161aede2556c27"`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_member_request" ALTER COLUMN "id" SET DEFAULT nextval('"group_member_request_id_seq"')`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_member_request" ALTER COLUMN "id" DROP DEFAULT`,
    );
    await queryRunner.query(`DROP SEQUENCE "group_member_request_id_seq"`);
    await queryRunner.query(
      `ALTER TABLE "group_member_request" ADD CONSTRAINT "FK_a15f4685964a47ecc362c7a0428" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_member_request" ADD CONSTRAINT "FK_864520203508eeb8980a50c92c7" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "group_member_request" DROP CONSTRAINT "FK_864520203508eeb8980a50c92c7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_member_request" DROP CONSTRAINT "FK_a15f4685964a47ecc362c7a0428"`,
    );
    await queryRunner.query(
      `CREATE SEQUENCE IF NOT EXISTS "group_member_request_id_seq" OWNED BY "group_member_request"."id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_member_request" ALTER COLUMN "id" SET DEFAULT nextval('"group_member_request_id_seq"')`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_member_request" ALTER COLUMN "id" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_member_request" ADD CONSTRAINT "FK_2872a8db74268161aede2556c27" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_member_request" ADD CONSTRAINT "FK_f8260c3393fef67e4bf3c0577b2" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
