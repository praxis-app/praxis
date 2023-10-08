import { MigrationInterface, QueryRunner } from 'typeorm';

export class RefactorRolesAndPermissions1688001951695
  implements MigrationInterface
{
  name = 'RefactorRolesAndPermissions1688001951695';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "proposal_action_role" DROP CONSTRAINT "FK_a5582c00ad2e43a5391f6cdb97b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_action_role" RENAME COLUMN "roleId" TO "groupRoleId"`,
    );
    await queryRunner.query(
      `CREATE TABLE "group_role_permission" ("id" SERIAL NOT NULL, "manageRoles" boolean NOT NULL DEFAULT false, "manageSettings" boolean NOT NULL DEFAULT false, "managePosts" boolean NOT NULL DEFAULT false, "manageComments" boolean NOT NULL DEFAULT false, "manageEvents" boolean NOT NULL DEFAULT false, "updateGroup" boolean NOT NULL DEFAULT false, "deleteGroup" boolean NOT NULL DEFAULT false, "createEvents" boolean NOT NULL DEFAULT false, "approveMemberRequests" boolean NOT NULL DEFAULT false, "removeMembers" boolean NOT NULL DEFAULT false, "groupRoleId" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_542fcdecad4a79dbee3bbe2725" UNIQUE ("groupRoleId"), CONSTRAINT "PK_8906688d83ac305cf4baf7c1b8c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "group_role" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "color" character varying NOT NULL, "groupId" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0fd3365b65e6121a0ef0cb7cb6e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "server_role_permission" ("id" SERIAL NOT NULL, "manageRoles" boolean NOT NULL DEFAULT false, "managePosts" boolean NOT NULL DEFAULT false, "manageComments" boolean NOT NULL DEFAULT false, "manageEvents" boolean NOT NULL DEFAULT false, "manageInvites" boolean NOT NULL DEFAULT false, "createInvites" boolean NOT NULL DEFAULT false, "removeMembers" boolean NOT NULL DEFAULT false, "serverRoleId" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_7ba90ade3419699107a9b2a341" UNIQUE ("serverRoleId"), CONSTRAINT "PK_2fbaa042aa7fc14dbc93337dc37" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "server_role" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "color" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_77fbb52d800cdca8c698bc0ddcc" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "group_role_members_user" ("groupRoleId" integer NOT NULL, "userId" integer NOT NULL, CONSTRAINT "PK_169cd0a726560510c740f78290d" PRIMARY KEY ("groupRoleId", "userId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_921a4c0b23e5efded8e7d9f725" ON "group_role_members_user" ("groupRoleId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ad33c1380ea67144e74080747c" ON "group_role_members_user" ("userId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "server_role_members_user" ("serverRoleId" integer NOT NULL, "userId" integer NOT NULL, CONSTRAINT "PK_8fbdc54227b52a90c2943464ab3" PRIMARY KEY ("serverRoleId", "userId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0e81fc759db187afd78c675e37" ON "server_role_members_user" ("serverRoleId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f63712bbbf85cf2d7974fea3da" ON "server_role_members_user" ("userId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_action_permission" DROP COLUMN "enabled"`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_action_permission" DROP COLUMN "name"`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_action_permission" ADD "manageRoles" boolean`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_action_permission" ADD "manageSettings" boolean`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_action_permission" ADD "managePosts" boolean`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_action_permission" ADD "manageComments" boolean`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_action_permission" ADD "manageEvents" boolean`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_action_permission" ADD "updateGroup" boolean`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_action_permission" ADD "deleteGroup" boolean`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_action_permission" ADD "createEvents" boolean`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_action_permission" ADD "approveMemberRequests" boolean`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_action_permission" ADD "removeMembers" boolean`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_action_permission" DROP CONSTRAINT "FK_d30bc47f532c1ee16830ef03d44"`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_action_permission" ADD CONSTRAINT "UQ_d30bc47f532c1ee16830ef03d44" UNIQUE ("proposalActionRoleId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_role_permission" ADD CONSTRAINT "FK_542fcdecad4a79dbee3bbe27250" FOREIGN KEY ("groupRoleId") REFERENCES "group_role"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_role" ADD CONSTRAINT "FK_5f5e3b95cbdf0582623d98adf10" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_action_permission" ADD CONSTRAINT "FK_d30bc47f532c1ee16830ef03d44" FOREIGN KEY ("proposalActionRoleId") REFERENCES "proposal_action_role"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_action_role" ADD CONSTRAINT "FK_9a0f44d9aa593ce0e503dffba2e" FOREIGN KEY ("groupRoleId") REFERENCES "group_role"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "server_role_permission" ADD CONSTRAINT "FK_7ba90ade3419699107a9b2a3412" FOREIGN KEY ("serverRoleId") REFERENCES "server_role"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_role_members_user" ADD CONSTRAINT "FK_921a4c0b23e5efded8e7d9f7253" FOREIGN KEY ("groupRoleId") REFERENCES "group_role"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_role_members_user" ADD CONSTRAINT "FK_ad33c1380ea67144e74080747c4" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "server_role_members_user" ADD CONSTRAINT "FK_0e81fc759db187afd78c675e37f" FOREIGN KEY ("serverRoleId") REFERENCES "server_role"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "server_role_members_user" ADD CONSTRAINT "FK_f63712bbbf85cf2d7974fea3da1" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "server_role_members_user" DROP CONSTRAINT "FK_f63712bbbf85cf2d7974fea3da1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "server_role_members_user" DROP CONSTRAINT "FK_0e81fc759db187afd78c675e37f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_role_members_user" DROP CONSTRAINT "FK_ad33c1380ea67144e74080747c4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_role_members_user" DROP CONSTRAINT "FK_921a4c0b23e5efded8e7d9f7253"`,
    );
    await queryRunner.query(
      `ALTER TABLE "server_role_permission" DROP CONSTRAINT "FK_7ba90ade3419699107a9b2a3412"`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_action_role" DROP CONSTRAINT "FK_9a0f44d9aa593ce0e503dffba2e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_action_permission" DROP CONSTRAINT "FK_d30bc47f532c1ee16830ef03d44"`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_role" DROP CONSTRAINT "FK_5f5e3b95cbdf0582623d98adf10"`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_role_permission" DROP CONSTRAINT "FK_542fcdecad4a79dbee3bbe27250"`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_action_permission" DROP CONSTRAINT "UQ_d30bc47f532c1ee16830ef03d44"`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_action_permission" ADD CONSTRAINT "FK_d30bc47f532c1ee16830ef03d44" FOREIGN KEY ("proposalActionRoleId") REFERENCES "proposal_action_role"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_action_permission" DROP COLUMN "removeMembers"`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_action_permission" DROP COLUMN "approveMemberRequests"`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_action_permission" DROP COLUMN "createEvents"`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_action_permission" DROP COLUMN "deleteGroup"`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_action_permission" DROP COLUMN "updateGroup"`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_action_permission" DROP COLUMN "manageEvents"`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_action_permission" DROP COLUMN "manageComments"`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_action_permission" DROP COLUMN "managePosts"`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_action_permission" DROP COLUMN "manageSettings"`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_action_permission" DROP COLUMN "manageRoles"`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_action_permission" ADD "name" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_action_permission" ADD "enabled" boolean NOT NULL`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f63712bbbf85cf2d7974fea3da"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0e81fc759db187afd78c675e37"`,
    );
    await queryRunner.query(`DROP TABLE "server_role_members_user"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ad33c1380ea67144e74080747c"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_921a4c0b23e5efded8e7d9f725"`,
    );
    await queryRunner.query(`DROP TABLE "group_role_members_user"`);
    await queryRunner.query(`DROP TABLE "server_role"`);
    await queryRunner.query(`DROP TABLE "server_role_permission"`);
    await queryRunner.query(`DROP TABLE "group_role"`);
    await queryRunner.query(`DROP TABLE "group_role_permission"`);
    await queryRunner.query(
      `ALTER TABLE "proposal_action_role" RENAME COLUMN "groupRoleId" TO "roleId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_action_role" ADD CONSTRAINT "FK_a5582c00ad2e43a5391f6cdb97b" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
