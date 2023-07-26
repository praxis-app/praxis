import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        host: configService.get("DB_HOST"),
        database: configService.get("DB_SCHEMA"),
        username: configService.get("DB_USERNAME"),
        password: configService.get("DB_PASSWORD"),
        port: parseInt(configService.get("DB_PORT") as string),
        synchronize: false,
        entities: ["dist/**/*{.entity,.model}.js"],
      }),
    }),
  ],
})
export class DatabaseModule {}
