import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVibeCheckTables1709004638886 implements MigrationInterface {
  name = 'AddVibeCheckTables1709004638886';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "answer" ("id" SERIAL NOT NULL, "text" character varying NOT NULL, "questionId" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_a4013f10cd6924793fbd5f0d63" UNIQUE ("questionId"), CONSTRAINT "PK_9232db17b63fb1e94f97e5c224f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "question" ("id" SERIAL NOT NULL, "text" character varying NOT NULL, "priority" integer NOT NULL, "questionnaireTicketId" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_21e5786aa0ea704ae185a79b2d5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "questionnaire_ticket_config" ("id" SERIAL NOT NULL, "decisionMakingModel" character varying NOT NULL, "standAsidesLimit" integer NOT NULL, "reservationsLimit" integer NOT NULL, "ratificationThreshold" integer NOT NULL, "closingAt" TIMESTAMP, "questionnaireTicketId" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_70a9ffb30df915c103ebc39e12" UNIQUE ("questionnaireTicketId"), CONSTRAINT "PK_209339a78b4bc3d91dda031de54" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "questionnaire_ticket" ("id" SERIAL NOT NULL, "status" character varying NOT NULL DEFAULT 'in-progress', "userId" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_f800aa2becd897215835f9800ba" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "server_question" ("id" SERIAL NOT NULL, "text" character varying NOT NULL, "priority" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_68736af5417c7f5888c45c6250b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "vote" ADD "questionnaireTicketId" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "server_role_permission" ADD "manageQuestions" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "server_role_permission" ADD "manageQuestionnaireTickets" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "verified" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(`ALTER TABLE "like" ADD "questionId" integer`);
    await queryRunner.query(
      `ALTER TABLE "notification" ADD "questionId" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification" ADD "questionnaireTicketId" integer`,
    );
    await queryRunner.query(`ALTER TABLE "comment" ADD "questionId" integer`);
    await queryRunner.query(
      `ALTER TABLE "comment" ADD "questionnaireTicketId" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "server_config" ADD "decisionMakingModel" character varying NOT NULL DEFAULT 'consensus'`,
    );
    await queryRunner.query(
      `ALTER TABLE "server_config" ADD "standAsidesLimit" integer NOT NULL DEFAULT '2'`,
    );
    await queryRunner.query(
      `ALTER TABLE "server_config" ADD "reservationsLimit" integer NOT NULL DEFAULT '2'`,
    );
    await queryRunner.query(
      `ALTER TABLE "server_config" ADD "ratificationThreshold" integer NOT NULL DEFAULT '50'`,
    );
    await queryRunner.query(
      `ALTER TABLE "server_config" ADD "votingTimeLimit" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "server_config" ADD "serverQuestionsPrompt" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "vote" DROP CONSTRAINT "FK_a6099cc53a32762d8c69e71dcd1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vote" ALTER COLUMN "proposalId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "answer" ADD CONSTRAINT "FK_a4013f10cd6924793fbd5f0d637" FOREIGN KEY ("questionId") REFERENCES "question"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "question" ADD CONSTRAINT "FK_626a1a5a69f5c55da49c0d254fe" FOREIGN KEY ("questionnaireTicketId") REFERENCES "questionnaire_ticket"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "questionnaire_ticket_config" ADD CONSTRAINT "FK_70a9ffb30df915c103ebc39e120" FOREIGN KEY ("questionnaireTicketId") REFERENCES "questionnaire_ticket"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "questionnaire_ticket" ADD CONSTRAINT "FK_32a49f9d0d9d2c20f3eb1ac18ce" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "vote" ADD CONSTRAINT "FK_a6099cc53a32762d8c69e71dcd1" FOREIGN KEY ("proposalId") REFERENCES "proposal"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "vote" ADD CONSTRAINT "FK_c137f56910727c7e972f1f21dea" FOREIGN KEY ("questionnaireTicketId") REFERENCES "questionnaire_ticket"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "like" ADD CONSTRAINT "FK_90ece133b55b4a6fcb50cb2ab1e" FOREIGN KEY ("questionId") REFERENCES "question"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification" ADD CONSTRAINT "FK_f5a7bc6e45da268d09823fe5fed" FOREIGN KEY ("questionId") REFERENCES "question"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification" ADD CONSTRAINT "FK_6759b3d490b15dc07873fcdba57" FOREIGN KEY ("questionnaireTicketId") REFERENCES "questionnaire_ticket"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" ADD CONSTRAINT "FK_38c7b71e5d494309af3cb8a7d70" FOREIGN KEY ("questionId") REFERENCES "question"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" ADD CONSTRAINT "FK_64081766f481f371c7e51beeecf" FOREIGN KEY ("questionnaireTicketId") REFERENCES "questionnaire_ticket"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "comment" DROP CONSTRAINT "FK_64081766f481f371c7e51beeecf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" DROP CONSTRAINT "FK_38c7b71e5d494309af3cb8a7d70"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification" DROP CONSTRAINT "FK_6759b3d490b15dc07873fcdba57"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification" DROP CONSTRAINT "FK_f5a7bc6e45da268d09823fe5fed"`,
    );
    await queryRunner.query(
      `ALTER TABLE "like" DROP CONSTRAINT "FK_90ece133b55b4a6fcb50cb2ab1e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vote" DROP CONSTRAINT "FK_c137f56910727c7e972f1f21dea"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vote" DROP CONSTRAINT "FK_a6099cc53a32762d8c69e71dcd1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "questionnaire_ticket" DROP CONSTRAINT "FK_32a49f9d0d9d2c20f3eb1ac18ce"`,
    );
    await queryRunner.query(
      `ALTER TABLE "questionnaire_ticket_config" DROP CONSTRAINT "FK_70a9ffb30df915c103ebc39e120"`,
    );
    await queryRunner.query(
      `ALTER TABLE "question" DROP CONSTRAINT "FK_626a1a5a69f5c55da49c0d254fe"`,
    );
    await queryRunner.query(
      `ALTER TABLE "answer" DROP CONSTRAINT "FK_a4013f10cd6924793fbd5f0d637"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vote" ALTER COLUMN "proposalId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "vote" ADD CONSTRAINT "FK_a6099cc53a32762d8c69e71dcd1" FOREIGN KEY ("proposalId") REFERENCES "proposal"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "server_config" DROP COLUMN "serverQuestionsPrompt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "server_config" DROP COLUMN "votingTimeLimit"`,
    );
    await queryRunner.query(
      `ALTER TABLE "server_config" DROP COLUMN "ratificationThreshold"`,
    );
    await queryRunner.query(
      `ALTER TABLE "server_config" DROP COLUMN "reservationsLimit"`,
    );
    await queryRunner.query(
      `ALTER TABLE "server_config" DROP COLUMN "standAsidesLimit"`,
    );
    await queryRunner.query(
      `ALTER TABLE "server_config" DROP COLUMN "decisionMakingModel"`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" DROP COLUMN "questionnaireTicketId"`,
    );
    await queryRunner.query(`ALTER TABLE "comment" DROP COLUMN "questionId"`);
    await queryRunner.query(
      `ALTER TABLE "notification" DROP COLUMN "questionnaireTicketId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification" DROP COLUMN "questionId"`,
    );
    await queryRunner.query(`ALTER TABLE "like" DROP COLUMN "questionId"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "verified"`);
    await queryRunner.query(
      `ALTER TABLE "server_role_permission" DROP COLUMN "manageQuestionnaireTickets"`,
    );
    await queryRunner.query(
      `ALTER TABLE "server_role_permission" DROP COLUMN "manageQuestions"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vote" DROP COLUMN "questionnaireTicketId"`,
    );
    await queryRunner.query(`DROP TABLE "server_question"`);
    await queryRunner.query(`DROP TABLE "questionnaire_ticket"`);
    await queryRunner.query(`DROP TABLE "questionnaire_ticket_config"`);
    await queryRunner.query(`DROP TABLE "question"`);
    await queryRunner.query(`DROP TABLE "answer"`);
  }
}
