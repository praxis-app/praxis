import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProposalActionImagesConstraint1685201083917
  implements MigrationInterface
{
  name = 'AddProposalActionImagesConstraint1685201083917';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "image" DROP CONSTRAINT "FK_e2a8d2eb051eb21b6715f6d21b2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "image" DROP CONSTRAINT "REL_e2a8d2eb051eb21b6715f6d21b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "image" ADD CONSTRAINT "FK_e2a8d2eb051eb21b6715f6d21b2" FOREIGN KEY ("proposalActionId") REFERENCES "proposal_action"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "image" DROP CONSTRAINT "FK_e2a8d2eb051eb21b6715f6d21b2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "image" ADD CONSTRAINT "REL_e2a8d2eb051eb21b6715f6d21b" UNIQUE ("proposalActionId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "image" ADD CONSTRAINT "FK_e2a8d2eb051eb21b6715f6d21b2" FOREIGN KEY ("proposalActionId") REFERENCES "proposal_action"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
