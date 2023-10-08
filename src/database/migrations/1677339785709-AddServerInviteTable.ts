import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddServerInviteTable1677339785709 implements MigrationInterface {
  name = 'AddServerInviteTable1677339785709';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "server_invite" ("id" SERIAL NOT NULL, "token" character varying NOT NULL, "uses" integer NOT NULL DEFAULT '0', "maxUses" integer, "userId" integer NOT NULL, "expiresAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_69a305ef30aec758f49e6c4bf84" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "server_invite" ADD CONSTRAINT "FK_7b9a12803a5d76d18b10c68eabb" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "server_invite" DROP CONSTRAINT "FK_7b9a12803a5d76d18b10c68eabb"`,
    );
    await queryRunner.query(`DROP TABLE "server_invite"`);
  }
}
