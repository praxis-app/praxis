import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddServerRolePermissionColumns1703978999070
  implements MigrationInterface
{
  name = 'AddServerRolePermissionColumns1703978999070';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_followers_user" DROP CONSTRAINT "FK_110f993e5e9213a7a44f172b264"`,
    );
    await queryRunner.query(
      `ALTER TABLE "server_role_permission" ADD "removeGroups" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "server_role_permission" ADD "removeProposals" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_followers_user" ADD CONSTRAINT "FK_110f993e5e9213a7a44f172b264" FOREIGN KEY ("userId_2") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_followers_user" DROP CONSTRAINT "FK_110f993e5e9213a7a44f172b264"`,
    );
    await queryRunner.query(
      `ALTER TABLE "server_role_permission" DROP COLUMN "removeProposals"`,
    );
    await queryRunner.query(
      `ALTER TABLE "server_role_permission" DROP COLUMN "removeGroups"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_followers_user" ADD CONSTRAINT "FK_110f993e5e9213a7a44f172b264" FOREIGN KEY ("userId_2") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
