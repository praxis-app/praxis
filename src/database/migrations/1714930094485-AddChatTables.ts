import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddChatTables1714930094485 implements MigrationInterface {
  name = 'AddChatTables1714930094485';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "conversation" ("id" SERIAL NOT NULL, "name" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_864528ec4274360a40f66c29845" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "conversation_member" ("id" SERIAL NOT NULL, "lastMessageReadId" integer, "userId" integer NOT NULL, "conversationId" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ed07d3bc360f4e68836841b8358" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "message" ("id" SERIAL NOT NULL, "body" character varying, "userId" integer NOT NULL, "conversationId" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ba01f0a3e0123651915008bc578" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification" ADD "conversationId" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification" ADD "unreadMessageCount" integer`,
    );
    await queryRunner.query(`ALTER TABLE "image" ADD "messageId" integer`);
    await queryRunner.query(
      `ALTER TABLE "server_config" ADD "vibeChatId" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification" ADD CONSTRAINT "FK_1a55a6d885aa67e53bd9574c91a" FOREIGN KEY ("conversationId") REFERENCES "conversation"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "conversation_member" ADD CONSTRAINT "FK_dd563b686e428caa50c69ca5e1e" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "conversation_member" ADD CONSTRAINT "FK_b15b0ed425fb8a2928f16db6fc8" FOREIGN KEY ("conversationId") REFERENCES "conversation"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "message" ADD CONSTRAINT "FK_446251f8ceb2132af01b68eb593" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "message" ADD CONSTRAINT "FK_7cf4a4df1f2627f72bf6231635f" FOREIGN KEY ("conversationId") REFERENCES "conversation"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "image" ADD CONSTRAINT "FK_f69c7f02013805481ec0edcf3ea" FOREIGN KEY ("messageId") REFERENCES "message"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "image" DROP CONSTRAINT "FK_f69c7f02013805481ec0edcf3ea"`,
    );
    await queryRunner.query(
      `ALTER TABLE "message" DROP CONSTRAINT "FK_7cf4a4df1f2627f72bf6231635f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "message" DROP CONSTRAINT "FK_446251f8ceb2132af01b68eb593"`,
    );
    await queryRunner.query(
      `ALTER TABLE "conversation_member" DROP CONSTRAINT "FK_b15b0ed425fb8a2928f16db6fc8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "conversation_member" DROP CONSTRAINT "FK_dd563b686e428caa50c69ca5e1e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification" DROP CONSTRAINT "FK_1a55a6d885aa67e53bd9574c91a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "server_config" DROP COLUMN "vibeChatId"`,
    );
    await queryRunner.query(`ALTER TABLE "image" DROP COLUMN "messageId"`);
    await queryRunner.query(
      `ALTER TABLE "notification" DROP COLUMN "unreadMessageCount"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification" DROP COLUMN "conversationId"`,
    );
    await queryRunner.query(`DROP TABLE "message"`);
    await queryRunner.query(`DROP TABLE "conversation_member"`);
    await queryRunner.query(`DROP TABLE "conversation"`);
  }
}
