import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveMemberRequestIdSeq1690336764201
  implements MigrationInterface
{
  name = 'RemoveMemberRequestIdSeq1690336764201';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP SEQUENCE IF EXISTS "member_request_id_seq"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE SEQUENCE IF NOT EXISTS "member_request_id_seq" OWNED BY "group_member_request"."id"`,
    );
  }
}
