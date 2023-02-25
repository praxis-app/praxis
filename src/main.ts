import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { GraphQLSchemaHost } from "@nestjs/graphql";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import * as cookieParser from "cookie-parser";
import { writeFileSync } from "fs";
import { printSchema } from "graphql";
import { graphqlUploadExpress } from "graphql-upload";
import { join } from "path";
import { AppModule } from "./app.module";

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule, { cors: true });

  app.useGlobalPipes(new ValidationPipe());
  app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }));
  app.use(cookieParser());

  const config = new DocumentBuilder()
    .setTitle("Social API")
    .setDescription(
      "Social networking API built with NestJS, Apollo Server, and TypeORM"
    )
    .setVersion("1.0")
    .build();
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup("api", app, document);

  await app.listen(process.env.SERVER_PORT as string);

  const { schema } = app.get(GraphQLSchemaHost);
  writeFileSync(join(process.cwd(), `./schema.graphql`), printSchema(schema));
};

bootstrap();
