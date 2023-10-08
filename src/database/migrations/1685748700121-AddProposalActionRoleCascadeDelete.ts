import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProposalActionRoleCascadeDelete1685748700121
  implements MigrationInterface
{
  name = 'AddProposalActionRoleCascadeDelete1685748700121';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "proposal_action_role" DROP CONSTRAINT "FK_a5582c00ad2e43a5391f6cdb97b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_action_role" ADD CONSTRAINT "FK_a5582c00ad2e43a5391f6cdb97b" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "proposal_action_role" DROP CONSTRAINT "FK_a5582c00ad2e43a5391f6cdb97b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_action_role" ADD CONSTRAINT "FK_a5582c00ad2e43a5391f6cdb97b" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
