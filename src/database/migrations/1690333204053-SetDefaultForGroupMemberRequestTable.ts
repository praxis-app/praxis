import { MigrationInterface, QueryRunner } from 'typeorm';

export class SetDefaultForGroupMemberRequestTable1690333204053
  implements MigrationInterface
{
  name = 'SetDefaultForGroupMemberRequestTable1690333204053';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "group_member_request" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "group_member_request" ALTER COLUMN "id" DROP DEFAULT`,
    );
  }
}
