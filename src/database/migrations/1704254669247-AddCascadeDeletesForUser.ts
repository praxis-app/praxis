import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCascadeDeletesForUser1704254669247
  implements MigrationInterface
{
  name = 'AddCascadeDeletesForUser1704254669247';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "group_role_members_user" DROP CONSTRAINT "FK_ad33c1380ea67144e74080747c4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "server_role_members_user" DROP CONSTRAINT "FK_f63712bbbf85cf2d7974fea3da1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_members_user" DROP CONSTRAINT "FK_427107c650638bcb2f1e167d2e5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_role_members_user" ADD CONSTRAINT "FK_ad33c1380ea67144e74080747c4" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "server_role_members_user" ADD CONSTRAINT "FK_f63712bbbf85cf2d7974fea3da1" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_members_user" ADD CONSTRAINT "FK_427107c650638bcb2f1e167d2e5" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "group_members_user" DROP CONSTRAINT "FK_427107c650638bcb2f1e167d2e5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "server_role_members_user" DROP CONSTRAINT "FK_f63712bbbf85cf2d7974fea3da1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_role_members_user" DROP CONSTRAINT "FK_ad33c1380ea67144e74080747c4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_members_user" ADD CONSTRAINT "FK_427107c650638bcb2f1e167d2e5" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "server_role_members_user" ADD CONSTRAINT "FK_f63712bbbf85cf2d7974fea3da1" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_role_members_user" ADD CONSTRAINT "FK_ad33c1380ea67144e74080747c4" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
