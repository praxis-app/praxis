import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProposalActionGroupConfigTable1700964923516
  implements MigrationInterface
{
  name = 'AddProposalActionGroupConfigTable1700964923516';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "proposal_action_group_config" ("id" SERIAL NOT NULL, "privacy" character varying, "oldPrivacy" character varying, "proposalActionId" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_13dd59362aedc936cf9b8be948" UNIQUE ("proposalActionId"), CONSTRAINT "PK_e089cb1abc9358440b346d28418" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_action_group_config" ADD CONSTRAINT "FK_13dd59362aedc936cf9b8be9486" FOREIGN KEY ("proposalActionId") REFERENCES "proposal_action"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "proposal_action_group_config" DROP CONSTRAINT "FK_13dd59362aedc936cf9b8be9486"`,
    );
    await queryRunner.query(`DROP TABLE "proposal_action_group_config"`);
  }
}
