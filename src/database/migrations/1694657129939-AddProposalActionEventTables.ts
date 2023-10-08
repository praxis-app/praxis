import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProposalActionEventTables1694657129939
  implements MigrationInterface
{
  name = 'AddProposalActionEventTables1694657129939';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "proposal_action_event_host" ("id" SERIAL NOT NULL, "status" character varying NOT NULL DEFAULT 'host', "userId" integer NOT NULL, "proposalActionEventId" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_d0f2bcbc31b6e1906b806c55ed7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "proposal_action_event" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" character varying NOT NULL, "location" character varying, "online" boolean NOT NULL DEFAULT false, "externalLink" character varying, "proposalActionId" integer NOT NULL, "startsAt" TIMESTAMP NOT NULL, "endsAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_2bf41b945a85f085c510939502" UNIQUE ("proposalActionId"), CONSTRAINT "PK_fd8d439ffa192cebed73b9ccdfd" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "image" ADD "proposalActionEventId" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_action_event_host" ADD CONSTRAINT "FK_15fd04018035c8ab772a4fad63a" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_action_event_host" ADD CONSTRAINT "FK_bf7af606e6af5036016192308a4" FOREIGN KEY ("proposalActionEventId") REFERENCES "proposal_action_event"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_action_event" ADD CONSTRAINT "FK_2bf41b945a85f085c510939502f" FOREIGN KEY ("proposalActionId") REFERENCES "proposal_action"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "image" ADD CONSTRAINT "FK_dc25c77a4e7bab832e4ccf41c08" FOREIGN KEY ("proposalActionEventId") REFERENCES "proposal_action_event"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "image" DROP CONSTRAINT "FK_dc25c77a4e7bab832e4ccf41c08"`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_action_event" DROP CONSTRAINT "FK_2bf41b945a85f085c510939502f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_action_event_host" DROP CONSTRAINT "FK_bf7af606e6af5036016192308a4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "proposal_action_event_host" DROP CONSTRAINT "FK_15fd04018035c8ab772a4fad63a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "image" DROP COLUMN "proposalActionEventId"`,
    );
    await queryRunner.query(`DROP TABLE "proposal_action_event"`);
    await queryRunner.query(`DROP TABLE "proposal_action_event_host"`);
  }
}
