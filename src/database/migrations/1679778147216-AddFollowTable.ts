import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFollowTable1679778147216 implements MigrationInterface {
  name = 'AddFollowTable1679778147216';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user_followers_user" ("userId_1" integer NOT NULL, "userId_2" integer NOT NULL, CONSTRAINT "PK_980ff03f415077df184596dcf73" PRIMARY KEY ("userId_1", "userId_2"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_26312a1e34901011fc6f63545e" ON "user_followers_user" ("userId_1") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_110f993e5e9213a7a44f172b26" ON "user_followers_user" ("userId_2") `,
    );
    await queryRunner.query(
      `ALTER TABLE "user_followers_user" ADD CONSTRAINT "FK_26312a1e34901011fc6f63545e2" FOREIGN KEY ("userId_1") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_followers_user" ADD CONSTRAINT "FK_110f993e5e9213a7a44f172b264" FOREIGN KEY ("userId_2") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_followers_user" DROP CONSTRAINT "FK_110f993e5e9213a7a44f172b264"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_followers_user" DROP CONSTRAINT "FK_26312a1e34901011fc6f63545e2"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_110f993e5e9213a7a44f172b26"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_26312a1e34901011fc6f63545e"`,
    );
    await queryRunner.query(`DROP TABLE "user_followers_user"`);
  }
}
