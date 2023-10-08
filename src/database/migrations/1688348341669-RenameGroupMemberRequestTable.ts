import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameGroupMemberRequestTable1688348341669
  implements MigrationInterface
{
  name = 'RenameGroupMemberRequestTable1688348341669';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "member_request" RENAME TO "group_member_request"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "group_member_request" RENAME TO "member_request"`,
    );
  }
}
