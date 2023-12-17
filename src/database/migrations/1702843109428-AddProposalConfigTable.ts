import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProposalConfigTable1702843109428 implements MigrationInterface {
  name = 'AddProposalConfigTable1702843109428';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "proposal_config" ("id" SERIAL NOT NULL, "decisionMakingModel" character varying NOT NULL, "standAsidesLimit" integer NOT NULL, "reservationsLimit" integer NOT NULL, "ratificationThreshold" integer NOT NULL, "closingAt" TIMESTAMP, "proposalId" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_9b5d32fef3ec87bf111c964f2c" UNIQUE ("proposalId"), CONSTRAINT "PK_2f0858babf4bb7af66b142b83f8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_action_group_config" ADD "decisionMakingModel" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_action_group_config" ADD "votingTimeLimit" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_action_group_config" ADD "oldDecisionMakingModel" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_action_group_config" ADD "oldVotingTimeLimit" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_config" ADD "decisionMakingModel" character varying NOT NULL DEFAULT 'consensus'`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_config" ADD "votingTimeLimit" integer NOT NULL DEFAULT '4320'`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_config" ADD CONSTRAINT "FK_9b5d32fef3ec87bf111c964f2cf" FOREIGN KEY ("proposalId") REFERENCES "proposal"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "proposal_config" DROP CONSTRAINT "FK_9b5d32fef3ec87bf111c964f2cf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_config" DROP COLUMN "votingTimeLimit"`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_config" DROP COLUMN "decisionMakingModel"`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_action_group_config" DROP COLUMN "oldVotingTimeLimit"`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_action_group_config" DROP COLUMN "oldDecisionMakingModel"`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_action_group_config" DROP COLUMN "votingTimeLimit"`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_action_group_config" DROP COLUMN "decisionMakingModel"`,
    );
    await queryRunner.query(`DROP TABLE "proposal_config"`);
  }
}
