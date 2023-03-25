import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFollowTable1679751871209 implements MigrationInterface {
  name = "AddFollowTable1679751871209";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "follow" ("followedUserId" integer NOT NULL, "userId" integer NOT NULL, CONSTRAINT "PK_6bfc56b279d53e3fd1533f58c08" PRIMARY KEY ("followedUserId", "userId"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6587b32043c93b3d2bb93cd82c" ON "follow" ("followedUserId") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_af9f90ce5e8f66f845ebbcc6f1" ON "follow" ("userId") `
    );
    await queryRunner.query(
      `ALTER TABLE "follow" ADD CONSTRAINT "FK_6587b32043c93b3d2bb93cd82c5" FOREIGN KEY ("followedUserId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE "follow" ADD CONSTRAINT "FK_af9f90ce5e8f66f845ebbcc6f15" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "follow" DROP CONSTRAINT "FK_af9f90ce5e8f66f845ebbcc6f15"`
    );
    await queryRunner.query(
      `ALTER TABLE "follow" DROP CONSTRAINT "FK_6587b32043c93b3d2bb93cd82c5"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_af9f90ce5e8f66f845ebbcc6f1"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6587b32043c93b3d2bb93cd82c"`
    );
    await queryRunner.query(`DROP TABLE "follow"`);
  }
}
