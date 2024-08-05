import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddServerRoleProposalColumns1722201841114
  implements MigrationInterface
{
  name = 'AddServerRoleProposalColumns1722201841114';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "proposal_action_permission" ADD "manageInvites" boolean`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_action_permission" ADD "createInvites" boolean`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_action_permission" ADD "removeGroups" boolean`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_action_permission" ADD "removeProposals" boolean`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_action_permission" ADD "manageRules" boolean`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_action_permission" ADD "manageQuestions" boolean`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_action_permission" ADD "manageQuestionnaireTickets" boolean`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_action_role" ADD "serverRoleId" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_action_role" ADD CONSTRAINT "FK_1c142ceb6e503d5ed8cfa9fa455" FOREIGN KEY ("serverRoleId") REFERENCES "server_role"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "proposal_action_role" DROP CONSTRAINT "FK_1c142ceb6e503d5ed8cfa9fa455"`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_action_role" DROP COLUMN "serverRoleId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_action_permission" DROP COLUMN "manageQuestionnaireTickets"`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_action_permission" DROP COLUMN "manageQuestions"`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_action_permission" DROP COLUMN "manageRules"`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_action_permission" DROP COLUMN "removeProposals"`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_action_permission" DROP COLUMN "removeGroups"`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_action_permission" DROP COLUMN "createInvites"`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_action_permission" DROP COLUMN "manageInvites"`,
    );
  }
}
