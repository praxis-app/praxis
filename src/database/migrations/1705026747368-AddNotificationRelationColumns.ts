import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNotificationRelationColumns1705026747368
  implements MigrationInterface
{
  name = 'AddNotificationRelationColumns1705026747368';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notification" ADD "commentId" integer`,
    );
    await queryRunner.query(`ALTER TABLE "notification" ADD "voteId" integer`);
    await queryRunner.query(`ALTER TABLE "notification" ADD "likeId" integer`);
    await queryRunner.query(
      `ALTER TABLE "notification" ADD CONSTRAINT "FK_8dcb425fddadd878d80bf5fa195" FOREIGN KEY ("commentId") REFERENCES "comment"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification" ADD CONSTRAINT "FK_8910f599ae02e09e7b42103a8e0" FOREIGN KEY ("voteId") REFERENCES "vote"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification" ADD CONSTRAINT "FK_e8fc34e5036ba2e4f1220ed0a62" FOREIGN KEY ("likeId") REFERENCES "like"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notification" DROP CONSTRAINT "FK_e8fc34e5036ba2e4f1220ed0a62"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification" DROP CONSTRAINT "FK_8910f599ae02e09e7b42103a8e0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification" DROP CONSTRAINT "FK_8dcb425fddadd878d80bf5fa195"`,
    );
    await queryRunner.query(`ALTER TABLE "notification" DROP COLUMN "likeId"`);
    await queryRunner.query(`ALTER TABLE "notification" DROP COLUMN "voteId"`);
    await queryRunner.query(
      `ALTER TABLE "notification" DROP COLUMN "commentId"`,
    );
  }
}
