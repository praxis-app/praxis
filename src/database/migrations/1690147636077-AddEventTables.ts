import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEventTables1690147636077 implements MigrationInterface {
  name = 'AddEventTables1690147636077';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "group_member_request" DROP CONSTRAINT "FK_864520203508eeb8980a50c92c7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_member_request" DROP CONSTRAINT "FK_a15f4685964a47ecc362c7a0428"`,
    );
    await queryRunner.query(
      `CREATE TABLE "event_attendee" ("id" SERIAL NOT NULL, "status" character varying NOT NULL, "userId" integer NOT NULL, "eventId" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_74780f7235f1576b54f93d3dff3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "event" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" character varying NOT NULL, "location" character varying, "online" boolean NOT NULL DEFAULT false, "externalLink" character varying, "groupId" integer, "startsAt" TIMESTAMP NOT NULL, "endsAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_30c2f3bbaf6d34a55f8ae6e4614" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`ALTER TABLE "image" ADD "eventId" integer`);
    await queryRunner.query(`ALTER TABLE "post" ADD "eventId" integer`);
    await queryRunner.query(
      `CREATE SEQUENCE IF NOT EXISTS "group_member_request_id_seq" OWNED BY "group_member_request"."id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_member_request" ALTER COLUMN "id" SET DEFAULT nextval('"group_member_request_id_seq"')`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_member_request" ALTER COLUMN "id" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "image" ADD CONSTRAINT "FK_042895d4be7cf838f0f89949705" FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_member_request" ADD CONSTRAINT "FK_2872a8db74268161aede2556c27" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_member_request" ADD CONSTRAINT "FK_f8260c3393fef67e4bf3c0577b2" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_attendee" ADD CONSTRAINT "FK_f440ae2db457bbcf76805a85352" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_attendee" ADD CONSTRAINT "FK_16b4a29e47abe22b1e3c851bcc9" FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "event" ADD CONSTRAINT "FK_0a28dcf5832d1068df34fc59e46" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "post" ADD CONSTRAINT "FK_0497171f776587bf42b759bb2c4" FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "post" DROP CONSTRAINT "FK_0497171f776587bf42b759bb2c4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event" DROP CONSTRAINT "FK_0a28dcf5832d1068df34fc59e46"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_attendee" DROP CONSTRAINT "FK_16b4a29e47abe22b1e3c851bcc9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_attendee" DROP CONSTRAINT "FK_f440ae2db457bbcf76805a85352"`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_member_request" DROP CONSTRAINT "FK_f8260c3393fef67e4bf3c0577b2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_member_request" DROP CONSTRAINT "FK_2872a8db74268161aede2556c27"`,
    );
    await queryRunner.query(
      `ALTER TABLE "image" DROP CONSTRAINT "FK_042895d4be7cf838f0f89949705"`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_member_request" ALTER COLUMN "id" SET DEFAULT nextval('"group_member_request_id_seq"')`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_member_request" ALTER COLUMN "id" DROP DEFAULT`,
    );
    await queryRunner.query(`DROP SEQUENCE "group_member_request_id_seq"`);
    await queryRunner.query(`ALTER TABLE "post" DROP COLUMN "eventId"`);
    await queryRunner.query(`ALTER TABLE "image" DROP COLUMN "eventId"`);
    await queryRunner.query(`DROP TABLE "event"`);
    await queryRunner.query(`DROP TABLE "event_attendee"`);
    await queryRunner.query(
      `ALTER TABLE "group_member_request" ADD CONSTRAINT "FK_a15f4685964a47ecc362c7a0428" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_member_request" ADD CONSTRAINT "FK_864520203508eeb8980a50c92c7" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
