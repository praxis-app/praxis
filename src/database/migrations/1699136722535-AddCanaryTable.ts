import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCanaryTable1699136722535 implements MigrationInterface {
  name = 'AddCanaryTable1699136722535';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "canary" ("id" SERIAL NOT NULL, "statement" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_9e3ce95e82a1639ff5fd50c8f93" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "canary"`);
  }
}
