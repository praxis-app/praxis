import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProposalActionRoleTable1684893300206
  implements MigrationInterface
{
  name = 'AddProposalActionRoleTable1684893300206';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "proposal_action_permission" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "enabled" boolean NOT NULL, "proposalActionRoleId" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_da6266a8417a739330b77007faa" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "proposal_action_role_member" ("id" SERIAL NOT NULL, "changeType" character varying NOT NULL, "userId" integer NOT NULL, "proposalActionRoleId" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_9daabc8eb1cb4a3bc1681773c84" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "proposal_action_role" ("id" SERIAL NOT NULL, "name" character varying, "color" character varying, "oldName" character varying, "oldColor" character varying, "proposalActionId" integer NOT NULL, "roleId" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_81a331d1f0e93a0eaac9585cb7" UNIQUE ("proposalActionId"), CONSTRAINT "PK_0a14dd2782594c498b221ccf557" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_action_permission" ADD CONSTRAINT "FK_d30bc47f532c1ee16830ef03d44" FOREIGN KEY ("proposalActionRoleId") REFERENCES "proposal_action_role"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_action_role_member" ADD CONSTRAINT "FK_5d535c7141b832cc7213a29b97a" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_action_role_member" ADD CONSTRAINT "FK_90dfd2320379570d63cb82bd615" FOREIGN KEY ("proposalActionRoleId") REFERENCES "proposal_action_role"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_action_role" ADD CONSTRAINT "FK_81a331d1f0e93a0eaac9585cb7c" FOREIGN KEY ("proposalActionId") REFERENCES "proposal_action"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_action_role" ADD CONSTRAINT "FK_a5582c00ad2e43a5391f6cdb97b" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "proposal_action_role" DROP CONSTRAINT "FK_a5582c00ad2e43a5391f6cdb97b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_action_role" DROP CONSTRAINT "FK_81a331d1f0e93a0eaac9585cb7c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_action_role_member" DROP CONSTRAINT "FK_90dfd2320379570d63cb82bd615"`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_action_role_member" DROP CONSTRAINT "FK_5d535c7141b832cc7213a29b97a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_action_permission" DROP CONSTRAINT "FK_d30bc47f532c1ee16830ef03d44"`,
    );
    await queryRunner.query(`DROP TABLE "proposal_action_role"`);
    await queryRunner.query(`DROP TABLE "proposal_action_role_member"`);
    await queryRunner.query(`DROP TABLE "proposal_action_permission"`);
  }
}
