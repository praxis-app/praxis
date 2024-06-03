import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGroupIdToConversationTable1717305686166
  implements MigrationInterface
{
  name = 'AddGroupIdToConversationTable1717305686166';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "conversation" ADD "groupId" integer`);
    await queryRunner.query(
      `ALTER TABLE "conversation" ALTER COLUMN "name" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "conversation" ADD CONSTRAINT "FK_2582545e3c921d0844ce79c8467" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "conversation" DROP CONSTRAINT "FK_2582545e3c921d0844ce79c8467"`,
    );
    await queryRunner.query(
      `ALTER TABLE "conversation" ALTER COLUMN "name" DROP NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "conversation" DROP COLUMN "groupId"`);
  }
}
